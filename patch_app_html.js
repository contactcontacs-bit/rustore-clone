const fs = require('fs');
let code = fs.readFileSync('app.html', 'utf8');

// Replace the video banner onClick handlers
code = code.replace(/onclick="if\(window\.appSettings && window\.appSettings\.hasVideo\) \{ window\.open\('instruction\.mp4\?t=' \+ new Date\(\)\.getTime\(\), '_blank'\); \} else \{ alert\('Видео-инструкция пока не загружена'\); \}"/g, 
`onclick="if(window.appSettings && window.appSettings.hasVideo) { window.playVideoInline(this); } else { alert('Видео-инструкция пока не загружена'); }"`);

// Inject the inline video player JS function and CSS at the end of <head>
const injection = `
    <style>
        .inline-video-player {
            width: 100%;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            background: #000;
            display: block;
            margin-bottom: 20px;
            animation: fadeIn 0.3s ease;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.98); }
            to { opacity: 1; transform: scale(1); }
        }
    </style>
    <script>
        window.playVideoInline = function(bannerElement) {
            const videoUrl = 'instruction.mp4?t=' + new Date().getTime();
            const videoHTML = '<video controls autoplay playsinline class="inline-video-player"><source src="' + videoUrl + '" type="video/mp4"></video>';
            bannerElement.outerHTML = videoHTML;
        };
    </script>
</head>`;

code = code.replace(/<\/head>/, injection);

fs.writeFileSync('app.html', code, 'utf8');
console.log('Patched app.html for inline video');
