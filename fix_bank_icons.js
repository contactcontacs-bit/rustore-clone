const fs = require('fs');
const path = require('path');
const https = require('https');
const url = require('url');

const iconsDir = path.join(__dirname, 'icons');

function downloadWithHeaders(fileUrl, destPath) {
    return new Promise((resolve) => {
        if (!fileUrl) { resolve(false); return; }
        const parsedUrl = url.parse(fileUrl);
        const proto = parsedUrl.protocol === 'https:' ? https : require('http');
        const options = {
            hostname: parsedUrl.hostname,
            path: parsedUrl.path,
            headers: {
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
                'Accept': 'image/webp,image/png,image/*',
                'Referer': 'https://rustore.ru/'
            }
        };
        const file = fs.createWriteStream(destPath);
        const req = proto.get(options, (res) => {
            if (res.statusCode === 301 || res.statusCode === 302) {
                file.close(); try{fs.unlinkSync(destPath);}catch(e){}
                downloadWithHeaders(res.headers.location, destPath).then(resolve); return;
            }
            if (res.statusCode !== 200) { file.close(); try{fs.unlinkSync(destPath);}catch(e){} resolve(false); return; }
            res.pipe(file);
            file.on('finish', () => { file.close(); resolve(true); });
        });
        req.on('error', () => { try{fs.unlinkSync(destPath);}catch(e){} resolve(false); });
        req.setTimeout(10000, () => { req.destroy(); try{fs.unlinkSync(destPath);}catch(e){} resolve(false); });
    });
}

// Bank SVG icons with brand colors and abbreviations
function makeBankSVG(abbr, bg, textColor = '#fff', fontSize = 22) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="108" height="108" viewBox="0 0 108 108">
  <rect width="108" height="108" rx="24" fill="${bg}"/>
  <text x="54" y="54" font-family="Arial,Helvetica,sans-serif" font-size="${fontSize}" font-weight="bold"
        fill="${textColor}" text-anchor="middle" dominant-baseline="central">${abbr}</text>
</svg>`;
}

// Russian bank icons: key -> {abbr, bg, textColor, fontSize}
const bankIcons = {
    "sberbank":       { abbr: "СБ",   bg: "#21A038", textColor: "#fff", fontSize: 30 },
    "tbank":          { abbr: "Т",    bg: "#FFDD2D", textColor: "#333", fontSize: 42 },
    "vtb":            { abbr: "ВТБ",  bg: "#009FDF", textColor: "#fff", fontSize: 26 },
    "alfabank":       { abbr: "А",    bg: "#EF3124", textColor: "#fff", fontSize: 42 },
    "gazprombank":    { abbr: "ГПБ",  bg: "#003087", textColor: "#fff", fontSize: 22 },
    "rosselkhozbank": { abbr: "РСХБ", bg: "#0C8C39", textColor: "#fff", fontSize: 18 },
    "sovcombank":     { abbr: "СКБ",  bg: "#6B2D8B", textColor: "#fff", fontSize: 22 },
    "psb":            { abbr: "ПСБ",  bg: "#003087", textColor: "#fff", fontSize: 24 },
    "otkritie":       { abbr: "ФК",   bg: "#F26322", textColor: "#fff", fontSize: 30 },
    "raiffeisenbank": { abbr: "РБ",   bg: "#FFCC00", textColor: "#333", fontSize: 30 },
    "mkb":            { abbr: "МКБ",  bg: "#C8102E", textColor: "#fff", fontSize: 24 },
    "rosbank":        { abbr: "РОС",  bg: "#DD2A2A", textColor: "#fff", fontSize: 22 },
    "uralsib":        { abbr: "УБ",   bg: "#003896", textColor: "#fff", fontSize: 30 },
    "bankspb":        { abbr: "БСП",  bg: "#F77F00", textColor: "#fff", fontSize: 22 },
    "akbars":         { abbr: "АБ",   bg: "#006B3F", textColor: "#fff", fontSize: 30 },
    "zenit":          { abbr: "З",    bg: "#1A1A2E", textColor: "#fff", fontSize: 42 },
    "yumoney":        { abbr: "Ю",    bg: "#8B00FF", textColor: "#fff", fontSize: 42 },
    "qiwi":           { abbr: "Q",    bg: "#FF8C00", textColor: "#fff", fontSize: 42 },
    "mirpay":         { abbr: "МИР",  bg: "#004C99", textColor: "#fff", fontSize: 22 },
    "divinityoriginalsin2": { abbr: "DOS2", bg: "#2C1810", textColor: "#D4AF37", fontSize: 18 },
};

// RuStore direct URLs (without imgproxy) for known apps
const rustoreDirectUrls = {
    "sberbank":  "https://static.rustore.ru/2026/5/6/2c/apk/312086/content/ICON/e5278a4b-b64f-4e96-bd39-c2c98609fc0c.png",
    "tbank":     "https://static.rustore.ru/2026/7/26/8e/apk/313443/content/ICON/a1d50b5c-0f43-4a02-9a5e-e7cf91ed5abc.png",
    "alfabank":  "https://static.rustore.ru/2026/7/29/80/apk/336682/content/ICON/7c6e45d3-c75f-45af-9a19-05ef5e55d11d.png",
    "yumoney":   "https://static.rustore.ru/2026/6/20/20/apk/5259174/content/ICON/e00a3da1-47a9-4b6b-b8ee-1d9a5ada7ff3.png",
    "mirpay":    "https://static.rustore.ru/2026/3/17/0b/apk/336843/content/ICON/02c61e28-c0b4-4e84-8d50-2e95dae5d98f.png",
};

async function main() {
    let dataStr = fs.readFileSync('data.js', 'utf8');
    let fixed = 0;

    for (const [key, svgData] of Object.entries(bankIcons)) {
        // First try RuStore direct URL
        let downloaded = false;
        if (rustoreDirectUrls[key]) {
            const destPng = path.join(iconsDir, `${key}.png`);
            downloaded = await downloadWithHeaders(rustoreDirectUrls[key], destPng);
            if (downloaded && fs.existsSync(destPng) && fs.statSync(destPng).size > 500) {
                const localPath = `/icons/${key}.png`;
                dataStr = dataStr.replace(
                    new RegExp(`("${key}"\\s*:\\s*\\{(?:[^{}]|\\{[^{}]*\\})*?"icon"\\s*:\\s*")[^"]*(")`,'s'),
                    (m, pre, post) => `${pre}${localPath}${post}`
                );
                console.log(`✅ ${key}: downloaded from RuStore`);
                fixed++;
                continue;
            }
        }

        // Fallback: generate SVG icon
        const svgContent = makeBankSVG(svgData.abbr, svgData.bg, svgData.textColor, svgData.fontSize);
        const svgPath = path.join(iconsDir, `${key}.svg`);
        fs.writeFileSync(svgPath, svgContent);
        
        const localPath = `/icons/${key}.svg`;
        dataStr = dataStr.replace(
            new RegExp(`("${key}"\\s*:\\s*\\{(?:[^{}]|\\{[^{}]*\\})*?"icon"\\s*:\\s*")[^"]*(")`,'s'),
            (m, pre, post) => `${pre}${localPath}${post}`
        );
        console.log(`🎨 ${key}: generated SVG (${svgData.abbr}, ${svgData.bg})`);
        fixed++;
    }

    fs.writeFileSync('data.js', dataStr);

    // Bump version
    ['index.html','app.html'].forEach(f => {
        let c = fs.readFileSync(f,'utf8');
        c = c.replace(/data\.js\?v=\d+/g, 'data.js?v=1016');
        fs.writeFileSync(f, c);
    });

    console.log(`\n✅ Fixed ${fixed} bank/game icons`);
    console.log(`Total icons in folder: ${fs.readdirSync(iconsDir).length}`);
}

main().catch(console.error);
