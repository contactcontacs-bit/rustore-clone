const fs = require('fs');

let botJs = fs.readFileSync('bot.js', 'utf8');

const adminLogic = `
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
    bot.handleUpdate({
        callback_query: { id: ctx.callbackQuery.id, from: ctx.from, message: ctx.callbackQuery.message, chat_instance: ctx.callbackQuery.chat_instance, data: 'manage_mirrors' }
    });
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
    const buttons = keys.map(k => [Markup.button.callback(`@\${mirrors[k].botUsername} (\${mirrors[k].username})`, `view_mirror_\${k}`)]);
    ctx.editMessageText("📋 **Список зеркал:**", { parse_mode: 'Markdown', reply_markup: { inline_keyboard: buttons } });
});

bot.action(/view_mirror_(.+)/, (ctx) => {
    if (!admins.includes(ctx.chat.id.toString())) return;
    const k = ctx.match[1];
    const m = mirrors[k];
    if (!m) return ctx.reply("Зеркало не найдено.");
    const msg = `🪞 Зеркало: @\${m.botUsername}\\n👤 Воркер: @\${m.username} (ID: \${k})\\n🛠 Права на свои приложения: \${m.canAddApps ? '✅ Да' : '❌ Нет'}`;
    const keyboard = Markup.inlineKeyboard([
        [Markup.button.callback(m.canAddApps ? '❌ Забрать права на приложения' : '✅ Выдать права на приложения', `toggle_app_rights_\${k}`)],
        [Markup.button.callback('🗑 Удалить зеркало', `delete_mirror_\${k}`)],
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
    bot.handleUpdate({ callback_query: { id: ctx.callbackQuery.id, from: ctx.from, message: ctx.callbackQuery.message, chat_instance: ctx.callbackQuery.chat_instance, data: `view_mirror_\${k}` } });
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

// Appending to bot.on('text')
const textLogic = `
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
`;

botJs = botJs.replace(/bot\.on\('text', async \(ctx, next\) => \{/, `$&\\n\${textLogic}`);
botJs = botJs.replace(/bot\.launch\(\)\.then/, `\${adminLogic}\\n$&`);

fs.writeFileSync('bot.js', botJs, 'utf8');
console.log('Admin features patched.');

