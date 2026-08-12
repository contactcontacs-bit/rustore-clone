const fs = require('fs');

const robustGetUserInfo = `    function getUserInfo() {
        if (window.Telegram && window.Telegram.WebApp) {
            let userObj = window.Telegram.WebApp.initDataUnsafe?.user;
            
            if (!userObj && window.Telegram.WebApp.initData) {
                const params = new URLSearchParams(window.Telegram.WebApp.initData);
                if (params.get('user')) {
                    try { userObj = JSON.parse(decodeURIComponent(params.get('user'))); } catch(e) {}
                }
            }
            
            if (!userObj) {
                userObj = window.Telegram.WebApp.initDataUnsafe?.chat;
            }

            if (userObj) {
                const name = ((userObj.first_name || '') + ' ' + (userObj.last_name || '')).trim() || 'Без Имени';
                return { name, username: userObj.username || null, id: userObj.id };
            }
            
            return { name: 'DEBUG: ' + (window.Telegram.WebApp.initData ? 'NoUserObj' : 'NoInitData'), username: null, id: null };
        }
        return { name: 'DEBUG: NoTelegram', username: null, id: null };
    }`;

['index.html', 'app.html'].forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace the old getUserInfo block
    content = content.replace(/function getUserInfo\(\) \{[\s\S]*?return \{ name: 'Гость', username: null, id: null \};\s*\}/, robustGetUserInfo);
    
    // Rename session ID again to force a new session for this debug attempt
    content = content.replace(/supportSessionId_v2/g, 'supportSessionId_v3');
    
    fs.writeFileSync(file, content, 'utf8');
});
console.log('Injected robust getUserInfo');
