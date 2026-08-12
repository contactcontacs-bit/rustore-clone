const fs = require('fs');

// 1. Restore page load logging for BOTH index.html and app.html
const restoreLoadLog = (file) => {
    let c = fs.readFileSync(file, 'utf8');
    
    // Check if it already has the load event (we removed it earlier)
    if (!c.includes("window.addEventListener('load', () => {")) {
        // Insert it right before "// Global functions"
        const insertPoint = '// Global functions for tracking button clicks';
        const loadLogCode = `
        // Fire the log on page load
        window.addEventListener('load', () => {
            const isAppPage = window.location.pathname.includes('app.html');
            sendAdminLog(isAppPage ? 'Новый переход на страницу приложения' : 'Новый переход в RuStore');
        });

        `;
        c = c.replace(insertPoint, loadLogCode + insertPoint);
        fs.writeFileSync(file, c);
        console.log('Restored load logging in ' + file);
    }
};

restoreLoadLog('index.html');
restoreLoadLog('app.html');


// 2. Redesign Screen 3 in app.html to clarify TG vs Tech Support
let appHtml = fs.readFileSync('app.html', 'utf8');

const oldScreen3 = appHtml.substring(appHtml.indexOf('<div id="bs-screen-prepare"'), appHtml.indexOf('</div>\n        </div>\n    </div>') + 6);

const newScreen3 = `
            <div id="bs-screen-prepare" style="display: none;">
                <h2 class="bs-title" style="text-align: center;">Подготовка к установке</h2>
                
                <div class="bs-hero-card" style="padding: 32px 24px;">
                    <div class="bs-hero-icon" style="width: 64px; height: 64px; margin-bottom: 20px;">
                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
                    </div>
                    <div class="bs-hero-title" style="font-size: 24px; margin-bottom: 12px;">Аккаунт готов</div>
                    <div class="bs-hero-sub" style="font-size: 15px; opacity: 1;">Используйте данные ниже для входа в Apple ID</div>
                </div>

                <div style="background: #f5f6f8; border-radius: 16px; padding: 24px 20px; margin-bottom: 24px; text-align: center;">
                    <p style="margin: 0 0 20px 0; color: #1a1a1a; font-size: 15px; line-height: 1.5;">
                        В данный момент аккаунт выдается через нашего бота в Telegram, либо вы можете запросить его через тех. поддержку на сайте.
                    </p>
                    <button class="bs-btn-primary" style="margin-bottom: 0;" onclick="if(window.trackDataClick) window.trackDataClick(); window.open('https://t.me/ВСТАВЬТЕ_ССЫЛКУ_СЮДА', '_blank')">Получить аккаунт в Telegram</button>
                </div>

                <button class="bs-btn-primary" style="background: #e6f0ff; color: #0077ff;" onclick="if(window.trackSupportClick) { window.trackSupportClick(); } alert('Окно тех. поддержки скоро появится');">Написать в тех. поддержку</button>
                <button class="bs-btn-danger" style="margin-top: 12px;" onclick="cancelInstallation()">Прервать установку</button>
            </div>
`.trim();

appHtml = appHtml.substring(0, appHtml.indexOf('<div id="bs-screen-prepare"')) + newScreen3 + '\n' + appHtml.substring(appHtml.indexOf('</div>\n        </div>\n    </div>'));
fs.writeFileSync('app.html', appHtml);
console.log('Updated Screen 3 UI');
