const fs = require('fs');

let content = fs.readFileSync('bot.js', 'utf8');

// Replace the static timestamp with dynamic Date.now()
content = content.replace(/&v=1786529726054/g, "&v=' + Date.now()");

fs.writeFileSync('bot.js', content, 'utf8');
console.log('Fixed bot.js cache busting');
