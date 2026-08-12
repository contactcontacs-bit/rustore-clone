const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');

const iconsDir = path.join(__dirname, 'icons');

function downloadFile(fileUrl, destPath) {
    return new Promise((resolve) => {
        if (!fileUrl) { resolve(false); return; }
        const parsedUrl = url.parse(fileUrl);
        const proto = parsedUrl.protocol === 'https:' ? https : require('http');
        const file = fs.createWriteStream(destPath);
        const req = proto.get(fileUrl, (res) => {
            if (res.statusCode === 301 || res.statusCode === 302) {
                file.close();
                try { fs.unlinkSync(destPath); } catch(e){}
                downloadFile(res.headers.location, destPath).then(resolve);
                return;
            }
            if (res.statusCode !== 200) {
                file.close();
                try { fs.unlinkSync(destPath); } catch(e){}
                resolve(false); return;
            }
            res.pipe(file);
            file.on('finish', () => { file.close(); resolve(true); });
        });
        req.on('error', () => { try{fs.unlinkSync(destPath);}catch(e){} resolve(false); });
        req.setTimeout(15000, () => { req.destroy(); try{fs.unlinkSync(destPath);}catch(e){} resolve(false); });
    });
}

function fetchiTunesIcon(term, country) {
    return new Promise((resolve) => {
        const apiUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=software&limit=1&country=${country}`;
        https.get(apiUrl, (res) => {
            let body = '';
            res.on('data', c => body += c);
            res.on('end', () => {
                try {
                    const j = JSON.parse(body);
                    if (j.results && j.results.length > 0) {
                        resolve({ icon: j.results[0].artworkUrl512 || j.results[0].artworkUrl100, name: j.results[0].trackName });
                    } else resolve(null);
                } catch(e) { resolve(null); }
            });
        }).on('error', () => resolve(null));
    });
}

// Failed apps - fetch from iTunes Russian App Store then download
const failedApps = {
    "sberbank":       { term: "Сбербанк Онлайн", country: "ru" },
    "tbank":          { term: "Т-Банк", country: "ru" },
    "alfabank":       { term: "Альфа-Банк", country: "ru" },
    "vtb":            { term: "ВТБ Онлайн банк", country: "ru" },
    "gazprombank":    { term: "Газпромбанк", country: "ru" },
    "rosselkhozbank": { term: "Россельхозбанк РСХБ", country: "ru" },
    "sovcombank":     { term: "Совкомбанк", country: "ru" },
    "psb":            { term: "ПСБ банк Промсвязьбанк", country: "ru" },
    "otkritie":       { term: "Открытие банк", country: "ru" },
    "raiffeisenbank": { term: "Райффайзен банк онлайн", country: "ru" },
    "mkb":            { term: "МКБ банк", country: "ru" },
    "rosbank":        { term: "Росбанк", country: "ru" },
    "uralsib":        { term: "Уралсиб банк", country: "ru" },
    "bankspb":        { term: "Банк Санкт-Петербург", country: "ru" },
    "akbars":         { term: "Ак Барс банк", country: "ru" },
    "zenit":          { term: "Зенит банк онлайн", country: "ru" },
    "yumoney":        { term: "ЮMoney кошелёк", country: "ru" },
    "qiwi":           { term: "QIWI кошелёк", country: "ru" },
    "mirpay":         { term: "Мир Pay платёж", country: "ru" },
    "divinityoriginalsin2": { term: "Divinity Original Sin 2 Larian", country: "us" },
};

async function main() {
    let dataStr = fs.readFileSync('data.js', 'utf8');
    let fixed = 0;

    for (const [key, { term, country }] of Object.entries(failedApps)) {
        const info = await fetchiTunesIcon(term, country);
        if (!info || !info.icon) {
            console.log(`❌ ${key}: not found on iTunes`);
            continue;
        }
        
        const ext = '.png';
        const destFile = path.join(iconsDir, `${key}${ext}`);
        const ok = await downloadFile(info.icon, destFile);
        
        if (ok && fs.existsSync(destFile) && fs.statSync(destFile).size > 500) {
            const localPath = `/icons/${key}${ext}`;
            dataStr = dataStr.replace(
                new RegExp(`("${key}"\\s*:\\s*\\{(?:[^{}]|\\{[^{}]*\\})*?"icon"\\s*:\\s*")[^"]*(")`,'s'),
                (m, pre, post) => `${pre}${localPath}${post}`
            );
            console.log(`✅ ${key}: "${info.name}"`);
            fixed++;
        } else {
            console.log(`❌ ${key}: download failed from ${info.icon.slice(0,60)}`);
        }
        await new Promise(r => setTimeout(r, 300));
    }

    fs.writeFileSync('data.js', dataStr);

    // Bump version
    ['index.html','app.html'].forEach(f => {
        let c = fs.readFileSync(f,'utf8');
        c = c.replace(/data\.js\?v=\d+/g, 'data.js?v=1015');
        fs.writeFileSync(f, c);
    });

    console.log(`\n✅ Fixed ${fixed}/${Object.keys(failedApps).length} remaining icons`);
    console.log(`Total icons in folder: ${fs.readdirSync(iconsDir).length}`);
}

main().catch(console.error);
