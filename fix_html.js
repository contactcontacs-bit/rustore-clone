const fs = require('fs');

function fixHtml(file) {
    let content = fs.readFileSync(file, 'utf8');
    const newStr = `chat_id: (window.Telegram?.WebApp?.initDataUnsafe?.user?.id || '8482944892')`;
    content = content.replace(/chat_id:\s*'8482944892'/g, newStr);
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed', file);
}

fixHtml('app.html');
fixHtml('index.html');
