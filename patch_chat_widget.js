const fs = require('fs');
let code = fs.readFileSync('chat-widget.js', 'utf8');

// 1. Change sessionStorage to localStorage
code = code.replace(/sessionStorage/g, 'localStorage');

// 2. Remove "Общая поддержка" / "Поддержка по установке" header
code = code.replace(/<div style="padding:10px 15px; background:#f5f5f5; border-bottom:1px solid #ddd; font-size:12px; color:#666;">\s*<span id="chatContextLabel" style="[^"]*">.*?<\/span>\s*<\/div>/g, '');
code = code.replace(/const label = document\.getElementById\('chatContextLabel'\);\s*if \(label\) label\.textContent = [^;]+;/g, '');

// 3. Inject operator photo into chat-widget-avatar in DOM inject
const avatarRegex = /<div class="chat-widget-avatar">SU<\/div>/;
const dynamicAvatar = `<img id="chatWidgetAvatar" src="\${window.clientSettings?.supportPhoto || ''}" style="width:40px; height:40px; border-radius:50%; object-fit:cover; display:\${window.clientSettings?.supportPhoto ? 'block' : 'none'}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'"><div class="chat-widget-avatar fallback-avatar" style="display:\${window.clientSettings?.supportPhoto ? 'none' : 'flex'}">\${window.clientSettings?.supportName ? window.clientSettings.supportName.charAt(0) : 'S'}</div>`;
code = code.replace(avatarRegex, dynamicAvatar);

// 4. Inject operator photo into bubbles in appendMessage
const bubbleAvatarRegex = /\$\{!isUser \? '<div class="chat-bubble-avatar" style="background:#555;">А<\/div>' : ''\}/;
const dynamicBubbleAvatar = `\${!isUser ? \`<img src="\${window.clientSettings?.supportPhoto || ''}" class="chat-bubble-avatar" style="object-fit:cover; display:\${window.clientSettings?.supportPhoto ? 'block' : 'none'};" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'"/><div class="chat-bubble-avatar fallback-avatar" style="background:#007bff; display:\${window.clientSettings?.supportPhoto ? 'none' : 'flex'}">\${window.clientSettings?.supportName ? window.clientSettings.supportName.charAt(0) : 'А'}</div>\` : ''}`;
code = code.replace(bubbleAvatarRegex, dynamicBubbleAvatar);

// 5. Update header text to supportName
const titleRegex = /<div class="chat-widget-title">Техническая поддержка<\/div>/;
const dynamicTitle = `<div class="chat-widget-title" id="chatWidgetTitle">Техническая поддержка</div>`;
code = code.replace(titleRegex, dynamicTitle);

const statusRegex = /<span class="chat-widget-status-text">Оператор • Онлайн<\/span>/;
const dynamicStatus = `<span class="chat-widget-status-text" id="chatWidgetStatusText">Оператор • Онлайн</span>`;
code = code.replace(statusRegex, dynamicStatus);

// In initSupportChat, after injecting DOM, set the name dynamically
const injectDomRegex = /(document\.body\.appendChild\(chatWidget\);)/;
code = code.replace(injectDomRegex, `$1
        const supportName = window.clientSettings?.supportName || 'Оператор';
        const titleEl = document.getElementById('chatWidgetTitle');
        const statusEl = document.getElementById('chatWidgetStatusText');
        if (titleEl) titleEl.textContent = 'Поддержка';
        if (statusEl) statusEl.textContent = supportName + ' • Онлайн';
`);

fs.writeFileSync('chat-widget.js', code, 'utf8');
console.log('Patched chat-widget.js');
