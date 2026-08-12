const fs = require('fs');

['index.html', 'app.html'].forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // The strict access check to inject
    const strictCheck = `
        (function() {
            let isTelegram = (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initData);
            
            // Check platform
            let platform = (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.platform) ? window.Telegram.WebApp.platform.toLowerCase() : 'unknown';
            let blockedPlatforms = ['tdesktop', 'web', 'weba', 'unigram', 'unknown', 'windows'];
            
            if (!isTelegram || blockedPlatforms.includes(platform)) {
                document.body.innerHTML = '<div style="display:flex; height:100vh; align-items:center; justify-content:center; flex-direction:column; background:#121212; color:white; font-family:sans-serif; text-align:center; padding: 20px;"><h2>Доступ запрещен</h2><p>Пожалуйста, используйте мобильное приложение Telegram для доступа к платформе.</p></div>';
                window.isAccessDenied = true;
                return;
            }
        })();
    `;

    // Replace the old access check
    content = content.replace(/\(function\(\) \{\s*if \(window\.Telegram && window\.Telegram\.WebApp\) \{[\s\S]*?return;\s*\}\s*\}\s*\}\)\(\);/, strictCheck);
    
    fs.writeFileSync(file, content, 'utf8');
});
console.log('Applied strict browser and Windows blocks');
