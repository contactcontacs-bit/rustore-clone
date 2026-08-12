const fs = require('fs');

// ============================================================
// 1. Remove old duplicate floating button from app.html
// ============================================================
let appHtml = fs.readFileSync('app.html', 'utf8');
appHtml = appHtml.replace(
    /\s*<!-- Floating Chat Button -->\s*<div[^>]*onclick="alert[^>]*>[\s\S]*?<\/div>/,
    ''
);
fs.writeFileSync('app.html', appHtml);
console.log('Removed duplicate floating button from app.html');

// ============================================================
// 2. Fix bot.js: sessions persistence, faster preview,
//    operator can write first, admin /chats panel, delete dialog
// ============================================================
let bot = fs.readFileSync('bot.js', 'utf8');

// 2a. Add sessions persistence helpers after chatSessions declaration
const chatSessionsDecl = `// sessions: { [sessionId]: { ws, context, userInfo, tgMsgId, tgPreviewMsgId, operatorConnected, messages[] } }
const chatSessions = {};
// Map from Telegram message_id → sessionId (so operator can reply)
const tgMsgToSession = {};`;

const chatSessionsNew = `// sessions: { [sessionId]: { ws, context, userInfo, tgConnectMsgId, tgPreviewMsgId, operatorConnected, messages[] } }
const chatSessions = {};
// Map from Telegram message_id → sessionId (so operator can reply)
const tgMsgToSession = {};
// Operator state: when operator clicked "reply to session" from /chats panel
const operatorReplyState = {};

const SESSIONS_FILE = 'support_sessions.json';

function saveSessions() {
    const toSave = {};
    for (const [id, s] of Object.entries(chatSessions)) {
        toSave[id] = {
            context: s.context,
            userInfo: s.userInfo,
            messages: s.messages || [],
            operatorConnected: s.operatorConnected,
            tgConnectMsgId: s.tgConnectMsgId || null,
            lastUserMsgId: s.lastUserMsgId || null,
            createdAt: s.createdAt || Date.now()
        };
    }
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(toSave, null, 2));
}

function loadSessions() {
    if (!fs.existsSync(SESSIONS_FILE)) return;
    try {
        const saved = JSON.parse(fs.readFileSync(SESSIONS_FILE, 'utf8'));
        for (const [id, s] of Object.entries(saved)) {
            chatSessions[id] = { ...s, ws: null };
            if (s.lastUserMsgId) tgMsgToSession[s.lastUserMsgId] = id;
            if (s.tgConnectMsgId) tgMsgToSession[s.tgConnectMsgId] = id;
        }
        console.log(\`Loaded \${Object.keys(saved).length} support sessions from file\`);
    } catch(e) {
        console.log('Could not load sessions:', e.message);
    }
}
loadSessions();`;

bot = bot.replace(chatSessionsDecl, chatSessionsNew);

// 2b. Speed up typing preview debounce: 1500ms -> 350ms
bot = bot.replace('}, 1500);', '}, 350);');

// 2c. Save sessions whenever messages are added - patch forwardMessageToAdmin
const oldForwardEnd = `        session.lastUserMsgId = sent.message_id;
    } catch(e) {
        console.error('Forward message error:', e.message);
    }
}`;
const newForwardEnd = `        session.lastUserMsgId = sent.message_id;
        // Save message to session history
        if (!session.messages) session.messages = [];
        session.messages.push({ from: 'user', text, time: new Date().toISOString() });
        saveSessions();
    } catch(e) {
        console.error('Forward message error:', e.message);
    }
}`;
bot = bot.replace(oldForwardEnd, newForwardEnd);

// 2d. Save sessions when operator replies
const oldReplyCode = `            sendToWs(supportSessionId, { type: 'operator_reply', text: msgText, time });
            return;`;
const newReplyCode = `            sendToWs(supportSessionId, { type: 'operator_reply', text: msgText, time });
            if (!chatSessions[supportSessionId].messages) chatSessions[supportSessionId].messages = [];
            chatSessions[supportSessionId].messages.push({ from: 'operator', text: msgText, time: new Date().toISOString() });
            saveSessions();
            ctx.reply('✅ Отправлено').catch(()=>{});
            return;`;
bot = bot.replace(oldReplyCode, newReplyCode);

// 2e. Add createdAt when creating new session
bot = bot.replace(
    `chatSessions[mySessionId] = {\n                    ws,\n                    context: data.context || 'general',\n                    userInfo: data.userInfo || { name: 'Гость' },\n                    operatorConnected: false,\n                    messages: []\n                };`,
    `chatSessions[mySessionId] = {\n                    ws,\n                    context: data.context || 'general',\n                    userInfo: data.userInfo || { name: 'Гость' },\n                    operatorConnected: false,\n                    messages: [],\n                    createdAt: Date.now()\n                };\n                saveSessions();`
);

// 2f. Send message history when rejoining session
const oldRejoinOk = `                    chatSessions[mySessionId].ws = ws;\n                    ws.send(JSON.stringify({ type: 'session_created', sessionId: mySessionId }));\n                    if (chatSessions[mySessionId].operatorConnected) {\n                        ws.send(JSON.stringify({ type: 'operator_connected' }));\n                    }`;
const newRejoinOk = `                    chatSessions[mySessionId].ws = ws;\n                    ws.send(JSON.stringify({ type: 'session_created', sessionId: mySessionId }));\n                    // Send message history\n                    if (chatSessions[mySessionId].messages && chatSessions[mySessionId].messages.length > 0) {\n                        ws.send(JSON.stringify({ type: 'history', messages: chatSessions[mySessionId].messages }));\n                    }\n                    if (chatSessions[mySessionId].operatorConnected) {\n                        ws.send(JSON.stringify({ type: 'operator_connected' }));\n                    }`;
bot = bot.replace(oldRejoinOk, newRejoinOk);

// 2g. Handle operator "send first" - userState for operator initiating message
// Add after chat_connect handler
const oldConnectEnd = `    await ctx.answerCbQuery('Вы подключились к чату!').catch(()=>{});
});`;
const newConnectEnd = `    await ctx.answerCbQuery('Вы подключились к чату!').catch(()=>{});
    // Prompt operator to send first message
    userState[ctx.chat.id] = { step: 'operator_send', sessionId };
    await ctx.reply('✏️ Напишите сообщение пользователю:', {
        reply_markup: { inline_keyboard: [[{ text: '❌ Пропустить', callback_data: 'cancel_operator_send' }]] }
    }).catch(()=>{});
});

bot.action('cancel_operator_send', (ctx) => {
    delete userState[ctx.chat.id];
    ctx.answerCbQuery().catch(()=>{});
    ctx.reply('Хорошо, можете ответить позже через reply на сообщение пользователя.').catch(()=>{});
});`;
bot = bot.replace(oldConnectEnd, newConnectEnd);

// 2h. Handle operator_send state in text handler
const oldEditSettingCheck = `    if (state.step === 'edit_setting') {`;
const newEditSettingCheck = `    if (state.step === 'operator_send') {
        const { sessionId } = state;
        delete userState[chatId];
        if (chatSessions[sessionId]) {
            const time = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
            sendToWs(sessionId, { type: 'operator_reply', text: msgText, time });
            if (!chatSessions[sessionId].messages) chatSessions[sessionId].messages = [];
            chatSessions[sessionId].messages.push({ from: 'operator', text: msgText, time: new Date().toISOString() });
            saveSessions();
            ctx.reply('✅ Сообщение отправлено пользователю').catch(()=>{});
        } else {
            ctx.reply('❌ Сессия не найдена или пользователь отключился').catch(()=>{});
        }
        return;
    }

    // Handle /chats reply state
    if (state.step === 'chat_reply') {
        const { sessionId } = state;
        delete userState[chatId];
        if (chatSessions[sessionId]) {
            const time = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
            sendToWs(sessionId, { type: 'operator_reply', text: msgText, time });
            if (!chatSessions[sessionId].messages) chatSessions[sessionId].messages = [];
            chatSessions[sessionId].messages.push({ from: 'operator', text: msgText, time: new Date().toISOString() });
            saveSessions();
            ctx.reply('✅ Отправлено!', Markup.inlineKeyboard([[{ text: '🔙 К диалогам', callback_data: 'view_chats' }]])).catch(()=>{});
        } else {
            ctx.reply('❌ Сессия не найдена').catch(()=>{});
        }
        return;
    }

    if (state.step === 'edit_setting') {`;
bot = bot.replace(oldEditSettingCheck, newEditSettingCheck);

// 2i. Add /chats admin panel and delete dialog
const adminChatsCode = `
// ---- Admin /chats panel ----
bot.command('chats', (ctx) => {
    if (ctx.chat.id.toString() !== ADMIN_CHAT_ID) return;
    showChatsList(ctx);
});

bot.action('view_chats', (ctx) => {
    if (ctx.chat.id.toString() !== ADMIN_CHAT_ID) return;
    delete userState[ctx.chat.id];
    showChatsList(ctx);
    ctx.answerCbQuery().catch(()=>{});
});

function showChatsList(ctx) {
    const sessions = Object.entries(chatSessions);
    if (sessions.length === 0) {
        const msg = '💬 Нет активных диалогов.';
        if (ctx.callbackQuery) ctx.editMessageText(msg, { reply_markup: { inline_keyboard: [[{ text: '🔙 Меню', callback_data: 'back_start' }]] } }).catch(() => ctx.reply(msg));
        else ctx.reply(msg, Markup.inlineKeyboard([[Markup.button.callback('🔙 Меню', 'back_start')]]));
        return;
    }
    const buttons = sessions.map(([id, s]) => {
        const u = s.userInfo || {};
        const who = u.username ? \`@\${u.username}\` : (u.name || 'Гость');
        const ctx_label = s.context === 'install' ? '🔧' : '💬';
        const online = s.ws && s.ws.readyState === 1 ? '🟢' : '🔴';
        const msgs = (s.messages || []).length;
        return [{ text: \`\${online} \${ctx_label} \${who} (\${msgs} сообщ.)\`, callback_data: \`view_chat_\${id}\` }];
    });
    buttons.push([{ text: '🔙 Меню', callback_data: 'back_start' }]);
    const msg = \`💬 <b>Диалоги тех. поддержки:</b>\\n🟢 = онлайн, 🔴 = офлайн\\n\\nВсего: \${sessions.length}\`;
    if (ctx.callbackQuery) {
        ctx.editMessageText(msg, { parse_mode: 'HTML', reply_markup: { inline_keyboard: buttons } }).catch(() => ctx.reply(msg, { parse_mode: 'HTML', reply_markup: { inline_keyboard: buttons } }));
    } else {
        ctx.reply(msg, { parse_mode: 'HTML', reply_markup: { inline_keyboard: buttons } });
    }
}

bot.action(/^view_chat_(.+)$/, (ctx) => {
    if (ctx.chat.id.toString() !== ADMIN_CHAT_ID) return;
    const sessionId = ctx.match[1];
    const s = chatSessions[sessionId];
    if (!s) {
        ctx.editMessageText('❌ Диалог не найден').catch(()=>{});
        ctx.answerCbQuery().catch(()=>{});
        return;
    }
    const u = s.userInfo || {};
    const who = u.username ? \`@\${u.username}\` : (u.name || 'Гость');
    const online = s.ws && s.ws.readyState === 1 ? '🟢 Онлайн' : '🔴 Офлайн';
    const ctxLabel = s.context === 'install' ? '🔧 Установка' : '💬 Общая';

    const history = (s.messages || []).slice(-10).map(m => {
        const who2 = m.from === 'user' ? '👤' : '🛠';
        const t = m.time ? new Date(m.time).toLocaleTimeString('ru-RU', {hour:'2-digit', minute:'2-digit'}) : '';
        return \`\${who2} <i>\${t}</i>: \${escapeHtmlBot(m.text)}\`;
    }).join('\\n');

    const msg = \`👤 <b>\${who}</b> | \${ctxLabel} | \${online}\\n\\n<b>Последние сообщения:</b>\\n\${history || '(пусто)'}\`;
    const buttons = [
        [{ text: '✏️ Ответить', callback_data: \`reply_chat_\${sessionId}\` }],
        [{ text: '🗑 Удалить диалог', callback_data: \`delete_chat_\${sessionId}\` }],
        [{ text: '🔙 К диалогам', callback_data: 'view_chats' }]
    ];
    ctx.editMessageText(msg, { parse_mode: 'HTML', reply_markup: { inline_keyboard: buttons } }).catch(()=>{});
    ctx.answerCbQuery().catch(()=>{});
});

bot.action(/^reply_chat_(.+)$/, (ctx) => {
    if (ctx.chat.id.toString() !== ADMIN_CHAT_ID) return;
    const sessionId = ctx.match[1];
    userState[ctx.chat.id] = { step: 'chat_reply', sessionId };
    ctx.reply('✏️ Напишите ответ пользователю:', {
        reply_markup: { inline_keyboard: [[{ text: '❌ Отмена', callback_data: \`view_chat_\${sessionId}\` }]] }
    }).catch(()=>{});
    ctx.answerCbQuery().catch(()=>{});
});

bot.action(/^delete_chat_(.+)$/, async (ctx) => {
    if (ctx.chat.id.toString() !== ADMIN_CHAT_ID) return;
    const sessionId = ctx.match[1];
    if (chatSessions[sessionId]) {
        // Notify user their chat was reset
        sendToWs(sessionId, { type: 'chat_deleted' });
        // Remove from tgMsgToSession
        for (const [msgId, sid] of Object.entries(tgMsgToSession)) {
            if (sid === sessionId) delete tgMsgToSession[msgId];
        }
        delete chatSessions[sessionId];
        saveSessions();
    }
    ctx.editMessageText('🗑 Диалог удалён. Пользователь может начать заново.', {
        reply_markup: { inline_keyboard: [[{ text: '🔙 К диалогам', callback_data: 'view_chats' }]] }
    }).catch(()=>{});
    ctx.answerCbQuery('Диалог удалён').catch(()=>{});
});
`;

// Insert admin chats code before bot.launch
bot = bot.replace(
    "// WebSocket handled by combinedServer below",
    adminChatsCode + "\n// WebSocket handled by combinedServer below"
);

// 2j. Add "💬 Диалоги" button to main menu
bot = bot.replace(
    "[Markup.button.callback('⚙️ Настройки', 'settings')]",
    "[Markup.button.callback('⚙️ Настройки', 'settings')],\n        [Markup.button.callback('💬 Диалоги поддержки', 'view_chats')]"
);

fs.writeFileSync('bot.js', bot);
console.log('bot.js updated');
