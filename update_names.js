const fs = require('fs');

let appsData = JSON.parse(fs.readFileSync('data.json', 'utf8'));

const cyrillicLetters = "АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЩЭЮЯ";

for (let key in appsData) {
    if (appsData[key].reviews) {
        appsData[key].reviews.forEach(rev => {
            // If author does not have a dot at the end, append a random initial
            if (!rev.author.includes('.')) {
                const randomLetter = cyrillicLetters[Math.floor(Math.random() * cyrillicLetters.length)];
                rev.author = `${rev.author} ${randomLetter}.`;
            }
        });
    }
}

fs.writeFileSync('data.json', JSON.stringify(appsData, null, 2));

let dataJsContent = fs.readFileSync('data.js', 'utf8');
const newBlock = 'const appsData = ' + JSON.stringify(appsData, null, 4) + ';\n';
if (dataJsContent.includes('const appsData =')) {
    dataJsContent = dataJsContent.split('const appsData =')[0] + newBlock;
} else {
    dataJsContent += '\n' + newBlock;
}
fs.writeFileSync('data.js', dataJsContent);

console.log("Updated review names.");
