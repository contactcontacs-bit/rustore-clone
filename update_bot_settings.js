const fs = require('fs');

let botJs = fs.readFileSync('bot.js', 'utf8');

// 1. Add global settings object
const settingsInit = `
let globalSettings = {};
if (fs.existsSync('settings.json')) {
    globalSettings = JSON.parse(fs.readFileSync('settings.json', 'utf8'));
} else {
    globalSettings = { tgLink: 'https://t.me/lizaa_hrr', videoLink: '' };
    fs.writeFileSync('settings.json', JSON.stringify(globalSettings, null, 2));
}

function saveSettings() {
    fs.writeFileSync('settings.json', JSON.stringify(globalSettings, null, 2));
    fs.writeFileSync('settings.js', 'window.appSettings = ' + JSON.stringify(globalSettings) + ';');
}
saveSettings(); // Ensure settings.js exists on startup
`;

if (!botJs.includes('let globalSettings = {};')) {
    botJs = botJs.replace("let appsData = {};", "let appsData = {};\n" + settingsInit);
}

// 2. Add Settings to main menu
if (!botJs.includes("'⚙️ Настройки'")) {
    botJs = botJs.replace("[Markup.button.callback('📋 Мои приложения', 'list_apps')]", "[Markup.button.callback('📋 Мои приложения', 'list_apps')],\n        [Markup.button.callback('⚙️ Настройки', 'settings')]");
}

// 3. Handle settings actions
const settingsActions = `
bot.action('settings', (ctx) => {
    delete userState[ctx.chat.id];
    const msg = \`⚙️ *Настройки:*\n\n💬 Ссылка на ТГ за аккаунтом: \${globalSettings.tgLink || 'Не задано'}\n🎥 Ссылка на видео-инструкцию: \${globalSettings.videoLink || 'Не задано'}\`;
    const keyboard = Markup.inlineKeyboard([
        [{ text: '✏️ Изменить ТГ ссылку', callback_data: 'edit_setting_tgLink' }],
        [{ text: '✏️ Изменить видео ссылку', callback_data: 'edit_setting_videoLink' }],
        [{ text: '🔙 Назад', callback_data: 'back_start' }]
    ]);
    if (ctx.callbackQuery) {
        ctx.editMessageText(msg, { parse_mode: 'Markdown', reply_markup: keyboard.reply_markup }).catch(()=>{});
    } else {
        ctx.reply(msg, { parse_mode: 'Markdown', reply_markup: keyboard.reply_markup });
    }
    ctx.answerCbQuery().catch(()=>{});
});

bot.action(/^edit_setting_(.+)$/, (ctx) => {
    const field = ctx.match[1];
    userState[ctx.chat.id] = { step: \`edit_setting\`, field };
    const names = { tgLink: 'ТГ аккаунта (где выдают данные)', videoLink: 'Видео-инструкции' };
    ctx.reply(\`✏️ Отправьте новую ссылку для \${names[field] || field}:\`, { reply_markup: { inline_keyboard: [[{ text: '❌ Отмена', callback_data: 'settings' }]] } });
    ctx.answerCbQuery().catch(()=>{});
});
`;

if (!botJs.includes("bot.action('settings'")) {
    botJs = botJs.replace("bot.action('back_start', (ctx) => {", settingsActions + "\nbot.action('back_start', (ctx) => {");
}

// 4. Handle text for settings
const textHandler = `
    if (state.step === 'edit_setting') {
        globalSettings[state.field] = text.trim();
        saveSettings();
        delete userState[chatId];
        ctx.reply("✅ Настройка сохранена!", Markup.inlineKeyboard([[{ text: '🔙 К настройкам', callback_data: 'settings' }]]));
        return;
    }
`;

if (!botJs.includes("state.step === 'edit_setting'")) {
    botJs = botJs.replace("if (state.step === 'id') {", textHandler + "\n    if (state.step === 'id') {");
}

fs.writeFileSync('bot.js', botJs);
console.log('bot.js updated with settings menu.');
