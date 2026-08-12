const fs = require('fs');

let c = fs.readFileSync('bot.js', 'utf8');

// 1. Remove the misplaced block from promptAddStep
const misplacedBlock = `
    if (state.step === 'edit_setting') {
        globalSettings[state.field] = text.trim();
        saveSettings();
        delete userState[chatId];
        ctx.reply("✅ Настройка сохранена!", Markup.inlineKeyboard([[{ text: '🔙 К настройкам', callback_data: 'settings' }]]));
        return;
    }
`;
c = c.replace(misplacedBlock, "");

// 2. Insert it correctly at the top of bot.on('text')
const botOnText = "bot.on('text', (ctx) => {";
const insertion = `
    const chatId = ctx.chat.id;
    const text = ctx.message.text;
    const state = userState[chatId];
    
    if (state && state.step === 'edit_setting') {
        globalSettings[state.field] = text.trim();
        saveSettings();
        delete userState[chatId];
        ctx.reply("✅ Настройка ТГ ссылки сохранена!", Markup.inlineKeyboard([[{ text: '🔙 К настройкам', callback_data: 'settings' }]]));
        return;
    }
`;

// wait, bot.on('text') already extracts chatId, text, state... Let's just insert it after state extraction.
// Let's find where bot.on('text') actually defines state.
