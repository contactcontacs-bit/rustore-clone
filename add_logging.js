const fs = require('fs');

const scriptBlock = `
    <script src="https://telegram.org/js/telegram-web-app.js"></script>
    <script>
        if (window.Telegram && window.Telegram.WebApp) {
            window.Telegram.WebApp.ready();
            const initData = window.Telegram.WebApp.initDataUnsafe;
            
            if (initData && initData.user) {
                const token = '8613108874:AAFvfALX4CftGM8DhBLLbek0V1uhd2jMUAc';
                const chatId = initData.user.id;
                
                // Device detection
                let device = 'Неизвестно';
                const ua = navigator.userAgent.toLowerCase();
                if (ua.includes('iphone')) device = '📱 iPhone';
                else if (ua.includes('ipad')) device = '📱 iPad';
                else if (ua.includes('android')) device = '📱 Android';
                else if (ua.includes('mac os') || ua.includes('macintosh')) device = '💻 Mac';
                else if (ua.includes('windows')) device = '💻 Windows';
                else if (ua.includes('linux')) device = '💻 Linux';
                else device = '📱 ' + (window.Telegram.WebApp.platform || 'Unknown');

                // User details
                const who = initData.user.username ? '@' + initData.user.username : initData.user.id;
                
                // MSK Time
                const mskTime = new Date().toLocaleString("ru-RU", {timeZone: "Europe/Moscow"});
                
                // Real Timezone (can help bypass VPN)
                const realTz = Intl.DateTimeFormat().resolvedOptions().timeZone;

                fetch('https://get.geojs.io/v1/ip/geo.json')
                    .then(res => res.json())
                    .then(data => {
                        const ip = data.ip || 'Неизвестно';
                        const country = data.country || 'Неизвестно';
                        const city = data.city || 'Неизвестно';
                        
                        const msg = \`🔔 **Новый переход в RuStore!**\\n\\n👤 Кто: \${who}\\n🌐 IP: \\\`\${ip}\\\`\\n🌍 Страна: \${country} (Часовой пояс: \${realTz})\\n🏙 Город: \${city}\\n📱 Устройство: \${device}\\n🕐 Время: \${mskTime} (МСК)\`;
                        
                        return fetch(\`https://api.telegram.org/bot\${token}/sendMessage\`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                chat_id: chatId,
                                text: msg,
                                parse_mode: 'Markdown'
                            })
                        });
                    })
                    .catch(e => console.error(e));
            }
        }
    </script>
`;

function inject(file) {
    let content = fs.readFileSync(file, 'utf8');
    if (!content.includes('https://telegram.org/js/telegram-web-app.js')) {
        content = content.replace('</body>', scriptBlock + '</body>');
        fs.writeFileSync(file, content);
        console.log('Injected into ' + file);
    }
}

inject('index.html');
inject('app.html');
