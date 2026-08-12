const fs = require('fs');

let chatWidgetJs = fs.readFileSync('chat-widget.js', 'utf8');
let chatWidgetCss = fs.readFileSync('chat-widget.css', 'utf8');

let indexHtml = fs.readFileSync('index.html', 'utf8');

// Remove external links
indexHtml = indexHtml.replace(/<link rel="stylesheet" href="chat-widget\.css[^"]*">\s*/, '');
indexHtml = indexHtml.replace(/<script src="chat-widget\.js[^"]*"><\/script>\s*/, '');

// Inject CSS before </head>
indexHtml = indexHtml.replace(/<\/head>/, `<style>\n${chatWidgetCss}\n</style>\n</head>`);

// Inject JS before </body>
indexHtml = indexHtml.replace(/<\/body>/, `<script>\n${chatWidgetJs}\n</script>\n</body>`);

fs.writeFileSync('index.html', indexHtml, 'utf8');

console.log('Inlined CSS/JS into index.html');
