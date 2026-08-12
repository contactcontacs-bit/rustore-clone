const https = require('https');
const fs = require('fs');

// Map of app key -> iTunes search term
const appSearchTerms = {
    "netflix":         "Netflix",
    "spotify":         "Spotify",
    "disneyplus":      "Disney+",
    "hbomax":          "Max HBO",
    "tinder":          "Tinder",
    "instagram":       "Instagram",
    "facebook":        "Facebook",
    "threads":         "Threads Instagram",
    "xtwitter":        "X Twitter",
    "linkedin":        "LinkedIn",
    "pinterest":       "Pinterest",
    "snapchat":        "Snapchat",
    "chatgpt":         "ChatGPT OpenAI",
    "claude":          "Claude AI Anthropic",
    "googlegemini":    "Google Gemini AI",
    "duolingo":        "Duolingo",
    "strava":          "Strava running cycling",
    "paypal":          "PayPal",
    "revolut":         "Revolut",
    "uber":            "Uber",
    "bolt":            "Bolt taxi",
    "airbnb":          "Airbnb",
    "booking":         "Booking.com",
    "capcut":          "CapCut video editor",
    "canva":           "Canva design",
    "lightroom":       "Adobe Lightroom",
    "photoshop":       "Adobe Photoshop",
    "minecraft":       "Minecraft",
    "stardewvalley":   "Stardew Valley",
    "terraria":        "Terraria",
    "geometrydash":    "Geometry Dash",
    "plagueinc":       "Plague Inc",
    "bloonstd6":       "Bloons TD 6",
    "balatro":         "Balatro",
    "monopoly":        "MONOPOLY",
    "gtasanandreas":   "Grand Theft Auto San Andreas",
    "wreckfest":       "Wreckfest",
    "slaythespire":    "Slay the Spire",
    "dontstarve":      "Don't Starve Pocket Edition",
    "northgard":       "Northgard",
    "deadcells":       "Dead Cells",
    "civilization6":   "Sid Meier Civilization VI",
    "divinityoriginalsin2": "Divinity Original Sin 2",
    "kingdomtwocrowns": "Kingdom Two Crowns",
    "theescapists2":   "The Escapists 2",
    "thiswarofmine":   "This War of Mine",
    "monumentvalley":  "Monument Valley",
    "monumentvalley2": "Monument Valley 2",
    "spongebob":       "SpongeBob SquarePants",
    "farmingsimulator":"Farming Simulator 23",
    "oceanhorn":       "Oceanhorn",
    "sberbank":        "Sberbank",
    "tbank":           "Tinkoff Bank",
    "vtb":             "VTB Online",
    "alfabank":        "Alfa Bank",
    "gazprombank":     "Gazprombank",
    "rosselkhozbank":  "Rosselkhozbank",
    "sovcombank":      "Sovcombank",
    "psb":             "Promsvyazbank",
    "otkritie":        "Otkritie Bank",
    "raiffeisenbank":  "Raiffeisen",
    "mkb":             "MKB Bank",
    "rosbank":         "Rosbank",
    "uralsib":         "Uralsib",
    "bankspb":         "Bank Saint Petersburg",
    "akbars":          "Ak Bars Bank",
    "zenit":           "Zenit Bank",
    "yumoney":         "YooMoney",
    "qiwi":            "QIWI Wallet",
    "mirpay":          "Mir Pay",
    "tocabocarworld":  "Toca Boca World",
    "tocalifework":    "Toca Life World",
    "migatownworld":   "Miga Town My World",
    "migatownpets":    "Miga Town My Pets",
    "migatownvacation":"Miga Town My Vacation",
    "migatownschool":  "Miga Town My School",
    "drpandatown":     "Dr Panda Town",
    "drpandatowntales":"Dr Panda Town Tales",
    "pepihouse":       "Pepi House Happy Family",
    "pepisuperstores": "Pepi Super Stores",
    "pepiwonderworld": "Pepi Wonder World",
    "pepihospital":    "Pepi Hospital",
    "sagominiworld":   "Sago Mini World",
    "sagominischool":  "Sago Mini School",
    "sagominibigcity": "Sago Mini Big City",
    "avatarworld":     "Avatar World City Life",
    "avatarworldcitylife": "Avatar World Bff City",
    "moy7":            "Moy 7 virtual pet",
    "mycitylondon":    "My City London",
    "mycityparis":     "My City Paris",
    "mycitynewyork":   "My City New York",
    "mycityboatadventure": "My City Boat Adventure",
    "mycityhome":      "My City Home",
    "mycitymansion":   "My City Mansion",
    "mytownhome":      "My Town Home Dollhouse",
    "mytownbestfriends":"My Town Best Friends House",
    "mytownschool":    "My Town School",
    "mytownairport":   "My Town Airport",
    "mytownhotel":     "My Town Hotel",
    "cupcat":          "CupCat",
};

function fetchIcon(term) {
    return new Promise((resolve) => {
        const url = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=software&limit=1&country=us`;
        https.get(url, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(body);
                    if (json.results && json.results.length > 0) {
                        // Get 512px icon
                        let icon = json.results[0].artworkUrl512 || json.results[0].artworkUrl100;
                        resolve(icon || null);
                    } else {
                        resolve(null);
                    }
                } catch(e) { resolve(null); }
            });
        }).on('error', () => resolve(null));
    });
}

async function main() {
    const results = {};
    const keys = Object.keys(appSearchTerms);
    
    console.log(`Fetching icons for ${keys.length} apps...`);
    
    // Fetch in batches of 5 to avoid rate limiting
    for (let i = 0; i < keys.length; i += 5) {
        const batch = keys.slice(i, i + 5);
        const promises = batch.map(k => fetchIcon(appSearchTerms[k]).then(icon => ({ k, icon })));
        const batchResults = await Promise.all(promises);
        
        for (const { k, icon } of batchResults) {
            results[k] = icon;
            const status = icon ? '✅' : '❌';
            console.log(`  ${status} ${k}: ${icon ? icon.slice(0,60)+'...' : 'not found'}`);
        }
        
        // Small delay between batches
        if (i + 5 < keys.length) await new Promise(r => setTimeout(r, 300));
    }
    
    // Save results
    fs.writeFileSync('itunes_icons.json', JSON.stringify(results, null, 2));
    
    // Now update data.js
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
    
    // Bump versions
    ['index.html','app.html'].forEach(f => {
        let c = fs.readFileSync(f, 'utf8');
        c = c.replace(/data\.js\?v=\d+/g, 'data.js?v=1008');
        fs.writeFileSync(f, c);
    });
    
    console.log(`\n✅ Updated ${updated} icons in data.js`);
}

main().catch(console.error);
