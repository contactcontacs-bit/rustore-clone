const fs = require('fs');

// Reliable icon map using clearbit logos + known CDN URLs
const iconMap = {
    // Streaming & Media
    "netflix":         "https://logo.clearbit.com/netflix.com",
    "spotify":         "https://logo.clearbit.com/spotify.com",
    "disneyplus":      "https://logo.clearbit.com/disneyplus.com",
    "hbomax":          "https://logo.clearbit.com/max.com",

    // Social Media
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
    "googlegemini":    "https://logo.clearbit.com/gemini.google.com",

    // Tools / Education
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

    // Games - use Google Play icons via a working proxy pattern
    "minecraft":       "https://play-lh.googleusercontent.com/VSwHMHLD9sQK5mFUPMMDlWTha32rnIjfNbkEPV5e2b5EFU7RxGe6KfnfUOGm3n3h1g=s128",
    "stardewvalley":   "https://play-lh.googleusercontent.com/MHQ9yHKwQSP8ZCFUE-PVQXD1E26oFTa2l3hD4K2BDSzLiXRxZAi3XALcLHB-OzW4TY=s128",
    "terraria":        "https://play-lh.googleusercontent.com/kq0GEqG6a-9pWpzMl1AHlG7TIFMg2g5wSO8m_P6D8Sg3GdPXi2jU1WM9gXwCFTblbA=s128",
    "geometrydash":    "https://play-lh.googleusercontent.com/jIbPb_T_HQ3sBNPUNF_jGJ-sUBs5O-y2DlI6_vShBFe2m4ZMVpX6B03uX-zV8PYsrA=s128",
    "plagueinc":       "https://play-lh.googleusercontent.com/0HXNxbJlpfFhDCJnJWQ3mwMDnXa9B2x-_jV78K7TwHi_-9Eqh4JGF2IyLV4U64s3TQ=s128",
    "bloonstd6":       "https://play-lh.googleusercontent.com/vcpAyuTb2ZhXaWkjMT6MFh8LnqHWyE0RmCBJNWPNEI0KUUlYYJGEkh5QxcDNNOiRxCY=s128",
    "balatro":         "https://play-lh.googleusercontent.com/M6jCDHY9CfFHBbG_gIGmQ8-U5BvkJ3v_O6nAnkP7W1lTIhvfHkVf7WJ7hMXL5JLbpzQ=s128",
    "monopoly":        "https://play-lh.googleusercontent.com/y5yzl_S-lHX5fMC4C08tJH73wfSnGYSEqiOm84dbtEWxc7O-jRa3FtaqZX0XYX_XBGE=s128",
    "gtasanandreas":   "https://play-lh.googleusercontent.com/Tmo8WPPcTu9KGVIaOwVLX24m8dE5aUbQpFZFoM5AzGwt2gKjx7_HNpOz-M5ELW5x4Js=s128",
    "wreckfest":       "https://play-lh.googleusercontent.com/zGzFhPH3mZhwDqCiPHPOinOmV4M8PrHH7yfVlMT6M2OqdnCiWqBZoFmkRxJ9cV75GHE=s128",
    "slaythespire":    "https://play-lh.googleusercontent.com/nqV0ZxjH8fGbXO9mq5WHANEpz-j8K6jHC8FgxCtNMfJLWEVeuwqaOo_lBG6PiHC5lg=s128",
    "dontstarve":      "https://play-lh.googleusercontent.com/TJXKuAM65uiWpDMoLRhKKzX-j5-i0KF1mJOtQNTSVoAr_xdYE5bRJ7e-lY39fzl_y0=s128",
    "northgard":       "https://play-lh.googleusercontent.com/YhH-rAl7zyvLzP7nIj1O40iFzxXpU5H-kxRFSJKK7nHGjYKGM1vlHv-eIJy8XIVR6g=s128",
    "deadcells":       "https://play-lh.googleusercontent.com/2fcXzWbzqxeJrJomO9z4Bqz4jIQRiYnMW3uHi9hk8r0m0VbECwUeImIIMj8zbnWh=s128",
    "civilization6":   "https://play-lh.googleusercontent.com/9bZhCQBJ73Y-UgUU5CQ0MKRLS4BVi-FzXZ-KXMM9W6yFXy-QNMW1DRdnT1PN9ZWn4o=s128",
    "divinityoriginalsin2": "https://play-lh.googleusercontent.com/1aJL0cEVRKF-lCKU08pTcOHGkAyRbLFjT6t_EBp1Yjp76oJlzVJlvPh90g5oKcG9fA=s128",
    "kingdomtwocrowns": "https://play-lh.googleusercontent.com/V9SHCc97-X-gX-v3Eg9eGGJj_K3MU_C6XMD9oBCH72JK2AO1Gq9l0XsTt50_GE8QQ=s128",
    "theescapists2":   "https://play-lh.googleusercontent.com/cZhKWWMVq2oCZqjyJIWFr_UuRPMNlr3eBrfgJllJ_T3MwBH7bQjbGbM5hkQ4eVe72Q=s128",
    "thiswarofmine":   "https://play-lh.googleusercontent.com/nQFp4g8OHrh1y1x1aDEoJSrmxDQ4Y9XlB7a7a9XBl7FaWCFREGlrKGLiVjU6sKnaBX8=s128",
    "monumentvalley":  "https://play-lh.googleusercontent.com/HOJoYOEOAoAdUH9RhzaHxiL7f0ysomrBKFpLAW52lQ7V1NG2GDELhqGo4m7PqG9KxQ=s128",
    "monumentvalley2": "https://play-lh.googleusercontent.com/AiX8Bq4UioJbwgf2dCg5DtM3iNkNlCmtCE7VaD0y5SjZP7cMMHV4lM0Yz-TiM2eQ4A=s128",
    "spongebob":       "https://play-lh.googleusercontent.com/D4kpHl0m7g1N5J7OHZ_LjWx8YhFqLJ5cK3tMrVG1nYuXXI0LiWQ0wAY01l2TYhVMFg=s128",
    "farmingsimulator":"https://play-lh.googleusercontent.com/BjkJLHJSVB_k--D6JFHZ1c7OmX9GrH4FcJEAV7oWHSDtkyuN9kQGpbHQ4w8vWk_t4E=s128",
    "oceanhorn":       "https://play-lh.googleusercontent.com/h-uG1EVRJ0T3oqfbpN4OxbFWzUd82OkjHjwAVfMFI-JniK0J8pBxXqQFQG5wdVCaA=s128",

    // Russian Banks - using RuStore icons where possible, else clearbit
    "sberbank":        "https://logo.clearbit.com/sberbank.ru",
    "tbank":           "https://logo.clearbit.com/tbank.ru",
    "vtb":             "https://logo.clearbit.com/vtb.ru",
    "alfabank":        "https://logo.clearbit.com/alfabank.ru",
    "gazprombank":     "https://logo.clearbit.com/gazprombank.ru",
    "rosselkhozbank":  "https://logo.clearbit.com/rshb.ru",
    "sovcombank":      "https://logo.clearbit.com/sovcombank.ru",
    "psb":             "https://logo.clearbit.com/psbank.ru",
    "otkritie":        "https://logo.clearbit.com/open.ru",
    "raiffeisenbank":  "https://logo.clearbit.com/raiffeisen.ru",
    "mkb":             "https://logo.clearbit.com/mkb.ru",
    "rosbank":         "https://logo.clearbit.com/rosbank.ru",
    "uralsib":         "https://logo.clearbit.com/uralsib.ru",
    "bankspb":         "https://logo.clearbit.com/bspb.ru",
    "akbars":          "https://logo.clearbit.com/akbars.ru",
    "zenit":           "https://logo.clearbit.com/zenit.ru",
    "yumoney":         "https://logo.clearbit.com/yoomoney.ru",
    "qiwi":            "https://logo.clearbit.com/qiwi.com",
    "mirpay":          "https://logo.clearbit.com/mironline.ru",

    // Kids apps
    "tocabocarworld":      "https://logo.clearbit.com/tocaboca.com",
    "tocalifework":        "https://logo.clearbit.com/tocaboca.com",
    "migatownworld":       "https://play-lh.googleusercontent.com/yBaGGvKp24CYmxZlNyGFwipRVz4KIYhc0WZlPpHtjfmH9ORbJDh-i7DW2P4YmPt0rA=s128",
    "migatownpets":        "https://play-lh.googleusercontent.com/z1h2Pf0TvGQjbVRxE_zIhMYRMCxS1D4s_4-KqGOFgfVhUOj-xFkPEL-Uw0sOhMuHhg=s128",
    "migatownvacation":    "https://play-lh.googleusercontent.com/hRiZlRBmqlHTQ9Ec2d7v8Bz_UBzr4HiazE8kX7_NZEH1c-iFJvS_8VmLi8Xb1gMrA=s128",
    "migatownschool":      "https://play-lh.googleusercontent.com/8R0fX4xS-v1UKJZi0-rMOw9Oi-bq2cJzDG_cPJSw7BBMT8GI5T5L4vEhGcEY2R5YA=s128",
    "drpandatown":         "https://logo.clearbit.com/drpanda.com",
    "drpandatowntales":    "https://logo.clearbit.com/drpanda.com",
    "pepihouse":           "https://play-lh.googleusercontent.com/gKA0PsFBiG9APeP9V1eJ5bqH5Kl4lMJ-3TA-cL97VeG_-b8BpMqV7Tm4e8r-L9ZATA=s128",
    "pepisuperstores":     "https://play-lh.googleusercontent.com/MpTJfTFjqJN4W8hOV3C9i7-LZ6V6kFJGwL4gX5_SdYIqxrlfBEqnY8l4fEzmWOl1jQ=s128",
    "pepiwonderworld":     "https://play-lh.googleusercontent.com/Y4OqFaVgI7Xqf_pVYrYR6K5SFqXm8eOqbIqh9V7cOgzGBnfxfTl6UGXevdz8mOV_A=s128",
    "pepihospital":        "https://play-lh.googleusercontent.com/4tNj-Z7kMk3Z2q3_G0cW7xwT3S8HYU5B-Rp-CQXWY-s7g8fgLhLX27ARLKhx5_hqg=s128",
    "sagominiworld":       "https://logo.clearbit.com/sagomini.com",
    "sagominischool":      "https://logo.clearbit.com/sagomini.com",
    "sagominibigcity":     "https://logo.clearbit.com/sagomini.com",
    "avatarworld":         "https://play-lh.googleusercontent.com/dGRpP1B8CqYp8-8RMFxYr9s1KKxMmVwsOEg4W7sifPO98QrBk7IpYCFBJjBqPqbwjg=s128",
    "avatarworldcitylife": "https://play-lh.googleusercontent.com/mItWE-V7Xr5WbRkK2jSRiT7QdPyuV-W5eE9Kc9Gv3Mzb59ZPJy6H8_6_CuTnFBMuw=s128",
    "moy7":                "https://play-lh.googleusercontent.com/SaxgG_wvJmnnphb4uT7_JXqq6Oz_2E6v9J3pqSH62YcFNGZ1oqLqWFkO3bLtfvIqzQ=s128",
    "mycitylondon":        "https://play-lh.googleusercontent.com/yJj7nRlLn8FyP8OAq-bHpz_u3T9Gj3JaT2NHZtB7V7_G2D7u2nv7bYuTQVHr-lJAQ=s128",
    "mycityparis":         "https://play-lh.googleusercontent.com/qQ0LQ6gEH1oI5aN8Gp5aKREhEBt1SoBxW0pDLqZTb0hFwVo7Aa7SzXvqY4m2N9kOcg=s128",
    "mycitynewyork":       "https://play-lh.googleusercontent.com/YnxzLO95Dh1Mxm6s9Nop7MV9eMTTBRPfV-j_bNqxLZAtBqj8fM9xJYJxeFNdh3ZkQ=s128",
    "mycityboatadventure": "https://play-lh.googleusercontent.com/TlLwPNK3VH2XZpV9M4dlOKY0eRuBQjuvRbk-fgBbWEOb_BpJ3nluMa0gRMqfGhlRAA=s128",
    "mycityhome":          "https://play-lh.googleusercontent.com/r3bORwGtX3JJ5Q9mmKtWJj8JBf6vhHPOvX7j1vMDFMUqJhz9yqzR8VcMc-P4_0HxbQ=s128",
    "mycitymansion":       "https://play-lh.googleusercontent.com/i1DJtlJ0eJjGt7h3V_L00TJicLW9y5Pr_BqMaFq50zy9OjCXGd6Wq5M18_RGEaL2ew=s128",
    "mytownhome":          "https://play-lh.googleusercontent.com/JgRHzaCyWGflzNmqSmQVOVwg-Q0kOkRMcMQY1iAq_oHZ2Yxep4U5bEEOoSKmJa6nrQ=s128",
    "mytownbestfriends":   "https://play-lh.googleusercontent.com/u9f7i6yY0tDwP8sW5sE0-mLIYlXmUXeW0LlH8PdDmSYfVe8lLi_V9oQqXC4rlEMFcg=s128",
    "mytownschool":        "https://play-lh.googleusercontent.com/UMy8WR4yVZ4P4V7yVHhE2j1P4JxOH2H7xb2D3eLJKPnGU3kAWYO8H3iRQx9V0VkVCQ=s128",
    "mytownairport":       "https://play-lh.googleusercontent.com/fkjq4ZcTQPmRR5M3-1YhSq4tYJLrNkz0-k-BbKSqmGrfX3_Mw0KjFhU-lJ2AQ-YXRQ=s128",
    "mytownhotel":         "https://play-lh.googleusercontent.com/6CZRyLbE7JG3-2JWqeWBECBlJVQ_XMNhU6m8m0-JXFjJBKHuCc03TiU7-jE2kMcr4Q=s128",
    "cupcat":              "https://play-lh.googleusercontent.com/M7y6JRpg7B5hc6x5MfPJx3sxMoP7-JktKJ3Xl9pCa4fVvMg8YevnN4LTB1RkMibEQ=s128",
};

// Update icons in data.js
let data = fs.readFileSync('data.js', 'utf8');

for (const [key, iconUrl] of Object.entries(iconMap)) {
    // Match the key entry and replace its icon field
    const regex = new RegExp(`("${key}":\\s*\\{[^}]*?"icon":\\s*")[^"]*(")`,'s');
    data = data.replace(regex, `$1${iconUrl}$2`);
}

fs.writeFileSync('data.js', data);

// Bump version
['index.html','app.html'].forEach(f => {
    let c = fs.readFileSync(f,'utf8');
    c = c.replace(/data\.js\?v=\d+/g, 'data.js?v=1006');
    fs.writeFileSync(f, c);
});

console.log(`✅ Updated ${Object.keys(iconMap).length} icons`);
