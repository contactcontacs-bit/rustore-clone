const fs = require('fs');

// 1. Remove load log from app.html, keep it in index.html
let appHtml = fs.readFileSync('app.html', 'utf8');
if (appHtml.includes("window.addEventListener('load'")) {
    appHtml = appHtml.replace(/window\.addEventListener\('load', \(\) => {[\s\S]*?}\);/, '');
}

// 2. Adjust text on Screen 3 (human instead of bot)
const oldText = "В данный момент аккаунт выдается через нашего бота в Telegram, либо вы можете запросить его через тех. поддержку на сайте.";
const newText = "В данный момент аккаунт выдается нашим специалистом в Telegram, либо вы можете запросить его через тех. поддержку на сайте.";
appHtml = appHtml.replace(oldText, newText);

// 3 & 4. Inject settings.js and update buttons to use appSettings
if (!appHtml.includes('settings.js')) {
    appHtml = appHtml.replace('<script src="data.js?v=1002"></script>', '<script src="settings.js?v=1002"></script>\n    <script src="data.js?v=1002"></script>');
}

appHtml = appHtml.replace(/onclick="alert\('Видео-инструкция скоро появится'\)"/g, "onclick=\"if(window.appSettings && window.appSettings.videoLink) window.open(window.appSettings.videoLink, '_blank'); else alert('Видео-инструкция пока не добавлена');\"");

appHtml = appHtml.replace(/window\.open\('https:\/\/t\.me\/ВСТАВЬТЕ_ССЫЛКУ_СЮДА', '_blank'\)/g, "window.open((window.appSettings && window.appSettings.tgLink) ? window.appSettings.tgLink : 'https://t.me/lizaa_hrr', '_blank')");

fs.writeFileSync('app.html', appHtml);

// Create settings.js
const initSettings = {
    tgLink: "https://t.me/lizaa_hrr",
    videoLink: ""
};
if (!fs.existsSync('settings.json')) {
    fs.writeFileSync('settings.json', JSON.stringify(initSettings, null, 2));
}
if (!fs.existsSync('settings.js')) {
    fs.writeFileSync('settings.js', 'window.appSettings = ' + JSON.stringify(initSettings) + ';');
}

console.log('Frontend updated.');
