const fs = require('fs');

let data = fs.readFileSync('data.js', 'utf8');

// Remove the "sber" entry (old duplicate of sberbank)
// Find the start of "sber": {  and the matching closing }, 
const keyPattern = /,?\s*"sber"\s*:\s*\{/;
const keyMatch = keyPattern.exec(data);
if (!keyMatch) {
    console.log('Could not find "sber" entry');
    process.exit(1);
}

const blockStart = keyMatch.index;
// Find matching closing brace by counting depth
let depth = 0;
let i = blockStart + keyMatch[0].length - 1; // position of opening {
for (; i < data.length; i++) {
    if (data[i] === '{') depth++;
    else if (data[i] === '}') {
        depth--;
        if (depth === 0) break;
    }
}
// i is now at the closing }
// Remove from blockStart to i+1 (inclusive)
data = data.slice(0, blockStart) + data.slice(i + 1);

fs.writeFileSync('data.js', data);

// Bump versions
['index.html','app.html'].forEach(f => {
    let c = fs.readFileSync(f, 'utf8');
    c = c.replace(/data\.js\?v=\d+/g, 'data.js?v=1010');
    fs.writeFileSync(f, c);
});

console.log('✅ Removed duplicate "sber" entry. Sberbank kept as "sberbank" with iTunes icon.');

// Verify
const data2 = fs.readFileSync('data.js', 'utf8');
const keys = [...data2.matchAll(/"([a-z][a-z0-9_]*)"\s*:\s*\{/g)].map(m => m[1]);
console.log('Total apps now:', keys.length);
const hasSber = keys.filter(k => k.includes('sber'));
console.log('Sber entries:', hasSber);
