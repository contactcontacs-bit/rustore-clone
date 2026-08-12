const fs = require('fs');

let c = fs.readFileSync('bot.js', 'utf8');

// Replace *Настройки:* with <b>Настройки:</b>
c = c.replace(/⚙️ \*Настройки:\*/g, '⚙️ <b>Настройки:</b>');

// Replace parse_mode: 'Markdown' with 'HTML' in the settings block
// Find the settings block
const settingsStart = c.indexOf("bot.action('settings'");
if (settingsStart !== -1) {
    const settingsEnd = c.indexOf("});", settingsStart);
    let settingsBlock = c.substring(settingsStart, settingsEnd + 3);
    settingsBlock = settingsBlock.replace(/parse_mode: 'Markdown'/g, "parse_mode: 'HTML'");
    c = c.substring(0, settingsStart) + settingsBlock + c.substring(settingsEnd + 3);
}

fs.writeFileSync('bot.js', c);
console.log('Fixed Markdown parse error in bot settings');
