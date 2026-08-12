const fs = require('fs');

let content = fs.readFileSync('bot.js', 'utf8');

const oldRejoin = `            case 'rejoin': {
                mySessionId = data.sessionId;
                if (chatSessions[mySessionId]) {
                    chatSessions[mySessionId].ws = ws;
                    ws.send(JSON.stringify({ type: 'session_created', sessionId: mySessionId }));
                    // Send message history
                    if (chatSessions[mySessionId].messages && chatSessions[mySessionId].messages.length > 0) {
                        ws.send(JSON.stringify({ type: 'history', messages: chatSessions[mySessionId].messages }));
                    }
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
            }`;

const newRejoin = `            case 'rejoin': {
                mySessionId = data.sessionId;
                if (chatSessions[mySessionId]) {
                    chatSessions[mySessionId].ws = ws;
                    ws.send(JSON.stringify({ type: 'session_created', sessionId: mySessionId }));
                    // Send message history
                    if (chatSessions[mySessionId].messages && chatSessions[mySessionId].messages.length > 0) {
                        ws.send(JSON.stringify({ type: 'history', messages: chatSessions[mySessionId].messages }));
                    }
                    if (chatSessions[mySessionId].operatorConnected) {
                        ws.send(JSON.stringify({ type: 'operator_connected' }));
                    }
                } else {
                    // SERVER RESTARTED: The client has a cached session, but the server lost it.
                    // Tell the client the chat is deleted so it resets and sends a fresh 'start' with userInfo!
                    ws.send(JSON.stringify({ type: 'chat_deleted' }));
                }
                break;
            }`;

if (content.includes(oldRejoin)) {
    content = content.replace(oldRejoin, newRejoin);
    fs.writeFileSync('bot.js', content, 'utf8');
    console.log('Fixed rejoin logic in bot.js');
} else {
    console.log('Error: Could not find the old rejoin block in bot.js');
}
