const https = require('https');
const fs = require('fs');

// All apps with their search terms - verify what iTunes actually returned
const allApps = {
    "netflix":         { term: "Netflix", country: "us" },
    "spotify":         { term: "Spotify", country: "us" },
    "disneyplus":      { term: "Disney+", country: "us" },
    "hbomax":          { term: "Max HBO", country: "us" },
    "tinder":          { term: "Tinder", country: "us" },
    "instagram":       { term: "Instagram", country: "us" },
    "facebook":        { term: "Facebook", country: "us" },
    "threads":         { term: "Threads Instagram", country: "us" },
    "xtwitter":        { term: "X Twitter", country: "us" },
    "linkedin":        { term: "LinkedIn", country: "us" },
    "pinterest":       { term: "Pinterest", country: "us" },
    "snapchat":        { term: "Snapchat", country: "us" },
    "chatgpt":         { term: "ChatGPT OpenAI", country: "us" },
    "claude":          { term: "Claude AI Anthropic", country: "us" },
    "googlegemini":    { term: "Google Gemini AI", country: "us" },
    "duolingo":        { term: "Duolingo", country: "us" },
    "strava":          { term: "Strava running cycling", country: "us" },
    "paypal":          { term: "PayPal", country: "us" },
    "revolut":         { term: "Revolut", country: "us" },
    "uber":            { term: "Uber", country: "us" },
    "bolt":            { term: "Bolt taxi", country: "us" },
    "airbnb":          { term: "Airbnb", country: "us" },
    "booking":         { term: "Booking.com", country: "us" },
    "capcut":          { term: "CapCut video editor", country: "us" },
    "canva":           { term: "Canva design", country: "us" },
    "lightroom":       { term: "Adobe Lightroom", country: "us" },
    "photoshop":       { term: "Adobe Photoshop", country: "us" },
    "minecraft":       { term: "Minecraft", country: "us" },
    "stardewvalley":   { term: "Stardew Valley", country: "us" },
    "terraria":        { term: "Terraria", country: "us" },
    "geometrydash":    { term: "Geometry Dash", country: "us" },
    "plagueinc":       { term: "Plague Inc", country: "us" },
    "bloonstd6":       { term: "Bloons TD 6", country: "us" },
    "balatro":         { term: "Balatro", country: "us" },
    "monopoly":        { term: "MONOPOLY", country: "us" },
    "gtasanandreas":   { term: "Grand Theft Auto San Andreas", country: "us" },
    "wreckfest":       { term: "Wreckfest", country: "us" },
    "slaythespire":    { term: "Slay the Spire", country: "us" },
    "dontstarve":      { term: "Don't Starve Pocket Edition", country: "us" },
    "northgard":       { term: "Northgard", country: "us" },
    "deadcells":       { term: "Dead Cells", country: "us" },
    "civilization6":   { term: "Sid Meier Civilization VI", country: "us" },
    "divinityoriginalsin2": { term: "Divinity Original Sin 2", country: "us" },
    "kingdomtwocrowns": { term: "Kingdom Two Crowns", country: "us" },
    "theescapists2":   { term: "The Escapists 2", country: "us" },
    "thiswarofmine":   { term: "This War of Mine", country: "us" },
    "monumentvalley":  { term: "Monument Valley", country: "us" },
    "monumentvalley2": { term: "Monument Valley 2", country: "us" },
    "spongebob":       { term: "SpongeBob SquarePants", country: "us" },
    "farmingsimulator":{ term: "Farming Simulator 23", country: "us" },
    "oceanhorn":       { term: "Oceanhorn", country: "us" },
    "sberbank":        { term: "Сбербанк Онлайн", country: "ru" },
    "tbank":           { term: "Тинькофф", country: "ru" },
    "vtb":             { term: "ВТБ Онлайн", country: "ru" },
    "alfabank":        { term: "Альфа-Банк", country: "ru" },
    "gazprombank":     { term: "Газпромбанк", country: "ru" },
    "rosselkhozbank":  { term: "Россельхозбанк", country: "ru" },
    "sovcombank":      { term: "Совкомбанк", country: "ru" },
    "psb":             { term: "Промсвязьбанк", country: "ru" },
    "otkritie":        { term: "Банк Открытие", country: "ru" },
    "raiffeisenbank":  { term: "Райффайзен", country: "ru" },
    "mkb":             { term: "МКБ Банк", country: "ru" },
    "rosbank":         { term: "Росбанк", country: "ru" },
    "uralsib":         { term: "Уралсиб Банк", country: "ru" },
    "bankspb":         { term: "Банк Санкт-Петербург", country: "ru" },
    "akbars":          { term: "Ак Барс Банк", country: "ru" },
    "zenit":           { term: "Банк Зенит", country: "ru" },
    "yumoney":         { term: "ЮMoney", country: "ru" },
    "qiwi":            { term: "QIWI Кошелёк", country: "ru" },
    "mirpay":          { term: "Мир Pay", country: "ru" },
    "tocabocarworld":  { term: "Toca Boca World", country: "us" },
    "tocalifework":    { term: "Toca Life World", country: "us" },
    "migatownworld":   { term: "Miga Town My World", country: "us" },
    "migatownpets":    { term: "Miga Town My Pets", country: "us" },
    "migatownvacation":{ term: "Miga Town My Vacation", country: "us" },
    "migatownschool":  { term: "Miga Town My School", country: "us" },
    "drpandatown":     { term: "Dr Panda Town", country: "us" },
    "drpandatowntales":{ term: "Dr Panda Town Tales", country: "us" },
    "pepihouse":       { term: "Pepi House Happy Family", country: "us" },
    "pepisuperstores": { term: "Pepi Super Stores", country: "us" },
    "pepiwonderworld": { term: "Pepi Wonder World", country: "us" },
    "pepihospital":    { term: "Pepi Hospital", country: "us" },
    "sagominiworld":   { term: "Sago Mini World", country: "us" },
    "sagominischool":  { term: "Sago Mini School", country: "us" },
    "sagominibigcity": { term: "Sago Mini Big City", country: "us" },
    "avatarworld":     { term: "Avatar World City Life", country: "us" },
    "avatarworldcitylife": { term: "Avatar World Bff City", country: "us" },
    "moy7":            { term: "Moy 7 My Virtual Pet", country: "us" },
    "mycitylondon":    { term: "My City London", country: "us" },
    "mycityparis":     { term: "My City Paris", country: "us" },
    "mycitynewyork":   { term: "My City New York", country: "us" },
    "mycityboatadventure": { term: "My City Boat Adventure", country: "us" },
    "mycityhome":      { term: "My City Home", country: "us" },
    "mycitymansion":   { term: "My City Mansion", country: "us" },
    "mytownhome":      { term: "My Town Home Dollhouse", country: "us" },
    "mytownbestfriends":{ term: "My Town Best Friends House", country: "us" },
    "mytownschool":    { term: "My Town School", country: "us" },
    "mytownairport":   { term: "My Town Airport", country: "us" },
    "mytownhotel":     { term: "My Town Hotel", country: "us" },
    "cupcat":          { term: "CupCat Cute Cat Game", country: "us" },
};

function fetchAppInfo(term, country = 'us') {
    return new Promise((resolve) => {
        const url = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=software&limit=1&country=${country}`;
        https.get(url, (res) => {
            let body = '';
            res.on('data', c => body += c);
            res.on('end', () => {
                try {
                    const json = JSON.parse(body);
                    if (json.results && json.results.length > 0) {
                        const r = json.results[0];
                        resolve({
                            trackName: r.trackName,
                            artistName: r.artistName,
                            icon: r.artworkUrl512 || r.artworkUrl100,
                        });
                    } else resolve(null);
                } catch(e) { resolve(null); }
            });
        }).on('error', () => resolve(null));
    });
}

// Load current data.js to get our app titles
const data = fs.readFileSync('data.js', 'utf8');
const start = data.indexOf('const appsData = {') + 'const appsData = '.length;
const end = data.lastIndexOf('};') + 1;
const appsData = eval('(' + data.slice(start, end) + ')');

async function main() {
    const keys = Object.keys(allApps);
    const results = {};
    const mismatches = [];

    console.log('Verifying all app icons...\n');

    for (let i = 0; i < keys.length; i += 6) {
        const batch = keys.slice(i, i + 6);
        const promises = batch.map(k => {
            const { term, country } = allApps[k];
            return fetchAppInfo(term, country).then(info => ({ k, info }));
        });
        const batchResults = await Promise.all(promises);
        for (const { k, info } of batchResults) {
            const ourTitle = appsData[k] ? appsData[k].title : '???';
            if (!info) {
                console.log(`❌ ${k}: NOT FOUND (our title: ${ourTitle})`);
                mismatches.push({ key: k, issue: 'not found', ourTitle });
            } else {
                const itunesName = info.trackName;
                // Simple check: does our title share words with iTunes result?
                const ourWords = ourTitle.toLowerCase().replace(/[^a-zа-яё0-9\s]/gi,' ').split(/\s+/).filter(w => w.length > 2);
                const itunesWords = itunesName.toLowerCase().replace(/[^a-zа-яё0-9\s]/gi,' ').split(/\s+/).filter(w => w.length > 2);
                const overlap = ourWords.filter(w => itunesWords.some(iw => iw.includes(w) || w.includes(iw)));
                const match = overlap.length > 0;
                const icon = info.icon;
                
                if (match) {
                    console.log(`✅ ${k}: "${itunesName}"`);
                    results[k] = icon;
                } else {
                    console.log(`⚠️  ${k}: iTunes returned "${itunesName}" but we have "${ourTitle}"`);
                    mismatches.push({ key: k, ourTitle, itunesName, icon });
                    results[k] = icon; // still save, user can review
                }
            }
        }
        if (i + 6 < keys.length) await new Promise(r => setTimeout(r, 400));
    }

    // Save report
    fs.writeFileSync('icon_verify_report.json', JSON.stringify({ results, mismatches }, null, 2));
    
    // Update data.js with all verified icons
    let dataStr = fs.readFileSync('data.js', 'utf8');
    let updated = 0;
    for (const [key, iconUrl] of Object.entries(results)) {
        if (!iconUrl) continue;
        dataStr = dataStr.replace(
            new RegExp(`("${key}"\\s*:\\s*\\{(?:[^{}]|\\{[^{}]*\\})*?"icon"\\s*:\\s*")[^"]*(")`,'s'),
            (m, pre, post) => `${pre}${iconUrl}${post}`
        );
        updated++;
    }
    fs.writeFileSync('data.js', dataStr);

    // Bump versions
    ['index.html','app.html'].forEach(f => {
        let c = fs.readFileSync(f, 'utf8');
        c = c.replace(/data\.js\?v=\d+/g, 'data.js?v=1011');
        fs.writeFileSync(f, c);
    });

    console.log(`\n📊 Summary:`);
    console.log(`  Total apps checked: ${keys.length}`);
    console.log(`  Confirmed matches: ${keys.length - mismatches.length}`);
    console.log(`  Possible mismatches: ${mismatches.length}`);
    if (mismatches.length) {
        console.log(`\n⚠️  Review these:`);
        mismatches.forEach(m => console.log(`  - ${m.key}: "${m.ourTitle}" vs iTunes "${m.itunesName || 'NOT FOUND'}"`));
    }
    console.log(`\n✅ Updated ${updated} icons`);
}

main().catch(console.error);
