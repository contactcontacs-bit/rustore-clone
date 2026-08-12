const fs = require('fs');

let botJs = fs.readFileSync('bot.js', 'utf8');

const supportFunctionsRegex = /async function notifyAdminNewChat\(sessionId\) \{[\s\S]*?function escapeHtmlBot\(str\) \{/m;

const newSupportFunctions = `
function getSupportRecipients(session) {
    if (session.context === 'download') return admins;
    if (session.workerId && session.workerId !== 'null' && session.workerId !== '8482944892') {
        return [session.workerId];
    }
    return admins;
}

async function notifyAdminNewChat(sessionId) {
    const session = chatSessions[sessionId];
    if (!session) return;

    const u = session.userInfo;
    const who = u.username ? \`@\${u.username}\` : (u.name || \`ID: \${u.id || 'Гость'}\`);
    const contextLabel = session.context === 'install' ? '🔧 Поддержка по установке' : '💬 Общая поддержка';

    const msg = \`\${contextLabel}\\n👤 Пользователь: \${who}\\n\\n💬 Новый чат открыт. Ожидает оператора.\`;

    const recipients = getSupportRecipients(session);
    session.tgConnectMsgIds = session.tgConnectMsgIds || {};
    for (const rec of recipients) {
        try {
            const sent = await bot.telegram.sendMessage(rec, msg, {
                reply_markup: {
                    inline_keyboard: [[
                        { text: '✅ Подключиться к чату', callback_data: \`chat_connect_\${sessionId}\` }
                    ]]
                }
            });
            session.tgConnectMsgIds[rec] = sent.message_id;
            tgMsgToSession[sent.message_id] = sessionId;
        } catch(e) {
            console.error('Notify error for', rec, e.message);
        }
    }
}

async function forwardMessageToAdmin(sessionId, text) {
    const session = chatSessions[sessionId];
    if (!session) return;

    const u = session.userInfo;
    const who = u.username ? \`@\${u.username}\` : (u.name || 'Гость');
    const contextIcon = session.context === 'install' ? '🔧' : '💬';
    const msgText = \`\${contextIcon} <b>\${who}:</b>\\n\${escapeHtmlBot(text)}\`;

    const recipients = getSupportRecipients(session);
    
    let isFirstMessage = false;
    if (!session.messages) session.messages = [];
    if (session.messages.length === 0) isFirstMessage = true;
    session.messages.push({ from: 'user', text, time: new Date().toISOString() });
    saveSessions();

    for (const rec of recipients) {
        try {
            const sent = await bot.telegram.sendMessage(rec, msgText, { parse_mode: 'HTML' });
            tgMsgToSession[sent.message_id] = sessionId;
            session.lastUserMsgId = sent.message_id;
        } catch(e) {}
    }
    
    if (isFirstMessage) {
        sendToWs(sessionId, { type: 'system_msg', text: 'Сообщение получено. Ожидайте ответа оператора — обычно отвечаем в течение нескольких минут.' });
    }
}

let previewUpdateTimers = {};
async function updateTypingPreview(sessionId, text) {
    const session = chatSessions[sessionId];
    if (!session) return;

    const u = session.userInfo;
    const who = u.username ? \`@\${u.username}\` : (u.name || 'Гость');
    const previewText = \`<b>✏️ \${who} печатает:</b>\\n<i>\${escapeHtmlBot(text)}</i>\`;

    clearTimeout(previewUpdateTimers[sessionId]);
    previewUpdateTimers[sessionId] = setTimeout(async () => {
        const recipients = getSupportRecipients(session);
        session.tgPreviewMsgIds = session.tgPreviewMsgIds || {};
        for (const rec of recipients) {
            try {
                if (session.tgPreviewMsgIds[rec]) {
                    await bot.telegram.editMessageText(rec, session.tgPreviewMsgIds[rec], null, previewText, { parse_mode: 'HTML' });
                } else {
                    const sent = await bot.telegram.sendMessage(rec, previewText, { parse_mode: 'HTML' });
                    session.tgPreviewMsgIds[rec] = sent.message_id;
                    tgMsgToSession[sent.message_id] = sessionId;
                }
            } catch(e) {
                session.tgPreviewMsgIds[rec] = null;
            }
        }
    }, 350);
}

async function clearTypingPreview(sessionId, text = null) {
    clearTimeout(previewUpdateTimers[sessionId]);
    const session = chatSessions[sessionId];
    if (!session) return;
    
    const recipients = getSupportRecipients(session);
    session.tgPreviewMsgIds = session.tgPreviewMsgIds || {};
    
    for (const rec of recipients) {
        if (session.tgPreviewMsgIds[rec]) {
            if (text) {
                const u = session.userInfo;
                const who = u.username ? \`@\${u.username}\` : (u.name || 'Гость');
                const previewText = \`<b>✏️ \${who} (приостановил печать):</b>\\n<i>\${escapeHtmlBot(text)}</i>\`;
                try {
                    await bot.telegram.editMessageText(rec, session.tgPreviewMsgIds[rec], null, previewText, { parse_mode: 'HTML' });
                } catch(e) {}
            } else {
                try {
                    await bot.telegram.deleteMessage(rec, session.tgPreviewMsgIds[rec]);
                } catch(e) {}
                session.tgPreviewMsgIds[rec] = null;
            }
        }
    }
}

function escapeHtmlBot(str) {
`;

botJs = botJs.replace(supportFunctionsRegex, newSupportFunctions);

fs.writeFileSync('bot.js', botJs, 'utf8');
console.log('Support functions updated successfully.');
