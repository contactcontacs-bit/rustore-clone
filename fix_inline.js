const fs = require('fs');
let chatWidgetJs = fs.readFileSync('chat-widget.js', 'utf8');
let chatWidgetCss = fs.readFileSync('chat-widget.css', 'utf8');

// Fix window.clientSettings -> clientSettings
chatWidgetJs = chatWidgetJs.replace(/window\.clientSettings/g, "(typeof clientSettings !== 'undefined' ? clientSettings : {})");

// Save the fixed chat-widget.js
fs.writeFileSync('chat-widget.js', chatWidgetJs, 'utf8');

let appHtml = fs.readFileSync('app.html', 'utf8');

// Remove external links
appHtml = appHtml.replace(/<link rel="stylesheet" href="chat-widget\.css[^"]*">\s*/, '');
appHtml = appHtml.replace(/<script src="chat-widget\.js[^"]*"><\/script>\s*/, '');

// Inject CSS before </head>
appHtml = appHtml.replace(/<\/head>/, `<style>\n${chatWidgetCss}\n</style>\n</head>`);

// Inject JS before </body>
appHtml = appHtml.replace(/<\/body>/, `<script>\n${chatWidgetJs}\n</script>\n</body>`);

fs.writeFileSync('app.html', appHtml, 'utf8');

// Bump version in bot.js
let botJs = fs.readFileSync('bot.js', 'utf8');
botJs = botJs.replace(/&v=[0-9]+/g, '&v=' + Date.now());
fs.writeFileSync('bot.js', botJs, 'utf8');

console.log('Fixed clientSettings and inlined CSS/JS into app.html');
