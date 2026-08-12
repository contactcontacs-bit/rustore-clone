const fs = require('fs');

let c = fs.readFileSync('app.html', 'utf8');

// 1. Replace the "Ваши данные в безопасности" card on Screen 1
const oldCard = `
                <div class="bs-info-card">
                    <div class="bs-info-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                    </div>
                    <div class="bs-info-content">
                        <h4>Ваши данные в безопасности</h4>
                        <p>Аккаунт используется временно только для установки</p>
                    </div>
                </div>
`.trim();

const newCard = `
                <div class="bs-info-card">
                    <div class="bs-info-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
                    </div>
                    <div class="bs-info-content">
                        <h4>Официальный аккаунт</h4>
                        <p>Установка происходит с общего аккаунта разработчика</p>
                    </div>
                </div>
`.trim();

c = c.replace(oldCard, newCard);

// 2. Redesign Screen 3 (Prepare Account)
const oldScreen3 = c.substring(c.indexOf('<div id="bs-screen-prepare"'), c.indexOf('</div>\n        </div>\n    </div>') + 6);

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
                        В данный момент данные для входа выдаются через Telegram.<br><b>Напишите нам, чтобы получить аккаунт.</b>
                    </p>
                    <button class="bs-btn-primary" style="margin-bottom: 0;" onclick="if(window.trackDataClick) window.trackDataClick(); window.open('https://t.me/ВСТАВЬТЕ_ССЫЛКУ_СЮДА', '_blank')">Получить данные в Telegram</button>
                </div>

                <button class="bs-btn-primary" style="background: #e6f0ff; color: #0077ff;" onclick="if(window.trackSupportClick) { window.trackSupportClick(); } window.open('https://t.me/lizaa_hrr', '_blank');">Служба поддержки</button>
                <button class="bs-btn-danger" style="margin-top: 12px;" onclick="cancelInstallation()">Прервать установку</button>
            </div>
`.trim();

c = c.substring(0, c.indexOf('<div id="bs-screen-prepare"')) + newScreen3 + '\n' + c.substring(c.indexOf('</div>\n        </div>\n    </div>'));

fs.writeFileSync('app.html', c);
console.log('Updated app.html');

// 3. Add trackDataClick to app.html's tracking script
let jsContent = fs.readFileSync('app.html', 'utf8');
if (!jsContent.includes('trackDataClick')) {
    jsContent = jsContent.replace('window.trackSupportClick = () => {', 
        "window.trackDataClick = () => { sendAdminLog('Пользователь перешел в ТГ за данными'); };\n        window.trackSupportClick = () => {");
    fs.writeFileSync('app.html', jsContent);
}

// 4. Update tracking in index.html for consistency
let indexContent = fs.readFileSync('index.html', 'utf8');
if (indexContent.includes('window.trackSupportClick') && !indexContent.includes('trackDataClick')) {
    indexContent = indexContent.replace('window.trackSupportClick = () => {', 
        "window.trackDataClick = () => { sendAdminLog('Пользователь перешел в ТГ за данными'); };\n        window.trackSupportClick = () => {");
    fs.writeFileSync('index.html', indexContent);
}
