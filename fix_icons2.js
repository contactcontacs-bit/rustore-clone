const fs = require('fs');

// Correct clearbit domains + working alternatives for each app
const iconFixes = {
    // Streaming
    "netflix":         "https://logo.clearbit.com/netflix.com",
    "spotify":         "https://logo.clearbit.com/spotify.com",
    "disneyplus":      "https://logo.clearbit.com/disneyplus.com",
    "hbomax":          "https://logo.clearbit.com/max.com",

    // Social
    "tinder":          "https://logo.clearbit.com/tinder.com",
    "instagram":       "https://logo.clearbit.com/instagram.com",
    "facebook":        "https://logo.clearbit.com/facebook.com",
    "threads":         "https://logo.clearbit.com/threads.net",
    "xtwitter":        "https://logo.clearbit.com/x.com",
    "linkedin":        "https://logo.clearbit.com/linkedin.com",
    "pinterest":       "https://logo.clearbit.com/pinterest.com",
    "snapchat":        "https://logo.clearbit.com/snapchat.com",

    // AI
    "chatgpt":         "https://logo.clearbit.com/openai.com",
    "claude":          "https://logo.clearbit.com/anthropic.com",
    "googlegemini":    "https://logo.clearbit.com/google.com",

    // Tools
    "duolingo":        "https://logo.clearbit.com/duolingo.com",
    "strava":          "https://logo.clearbit.com/strava.com",
    "paypal":          "https://logo.clearbit.com/paypal.com",
    "revolut":         "https://logo.clearbit.com/revolut.com",
    "uber":            "https://logo.clearbit.com/uber.com",
    "bolt":            "https://logo.clearbit.com/bolt.eu",
    "airbnb":          "https://logo.clearbit.com/airbnb.com",
    "booking":         "https://logo.clearbit.com/booking.com",

    // Creative
    "capcut":          "https://logo.clearbit.com/capcut.com",
    "canva":           "https://logo.clearbit.com/canva.com",
    "lightroom":       "https://logo.clearbit.com/adobe.com",
    "photoshop":       "https://logo.clearbit.com/adobe.com",

    // Games — Steam thumbnail format (rectangular, but loads reliably)
    "minecraft":        "https://logo.clearbit.com/minecraft.net",
    "stardewvalley":    "https://logo.clearbit.com/stardewvalley.net",
    "terraria":         "https://logo.clearbit.com/terraria.org",
    "geometrydash":     "https://logo.clearbit.com/robtopgames.com",
    "plagueinc":        "https://logo.clearbit.com/ndemiccreations.com",
    "bloonstd6":        "https://logo.clearbit.com/ninjakiwi.com",
    "balatro":          "https://logo.clearbit.com/playbalatro.com",
    "monopoly":         "https://logo.clearbit.com/monopoly.com",
    "gtasanandreas":    "https://logo.clearbit.com/rockstargames.com",
    "wreckfest":        "https://logo.clearbit.com/bugbeargames.com",
    "slaythespire":     "https://logo.clearbit.com/megacrit.com",
    "dontstarve":       "https://logo.clearbit.com/klei.com",
    "northgard":        "https://logo.clearbit.com/shirogames.com",
    "deadcells":        "https://logo.clearbit.com/motion-twin.com",
    "civilization6":    "https://logo.clearbit.com/civilization.com",
    "divinityoriginalsin2": "https://logo.clearbit.com/larian.com",
    "kingdomtwocrowns": "https://logo.clearbit.com/rawfury.com",
    "theescapists2":    "https://logo.clearbit.com/team17.com",
    "thiswarofmine":    "https://logo.clearbit.com/11bitstudios.com",
    "monumentvalley":   "https://logo.clearbit.com/ustwo.com",
    "monumentvalley2":  "https://logo.clearbit.com/ustwo.com",
    "spongebob":        "https://logo.clearbit.com/nickelodeon.com",
    "farmingsimulator": "https://logo.clearbit.com/giants-software.com",
    "oceanhorn":        "https://logo.clearbit.com/cornfoxbrothers.com",

    // Russian banks
    "sberbank":         "https://logo.clearbit.com/sberbank.ru",
    "tbank":            "https://logo.clearbit.com/tinkoff.ru",
    "vtb":              "https://logo.clearbit.com/vtb.ru",
    "alfabank":         "https://logo.clearbit.com/alfabank.ru",
    "gazprombank":      "https://logo.clearbit.com/gazprombank.ru",
    "rosselkhozbank":   "https://logo.clearbit.com/rshb.ru",
    "sovcombank":       "https://logo.clearbit.com/sovcombank.ru",
    "psb":              "https://logo.clearbit.com/psbank.ru",
    "otkritie":         "https://logo.clearbit.com/open.ru",
    "raiffeisenbank":   "https://logo.clearbit.com/raiffeisen.ru",
    "mkb":              "https://logo.clearbit.com/mkb.ru",
    "rosbank":          "https://logo.clearbit.com/rosbank.ru",
    "uralsib":          "https://logo.clearbit.com/uralsib.ru",
    "bankspb":          "https://logo.clearbit.com/bspb.ru",
    "akbars":           "https://logo.clearbit.com/akbars.ru",
    "zenit":            "https://logo.clearbit.com/zenit.ru",
    "yumoney":          "https://logo.clearbit.com/yoomoney.ru",
    "qiwi":             "https://logo.clearbit.com/qiwi.com",
    "mirpay":           "https://logo.clearbit.com/mironline.ru",

    // Kids
    "tocabocarworld":      "https://logo.clearbit.com/tocaboca.com",
    "tocalifework":        "https://logo.clearbit.com/tocaboca.com",
    "migatownworld":       "https://logo.clearbit.com/migatown.com",
    "migatownpets":        "https://logo.clearbit.com/migatown.com",
    "migatownvacation":    "https://logo.clearbit.com/migatown.com",
    "migatownschool":      "https://logo.clearbit.com/migatown.com",
    "drpandatown":         "https://logo.clearbit.com/drpanda.com",
    "drpandatowntales":    "https://logo.clearbit.com/drpanda.com",
    "pepihouse":           "https://logo.clearbit.com/pepiplay.com",
    "pepisuperstores":     "https://logo.clearbit.com/pepiplay.com",
    "pepiwonderworld":     "https://logo.clearbit.com/pepiplay.com",
    "pepihospital":        "https://logo.clearbit.com/pepiplay.com",
    "sagominiworld":       "https://logo.clearbit.com/sagomini.com",
    "sagominischool":      "https://logo.clearbit.com/sagomini.com",
    "sagominibigcity":     "https://logo.clearbit.com/sagomini.com",
    "avatarworld":         "https://logo.clearbit.com/pazugames.com",
    "avatarworldcitylife": "https://logo.clearbit.com/pazugames.com",
    "moy7":                "https://logo.clearbit.com/frojoapps.com",
    "mycitylondon":        "https://logo.clearbit.com/mycityentertainment.com",
    "mycityparis":         "https://logo.clearbit.com/mycityentertainment.com",
    "mycitynewyork":       "https://logo.clearbit.com/mycityentertainment.com",
    "mycityboatadventure": "https://logo.clearbit.com/mycityentertainment.com",
    "mycityhome":          "https://logo.clearbit.com/mycityentertainment.com",
    "mycitymansion":       "https://logo.clearbit.com/mycityentertainment.com",
    "mytownhome":          "https://logo.clearbit.com/mytowngames.com",
    "mytownbestfriends":   "https://logo.clearbit.com/mytowngames.com",
    "mytownschool":        "https://logo.clearbit.com/mytowngames.com",
    "mytownairport":       "https://logo.clearbit.com/mytowngames.com",
    "mytownhotel":         "https://logo.clearbit.com/mytowngames.com",
    "cupcat":              "https://logo.clearbit.com/cupcat.io",
};

let data = fs.readFileSync('data.js', 'utf8');

let updated = 0;
for (const [key, iconUrl] of Object.entries(iconFixes)) {
    // Replace icon field inside the specific app entry
    const before = data.length;
    // Match the key block and replace icon within it
    data = data.replace(
        new RegExp(`("${key}"\\s*:\\s*\\{(?:[^{}]|\\{[^{}]*\\})*?"icon"\\s*:\\s*")[^"]*(")`,'s'),
        (m, pre, post) => `${pre}${iconUrl}${post}`
    );
    if (data.length !== before || data.includes(iconUrl)) updated++;
}

fs.writeFileSync('data.js', data);

// Bump version numbers
['index.html','app.html'].forEach(f => {
    let c = fs.readFileSync(f, 'utf8');
    c = c.replace(/data\.js\?v=\d+/g, 'data.js?v=1007');
    c = c.replace(/marquee\.js\?v=\d+/g, 'marquee.js?v=1007');
    fs.writeFileSync(f, c);
});

console.log(`Done. Updated icons for ${Object.keys(iconFixes).length} apps.`);
