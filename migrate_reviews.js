const fs = require('fs');

const firstNames = ["Алексей", "Дмитрий", "Иван", "Сергей", "Андрей", "Александр", "Максим", "Евгений", "Михаил", "Антон", "Елена", "Анна", "Мария", "Ольга", "Наталья", "Татьяна", "Екатерина", "Юлия", "Ирина", "Дарья"];
const positiveTexts = [
    "Отличное приложение, работает без нареканий!",
    "Супер, давно искал что-то подобное.",
    "Очень удобный интерфейс, всё понятно и просто.",
    "Разработчики молодцы, приложение топ!",
    "Лучшее в своей категории, однозначно рекомендую.",
    "Всё работает быстро и без зависаний.",
    "Пользуюсь каждый день, очень помогает.",
    "Приятно удивлен функционалом, 5 звезд!",
    "Наконец-то добавили нужные фичи, спасибо!",
    "Просто и со вкусом. То что надо.",
    "Отличная замена аналогам, работает стабильнее.",
    "Никаких проблем при использовании не возникло."
];

let appsData = {};
try {
    appsData = JSON.parse(fs.readFileSync('data.json', 'utf8'));
} catch (e) {
    console.log("Error reading data.json");
    process.exit(1);
}

// Simple seeded random function
function seededRandom(seedStr) {
    let seed = 0;
    for (let i = 0; i < seedStr.length; i++) {
        seed = seedStr.charCodeAt(i) + ((seed << 5) - seed);
    }
    return function() {
        let t = seed += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
}

for (let key in appsData) {
    if (!appsData[key].reviews) {
        const random = seededRandom(key);
        // Random count between 3 and 13
        const count = 3 + Math.floor(random() * 11);
        
        appsData[key].reviews = [];
        
        for (let i = 0; i < count; i++) {
            const author = firstNames[Math.floor(random() * firstNames.length)];
            const text = positiveTexts[Math.floor(random() * positiveTexts.length)];
            const rating = 4 + Math.floor(random() * 2); // 4 or 5
            appsData[key].reviews.push({
                id: `rev_${Date.now()}_${i}_${Math.floor(Math.random()*1000)}`,
                author,
                text,
                rating,
                date: "Сегодня"
            });
        }
    }
}

fs.writeFileSync('data.json', JSON.stringify(appsData, null, 2));

// Update data.js
let dataJsContent = fs.readFileSync('data.js', 'utf8');
const newBlock = 'const appsData = ' + JSON.stringify(appsData, null, 4) + ';\n';

if (dataJsContent.includes('const appsData =')) {
    dataJsContent = dataJsContent.split('const appsData =')[0] + newBlock;
} else {
    dataJsContent += '\n' + newBlock;
}
fs.writeFileSync('data.js', dataJsContent);

console.log("Migration complete. All apps now have reviews in DB.");
