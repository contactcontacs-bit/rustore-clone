const https = require('fs');
const fs = require('fs');

// Targeted manual fixes for apps that keep getting wrong results
// Divinity OS2 is not on mobile App Store - use clearbit
// My City New York - try different approach

const finalFixes = {
    // Divinity is PC/console only - use publisher logo as fallback
    "divinityoriginalsin2": "https://logo.clearbit.com/larian.com",
    // My City New York - search differently
    // moy7 - got correct one "Moy 7 The Virtual Pet Game" - OK
    // Monument Valley 2 - got "Monument Valley" icon which is close enough
};

// For mycitynewyork - let's verify what we got
const data = fs.readFileSync('data.js', 'utf8');
const start = data.indexOf('const appsData = {') + 'const appsData = '.length;
const end = data.lastIndexOf('};') + 1;
const appsData = eval('(' + data.slice(start, end) + ')');

console.log('Current mycitynewyork icon:', appsData['mycitynewyork'] ? appsData['mycitynewyork'].icon.slice(0,80) : 'NOT FOUND');
console.log('Current divinityoriginalsin2 icon:', appsData['divinityoriginalsin2'] ? appsData['divinityoriginalsin2'].icon.slice(0,80) : 'NOT FOUND');

// Apply final fixes
let dataStr = fs.readFileSync('data.js', 'utf8');
for (const [key, iconUrl] of Object.entries(finalFixes)) {
    dataStr = dataStr.replace(
        new RegExp(`("${key}"\\s*:\\s*\\{(?:[^{}]|\\{[^{}]*\\})*?"icon"\\s*:\\s*")[^"]*(")`,'s'),
        (m, pre, post) => `${pre}${iconUrl}${post}`
    );
}
fs.writeFileSync('data.js', dataStr);

// Bump version
['index.html','app.html'].forEach(f => {
    let c = fs.readFileSync(f, 'utf8');
    c = c.replace(/data\.js\?v=\d+/g, 'data.js?v=1013');
    fs.writeFileSync(f, c);
});

console.log('✅ Applied final manual fixes');
