const fs = require('fs');
let code = fs.readFileSync('bot.js', 'utf8');

// 1. Fix block_user to prevent blocking creator
code = code.replace(/bot\.action\(\/block_user_\(\.\+\)\/, \(ctx\) => \{\n\s*if \(!admins\.includes\(ctx\.chat\.id\.toString\(\)\)\) return ctx\.answerCbQuery\("Отказано в доступе"\);\n\s*const mammothId = ctx\.match\[1\];/g, 
`bot.action(/block_user_(.+)/, (ctx) => {
    if (!admins.includes(ctx.chat.id.toString())) return ctx.answerCbQuery("Отказано в доступе");
    const mammothId = ctx.match[1];
    if (mammothId === ADMIN_CHAT_ID_LEGACY) return ctx.answerCbQuery("❌ Нельзя заблокировать создателя!");`);

// 2. Fix reply_markup in blocked_users
code = code.replace(/\{ reply_markup: Markup\.inlineKeyboard\(\[\[Markup\.button\.callback\('🔙 Назад', 'back_start'\)\]\]\) \}/g,
"{ reply_markup: Markup.inlineKeyboard([[Markup.button.callback('🔙 Назад', 'back_start')]]).reply_markup }");

code = code.replace(/\{ parse_mode: 'Markdown', reply_markup: Markup\.inlineKeyboard\(buttons\) \}/g,
"{ parse_mode: 'Markdown', reply_markup: Markup.inlineKeyboard(buttons).reply_markup }");

fs.writeFileSync('bot.js', code, 'utf8');
console.log('Patched blocking logic');
