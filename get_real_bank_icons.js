const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');

const iconsDir = path.join(__dirname, 'icons');

function downloadFile(fileUrl, destPath) {
    return new Promise((resolve) => {
        const parsedUrl = url.parse(fileUrl);
        const options = {
            hostname: parsedUrl.hostname,
            path: parsedUrl.path,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
            }
        };
        const req = https.get(options, (res) => {
            if (res.statusCode === 301 || res.statusCode === 302) {
                downloadFile(res.headers.location, destPath).then(resolve);
                return;
            }
            if (res.statusCode !== 200) {
                resolve(false);
                return;
            }
            const file = fs.createWriteStream(destPath);
            res.pipe(file);
            file.on('finish', () => { file.close(); resolve(true); });
        });
        req.on('error', () => resolve(false));
    });
}

const banks = {
    "sberbank":       "sberbank.ru",
    "tbank":          "tbank.ru",
    "vtb":            "vtb.ru",
    "alfabank":       "alfabank.ru",
    "gazprombank":    "gazprombank.ru",
    "rosselkhozbank": "rshb.ru",
    "sovcombank":     "sovcombank.ru",
    "psb":            "psbank.ru",
    "otkritie":       "open.ru",
    "raiffeisenbank": "raiffeisen.ru",
    "mkb":            "mkb.ru",
    "rosbank":        "rosbank.ru",
    "uralsib":        "uralsib.ru",
    "bankspb":        "bspb.ru",
    "akbars":         "akbars.ru",
    "zenit":          "zenit.ru",
    "yumoney":        "yoomoney.ru",
    "qiwi":           "qiwi.com",
    "mirpay":         "mironline.ru",
    "divinityoriginalsin2": "larian.com"
};

async function main() {
    let dataStr = fs.readFileSync('data.js', 'utf8');
    let fixed = 0;

    for (const [key, domain] of Object.entries(banks)) {
        // Try Google Favicon (returns high res if available)
        const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
        const destPath = path.join(iconsDir, `${key}_real.png`);
        
        console.log(`Downloading real icon for ${key}...`);
        const ok = await downloadFile(faviconUrl, destPath);
        
        if (ok && fs.existsSync(destPath) && fs.statSync(destPath).size > 200) {
            const localPath = `/icons/${key}_real.png`;
            dataStr = dataStr.replace(
                new RegExp(`("${key}"\\s*:\\s*\\{(?:[^{}]|\\{[^{}]*\\})*?"icon"\\s*:\\s*")[^"]*(")`,'s'),
                (m, pre, post) => `${pre}${localPath}${post}`
            );
            console.log(`✅ ${key}: got real icon`);
            fixed++;
        } else {
            console.log(`❌ ${key}: failed`);
        }
    }

    fs.writeFileSync('data.js', dataStr);

    ['index.html','app.html'].forEach(f => {
        let c = fs.readFileSync(f,'utf8');
        c = c.replace(/data\.js\?v=\d+/g, 'data.js?v=1017');
        fs.writeFileSync(f, c);
    });

    console.log(`\n✅ Downloaded ${fixed} real icons`);
}

main();
