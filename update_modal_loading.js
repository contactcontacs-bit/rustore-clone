const fs = require('fs');

// 1. Add spinner CSS to app.css
let appCss = fs.readFileSync('app.css', 'utf8');
if (!appCss.includes('.bs-spinner')) {
    const spinnerCss = `
.bs-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f0f0f0;
    border-top: 4px solid #0077ff;
    border-radius: 50%;
    animation: spin 1s cubic-bezier(0.5, 0, 0.5, 1) infinite;
    margin: 32px auto;
}
@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
`;
    fs.writeFileSync('app.css', appCss + '\n' + spinnerCss);
}

// 2. Add loading screen to app.html
let appHtml = fs.readFileSync('app.html', 'utf8');
if (!appHtml.includes('id="bs-screen-loading"')) {
    const loadingHtml = `
            <!-- Screen 0: Loading -->
            <div id="bs-screen-loading" style="display: none; padding: 32px 0 16px 0; text-align: center;">
                <h2 class="bs-title" id="bs-loading-title">Подготовка к установке</h2>
                <p class="bs-text" style="color: #888; margin-bottom: 0;" id="bs-loading-text">Получаем данные...</p>
                <div class="bs-spinner"></div>
            </div>
`;
    appHtml = appHtml.replace('<!-- Screen 1: Intro -->', loadingHtml + '\n            <!-- Screen 1: Intro -->');
    
    // Change closeBottomSheet() on the "Прервать установку" buttons to cancelInstallation()
    appHtml = appHtml.replace(/onclick="closeBottomSheet\(\)"/g, function(match, offset, string) {
        // We only want to replace the text buttons, not the X icon
        if (string.substring(offset - 30, offset).includes('bs-btn-danger')) {
            return 'onclick="cancelInstallation()"';
        }
        return match; // keep closeBottomSheet for the X icon
    });
    fs.writeFileSync('app.html', appHtml);
}

// 3. Update app.js logic
let appJs = fs.readFileSync('app.js', 'utf8');
if (!appJs.includes('cancelInstallation')) {
    const updatedJs = `
// Bottom Sheet Logic
window.openBottomSheet = () => {
    document.getElementById('apple-id-sheet').classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Show loading first
    document.getElementById('bs-loading-title').textContent = 'Подготовка к установке';
    document.getElementById('bs-loading-text').textContent = 'Получаем данные...';
    switchBsScreen('loading');
    
    setTimeout(() => {
        switchBsScreen('intro');
    }, 1500); // 1.5 seconds loading
};

window.closeBottomSheet = () => {
    document.getElementById('apple-id-sheet').classList.remove('active');
    document.body.style.overflow = '';
};

window.cancelInstallation = () => {
    // Show loading before closing
    document.getElementById('bs-loading-title').textContent = 'Отмена установки';
    document.getElementById('bs-loading-text').textContent = 'Пожалуйста, подождите...';
    switchBsScreen('loading');
    
    setTimeout(() => {
        closeBottomSheet();
    }, 1500); // 1.5 seconds loading
};

window.switchBsScreen = (screenName) => {
    document.getElementById('bs-screen-loading').style.display = 'none';
    document.getElementById('bs-screen-intro').style.display = 'none';
    document.getElementById('bs-screen-instructions').style.display = 'none';
    document.getElementById('bs-screen-prepare').style.display = 'none';
    
    document.getElementById('bs-screen-' + screenName).style.display = 'block';
    
    // Scroll to top of modal
    document.querySelector('.bottom-sheet').scrollTop = 0;
};
`;
    // Find where the old JS logic is and replace it
    const jsStart = appJs.indexOf('// Bottom Sheet Logic');
    if (jsStart !== -1) {
        appJs = appJs.substring(0, jsStart) + updatedJs;
        fs.writeFileSync('app.js', appJs);
    }
}
