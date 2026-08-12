const fs = require('fs');

let c = fs.readFileSync('app.html', 'utf8');

// 1. Remove body.style.overflow modifications which cause lag on iOS
c = c.replace(/document\.body\.style\.overflow = 'hidden';/g, "");
c = c.replace(/document\.body\.style\.overflow = '';/g, "");

// 2. Remove settings.js script and replace with dynamic fetch
c = c.replace('<script src="settings.js?v=1002"></script>', '');

const dynamicFetch = `
        // Fetch settings dynamically to bypass cache
        fetch('settings.json?t=' + new Date().getTime())
            .then(res => res.json())
            .then(data => { window.appSettings = data; })
            .catch(err => { window.appSettings = { tgLink: 'https://t.me/lizaa_hrr', hasVideo: false }; });
`;
c = c.replace('window.trackSupportClick = () => {', dynamicFetch + '\n        window.trackSupportClick = () => {');

// 3. Update Video button logic
// The user wants to play a video file directly uploaded via bot.
// Let's assume the bot saves it as `instruction.mp4` and sets `hasVideo: true` in settings.json
c = c.replace(/onclick="if\(window\.appSettings && window\.appSettings\.videoLink\).*?"/g, 
"onclick=\"if(window.appSettings && window.appSettings.hasVideo) { window.open('instruction.mp4?t=' + new Date().getTime(), '_blank'); } else { alert('Видео-инструкция пока не добавлена'); }\"");

fs.writeFileSync('app.html', c);
console.log('Fixed app.html scroll lags and dynamic settings loading');
