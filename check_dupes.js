const fs = require('fs');
const data = fs.readFileSync('data.js', 'utf8');

// Find all top-level keys in appsData object
const matches = [...data.matchAll(/"([a-z][a-z0-9_]*)"\s*:\s*\{/g)].map(m => m[1]);

const seen = {};
const dupes = [];
matches.forEach(k => {
    if (seen[k]) dupes.push(k);
    else seen[k] = 1;
});

console.log('Total keys found:', matches.length);
if (dupes.length > 0) {
    console.log('DUPLICATES:');
    dupes.forEach(d => console.log('  -', d));
} else {
    console.log('No duplicates found!');
}

// Also check for "stardewvalley" appearing twice since it was listed twice in the original request
console.log('\nTop 10 keys:', matches.slice(0,10));
