const fs = require('fs');
const data = fs.readFileSync('data.js', 'utf8');

// Extract appsData object properly
const start = data.indexOf('const appsData = {') + 'const appsData = '.length;
const end = data.lastIndexOf('};') + 1;
const objStr = data.slice(start, end);
const appsData = eval('(' + objStr + ')');

const keys = Object.keys(appsData);
console.log('Total apps:', keys.length);
console.log('\n--- All apps (key | title | category | icon source) ---');
keys.forEach(k => {
    const a = appsData[k];
    const iconSrc = a.icon ? (a.icon.includes('mzstatic') ? 'iTunes' : a.icon.includes('rustore') ? 'RuStore' : a.icon.includes('clearbit') ? 'Clearbit' : a.icon.slice(0,40)) : 'NONE';
    console.log(`${k.padEnd(25)} | ${(a.title||'').padEnd(35)} | ${(a.category||'').padEnd(20)} | ${iconSrc}`);
});

// Find similar titles
console.log('\n--- Potential title duplicates ---');
const titles = {};
keys.forEach(k => {
    const t = (appsData[k].title||'').toLowerCase().replace(/[^a-zа-яё0-9]/gi,'');
    if (!titles[t]) titles[t] = [];
    titles[t].push(k);
});
Object.entries(titles).forEach(([t, ks]) => {
    if (ks.length > 1) console.log(`DUPE title "${t}": keys = ${ks.join(', ')}`);
});
