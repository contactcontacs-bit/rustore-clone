const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Create icons directory
const iconsDir = path.join(__dirname, 'icons');
if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir);

// Load appsData
const dataContent = fs.readFileSync('data.js', 'utf8');
const start = dataContent.indexOf('const appsData = {') + 'const appsData = '.length;
const end = dataContent.lastIndexOf('};') + 1;
const appsData = eval('(' + dataContent.slice(start, end) + ')');

function downloadFile(fileUrl, destPath) {
    return new Promise((resolve) => {
        if (!fileUrl || fileUrl.trim() === '') { resolve(false); return; }
        
        const parsedUrl = url.parse(fileUrl);
        const proto = parsedUrl.protocol === 'https:' ? https : http;
        
        const file = fs.createWriteStream(destPath);
        const req = proto.get(fileUrl, (res) => {
            // Follow redirect
            if (res.statusCode === 301 || res.statusCode === 302) {
                file.close();
                fs.unlinkSync(destPath);
                downloadFile(res.headers.location, destPath).then(resolve);
                return;
            }
            if (res.statusCode !== 200) {
                file.close();
                try { fs.unlinkSync(destPath); } catch(e) {}
                resolve(false);
                return;
            }
            res.pipe(file);
            file.on('finish', () => { file.close(); resolve(true); });
        });
        req.on('error', () => { 
            try { fs.unlinkSync(destPath); } catch(e) {}
            resolve(false); 
        });
        req.setTimeout(15000, () => {
            req.destroy();
            try { fs.unlinkSync(destPath); } catch(e) {}
            resolve(false);
        });
    });
}

async function main() {
    const keys = Object.keys(appsData);
    console.log(`Downloading ${keys.length} icons...`);
    
    const iconMap = {}; // key -> local path
    let success = 0, failed = 0;

    // Download in batches of 8
    for (let i = 0; i < keys.length; i += 8) {
        const batch = keys.slice(i, i + 8);
        await Promise.all(batch.map(async (key) => {
            const app = appsData[key];
            if (!app || !app.icon) return;
            
            const iconUrl = app.icon;
            // Detect extension
            let ext = '.png';
            if (iconUrl.includes('.jpg') || iconUrl.includes('.jpeg')) ext = '.jpg';
            else if (iconUrl.includes('.webp')) ext = '.webp';
            
            const destFile = path.join(iconsDir, `${key}${ext}`);
            
            // Skip if already downloaded
            if (fs.existsSync(destFile) && fs.statSync(destFile).size > 1000) {
                iconMap[key] = `/icons/${key}${ext}`;
                success++;
                return;
            }
            
            const ok = await downloadFile(iconUrl, destFile);
            if (ok && fs.existsSync(destFile) && fs.statSync(destFile).size > 500) {
                iconMap[key] = `/icons/${key}${ext}`;
                console.log(`  ✅ ${key}`);
                success++;
            } else {
                console.log(`  ❌ ${key}: failed (${iconUrl.slice(0,60)})`);
                failed++;
            }
        }));
        
        // Small delay between batches
        await new Promise(r => setTimeout(r, 300));
    }

    // Update data.js with local icon paths
    let dataStr = fs.readFileSync('data.js', 'utf8');
    for (const [key, localPath] of Object.entries(iconMap)) {
        dataStr = dataStr.replace(
            new RegExp(`("${key}"\\s*:\\s*\\{(?:[^{}]|\\{[^{}]*\\})*?"icon"\\s*:\\s*")[^"]*(")`,'s'),
            (m, pre, post) => `${pre}${localPath}${post}`
        );
    }
    fs.writeFileSync('data.js', dataStr);

    // Bump versions
    ['index.html','app.html'].forEach(f => {
        let c = fs.readFileSync(f, 'utf8');
        c = c.replace(/data\.js\?v=\d+/g, 'data.js?v=1014');
        fs.writeFileSync(f, c);
    });

    console.log(`\n📊 Downloaded: ${success}/${keys.length} icons`);
    if (failed > 0) console.log(`   Failed: ${failed}`);
    console.log(`   Icons saved to: ${iconsDir}`);
    console.log(`✅ data.js updated with local icon paths`);
}

main().catch(console.error);
