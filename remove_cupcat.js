const fs = require('fs');

let data = fs.readFileSync('data.js', 'utf8');

// Find the block for "cupcat" and remove it entirely
const keyPattern = /,?\s*"cupcat"\s*:\s*\{/;
const keyMatch = keyPattern.exec(data);

if (keyMatch) {
    const blockStart = keyMatch.index;
    let depth = 0;
    let i = blockStart + keyMatch[0].length - 1; // position of opening {
    
    for (; i < data.length; i++) {
        if (data[i] === '{') depth++;
        else if (data[i] === '}') {
            depth--;
            if (depth === 0) break;
        }
    }
    
    // Remove the entire block
    data = data.slice(0, blockStart) + data.slice(i + 1);
    
    fs.writeFileSync('data.js', data);
    console.log('✅ Removed the confusing "cupcat" game entry entirely.');
    
    // Bump version
    ['index.html','app.html'].forEach(f => {
        let c = fs.readFileSync(f, 'utf8');
        c = c.replace(/data\.js\?v=\d+/g, 'data.js?v=1018');
        fs.writeFileSync(f, c);
    });
} else {
    console.log('Could not find cupcat entry');
}
