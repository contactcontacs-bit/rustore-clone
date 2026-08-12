const fs = require('fs');

// ============ 1. Fix widget stop_typing ============
let w = fs.readFileSync('chat-widget.js', 'utf8');

w = w.replace(
    `            // Stop typing signal after 3 seconds of inactivity
            typingTimer = setTimeout(() => {
                if (ws && ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({ type: 'stop_typing', sessionId }));
                }
            }, 3000);`,
    `            // Stop typing signal after 3 seconds of inactivity
            typingTimer = setTimeout(() => {
                if (ws && ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({ type: 'stop_typing', sessionId, text: currentTypingText }));
                }
            }, 3000);`
);

fs.writeFileSync('chat-widget.js', w);

// ============ 2. Fix bot.js clearTypingPreview and operator_send mode ============
let bot = fs.readFileSync('bot.js', 'utf8');

// 2a. Update clearTypingPreview to keep text
const oldClearPreview = `async function clearTypingPreview(sessionId) {
    clearTimeout(previewUpdateTimers[sessionId]);
    const session = chatSessions[sessionId];
    if (session && session.tgPreviewMsgId) {
        try {
            await bot.telegram.deleteMessage(ADMIN_CHAT_ID, session.tgPreviewMsgId);
        } catch(e) {}
        session.tgPreviewMsgId = null;
    }
}`;

const newClearPreview = `async function clearTypingPreview(sessionId, text = null) {
    clearTimeout(previewUpdateTimers[sessionId]);
    const session = chatSessions[sessionId];
    if (session && session.tgPreviewMsgId) {
        if (text) {
            const u = session.userInfo;
            const who = u.username ? \`@\${u.username}\` : (u.name || 'Гость');
            const previewText = \`<b>✏️ \${who} (приостановил печать):</b>\\n<i>\${escapeHtmlBot(text)}</i>\`;
            try {
                await bot.telegram.editMessageText(ADMIN_CHAT_ID, session.tgPreviewMsgId, null, previewText, { parse_mode: 'HTML' });
            } catch(e) {}
        } else {
            try {
                await bot.telegram.deleteMessage(ADMIN_CHAT_ID, session.tgPreviewMsgId);
            } catch(e) {}
            session.tgPreviewMsgId = null;
        }
    }
}`;
bot = bot.replace(oldClearPreview, newClearPreview);

// 2b. Update the ws handler to pass text to clearTypingPreview
bot = bot.replace(
    `            case 'stop_typing': {
                if (!mySessionId) break;
                clearTimeout(previewUpdateTimers[mySessionId]);
                await clearTypingPreview(mySessionId);
                break;
            }`,
    `            case 'stop_typing': {
                if (!mySessionId) break;
                clearTimeout(previewUpdateTimers[mySessionId]);
                await clearTypingPreview(mySessionId, data.text);
                break;
            }`
);

// 2c. When message is sent, call clearTypingPreview without text to delete the preview message
bot = bot.replace(
    `                await clearTypingPreview(mySessionId);
                await forwardMessageToAdmin(mySessionId, data.text);`,
    `                await clearTypingPreview(mySessionId, null);
                await forwardMessageToAdmin(mySessionId, data.text);`
);

// 2d. Keep operator in "operator_send"/"chat_reply" state after sending message
bot = bot.replace(
    `    // Handle operator typing a reply from /chats panel
    if (userState[chatId] && (userState[chatId].step === 'chat_reply' || userState[chatId].step === 'operator_send')) {
        const { sessionId } = userState[chatId];
        delete userState[chatId];`,
    `    // Handle operator typing a reply from /chats panel
    if (userState[chatId] && (userState[chatId].step === 'chat_reply' || userState[chatId].step === 'operator_send')) {
        const { sessionId } = userState[chatId];
        // DO NOT delete userState, let them send multiple messages!`
);

// 2e. Operator connected WS msg to user (we fixed this before, let's make sure it's triggered)
// In bot.action('chat_connect_...'), it does:
// sendToWs(sessionId, { type: 'operator_connected' });
// And chat-widget.js appends it. No action needed for this part since it's already there.

fs.writeFileSync('bot.js', bot);
console.log('Fixed bot.js and chat-widget.js');
