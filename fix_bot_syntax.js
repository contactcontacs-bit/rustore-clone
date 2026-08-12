const fs = require('fs');

let content = fs.readFileSync('bot.js', 'utf8');

// Fix the syntax error I introduced
content = content.replace(/Date\.now\(\)'/g, "Date.now()");

fs.writeFileSync('bot.js', content, 'utf8');
console.log('Fixed bot.js syntax');
