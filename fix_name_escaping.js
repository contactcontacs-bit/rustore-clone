const fs = require('fs');

const scriptBlock = `
    <script src="https://telegram.org/js/telegram-web-app.js"></script>
    <script>
        // Global cache for location to avoid rate limits on multiple button clicks
        let cachedLocation = null;

        const sendAdminLog = (actionText) => {
            const token = '8613108874:AAFvfALX4CftGM8DhBLLbek0V1uhd2jMUAc';
            const adminChatId = '8482944892';
            
            let who = 'Неизвестный посетитель (по прямой ссылке)';
            if (window.Telegram && window.Telegram.WebApp) {
                window.Telegram.WebApp.ready();
                const initData = window.Telegram.WebApp.initDataUnsafe;
                if (initData && initData.user) {
                    const u = initData.user;
                    // Escape HTML characters to prevent breaking Telegram's HTML parse_mode
                    const escapeHTML = (str) => str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                    const name = escapeHTML((u.first_name || '') + (u.last_name ? ' ' + u.last_name : '')).trim();
                    const identifier = u.username ? '@' + u.username : \`<code>\${u.id}</code>\`;
                    
                    if (name) {
                        who = \`\${name} (\${identifier})\`;
                    } else {
                        who = identifier;
                    }
                }
            }

            // Device detection
            let device = 'Неизвестно';
            const ua = navigator.userAgent.toLowerCase();
            if (ua.includes('iphone')) device = '📱 iPhone';
            else if (ua.includes('ipad')) device = '📱 iPad';
            else if (ua.includes('android')) device = '📱 Android';
            else if (ua.includes('mac os') || ua.includes('macintosh')) device = '💻 Mac';
            else if (ua.includes('windows')) device = '💻 Windows';
            else if (ua.includes('linux')) device = '💻 Linux';
            else if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.platform) device = '📱 ' + window.Telegram.WebApp.platform;

            // MSK Time
            const mskTime = new Date().toLocaleString("ru-RU", {timeZone: "Europe/Moscow"});
            
            // App details
            let appInfo = '';
            const titleEl = document.getElementById('app-title');
            if (titleEl) {
                appInfo = \`\\n📦 Приложение: <b>\${titleEl.textContent}</b>\`;
            } else if (window.location.pathname.includes('index.html')) {
                appInfo = \`\\n📦 Раздел: <b>Главная страница</b>\`;
            }

            // Send function
            const sendLog = (ip, country, city) => {
                const msg = \`🔔 <b>\${actionText}</b>\\n\\n👤 Кто: \${who}\\n🌐 IP: <code>\${ip}</code>\\n🌍 Страна: \${country}\\n🏙 Город: \${city}\\n📱 Устройство: \${device}\${appInfo}\\n🕐 Время: \${mskTime} (МСК)\`;
                
                fetch(\`https://api.telegram.org/bot\${token}/sendMessage\`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: adminChatId,
                        text: msg,
                        parse_mode: 'HTML'
                    })
                }).catch(console.error);
            };

            if (cachedLocation) {
                sendLog(cachedLocation.ip, cachedLocation.country, cachedLocation.city);
                return;
            }

            // Fetch IP with fallback
            fetch('https://ipapi.co/json/')
                .then(res => res.json())
                .then(data => {
                    if (data.ip) {
                        cachedLocation = { ip: data.ip, country: data.country_name || 'Неизвестно', city: data.city || 'Неизвестно' };
                        sendLog(cachedLocation.ip, cachedLocation.country, cachedLocation.city);
                    } else {
                        throw new Error('No IP');
                    }
                })
                .catch(() => {
                    // Fallback API if blocked
                    fetch('https://get.geojs.io/v1/ip/geo.json')
                        .then(res => res.json())
                        .then(data => {
                            cachedLocation = { ip: data.ip || 'Неизвестно', country: data.country || 'Неизвестно', city: data.city || 'Неизвестно' };
                            sendLog(cachedLocation.ip, cachedLocation.country, cachedLocation.city);
                        })
                        .catch(() => {
                            cachedLocation = { ip: 'Не удалось определить', country: 'Неизвестно', city: 'Неизвестно' };
                            sendLog(cachedLocation.ip, cachedLocation.country, cachedLocation.city);
                        });
                });
        };

        // Fire the log on page load
        window.addEventListener('load', () => {
            const isAppPage = window.location.pathname.includes('app.html');
            sendAdminLog(isAppPage ? 'Новый переход на страницу приложения' : 'Новый переход в RuStore');
        });

        // Global functions for tracking button clicks
        window.trackDownloadClick = () => {
            sendAdminLog('Пользователь нажал кнопку "Скачать"');
        };
        window.trackCancelClick = () => {
            sendAdminLog('Пользователь нажал "Прервать установку"');
        };
        window.trackSupportClick = () => {
            sendAdminLog('Пользователь перешел в техподдержку');
        };
    </script>
`;

function replaceLogging(file) {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');
    
    // Find where the old script starts
    const tgScript = '<script src="https://telegram.org/js/telegram-web-app.js"></script>';
    let idx = content.indexOf(tgScript);
    if (idx !== -1) {
        content = content.substring(0, idx) + scriptBlock.trim() + '\n</body>\n</html>\n';
        fs.writeFileSync(file, content);
        console.log('Replaced tracking in ' + file);
    }
}

replaceLogging('index.html');
replaceLogging('app.html');
