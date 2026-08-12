const fs = require('fs');

// --- 1. CSS Injection ---
const cssContent = `
/* Bottom Sheet Modal Styles */
.bottom-sheet-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.4);
    z-index: 2000;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s ease;
}
.bottom-sheet-overlay.active {
    opacity: 1;
    pointer-events: auto;
}
.bottom-sheet {
    background: #fff;
    width: 100%;
    max-width: 600px;
    border-radius: 20px 20px 0 0;
    padding: 24px;
    padding-bottom: max(24px, env(safe-area-inset-bottom));
    transform: translateY(100%);
    transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1);
    max-height: 92vh;
    overflow-y: auto;
    position: relative;
}
.bottom-sheet-overlay.active .bottom-sheet {
    transform: translateY(0);
}
.bs-close {
    position: absolute;
    top: 16px;
    right: 16px;
    width: 32px;
    height: 32px;
    background: #f0f0f0;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border: none;
    z-index: 10;
}

.video-banner {
    background: linear-gradient(135deg, #0077ff, #005ce6);
    border-radius: 16px;
    padding: 16px;
    display: flex;
    align-items: center;
    gap: 12px;
    color: white;
    margin-bottom: 24px;
    cursor: pointer;
    margin-top: 24px;
}
.video-banner-icon {
    width: 48px;
    height: 48px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
}
.video-banner-text {
    flex: 1;
}
.video-banner-title {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 4px;
}
.video-banner-sub {
    font-size: 12px;
    opacity: 0.9;
}

.bs-title {
    font-size: 24px;
    font-weight: 700;
    margin-bottom: 16px;
    color: #1a1a1a;
}
.bs-text {
    font-size: 14px;
    color: #4a4a4a;
    line-height: 1.5;
    margin-bottom: 24px;
}
.bs-info-card {
    background: #f5f6f8;
    border-radius: 12px;
    padding: 16px;
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 12px;
}
.bs-info-icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: #e6f0ff;
    color: #0077ff;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}
.bs-info-content h4 {
    font-size: 14px;
    font-weight: 600;
    margin: 0 0 4px 0;
    color: #1a1a1a;
}
.bs-info-content p {
    font-size: 12px;
    color: #888;
    margin: 0;
}

.bs-action-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    background: #f5f6f8;
    border-radius: 12px;
    font-weight: 600;
    color: #1a1a1a;
    cursor: pointer;
    margin-bottom: 24px;
}
.bs-action-row:hover { background: #eef0f4; }
.bs-action-row-left { display: flex; align-items: center; gap: 16px; font-size: 15px; }
.bs-action-row-icon {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: #0077ff;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
}

.bs-btn-primary {
    display: block;
    width: 100%;
    background: #0077ff;
    color: white;
    font-weight: 600;
    font-size: 16px;
    padding: 16px;
    border-radius: 12px;
    border: none;
    text-align: center;
    cursor: pointer;
    margin-bottom: 12px;
}
.bs-btn-primary:hover { background: #006ce6; }
.bs-btn-danger {
    display: block;
    width: 100%;
    background: transparent;
    color: #ff3b30;
    font-weight: 600;
    font-size: 16px;
    padding: 16px;
    border-radius: 12px;
    border: 1px solid #ff3b30;
    text-align: center;
    cursor: pointer;
}
.bs-btn-danger:hover { background: #fff0f0; }

.bs-step {
    display: flex;
    gap: 16px;
    margin-bottom: 24px;
    align-items: flex-start;
}
.bs-step-number {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: #e6f0ff;
    color: #0077ff;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    font-size: 14px;
}
.bs-step-text {
    font-size: 15px;
    color: #1a1a1a;
    line-height: 1.4;
    padding-top: 6px;
    border-bottom: 1px solid #f0f0f0;
    padding-bottom: 24px;
    flex: 1;
}
.bs-step:last-child .bs-step-text { border-bottom: none; }

.bs-hero-card {
    background: linear-gradient(135deg, #0077ff, #00c6ff);
    border-radius: 20px;
    padding: 24px;
    color: white;
    text-align: center;
    margin-bottom: 24px;
    margin-top: 24px;
}
.bs-hero-icon {
    width: 56px;
    height: 56px;
    background: rgba(255,255,255,0.2);
    border-radius: 16px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
}
.bs-hero-title {
    font-size: 20px;
    font-weight: 700;
    margin-bottom: 8px;
}
.bs-hero-sub {
    font-size: 14px;
    opacity: 0.9;
    line-height: 1.4;
}
.bs-warning-card {
    background: #f0f8ff;
    border-radius: 12px;
    padding: 16px;
    color: #0077ff;
    font-size: 14px;
    line-height: 1.5;
    margin-bottom: 24px;
    display: flex;
    gap: 12px;
    align-items: flex-start;
}
`;

let appCss = fs.readFileSync('app.css', 'utf8');
if (!appCss.includes('.bottom-sheet-overlay')) {
    fs.writeFileSync('app.css', appCss + '\n' + cssContent);
}

// --- 2. HTML Injection ---
const htmlModal = `
    <!-- Apple ID Bottom Sheet -->
    <div class="bottom-sheet-overlay" id="apple-id-sheet">
        <div class="bottom-sheet">
            <button class="bs-close" onclick="closeBottomSheet()">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1L13 13M1 13L13 1" stroke="#888" stroke-width="2" stroke-linecap="round"/></svg>
            </button>

            <!-- Screen 1: Intro -->
            <div id="bs-screen-intro">
                <div class="video-banner" onclick="alert('Видео-инструкция скоро появится')">
                    <div class="video-banner-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
                    </div>
                    <div class="video-banner-text">
                        <div class="video-banner-title">Смотреть видео-инструкцию</div>
                        <div class="video-banner-sub">Как выйти из Apple ID за 30 секунд</div>
                    </div>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
                </div>

                <h2 class="bs-title">Временный вход в Apple ID</h2>
                <p class="bs-text">Для установки данного приложения на ваш iPhone необходимо выполнить временный вход в наш общий аккаунт iCloud (Apple ID).<br><br>Следуйте простым шагам для выхода из текущего Apple ID и входа в новый аккаунт.<br><br>После выхода нажмите кнопку «Подготовить аккаунт» ниже и получите данные нового аккаунта.</p>
                
                <div class="bs-info-card">
                    <div class="bs-info-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                    </div>
                    <div class="bs-info-content">
                        <h4>10 минут на установку</h4>
                        <p>Этого достаточно, чтобы установить приложение</p>
                    </div>
                </div>

                <div class="bs-info-card">
                    <div class="bs-info-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                    </div>
                    <div class="bs-info-content">
                        <h4>Ваши данные в безопасности</h4>
                        <p>Аккаунт используется временно только для установки</p>
                    </div>
                </div>

                <div class="bs-action-row" onclick="switchBsScreen('instructions')">
                    <div class="bs-action-row-left">
                        <div class="bs-action-row-icon">i</div>
                        <span>Инструкция как выйти</span>
                    </div>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
                </div>

                <button class="bs-btn-primary" onclick="switchBsScreen('prepare')">Подготовить аккаунт</button>
                <button class="bs-btn-danger" onclick="closeBottomSheet()">Прервать установку</button>
            </div>

            <!-- Screen 2: Instructions -->
            <div id="bs-screen-instructions" style="display: none;">
                <div class="video-banner" onclick="alert('Видео-инструкция скоро появится')">
                    <div class="video-banner-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
                    </div>
                    <div class="video-banner-text">
                        <div class="video-banner-title">Смотреть видео-инструкцию</div>
                    </div>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
                </div>

                <h2 class="bs-title">Инструкция по установке</h2>
                <p class="bs-text">Следуйте простым шагам для выхода из текущего Apple ID и входа в новый аккаунт.</p>
                
                <div class="bs-step">
                    <div class="bs-step-number">1</div>
                    <div class="bs-step-text">Откройте приложение «Настройки» на вашем iPhone</div>
                </div>
                <div class="bs-step">
                    <div class="bs-step-number">2</div>
                    <div class="bs-step-text">Нажмите на ваше имя в верхней части экрана</div>
                </div>
                <div class="bs-step">
                    <div class="bs-step-number">3</div>
                    <div class="bs-step-text">Прокрутите вниз и выберите «Выйти»</div>
                </div>
                <div class="bs-step">
                    <div class="bs-step-number">4</div>
                    <div class="bs-step-text">Введите пароль вашего текущего Apple ID</div>
                </div>
                <div class="bs-step">
                    <div class="bs-step-number">5</div>
                    <div class="bs-step-text">Подтвердите выход, выбрав «Выйти» в правом верхнем углу</div>
                </div>
                <div class="bs-step">
                    <div class="bs-step-number">6</div>
                    <div class="bs-step-text">После выхода нажмите кнопку «Подготовить аккаунт» ниже и получите данные нового аккаунта.</div>
                </div>

                <button class="bs-btn-primary" onclick="switchBsScreen('intro')">Понятно</button>
            </div>

            <!-- Screen 3: Prepare Account -->
            <div id="bs-screen-prepare" style="display: none;">
                <h2 class="bs-title" style="text-align: center;">Подготовка к установке</h2>
                
                <div class="bs-hero-card">
                    <div class="bs-hero-icon">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>
                    </div>
                    <div class="bs-hero-title">Требуется аккаунт</div>
                    <div class="bs-hero-sub">Для вашей безопасности мы выдаем Apple ID в индивидуальном порядке</div>
                </div>

                <div class="bs-warning-card">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                    <span>В данный момент данные для входа выдаются через техническую поддержку. Напишите нам, чтобы получить аккаунт и продолжить установку.</span>
                </div>

                <button class="bs-btn-primary" onclick="window.open('https://t.me/lizaa_hrr', '_blank')">Написать в поддержку</button>
                <button class="bs-btn-danger" onclick="closeBottomSheet()">Прервать установку</button>
            </div>
        </div>
    </div>
`;

let appHtml = fs.readFileSync('app.html', 'utf8');
if (!appHtml.includes('id="apple-id-sheet"')) {
    appHtml = appHtml.replace('</main>', '</main>\n' + htmlModal);
    fs.writeFileSync('app.html', appHtml);
}

// --- 3. JS Injection ---
const jsContent = `
// Bottom Sheet Logic
window.openBottomSheet = () => {
    document.getElementById('apple-id-sheet').classList.add('active');
    document.body.style.overflow = 'hidden';
    switchBsScreen('intro'); // reset to intro
};

window.closeBottomSheet = () => {
    document.getElementById('apple-id-sheet').classList.remove('active');
    document.body.style.overflow = '';
};

window.switchBsScreen = (screenName) => {
    document.getElementById('bs-screen-intro').style.display = 'none';
    document.getElementById('bs-screen-instructions').style.display = 'none';
    document.getElementById('bs-screen-prepare').style.display = 'none';
    
    document.getElementById('bs-screen-' + screenName).style.display = 'block';
    
    // Scroll to top of modal
    document.querySelector('.bottom-sheet').scrollTop = 0;
};
`;

let appJs = fs.readFileSync('app.js', 'utf8');
if (!appJs.includes('openBottomSheet')) {
    appJs += '\n' + jsContent;
    
    // Replace installBtn logic
    appJs = appJs.replace(
        "installBtn.textContent = 'Загрузка...';",
        "openBottomSheet(); return; // installBtn.textContent = 'Загрузка...';"
    );
    fs.writeFileSync('app.js', appJs);
}

console.log('UI injected successfully.');
