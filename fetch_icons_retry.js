const https = require('https');
const fs = require('fs');

// Retry missing apps with different terms and Russian App Store
const retryApps = {
    "raiffeisenbank":  { term: "Raiffeisen Bank Online", country: "ru" },
    "uralsib":         { term: "Уралсиб Банк", country: "ru" },
    "bankspb":         { term: "Банк Санкт-Петербург", country: "ru" },
    "akbars":          { term: "Ак Барс Банк", country: "ru" },
    "zenit":           { term: "Зенит Банк", country: "ru" },
    "yumoney":         { term: "ЮMoney", country: "ru" },
    "qiwi":            { term: "QIWI Кошелёк", country: "ru" },
    "mirpay":          { term: "Мир Pay", country: "ru" },
    "tocabocarworld":  { term: "Toca World", country: "us" },
    "tocalifework":    { term: "Toca Life World", country: "us" },
    "migatownworld":   { term: "Miga Town World", country: "us" },
    "migatownpets":    { term: "Miga Town Pets", country: "us" },
    "migatownvacation":{ term: "Miga Town Vacation", country: "us" },
    "migatownschool":  { term: "Miga Town School", country: "us" },
    "drpandatowntales":{ term: "Dr Panda Town Tales", country: "us" },
    "pepiwonderworld": { term: "Pepi Wonder World", country: "us" },
    "pepihospital":    { term: "Pepi Hospital", country: "us" },
    "sagominiworld":   { term: "Sago Mini World Kids", country: "us" },
    "sagominischool":  { term: "Sago Mini School", country: "us" },
    "sagominibigcity": { term: "Sago Mini Big City", country: "us" },
    "avatarworld":     { term: "Avatar World Pazu", country: "us" },
    "moy7":            { term: "Moy 7 My Virtual Pet", country: "us" },
    "mycityparis":     { term: "My City Paris", country: "us" },
    "mycitynewyork":   { term: "My City New York", country: "us" },
    "mycityboatadventure": { term: "My City Boat Adventure", country: "us" },
    "mycityhome":      { term: "My City Home", country: "us" },
    "mycitymansion":   { term: "My City Mansion", country: "us" },
    "mytownhome":      { term: "My Town Home Dollhouse", country: "us" },
    "mytownbestfriends":{ term: "My Town Best Friends", country: "us" },
    "mytownschool":    { term: "My Town School", country: "us" },
    "mytownairport":   { term: "My Town Airport", country: "us" },
    "mytownhotel":     { term: "My Town Hotel", country: "us" },
    "cupcat":          { term: "CupCat Cute Cat Game", country: "us" },
};

function fetchIcon(term, country = 'us') {
    return new Promise((resolve) => {
        const url = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=software&limit=3&country=${country}`;
        https.get(url, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(body);
                    if (json.results && json.results.length > 0) {
                        let icon = json.results[0].artworkUrl512 || json.results[0].artworkUrl100;
                        resolve(icon || null);
                    } else { resolve(null); }
                } catch(e) { resolve(null); }
            });
        }).on('error', () => resolve(null));
    });
}

async function main() {
    const keys = Object.keys(retryApps);
    console.log(`Retrying ${keys.length} missing apps...`);
    
    const results = {};
    for (let i = 0; i < keys.length; i += 5) {
        const batch = keys.slice(i, i + 5);
        const promises = batch.map(k => {
            const { term, country } = retryApps[k];
            return fetchIcon(term, country).then(icon => ({ k, icon }));
        });
        const batchResults = await Promise.all(promises);
        for (const { k, icon } of batchResults) {
            results[k] = icon;
            console.log(`  ${icon ? '✅' : '❌'} ${k}: ${icon ? icon.slice(0,60)+'...' : 'not found'}`);
        }
        if (i + 5 < keys.length) await new Promise(r => setTimeout(r, 300));
    }

    // Update data.js
    let data = fs.readFileSync('data.js', 'utf8');
    let updated = 0;
    for (const [key, iconUrl] of Object.entries(results)) {
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
        c = c.replace(/data\.js\?v=\d+/g, 'data.js?v=1009');
        fs.writeFileSync(f, c);
    });

    console.log(`\n✅ Updated ${updated} more icons in data.js`);
}

main().catch(console.error);
