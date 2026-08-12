const fs = require('fs');

let c = fs.readFileSync('app.html', 'utf8');

const targetStr = "window.open('https://t.me/lizaa_hrr', '_blank')";
const replaceStr = "if(window.trackSupportClick) { window.trackSupportClick(); } window.open('https://t.me/lizaa_hrr', '_blank');";

if (c.includes(targetStr)) {
    c = c.split(targetStr).join(replaceStr);
    fs.writeFileSync('app.html', c);
    console.log('Successfully updated tracking on support button');
} else {
    console.log('Target string not found');
}
