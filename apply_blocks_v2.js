const fs = require('fs');

['index.html', 'app.html'].forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // The strict access check to inject
    const strictCheck = `
    <script>
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
    </script>
    `;

    // Remove the old checks so they don't interfere
    content = content.replace(/if \(window\.Telegram && window\.Telegram\.WebApp\) \{\s*const platform = window\.Telegram\.WebApp\.platform \|\| '';[\s\S]*?return;\s*\}/g, '');
    
    // Insert new check after telegram-web-app.js
    content = content.replace(/<script src="https:\/\/telegram\.org\/js\/telegram-web-app\.js"><\/script>/g, '<script src="https://telegram.org/js/telegram-web-app.js"></script>' + strictCheck);
    
    fs.writeFileSync(file, content, 'utf8');
});
console.log('Applied strict browser and Windows blocks successfully');
