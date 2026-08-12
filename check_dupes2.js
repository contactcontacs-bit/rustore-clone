const fs = require('fs');

// Extract appsData
const data = fs.readFileSync('data.js', 'utf8');
const start = data.indexOf('const appsData = {') + 'const appsData = '.length;
const end = data.lastIndexOf('};') + 1;
const appsData = eval('(' + data.slice(start, end) + ')');

// Keys to remove (duplicates - keep the better version)
// "sber" is an old entry with RuStore icon; "sberbank" is the new one with iTunes icon
// "tocabocarworld" vs "tocalifework" - these are DIFFERENT apps (Toca Boca World ≠ Toca Life World), keep both
// Check all apps for similar titles
const titleMap = {};
const keysToRemove = [];

Object.entries(appsData).forEach(([key, app]) => {
    // Normalize title for comparison
    const normTitle = (app.title || '').toLowerCase()
        .replace(/[:\-–—]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    
    if (!titleMap[normTitle]) {
        titleMap[normTitle] = [];
    }
    titleMap[normTitle].push(key);
});

console.log('--- Duplicate title groups ---');
Object.entries(titleMap).forEach(([title, keys]) => {
    if (keys.length > 1) {
        console.log(`"${title}":`);
        keys.forEach(k => {
            const a = appsData[k];
            const iconType = a.icon.includes('mzstatic') ? 'iTunes✅' : a.icon.includes('rustore') ? 'RuStore' : 'other';
            console.log(`  ${k}: "${a.title}" [${iconType}]`);
        });
    }
});

// Also check for partial title matches (e.g. "Сбербанк" contained in longer title)
console.log('\n--- Checking for similar "Сбер" entries ---');
Object.entries(appsData).forEach(([k, a]) => {
    if ((a.title || '').toLowerCase().includes('сбер')) {
        console.log(`  ${k}: ${a.title} [icon: ${a.icon.slice(0,50)}]`);
    }
});

console.log('\n--- Checking for similar "Toca" entries ---');
Object.entries(appsData).forEach(([k, a]) => {
    if ((a.title || '').toLowerCase().includes('toca')) {
        console.log(`  ${k}: ${a.title}`);
    }
});
