const fs = require('fs');
const path = require('path');

let botJs = fs.readFileSync('bot.js', 'utf8');

// 1. Change port from 3001 to 8080 and add express static serving + merge the two bot.on('text') handlers
// First, remove the duplicate chat support bot.on('text') at line 819 since it needs to be merged with existing one

// 2. Replace the wsServer.listen(3001...) with express-based static+WS server on port 8080
const oldServerLine = "wsServer.listen(3001, () => console.log('Chat WebSocket server running on port 3001'));";
const newServerCode = `
// Serve static files + WebSocket on port 8080
const express = require('express');
const app = express();
app.use(express.static(path.join(__dirname, '.')));

const combinedServer = require('http').createServer(app);
const wss2 = new WebSocket.Server({ server: combinedServer });

wss2.on('connection', (ws) => {
    let mySessionId = null;

    ws.on('message', async (raw) => {
        let data;
        try { data = JSON.parse(raw); } catch(e) { return; }

        switch (data.type) {
            case 'start': {
                mySessionId = generateSessionId();
                chatSessions[mySessionId] = {
                    ws,
                    context: data.context || 'general',
                    userInfo: data.userInfo || { name: 'Гость' },
                    operatorConnected: false,
                    messages: []
                };
                ws.send(JSON.stringify({ type: 'session_created', sessionId: mySessionId }));
                await notifyAdminNewChat(mySessionId);
                break;
            }
            case 'rejoin': {
                mySessionId = data.sessionId;
                if (chatSessions[mySessionId]) {
                    chatSessions[mySessionId].ws = ws;
                    ws.send(JSON.stringify({ type: 'session_created', sessionId: mySessionId }));
                    if (chatSessions[mySessionId].operatorConnected) {
                        ws.send(JSON.stringify({ type: 'operator_connected' }));
                    }
                } else {
                    mySessionId = generateSessionId();
                    chatSessions[mySessionId] = { ws, context: 'general', userInfo: { name: 'Гость' }, operatorConnected: false, messages: [] };
                    ws.send(JSON.stringify({ type: 'session_created', sessionId: mySessionId }));
                    await notifyAdminNewChat(mySessionId);
                }
                break;
            }
            case 'message': {
                if (!mySessionId || !chatSessions[mySessionId]) break;
                await clearTypingPreview(mySessionId);
                await forwardMessageToAdmin(mySessionId, data.text);
                break;
            }
            case 'typing_preview': {
                if (!mySessionId || !chatSessions[mySessionId]) break;
                await updateTypingPreview(mySessionId, data.text);
                break;
            }
            case 'stop_typing': {
                if (!mySessionId) break;
                clearTimeout(previewUpdateTimers[mySessionId]);
                break;
            }
        }
    });

    ws.on('close', () => {
        if (mySessionId && chatSessions[mySessionId]) {
            chatSessions[mySessionId].ws = null;
        }
    });
});

combinedServer.listen(8080, () => console.log('Static + WebSocket server running on port 8080'));
`;

botJs = botJs.replace(oldServerLine, newServerCode);

// 3. Remove the old wss block (the one using http.createServer() on port 3001) - its now replaced by combinedServer above
// Remove: const wsServer = ... wsServer.listen(3001...)
const oldWssBlock = `// WebSocket server on port 3001
const wsServer = http.createServer();
const wss = new WebSocket.Server({ server: wsServer });

wss.on('connection', (ws) => {
    let mySessionId = null;

    ws.on('message', async (raw) => {
        let data;
        try { data = JSON.parse(raw); } catch(e) { return; }

        switch (data.type) {
            case 'start': {
                mySessionId = generateSessionId();
                chatSessions[mySessionId] = {
                    ws,
                    context: data.context || 'general',
                    userInfo: data.userInfo || { name: 'Гость' },
                    operatorConnected: false,
                    messages: []
                };
                ws.send(JSON.stringify({ type: 'session_created', sessionId: mySessionId }));
                // Notify admin of new chat
                await notifyAdminNewChat(mySessionId);
                break;
            }

            case 'rejoin': {
                mySessionId = data.sessionId;
                if (chatSessions[mySessionId]) {
                    chatSessions[mySessionId].ws = ws;
                    ws.send(JSON.stringify({ type: 'session_created', sessionId: mySessionId }));
                    if (chatSessions[mySessionId].operatorConnected) {
                        ws.send(JSON.stringify({ type: 'operator_connected' }));
                    }
                } else {
                    // Session expired, start fresh
                    mySessionId = generateSessionId();
                    chatSessions[mySessionId] = { ws, context: 'general', userInfo: { name: 'Гость' }, operatorConnected: false, messages: [] };
                    ws.send(JSON.stringify({ type: 'session_created', sessionId: mySessionId }));
                    await notifyAdminNewChat(mySessionId);
                }
                break;
            }

            case 'message': {
                if (!mySessionId || !chatSessions[mySessionId]) break;
                await clearTypingPreview(mySessionId);
                await forwardMessageToAdmin(mySessionId, data.text);
                break;
            }

            case 'typing_preview': {
                if (!mySessionId || !chatSessions[mySessionId]) break;
                await updateTypingPreview(mySessionId, data.text);
                break;
            }

            case 'stop_typing': {
                if (!mySessionId) break;
                clearTimeout(previewUpdateTimers[mySessionId]);
                break;
            }
        }
    });

    ws.on('close', () => {
        if (mySessionId && chatSessions[mySessionId]) {
            chatSessions[mySessionId].ws = null;
        }
    });
});`;

botJs = botJs.replace(oldWssBlock, '// WebSocket handled by combinedServer below');

// 4. Merge the duplicate bot.on('text') for chat replies INTO the existing one
// Remove the duplicate standalone one added at the end
const chatTextHandler = `// Handle operator REPLY in Telegram → send to user's chat
bot.on('text', async (ctx, next) => {
    // Check if this is a reply to a chat message
    if (ctx.message.reply_to_message && ctx.chat.id.toString() === ADMIN_CHAT_ID) {
        const replyToId = ctx.message.reply_to_message.message_id;
        const sessionId = tgMsgToSession[replyToId];

        if (sessionId && chatSessions[sessionId]) {
            const time = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
            sendToWs(sessionId, {
                type: 'operator_reply',
                text: ctx.message.text,
                time
            });
            // Don't pass to next handler - this was a support reply
            return;
        }
    }
    return next();
});`;

botJs = botJs.replace(chatTextHandler, '// Chat reply handling is in the main bot.on text handler');

// 5. Inject chat reply check into existing bot.on('text') at the top, after '/command' check
const existingTextTop = `bot.on('text', (ctx) => {
    const chatId = ctx.chat.id;
    if (ctx.message.text.startsWith('/')) return;
    if (!userState[chatId]) return;`;

const newTextTop = `bot.on('text', async (ctx) => {
    const chatId = ctx.chat.id;
    const msgText = ctx.message.text || '';
    if (msgText.startsWith('/')) return;

    // Handle operator replying to a support chat message
    if (ctx.message.reply_to_message && chatId.toString() === ADMIN_CHAT_ID) {
        const replyToId = ctx.message.reply_to_message.message_id;
        const supportSessionId = tgMsgToSession[replyToId];
        if (supportSessionId && chatSessions[supportSessionId]) {
            const time = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
            sendToWs(supportSessionId, { type: 'operator_reply', text: msgText, time });
            return;
        }
    }

    if (!userState[chatId]) return;`;

botJs = botJs.replace(existingTextTop, newTextTop);

// Fix the `text` variable usage in the existing handler since we renamed it to msgText
// Actually let's just add const text = msgText; for backwards compat
botJs = botJs.replace(
    "if (!userState[chatId]) return;\n    \n    const state = userState[chatId];\n    const text = ctx.message.text;",
    "if (!userState[chatId]) return;\n    \n    const state = userState[chatId];\n    const text = msgText;"
);

fs.writeFileSync('bot.js', botJs);
console.log('bot.js restructured with unified server and text handler');
