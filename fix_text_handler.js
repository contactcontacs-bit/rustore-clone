const fs = require('fs');

// ============ 1. Remove old button from index.html ============
let idx = fs.readFileSync('index.html', 'utf8');
idx = idx.replace(/\s*<!-- Floating Chat Button -->\s*<div[^>]*onclick="alert[^>]*>[\s\S]*?<\/div>/m, '');
fs.writeFileSync('index.html', idx);
console.log('Removed duplicate button from index.html');

// ============ 2. Fix bot.js ============
let bot = fs.readFileSync('bot.js', 'utf8');

// 2a. Remove the wrongly placed code inside promptAddStep (lines 83-120 area)
bot = bot.replace(
`    if (state.step === 'operator_send') {
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

    if (state.step === 'edit_setting') {`,
    `    if (state.step === 'edit_setting') {`
);

// 2b. Now inject the correct handlers into bot.on('text'), right after the reply_to_message block
const replyBlockEnd = `            ctx.reply('✅ Отправлено').catch(()=>{});
            return;
        }
    }

    if (!userState[chatId]) return;`;

const replyBlockNew = `            ctx.reply('✅ Отправлено').catch(()=>{});
            return;
        }
    }

    // Handle operator typing a reply from /chats panel
    if (userState[chatId] && (userState[chatId].step === 'chat_reply' || userState[chatId].step === 'operator_send')) {
        const { sessionId } = userState[chatId];
        delete userState[chatId];
        if (sessionId && chatSessions[sessionId]) {
            const time = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
            sendToWs(sessionId, { type: 'operator_reply', text: msgText, time });
            if (!chatSessions[sessionId].messages) chatSessions[sessionId].messages = [];
            chatSessions[sessionId].messages.push({ from: 'operator', text: msgText, time: new Date().toISOString() });
            saveSessions();
            ctx.reply('✅ Отправлено!', Markup.inlineKeyboard([[{ text: '🔙 К диалогам', callback_data: 'view_chats' }]])).catch(()=>{});
        } else {
            ctx.reply('❌ Сессия не найдена или пользователь отключился.').catch(()=>{});
        }
        return;
    }

    if (!userState[chatId]) return;`;

bot = bot.replace(replyBlockEnd, replyBlockNew);

fs.writeFileSync('bot.js', bot);
console.log('Fixed bot.js text handler');
