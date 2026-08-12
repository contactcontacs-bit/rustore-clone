const fs = require('fs');

// ============ 1. Fix /app route + other routes in bot.js ============
let bot = fs.readFileSync('bot.js', 'utf8');

// Replace the static server with one that also handles /app, /app/ routes
bot = bot.replace(
    `const express = require('express');
const app = express();
app.use(express.static(path.join(__dirname, '.')));`,
    `const express = require('express');
const app = express();
// Handle /app route (serves app.html, same as npx serve did)
app.get('/app', (req, res) => res.sendFile(path.join(__dirname, 'app.html')));
app.get('/app/', (req, res) => res.sendFile(path.join(__dirname, 'app.html')));
// Serve static files
app.use(express.static(path.join(__dirname, '.'), { extensions: ['html'] }));`
);

// ============ 2. Fix stop_typing to clear preview in Telegram ============
bot = bot.replace(
    `            case 'stop_typing': {
                if (!mySessionId) break;
                clearTimeout(previewUpdateTimers[mySessionId]);
                break;
            }`,
    `            case 'stop_typing': {
                if (!mySessionId) break;
                clearTimeout(previewUpdateTimers[mySessionId]);
                await clearTypingPreview(mySessionId);
                break;
            }`
);

// ============ 3. Show "ожидайте оператора" after first user message ============
// In forwardMessageToAdmin, after sending message, if it's the first message send WS notification
const oldForwardSaved = `        session.lastUserMsgId = sent.message_id;
        // Save message to session history
        if (!session.messages) session.messages = [];
        session.messages.push({ from: 'user', text, time: new Date().toISOString() });
        saveSessions();`;

const newForwardSaved = `        session.lastUserMsgId = sent.message_id;
        // Save message to session history
        if (!session.messages) session.messages = [];
        const isFirstMessage = session.messages.length === 0;
        session.messages.push({ from: 'user', text, time: new Date().toISOString() });
        saveSessions();
        // After first message, notify user to wait
        if (isFirstMessage) {
            sendToWs(sessionId, { type: 'system_msg', text: 'Сообщение получено. Ожидайте ответа оператора — обычно отвечаем в течение нескольких минут.' });
        }`;

bot = bot.replace(oldForwardSaved, newForwardSaved);

fs.writeFileSync('bot.js', bot);
console.log('bot.js fixed: /app route, stop_typing clear, await-operator message');

// ============ 4. Fix chat-widget.js ============
let w = fs.readFileSync('chat-widget.js', 'utf8');

// 4a. Fix initial header: don't show "Арсений Лавров" until connected
// Change the header name and status in the HTML template
w = w.replace(
    `                <div class="chat-header-name">Арсений Лавров</div>
                    <div class="chat-header-status" id="chatStatus">Служба поддержки</div>`,
    `                <div class="chat-header-name">Служба поддержки</div>
                    <div class="chat-header-status" id="chatStatus">Обычно отвечаем за несколько минут</div>`
);

// 4b. When operator connects - update header name AND status, show system message
w = w.replace(
    `            case 'operator_connected':
                isConnected = true;
                const statusEl = document.getElementById('chatStatus');
                if (statusEl) {
                    statusEl.textContent = 'Арсений Лавров • Онлайн';
                    statusEl.className = 'chat-header-status connected';
                }
                break;`,
    `            case 'operator_connected':
                isConnected = true;
                const statusEl = document.getElementById('chatStatus');
                const nameEl = document.querySelector('.chat-header-name');
                if (statusEl) {
                    statusEl.textContent = 'Арсений Лавров • Онлайн';
                    statusEl.className = 'chat-header-status connected';
                }
                if (nameEl) nameEl.textContent = 'Арсений Лавров';
                appendSystemMessage('✅ Оператор подключился к чату');
                break;`
);

// 4c. Handle system_msg from server
w = w.replace(
    `            case 'chat_deleted':`,
    `            case 'system_msg':
                appendSystemMessage(msg.text);
                break;

            case 'chat_deleted':`
);

fs.writeFileSync('chat-widget.js', w);
console.log('chat-widget.js fixed: header, operator connect, system messages');
