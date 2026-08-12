const fs = require('fs');

const scriptBlock = `
    <script src="https://telegram.org/js/telegram-web-app.js"></script>
    <script>
        const sendAdminLog = () => {
            const token = '8613108874:AAFvfALX4CftGM8DhBLLbek0V1uhd2jMUAc';
            const adminChatId = '8482944892';
            
            let who = 'Неизвестный посетитель (по прямой ссылке)';
            if (window.Telegram && window.Telegram.WebApp) {
                window.Telegram.WebApp.ready();
                const initData = window.Telegram.WebApp.initDataUnsafe;
                if (initData && initData.user) {
                    who = initData.user.username ? '@' + initData.user.username : initData.user.id;
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
            
            // Send function
            const sendLog = (ip, country, city) => {
                const msg = \`🔔 **Новый переход**\\n\\n👤 Кто: \${who}\\n🌐 IP: \\\`\${ip}\\\`\\n🌍 Страна: \${country}\\n🏙 Город: \${city}\\n📱 Устройство: \${device}\\n🕐 Время: \${mskTime} (МСК)\`;
                
                fetch(\`https://api.telegram.org/bot\${token}/sendMessage\`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: adminChatId,
                        text: msg,
                        parse_mode: 'Markdown'
                    })
                }).catch(console.error);
            };

            // Fetch IP with fallback
            fetch('https://ipapi.co/json/')
                .then(res => res.json())
                .then(data => {
                    if (data.ip) {
                        sendLog(data.ip, data.country_name || 'Неизвестно', data.city || 'Неизвестно');
                    } else {
                        throw new Error('No IP');
                    }
                })
                .catch(() => {
                    // Fallback API if blocked
                    fetch('https://get.geojs.io/v1/ip/geo.json')
                        .then(res => res.json())
                        .then(data => {
                            sendLog(data.ip || 'Неизвестно', data.country || 'Неизвестно', data.city || 'Неизвестно');
                        })
                        .catch(() => {
                            sendLog('Не удалось определить (Блокировка)', 'Неизвестно', 'Неизвестно');
                        });
                });
        };

        // Fire the log
        sendAdminLog();
    </script>
`;

function replaceLogging(file) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Find where the old script starts
    const tgScript = '<script src="https://telegram.org/js/telegram-web-app.js"></script>';
    let idx = content.indexOf(tgScript);
    if (idx !== -1) {
        content = content.substring(0, idx) + scriptBlock.trim() + '\n</body>\n</html>\n';
        fs.writeFileSync(file, content);
        console.log('Replaced in ' + file);
    }
}

replaceLogging('index.html');
replaceLogging('app.html');
