const fs = require('fs');

const data = fs.readFileSync('data.js', 'utf8');
const start = data.indexOf('const appsData = {') + 'const appsData = '.length;
const end = data.lastIndexOf('};') + 1;
const appsData = eval('(' + data.slice(start, end) + ')');

const firstNames = [
    "Александр", "Сергей", "Елена", "Мария", "Анна", "Дмитрий", "Иван", 
    "Екатерина", "Наталья", "Михаил", "Алексей", "Ольга", "Виктория", 
    "Андрей", "Николай", "Ирина", "Татьяна", "Светлана", "Максим", "Владимир",
    "Юлия", "Евгений", "Денис", "Павел", "Олег", "Алина", "Ксения", "Дарья"
];
const lastInitials = "АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЩЭЮЯ".split("");

const reviewTexts = {
    positive: [
        "Отличное приложение, всё работает быстро и без багов.",
        "Очень удобно! Пользуюсь каждый день, никаких нареканий.",
        "Давно искал нечто подобное. Интерфейс супер приятный.",
        "Спасибо разработчикам! Топовая вещь.",
        "Регулярно обновляется, всё стабильно.",
        "Лучшее в своей категории. Однозначно 5 звезд.",
        "Всё круто, функционал на высоте.",
        "Просто работает. Никакой лишней рекламы, всё четко.",
        "Очень классный дизайн и всё интуитивно понятно.",
        "Без этого приложения уже как без рук. Рекомендую!"
    ],
    neutral: [
        "Неплохо, но есть куда расти.",
        "Нормально работает, иногда бывают мелкие лаги.",
        "Функций хватает, но интерфейс можно было бы сделать удобнее.",
        "В целом пойдет. Жду новых обновлений.",
        "После последнего обновления стало чуть медленнее, но пользоваться можно."
    ],
    negative: [
        "Постоянно вылетает на моем телефоне! Исправьте!",
        "Раньше было лучше. Сейчас куча ненужных функций.",
        "Очень долго грузится при запуске.",
        "Не работает нужный мне функционал. Удаляю."
    ]
};

function getRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomDate() {
    const today = new Date();
    const past = new Date(today.getTime() - Math.random() * 90 * 24 * 60 * 60 * 1000); // within last 90 days
    return past.toISOString().split('T')[0];
}

// Generate new unique reviews for each app
Object.keys(appsData).forEach(key => {
    const numReviews = Math.floor(Math.random() * 4) + 3; // 3 to 6 reviews
    const newReviews = [];
    
    for (let i = 0; i < numReviews; i++) {
        const ratingNum = Math.random();
        let rating = 5;
        let textArr = reviewTexts.positive;
        
        if (ratingNum > 0.85) {
            rating = 4;
            textArr = Math.random() > 0.5 ? reviewTexts.positive : reviewTexts.neutral;
        } else if (ratingNum > 0.75) {
            rating = 3;
            textArr = reviewTexts.neutral;
        } else if (ratingNum > 0.65) {
            rating = Math.floor(Math.random() * 2) + 1; // 1 or 2
            textArr = reviewTexts.negative;
        }
        
        const name = `${getRandom(firstNames)} ${getRandom(lastInitials)}.`;
        
        newReviews.push({
            id: `rev_${key}_${Math.random().toString(36).substring(2,9)}`,
            author: name,
            date: getRandomDate(),
            rating: rating,
            text: getRandom(textArr)
        });
    }
    
    // Sort by date descending (newest first)
    newReviews.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    appsData[key].reviews = newReviews;
});

// Write back
let newDataStr = fs.readFileSync('data.js', 'utf8');
newDataStr = newDataStr.slice(0, start) + JSON.stringify(appsData, null, 4) + newDataStr.slice(end - 1);

// We need to fix the formatting a bit since JSON.stringify replaces single quotes with double,
// and doesn't exactly match the original formatting, but it's valid JS.
fs.writeFileSync('data.js', newDataStr);

// Bump version
['index.html','app.html'].forEach(f => {
    let c = fs.readFileSync(f, 'utf8');
    c = c.replace(/data\.js\?v=\d+/g, 'data.js?v=1019');
    fs.writeFileSync(f, c);
});

console.log('✅ Randomized all reviews for all apps.');
