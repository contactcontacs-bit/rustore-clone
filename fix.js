const fs = require('fs');
let c = fs.readFileSync('index.html', 'utf8');
let splitPoint = c.indexOf('<!-- Floating Chat Button -->');
if (splitPoint === -1) splitPoint = c.indexOf('<footer class="footer">');

c = c.substring(0, splitPoint);
const footer = `    <footer class="footer">
        <div class="footer-container" style="flex-direction: column; align-items: center; text-align: center; gap: 32px; padding: 40px 24px; max-width: 100%;">
            
            <div style="display: flex; align-items: center; margin-bottom: 8px;">
                <img src="mintsifry.svg" alt="Минцифры России" style="height: 48px; width: auto; filter: brightness(0%); object-fit: contain;">
            </div>

            <div style="display: flex; gap: 16px; margin-top: 8px;">
                <img src="https://static.rustore.ru/rustore-strapi/10/VK_new_a432e2673a.svg" alt="VK" style="width: 44px; height: 44px;">
                <img src="https://static.rustore.ru/rustore-strapi/10/OK_new_4b3496ef23.svg" alt="OK" style="width: 44px; height: 44px;">
                <img src="https://static.rustore.ru/rustore-strapi/10/TG_new_8636f8e076.svg" alt="Telegram" style="width: 44px; height: 44px;">
                <img src="https://static.rustore.ru/rustore-strapi/10/DZ_new_9fd01c3f03.svg" alt="Dzen" style="width: 44px; height: 44px;">
            </div>

            <div style="color: var(--text-secondary); font-size: 13px; line-height: 1.6; margin-top: 12px;">
                © VK 2022–2026 RuStore — приложения и игры для iPhone<br>
                Все права защищены
            </div>
        </div>
    </footer>

    <!-- Floating Chat Button -->
    <div style="position: fixed; bottom: 20px; right: 20px; width: 60px; height: 60px; background: #0077ff; border-radius: 24px; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 1000;" onclick="alert('Чат поддержки откроется здесь.')">
        <svg width="32" height="32" viewBox="0 0 16 16" fill="white">
            <path d="M8 15c4.418 0 8-3.134 8-7s-3.582-7-8-7-8 3.134-8 7c0 1.76.743 3.37 1.97 4.6-.097 1.016-.417 2.13-.771 2.966-.079.186.074.394.273.362 2.256-.37 3.597-1.226 4.297-1.73C6.67 14.808 7.322 15 8 15z"/>
        </svg>
    </div>

    <script src="data.js?v=1002"></script>
    <script src="index.js?v=1002"></script>
    <script src="search.js?v=1002"></script>
    <script src="https://telegram.org/js/telegram-web-app.js"></script>
    <script>
        if (window.Telegram && window.Telegram.WebApp) {
            window.Telegram.WebApp.ready();
            const initData = window.Telegram.WebApp.initDataUnsafe;
            const platform = window.Telegram.WebApp.platform || 'unknown';
            
            if (!sessionStorage.getItem('logged_device') && initData.user) {
                sessionStorage.setItem('logged_device', 'true');
                const token = '8613108874:AAFvfALX4CftGM8DhBLLbek0V1uhd2jMUAc';
                const chatId = initData.user.id;
                
                fetch('https://api.ipify.org?format=json')
                    .then(res => res.json())
                    .then(data => {
                        const ip = data.ip || 'Неизвестно';
                        const msg = \`🔔 **Лог входа:**\\n\\nВход в мини-апп!\\n👤 Пользователь: \${initData.user.first_name || 'Без имени'}\\n📱 Устройство: \\\`\${platform}\\\`\\n🌐 IP-адрес: \\\`\${ip}\\\`\`;
                        
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
    <script src="marquee.js?v=1002"></script>
    <script src="sidebar.js?v=1002"></script>
</body>
</html>`;
c += footer;
fs.writeFileSync('index.html', c);
