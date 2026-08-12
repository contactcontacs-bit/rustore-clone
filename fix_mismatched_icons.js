const https = require('https');
const fs = require('fs');

function fetchIcon(term, country = 'ru') {
    return new Promise((resolve) => {
        const url = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=software&limit=5&country=${country}`;
        https.get(url, (res) => {
            let body = '';
            res.on('data', c => body += c);
            res.on('end', () => {
                try {
                    const json = JSON.parse(body);
                    if (json.results && json.results.length > 0) {
                        // Return top result info
                        const r = json.results[0];
                        resolve({ icon: r.artworkUrl512 || r.artworkUrl100, name: r.trackName });
                    } else resolve(null);
                } catch(e) { resolve(null); }
            });
        }).on('error', () => resolve(null));
    });
}

// Manual fallback icons for apps that iTunes can't find correctly
// These are known working icon URLs for Russian apps from their own servers
const manualIcons = {
    // Russian banks - use RuStore CDN icons (taken from data.js originals where present)
    // or clearbit fallback (at least shows brand correctly)
    "sberbank":    "https://static.rustore.ru/imgproxy/rGr87NnjSOsiX-imht9uyNnHK-YDQJNvIlY2rIb4gsA/preset:web_app_icon_62/plain/https://static.rustore.ru/2026/5/6/2c/apk/312086/content/ICON/e5278a4b-b64f-4e96-bd39-c2c98609fc0c.png@webp",
    "tbank":       "https://static.rustore.ru/imgproxy/B5vCiJBi9KIeZUhh3WS6X_5g7RuBMbOy_P88JdHoD1A/preset:web_app_icon_62/plain/https://static.rustore.ru/2026/7/26/8e/apk/313443/content/ICON/a1d50b5c-0f43-4a02-9a5e-e7cf91ed5abc.png@webp",
    "alfabank":    "https://static.rustore.ru/imgproxy/NW3cBQhLBT7cX5pRAa44d3KeRD8j0Baw3kUG3A_4WTs/preset:web_app_icon_62/plain/https://static.rustore.ru/2026/7/29/80/apk/336682/content/ICON/7c6e45d3-c75f-45af-9a19-05ef5e55d11d.png@webp",
    "yumoney":     "https://static.rustore.ru/imgproxy/F76HECvqdVJmS5M0u8rRV9Syo2MkxRwPVvGVfRkJNm4/preset:web_app_icon_62/plain/https://static.rustore.ru/2026/6/20/20/apk/5259174/content/ICON/e00a3da1-47a9-4b6b-b8ee-1d9a5ada7ff3.png@webp",
    "mirpay":      "https://static.rustore.ru/imgproxy/w2pjHEXI3EjGHCJNzYJJLHqK_gI2MLXLxSiCRwcfDNQ/preset:web_app_icon_62/plain/https://static.rustore.ru/2026/3/17/0b/apk/336843/content/ICON/02c61e28-c0b4-4e84-8d50-2e95dae5d98f.png@webp",
    // These Russian banks don't have App Store results — use logo.clearbit.com
    "vtb":         "https://logo.clearbit.com/vtb.ru",
    "gazprombank": "https://logo.clearbit.com/gazprombank.ru",
    "rosselkhozbank": "https://logo.clearbit.com/rshb.ru",
    "sovcombank":  "https://logo.clearbit.com/sovcombank.ru",
    "psb":         "https://logo.clearbit.com/psbank.ru",
    "otkritie":    "https://logo.clearbit.com/open.ru",
    "mkb":         "https://logo.clearbit.com/mkb.ru",
    "rosbank":     "https://logo.clearbit.com/rosbank.ru",
    "uralsib":     "https://logo.clearbit.com/uralsib.ru",
    "bankspb":     "https://logo.clearbit.com/bspb.ru",
    "akbars":      "https://logo.clearbit.com/akbars.ru",
    "raiffeisenbank": "https://logo.clearbit.com/raiffeisen.ru",
    "zenit":       "https://logo.clearbit.com/zenit.ru",
    "qiwi":        "https://logo.clearbit.com/qiwi.com",
    // Kids games not found - search again with better terms
    // Monument Valley 2 wrong - fix
    "monumentvalley2": null, // will fetch below
    // Divinity wrong - fix
    "divinityoriginalsin2": null, // will fetch below
    // moy7 wrong
    "moy7": null, // will fetch
    // My City/My Town not found
    "mycityparis": null,
    "mycitynewyork": null,
    "mycityboatadventure": null,
    "mytownhome": null,
    "mytownbestfriends": null,
};

// Re-fetch attempts for null ones
const refetchTerms = {
    "monumentvalley2":    { term: "Monument Valley 2 Forgotten Shores", country: "us" },
    "divinityoriginalsin2": { term: "Divinity Original Sin 2", country: "gb" },
    "moy7":               { term: "Moy 7 the Virtual Pet Game", country: "ru" },
    "mycityparis":        { term: "My City Paris Adventure", country: "gb" },
    "mycitynewyork":      { term: "My City New York Trip", country: "gb" },
    "mycityboatadventure":{ term: "My City Boat", country: "gb" },
    "mytownhome":         { term: "My Town Home Doll House Play", country: "gb" },
    "mytownbestfriends":  { term: "My Town Best Friends Play House", country: "gb" },
};

async function main() {
    const fixes = {};

    // Apply manual fixes
    for (const [key, icon] of Object.entries(manualIcons)) {
        if (icon !== null) fixes[key] = icon;
    }

    // Re-fetch null ones
    console.log('Re-fetching missing icons...');
    for (const [key, { term, country }] of Object.entries(refetchTerms)) {
        const info = await fetchIcon(term, country);
        if (info) {
            console.log(`  ✅ ${key}: "${info.name}"`);
            fixes[key] = info.icon;
        } else {
            console.log(`  ❌ ${key}: still not found`);
        }
        await new Promise(r => setTimeout(r, 200));
    }

    // Apply all fixes to data.js
    let data = fs.readFileSync('data.js', 'utf8');
    let updated = 0;
    for (const [key, iconUrl] of Object.entries(fixes)) {
        if (!iconUrl) continue;
        data = data.replace(
            new RegExp(`("${key}"\\s*:\\s*\\{(?:[^{}]|\\{[^{}]*\\})*?"icon"\\s*:\\s*")[^"]*(")`,'s'),
            (m, pre, post) => `${pre}${iconUrl}${post}`
        );
        updated++;
    }
    fs.writeFileSync('data.js', data);

    // Bump version
    ['index.html','app.html'].forEach(f => {
        let c = fs.readFileSync(f, 'utf8');
        c = c.replace(/data\.js\?v=\d+/g, 'data.js?v=1012');
        fs.writeFileSync(f, c);
    });

    console.log(`\n✅ Fixed ${updated} icons`);
}

main().catch(console.error);
