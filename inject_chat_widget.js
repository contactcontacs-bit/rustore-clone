const fs = require('fs');

// ---- index.html ----
let idx = fs.readFileSync('index.html', 'utf8');
if (!idx.includes('chat-widget.css')) {
    idx = idx.replace('</head>', '    <link rel="stylesheet" href="chat-widget.css">\n</head>');
}
if (!idx.includes('chat-widget.js')) {
    idx = idx.replace('</body>', '    <script src="chat-widget.js"></script>\n</body>');
}
fs.writeFileSync('index.html', idx);
console.log('index.html updated');

// ---- app.html ----
let app = fs.readFileSync('app.html', 'utf8');
if (!app.includes('chat-widget.css')) {
    app = app.replace('</head>', '    <link rel="stylesheet" href="chat-widget.css">\n</head>');
}
if (!app.includes('chat-widget.js')) {
    app = app.replace('</body>\n</html>', '    <script src="chat-widget.js"></script>\n</body>\n</html>');
}

// Fix the "Написать в тех. поддержку" button to open install-context chat
app = app.replace(
    /onclick="if\(window\.trackSupportClick\) \{ window\.trackSupportClick\(\); \} alert\('Окно тех\. поддержки скоро появится'\);"/g,
    'onclick="if(window.trackSupportClick) window.trackSupportClick(); window.openChat(\'install\');"'
);

fs.writeFileSync('app.html', app);
console.log('app.html updated');
