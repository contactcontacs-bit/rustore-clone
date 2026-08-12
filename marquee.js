document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('marquee-container');
    if (!container) return;

    const appKeys = Object.keys(appsData);
    
    function shuffleArray(array) {
        let shuff = [...array];
        for (let i = shuff.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuff[i], shuff[j]] = [shuff[j], shuff[i]];
        }
        return shuff;
    }

    // Color palette for placeholder icons
    const colors = [
        '#4f46e5','#0ea5e9','#10b981','#f59e0b','#ef4444',
        '#8b5cf6','#ec4899','#06b6d4','#84cc16','#f97316'
    ];
    function getColor(str) {
        let h = 0;
        for (let c of str) h = (h * 31 + c.charCodeAt(0)) & 0xffffffff;
        return colors[Math.abs(h) % colors.length];
    }

    function generateItemsHtml(keys) {
        return keys.map(key => {
            const app = appsData[key];
            const initial = (app.title || 'A')[0].toUpperCase();
            const color = getColor(key);
            return `
                <div class="marquee-item" onclick="navToApp(null, '${key}')" title="${app.title}">
                    <img src="${app.icon}" alt="${app.title}"
                         onerror="this.style.display='none';this.parentElement.querySelector('.mi-fallback').style.display='flex';">
                    <div class="mi-fallback" style="display:none;width:100%;height:100%;background:${color};color:#fff;font-weight:700;font-size:18px;align-items:center;justify-content:center;border-radius:9px;">${initial}</div>
                </div>
            `;
        }).join('');
    }

    // ITEM SIZE: 44px + 8px gap = 52px per item
    const ITEM_PX = 52;
    // TARGET SPEED: 40 pixels per second (feels slow and comfortable)
    const SPEED_PX_PER_SEC = 40;

    for (let r = 0; r < 2; r++) {
        const row = document.createElement('div');
        const dir = r === 1 ? 'right' : 'left';
        row.className = `marquee-row ${dir}`;

        let baseKeys = shuffleArray(appKeys);
        // Ensure enough width: minimum 3 copies of all apps
        let blockKeys = [];
        for (let i = 0; i < 3; i++) blockKeys = blockKeys.concat(baseKeys);
        // Duplicate for seamless loop
        const fullKeys = blockKeys.concat(blockKeys);
        row.innerHTML = generateItemsHtml(fullKeys);
        container.appendChild(row);

        // Calculate animation duration based on content width
        // Half the content is what gets traversed (0 to -50%)
        const halfWidthPx = fullKeys.length / 2 * ITEM_PX;
        const duration = Math.round(halfWidthPx / SPEED_PX_PER_SEC);

        // Apply dynamic duration via inline style override
        row.style.animationDuration = `${duration}s`;

        // Right row starts at -50%
        if (dir === 'right') {
            row.style.transform = 'translateX(-50%)';
        }
    }
});
