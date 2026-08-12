const fs = require('fs');

// ============ Fix chat-widget.js ============
let w = fs.readFileSync('chat-widget.js', 'utf8');

// 1. Remove context badge from widget HTML (user shouldn't see "general/install" labels)
w = w.replace(
`            <div class="chat-context-badge" id="chatContextBadge">
                Тема: <span id="chatContextLabel">Общая поддержка</span>
            </div>`,
    ''
);

// 2. Change initial status - don't mention operator by name until connected
w = w.replace(
    `<div class="chat-header-status" id="chatStatus">Ожидание подключения...</div>`,
    `<div class="chat-header-status" id="chatStatus">Служба поддержки</div>`
);

// 3. Remove the system message "Напишите ваш вопрос. Оператор подключится в течение нескольких минут."
w = w.replace(
    `<div class="chat-system-msg">Напишите ваш вопрос. Оператор подключится в течение нескольких минут.</div>`,
    `<div class="chat-system-msg">Напишите ваш вопрос — мы ответим в ближайшее время.</div>`
);

// 4. Don't show "Оператор Арсений Лавров подключился к чату" as system msg,
//    only update the header status - remove the appendSystemMessage call
w = w.replace(
    `appendSystemMessage('✅ Оператор Арсений Лавров подключился к чату');`,
    ``
);

// Also update status to show operator name when connected
w = w.replace(
    `statusEl.textContent = 'Арсений подключился';`,
    `statusEl.textContent = 'Арсений Лавров • Онлайн';`
);

fs.writeFileSync('chat-widget.js', w);
console.log('Fixed chat-widget.js');

// ============ Fix Telegram preview to show username + sent message clearly ============
let bot = fs.readFileSync('bot.js', 'utf8');

// Fix updateTypingPreview to show a clear card with username
const oldPreviewText = "const previewText = `${contextLabel} ${who} печатает...\\n\\n✏️ <i>${escapeHtmlBot(text)}</i>`;";
const newPreviewText = `const contextLabel = session.context === 'install' ? '🔧 Установка' : '💬 Поддержка';
    const previewText = \`<b>\${contextLabel} — \${who}</b>\\n✏️ <i>печатает: \${escapeHtmlBot(text)}</i>\`;`;

// The function already has contextLabel defined above, so we need to be more careful
// Let's just update the format of the previewText line
bot = bot.replace(
    `    const previewText = \`\${contextLabel} \${who} печатает...\\n\\n✏️ <i>\${escapeHtmlBot(text)}</i>\`;`,
    `    const previewText = \`<b>✏️ \${who} печатает:</b>\\n<i>\${escapeHtmlBot(text)}</i>\`;`
);

// Fix forwardMessageToAdmin to show a clear message format
const oldForwardMsg = "    const msgText = `${contextLabel} ${who}:\\n${text}`;";
const newForwardMsg = `    const contextIcon = session.context === 'install' ? '🔧' : '💬';
    const msgText = \`\${contextIcon} <b>\${who}:</b>\\n\${escapeHtmlBot(text)}\`;`;

bot = bot.replace(oldForwardMsg, newForwardMsg);

// Fix sendMessage to use HTML parse mode
bot = bot.replace(
    `        const sent = await bot.telegram.sendMessage(ADMIN_CHAT_ID, msgText);
        // Map this message ID for replies
        tgMsgToSession[sent.message_id] = sessionId;`,
    `        const sent = await bot.telegram.sendMessage(ADMIN_CHAT_ID, msgText, { parse_mode: 'HTML' });
        // Map this message ID for replies
        tgMsgToSession[sent.message_id] = sessionId;`
);

fs.writeFileSync('bot.js', bot);
console.log('Fixed bot.js preview and message format');
