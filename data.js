function getParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    let val = urlParams.get(name);
    if (!val) {
        val = sessionStorage.getItem(name);
    } else {
        sessionStorage.setItem(name, val);
    }
    return val;
}

function navToApp(event, key) {
    if (event) event.stopPropagation();
    sessionStorage.setItem('id', key);
    // Also clear category so it doesn't leak
    sessionStorage.removeItem('category');
    const w = new URLSearchParams(window.location.search).get('worker'); window.location.href = 'app.html?id=' + key + (w ? '&worker=' + w : '') + window.location.hash;
}

function navToCategory(event, categoryName) {
    if (event) event.preventDefault();
    sessionStorage.setItem('category', categoryName);
    sessionStorage.removeItem('id');
    const w = new URLSearchParams(window.location.search).get('worker');
    window.location.href = 'index.html?category=' + encodeURIComponent(categoryName) + (w ? '&worker=' + w : '');
}

function navToHome(event) {
    if (event) event.preventDefault();
    sessionStorage.removeItem('category');
    sessionStorage.removeItem('id');
    const w = new URLSearchParams(window.location.search).get('worker');
    window.location.href = 'index.html' + (w ? '?worker=' + w : '');
}

let appsData = {
    "gosuslugi": {
        "title": "Госуслуги",
        "aliases": [
            "gosuslugi",
            "госуслуги",
            "гос услуги"
        ],
        "developer": "Минцифры России",
        "category": "Государственные",
        "rating": "4.5",
        "reviewsCount": "261,5 тыс.",
        "downloads": "40 млн +",
        "size": "149.8 MB",
        "age": "0+",
        "icon": "icons/gosuslugi.png",
        "description": "Приложение «Госуслуги» — ваш помощник для взаимодействия с ведомствами и государством.",
        "screenshots": [
            "https://static.rustore.ru/imgproxy/ISSrYdwu348Ip49878E52ozKRYIstKALAVZag4-nxkc/preset:web_scr_prt_162/plain/https://static.rustore.ru/2025/11/25/ac/apk/537791/content/SCREENSHOT/a8b8dd05-fc73-4cbb-8ae5-7d9ea578db2f.png@webp"
        ],
        "reviews": [
            {
                "id": "rev_1786362717242_0_905",
                "author": "Иван О.",
                "text": "Разработчики молодцы, приложение топ!",
                "rating": 5,
                "date": "Сегодня"
            },
            {
                "id": "rev_1786362717243_1_635",
                "author": "Мария О.",
                "text": "Отличная замена аналогам, работает стабильнее.",
                "rating": 4,
                "date": "Сегодня"
            },
            {
                "id": "rev_1786362717243_2_937",
                "author": "Наталья Р.",
                "text": "Никаких проблем при использовании не возникло.",
                "rating": 5,
                "date": "Сегодня"
            },
            {
                "id": "rev_1786362717243_3_462",
                "author": "Дарья Ш.",
                "text": "Отличное приложение, работает без нареканий!",
                "rating": 5,
                "date": "Сегодня"
            }
        ],
        "owner": "GLOBAL",
        "isPersonal": false,
        "workerId": null
    },
    "vk": {
        "title": "ВКонтакте",
        "aliases": [
            "vk",
            "vkontakte",
            "вконтакте",
            "вк"
        ],
        "developer": "VK",
        "category": "Социальные сети",
        "rating": "4.2",
        "reviewsCount": "263,5 тыс.",
        "downloads": "50 млн +",
        "size": "120.5 MB",
        "age": "12+",
        "icon": "icons/vk.png",
        "description": "ВКонтакте объединяет миллионы людей, создавая безграничные возможности для общения.",
        "screenshots": [
            "https://static.rustore.ru/imgproxy/M5J6O5PjRLaNfz9C_PTML_LWb7WcWAkh4T5HAeZHzhU/preset:web_scr_prt_104/plain/https://static.rustore.ru/2026/5/6/d3/apk/317631/content/SCREENSHOT/3e54a2d0-13a1-4508-a8dd-b93a05ea2a63.jpg@webp"
        ],
        "reviews": [
            {
                "id": "rev_1786362717243_0_855",
                "author": "Дарья О.",
                "text": "Пользуюсь каждый день, очень помогает.",
                "rating": 4,
                "date": "Сегодня"
            },
            {
                "id": "rev_1786362717243_1_643",
                "author": "Максим Ш.",
                "text": "Наконец-то добавили нужные фичи, спасибо!",
                "rating": 5,
                "date": "Сегодня"
            },
            {
                "id": "rev_1786362717243_2_405",
                "author": "Алексей А.",
                "text": "Лучшее в своей категории, однозначно рекомендую.",
                "rating": 5,
                "date": "Сегодня"
            }
        ],
        "owner": "GLOBAL",
        "isPersonal": false,
        "workerId": null
    },
    "yabrowser": {
        "title": "Яндекс Браузер",
        "aliases": [
            "yandex browser",
            "yandex",
            "яндекс",
            "яндекс браузер",
            "браузер"
        ],
        "developer": "Direct Cursus Computer Systems Trading",
        "category": "Инструменты",
        "rating": "4.2",
        "reviewsCount": "71 тыс.",
        "downloads": "10 млн +",
        "size": "200.1 MB",
        "age": "3+",
        "icon": "icons/yabrowser.png",
        "description": "Яндекс Браузер — быстрый и безопасный браузер с Алисой AI.",
        "screenshots": [
            "https://static.rustore.ru/imgproxy/mgoN6E7wJ8gE1ZUoIye9JItcfHVjb6vrZAQIZVKv-8E/preset:web_scr_prt_104/plain/https://static.rustore.ru/2025/10/25/6a/apk/579007/content/SCREENSHOT/b14e7901-1fcb-4045-94af-3464c359f224.jpg@webp"
        ],
        "reviews": [
            {
                "id": "rev_1786362717243_0_489",
                "author": "Максим У.",
                "text": "Всё работает быстро и без зависаний.",
                "rating": 4,
                "date": "Сегодня"
            },
            {
                "id": "rev_1786362717243_1_679",
                "author": "Алексей Л.",
                "text": "Отличная замена аналогам, работает стабильнее.",
                "rating": 4,
                "date": "Сегодня"
            },
            {
                "id": "rev_1786362717243_2_971",
                "author": "Наталья Е.",
                "text": "Супер, давно искал что-то подобное.",
                "rating": 4,
                "date": "Сегодня"
            },
            {
                "id": "rev_1786362717243_3_272",
                "author": "Ольга Ю.",
                "text": "Никаких проблем при использовании не возникло.",
                "rating": 4,
                "date": "Сегодня"
            },
            {
                "id": "rev_1786362717243_4_372",
                "author": "Анна Д.",
                "text": "Отличное приложение, работает без нареканий!",
                "rating": 5,
                "date": "Сегодня"
            },
            {
                "id": "rev_1786362717243_5_858",
                "author": "Мария Н.",
                "text": "Разработчики молодцы, приложение топ!",
                "rating": 4,
                "date": "Сегодня"
            },
            {
                "id": "rev_1786362717243_6_641",
                "author": "Евгений Ч.",
                "text": "Просто и со вкусом. То что надо.",
                "rating": 5,
                "date": "Сегодня"
            }
        ],
        "owner": "GLOBAL",
        "isPersonal": false,
        "workerId": null
    },
    "ozon": {
        "title": "OZON: товары, одежда...",
        "aliases": [
            "ozon",
            "озон",
            "магазин"
        ],
        "developer": "Интернет Решения",
        "category": "Покупки",
        "rating": "4.3",
        "reviewsCount": "163 тыс.",
        "downloads": "20 млн +",
        "size": "80.0 MB",
        "age": "3+",
        "icon": "icons/ozon.png",
        "description": "Покупайте миллионы товаров со скидками и быстрой доставкой от одного дня!",
        "screenshots": [
            "https://static.rustore.ru/imgproxy/05Eu3BCEJ5KgWf6fD-bL2yrcSt4uJIranMASkQNrGmA/preset:web_scr_prt_104/plain/https://static.rustore.ru/2026/6/24/46/apk/514239/content/SCREENSHOT/746309f3-a453-4dfb-8657-ad0718d07c31.jpg@webp"
        ],
        "reviews": [
            {
                "id": "rev_1786362717243_0_307",
                "author": "Мария Л.",
                "text": "Пользуюсь каждый день, очень помогает.",
                "rating": 5,
                "date": "Сегодня"
            },
            {
                "id": "rev_1786362717243_1_359",
                "author": "Елена Ц.",
                "text": "Просто и со вкусом. То что надо.",
                "rating": 4,
                "date": "Сегодня"
            },
            {
                "id": "rev_1786362717243_2_137",
                "author": "Максим Б.",
                "text": "Никаких проблем при использовании не возникло.",
                "rating": 5,
                "date": "Сегодня"
            },
            {
                "id": "rev_1786362717243_3_553",
                "author": "Екатерина Г.",
                "text": "Очень удобный интерфейс, всё понятно и просто.",
                "rating": 4,
                "date": "Сегодня"
            },
            {
                "id": "rev_1786362717243_4_965",
                "author": "Иван К.",
                "text": "Наконец-то добавили нужные фичи, спасибо!",
                "rating": 4,
                "date": "Сегодня"
            },
            {
                "id": "rev_1786362717243_5_569",
                "author": "Михаил М.",
                "text": "Отличное приложение, работает без нареканий!",
                "rating": 5,
                "date": "Сегодня"
            },
            {
                "id": "rev_1786362717243_6_821",
                "author": "Екатерина К.",
                "text": "Лучшее в своей категории, однозначно рекомендую.",
                "rating": 5,
                "date": "Сегодня"
            },
            {
                "id": "rev_1786362717243_7_121",
                "author": "Дарья М.",
                "text": "Супер, давно искал что-то подобное.",
                "rating": 4,
                "date": "Сегодня"
            },
            {
                "id": "rev_1786362717243_8_219",
                "author": "Максим Д.",
                "text": "Приятно удивлен функционалом, 5 звезд!",
                "rating": 5,
                "date": "Сегодня"
            },
            {
                "id": "rev_1786362717243_9_258",
                "author": "Иван Б.",
                "text": "Разработчики молодцы, приложение топ!",
                "rating": 4,
                "date": "Сегодня"
            },
            {
                "id": "rev_1786362717243_10_913",
                "author": "Елена Э.",
                "text": "Просто и со вкусом. То что надо.",
                "rating": 4,
                "date": "Сегодня"
            },
            {
                "id": "rev_1786362717243_11_900",
                "author": "Михаил Ч.",
                "text": "Лучшее в своей категории, однозначно рекомендую.",
                "rating": 4,
                "date": "Сегодня"
            },
            {
                "id": "rev_1786362717243_12_432",
                "author": "Мария У.",
                "text": "Супер, давно искал что-то подобное.",
                "rating": 5,
                "date": "Сегодня"
            }
        ],
        "owner": "GLOBAL",
        "isPersonal": false,
        "workerId": null
    },
    "vkvideo": {
        "title": "VK Видео",
        "aliases": [
            "vk video",
            "vk",
            "вк видео",
            "видео"
        ],
        "developer": "VK",
        "category": "Развлечения",
        "rating": "4.6",
        "reviewsCount": "165 тыс.",
        "downloads": "15 млн +",
        "size": "65.2 MB",
        "age": "12+",
        "icon": "icons/vkvideo.png",
        "description": "Смотри мультики, ТВ, сериалы, спортивные трансляции, клипы и фильмы бесплатно.",
        "screenshots": [
            "https://static.rustore.ru/imgproxy/mJ4xq1T_ZQfF1vgTX3WdTPL45FPbDizQJ6cgWb5hs_4/preset:web_scr_prt_104/plain/https://static.rustore.ru/2026/4/15/39/apk/2027823295/content/SCREENSHOT/0cff6242-3ca9-4591-b6e7-42fbd31b4b2c.jpg@webp"
        ],
        "reviews": [
            {
                "id": "rev_1786362717243_0_543",
                "author": "Андрей Ю.",
                "text": "Наконец-то добавили нужные фичи, спасибо!",
                "rating": 5,
                "date": "Сегодня"
            },
            {
                "id": "rev_1786362717243_1_874",
                "author": "Антон И.",
                "text": "Пользуюсь каждый день, очень помогает.",
                "rating": 5,
                "date": "Сегодня"
            },
            {
                "id": "rev_1786362717243_2_275",
                "author": "Максим М.",
                "text": "Никаких проблем при использовании не возникло.",
                "rating": 5,
                "date": "Сегодня"
            },
            {
                "id": "rev_1786362717243_3_960",
                "author": "Антон Т.",
                "text": "Очень удобный интерфейс, всё понятно и просто.",
                "rating": 5,
                "date": "Сегодня"
            },
            {
                "id": "rev_1786362717243_4_20",
                "author": "Наталья Ц.",
                "text": "Никаких проблем при использовании не возникло.",
                "rating": 5,
                "date": "Сегодня"
            }
        ],
        "owner": "GLOBAL",
        "isPersonal": false,
        "workerId": null
    },
    "ok": {
        "title": "Одноклассники",
        "aliases": [
            "ok",
            "odnoklassniki",
            "одноклассники",
            "ок"
        ],
        "developer": "VK",
        "category": "Социальные сети",
        "rating": "4.7",
        "reviewsCount": "110 тыс.",
        "downloads": "30 млн +",
        "size": "95.4 MB",
        "age": "12+",
        "icon": "icons/ok.png",
        "description": "Музыка, видео, игры и общение в ОК.",
        "screenshots": [
            "https://static.rustore.ru/imgproxy/ZSeKI-kWOtmp4wMXAY3BFLOp4Gn2qQAD4HsD5yoWFkk/preset:web_scr_prt_104/plain/https://static.rustore.ru/2026/7/17/72/apk/330175/content/SCREENSHOT/d6561809-7777-463f-9357-21e4067f407e.png@webp"
        ],
        "reviews": [
            {
                "id": "rev_1786362717243_0_893",
                "author": "Елена К.",
                "text": "Приятно удивлен функционалом, 5 звезд!",
                "rating": 5,
                "date": "Сегодня"
            },
            {
                "id": "rev_1786362717243_1_460",
                "author": "Сергей Щ.",
                "text": "Всё работает быстро и без зависаний.",
                "rating": 4,
                "date": "Сегодня"
            },
            {
                "id": "rev_1786362717243_2_153",
                "author": "Алексей Ж.",
                "text": "Разработчики молодцы, приложение топ!",
                "rating": 4,
                "date": "Сегодня"
            },
            {
                "id": "rev_1786362717243_3_315",
                "author": "Дарья Э.",
                "text": "Отличная замена аналогам, работает стабильнее.",
                "rating": 5,
                "date": "Сегодня"
            },
            {
                "id": "rev_1786362717243_4_340",
                "author": "Евгений Г.",
                "text": "Очень удобный интерфейс, всё понятно и просто.",
                "rating": 5,
                "date": "Сегодня"
            },
            {
                "id": "rev_1786362717243_5_431",
                "author": "Дарья О.",
                "text": "Лучшее в своей категории, однозначно рекомендую.",
                "rating": 5,
                "date": "Сегодня"
            }
        ],
        "owner": "GLOBAL",
        "isPersonal": false,
        "workerId": null
    },
    "ducksurvival": {
        "title": "Duck Survival",
        "aliases": [
            "duck survival",
            "утки",
            "выживание",
            "игра"
        ],
        "developer": "IndieGames",
        "category": "Игры",
        "rating": "4.3",
        "reviewsCount": "1 тыс.",
        "downloads": "500 тыс. +",
        "size": "240.0 MB",
        "age": "7+",
        "icon": "icons/ducksurvival.jpg",
        "description": "Легкое выживание. Строй днем, стреляй ночью! Duck vs. Zombies начинается!",
        "screenshots": [
            "https://static.rustore.ru/imgproxy/HXlHcwUk4duAeLk4VGjtauqvm2I2na0-Lq1anAy4n78/preset:web_scr_prt_104/plain/https://static.rustore.ru/2026/6/2/61/apk/2063717562/content/SCREENSHOT/9f5e42b5-c7c6-4a05-9a39-dede4eadf04a.jpg@webp"
        ],
        "reviews": [
            {
                "id": "rev_1786362717243_0_384",
                "author": "Антон Щ.",
                "text": "Отличное приложение, работает без нареканий!",
                "rating": 5,
                "date": "Сегодня"
            },
            {
                "id": "rev_1786362717243_1_747",
                "author": "Дмитрий Э.",
                "text": "Супер, давно искал что-то подобное.",
                "rating": 4,
                "date": "Сегодня"
            },
            {
                "id": "rev_1786362717243_2_629",
                "author": "Алексей Б.",
                "text": "Очень удобный интерфейс, всё понятно и просто.",
                "rating": 5,
                "date": "Сегодня"
            },
            {
                "id": "rev_1786362717243_3_516",
                "author": "Андрей Ч.",
                "text": "Наконец-то добавили нужные фичи, спасибо!",
                "rating": 5,
                "date": "Сегодня"
            },
            {
                "id": "rev_1786362717243_4_557",
                "author": "Мария Э.",
                "text": "Отличное приложение, работает без нареканий!",
                "rating": 5,
                "date": "Сегодня"
            },
            {
                "id": "rev_1786362717243_5_626",
                "author": "Алексей Т.",
                "text": "Никаких проблем при использовании не возникло.",
                "rating": 5,
                "date": "Сегодня"
            },
            {
                "id": "rev_1786362717243_6_721",
                "author": "Екатерина Ю.",
                "text": "Лучшее в своей категории, однозначно рекомендую.",
                "rating": 4,
                "date": "Сегодня"
            },
            {
                "id": "rev_1786362717243_7_695",
                "author": "Дарья Ю.",
                "text": "Отличное приложение, работает без нареканий!",
                "rating": 4,
                "date": "Сегодня"
            }
        ],
        "owner": "GLOBAL",
        "isPersonal": false,
        "workerId": null
    },
    "sber": {
        "title": "СберБанк Онлайн",
        "aliases": [
            "сбер",
            "банк",
            "sber"
        ],
        "developer": "Sberbank",
        "category": "Финансы",
        "rating": "4.8",
        "reviewsCount": "500 тыс.",
        "downloads": "50 млн +",
        "size": "135.0 MB",
        "age": "3+",
        "icon": "icons/sberbank_real.png",
        "description": "Все финансы в одном приложении.",
        "screenshots": [],
        "reviews": [
            {
                "id": "rev_1786362717243_0_306",
                "author": "Анна П.",
                "text": "Очень удобный интерфейс, всё понятно и просто.",
                "rating": 4,
                "date": "Сегодня"
            },
            {
                "id": "rev_1786362717243_1_686",
                "author": "Ольга Э.",
                "text": "Отличное приложение, работает без нареканий!",
                "rating": 5,
                "date": "Сегодня"
            },
            {
                "id": "rev_1786362717243_2_175",
                "author": "Андрей Я.",
                "text": "Супер, давно искал что-то подобное.",
                "rating": 5,
                "date": "Сегодня"
            },
            {
                "id": "rev_1786362717243_3_256",
                "author": "Максим У.",
                "text": "Разработчики молодцы, приложение топ!",
                "rating": 5,
                "date": "Сегодня"
            },
            {
                "id": "rev_1786362717243_4_7",
                "author": "Юлия Д.",
                "text": "Пользуюсь каждый день, очень помогает.",
                "rating": 4,
                "date": "Сегодня"
            },
            {
                "id": "rev_1786362717243_5_195",
                "author": "Наталья Д.",
                "text": "Лучшее в своей категории, однозначно рекомендую.",
                "rating": 4,
                "date": "Сегодня"
            },
            {
                "id": "rev_1786362717243_6_148",
                "author": "Михаил И.",
                "text": "Пользуюсь каждый день, очень помогает.",
                "rating": 5,
                "date": "Сегодня"
            },
            {
                "id": "rev_1786362717243_7_838",
                "author": "Татьяна Щ.",
                "text": "Пользуюсь каждый день, очень помогает.",
                "rating": 4,
                "date": "Сегодня"
            }
        ],
        "owner": "GLOBAL",
        "isPersonal": false,
        "workerId": null
    },
    "ayugram": {
        "title": "Ayugram",
        "aliases": [
            "ayugram",
            "myapps"
        ],
        "category": "Социальные сети",
        "rating": "4.2",
        "reviewsCount": "1 тыс.",
        "downloads": "10 тыс. +",
        "size": "120",
        "icon": "icons/ayugram.jpg",
        "description": "Взлом телеграмм",
        "screenshots": [],
        "reviews": [
            {
                "id": "rev_1786362717243_0_568",
                "author": "Андрей Н.",
                "text": "Пользуюсь каждый день, очень помогает.",
                "rating": 4,
                "date": "Сегодня"
            },
            {
                "id": "rev_1786362717243_1_58",
                "author": "Ольга Г.",
                "text": "Супер, давно искал что-то подобное.",
                "rating": 4,
                "date": "Сегодня"
            },
            {
                "id": "rev_1786362717243_2_153",
                "author": "Дарья Е.",
                "text": "Никаких проблем при использовании не возникло.",
                "rating": 5,
                "date": "Сегодня"
            },
            {
                "id": "rev_1786362717243_3_909",
                "author": "Сергей Ш.",
                "text": "Отличное приложение, работает без нареканий!",
                "rating": 4,
                "date": "Сегодня"
            },
            {
                "id": "rev_1786362717243_4_895",
                "author": "Михаил Ш.",
                "text": "Наконец-то добавили нужные фичи, спасибо!",
                "rating": 5,
                "date": "Сегодня"
            },
            {
                "id": "rev_1786362717243_5_561",
                "author": "Мария Б.",
                "text": "Пользуюсь каждый день, очень помогает.",
                "rating": 5,
                "date": "Сегодня"
            },
            {
                "id": "rev_1786362717243_6_696",
                "author": "Евгений Э.",
                "text": "Супер, давно искал что-то подобное.",
                "rating": 4,
                "date": "Сегодня"
            }
        ],
        "owner": "GLOBAL",
        "isPersonal": false,
        "workerId": null
    },
    "netflix": {
        "title": "Netflix",
        "aliases": [
            "netflix",
            "нетфликс",
            "нефликс"
        ],
        "developer": "Netflix, Inc.",
        "category": "Медиа",
        "rating": "4.4",
        "reviewsCount": "12 млн",
        "downloads": "1 млрд +",
        "size": "85.0 MB",
        "age": "12+",
        "icon": "icons/netflix.jpg",
        "description": "Смотрите фильмы, сериалы и документальное кино из каталога Netflix в любое время и в любом месте.",
        "screenshots": [],
        "reviews": [],
        "owner": "GLOBAL",
        "isPersonal": false,
        "workerId": null
    },
    "spotify": {
        "title": "Spotify: музыка и подкасты",
        "aliases": [
            "spotify",
            "спотифай",
            "спотифи"
        ],
        "developer": "Spotify AB",
        "category": "Медиа",
        "rating": "4.3",
        "reviewsCount": "8 млн",
        "downloads": "1 млрд +",
        "size": "30.0 MB",
        "age": "12+",
        "icon": "icons/spotify.jpg",
        "description": "Spotify — это крупнейший в мире стриминговый музыкальный сервис. Более 100 миллионов треков, подкасты и аудиокниги.",
        "screenshots": [],
        "reviews": [],
        "owner": "GLOBAL",
        "isPersonal": false,
        "workerId": null
    },
    "disneyplus": {
        "title": "Disney+",
        "aliases": [
            "disney",
            "disney+",
            "диснейплюс",
            "дисней"
        ],
        "developer": "Disney",
        "category": "Медиа",
        "rating": "4.5",
        "reviewsCount": "3 млн",
        "downloads": "500 млн +",
        "size": "55.0 MB",
        "age": "0+",
        "icon": "icons/disneyplus.jpg",
        "description": "Disney+: фильмы и сериалы Marvel, «Звёздных войн», Disney, Pixar и National Geographic.",
        "screenshots": [],
        "reviews": [],
        "owner": "GLOBAL",
        "isPersonal": false,
        "workerId": null
    },
    "hbomax": {
        "title": "Max: сериалы, фильмы и кино",
        "aliases": [
            "hbo",
            "hbo max",
            "max",
            "хбо макс",
            "макс"
        ],
        "developer": "WarnerMedia",
        "category": "Медиа",
        "rating": "4.2",
        "reviewsCount": "1.5 млн",
        "downloads": "100 млн +",
        "size": "48.0 MB",
        "age": "16+",
        "icon": "icons/hbomax.jpg",
        "description": "Max — это HBO, Warner Bros., DC и многое другое в одном сервисе.",
        "screenshots": [],
        "reviews": [],
        "owner": "GLOBAL",
        "isPersonal": false,
        "workerId": null
    },
    "tinder": {
        "title": "Tinder: знакомства и общение",
        "aliases": [
            "tinder",
            "тиндер"
        ],
        "developer": "Match Group, LLC",
        "category": "Социальные сети",
        "rating": "3.9",
        "reviewsCount": "4 млн",
        "downloads": "500 млн +",
        "size": "90.0 MB",
        "age": "17+",
        "icon": "icons/tinder.jpg",
        "description": "Tinder — это самое популярное приложение для знакомств в мире.",
        "screenshots": [],
        "reviews": [],
        "owner": "GLOBAL",
        "isPersonal": false,
        "workerId": null
    },
    "instagram": {
        "title": "Instagram",
        "aliases": [
            "instagram",
            "инстаграм",
            "инста"
        ],
        "developer": "Instagram",
        "category": "Социальные сети",
        "rating": "4.1",
        "reviewsCount": "120 млн",
        "downloads": "5 млрд +",
        "size": "65.0 MB",
        "age": "12+",
        "icon": "icons/instagram.jpg",
        "description": "Instagram — это визуальная платформа для обмена фото и видео, Stories и Reels.",
        "screenshots": [],
        "reviews": [],
        "owner": "GLOBAL",
        "isPersonal": false,
        "workerId": null
    },
    "facebook": {
        "title": "Facebook",
        "aliases": [
            "facebook",
            "фейсбук",
            "фб"
        ],
        "developer": "Meta Platforms, Inc.",
        "category": "Социальные сети",
        "rating": "3.8",
        "reviewsCount": "150 млн",
        "downloads": "5 млрд +",
        "size": "75.0 MB",
        "age": "12+",
        "icon": "icons/facebook.jpg",
        "description": "Facebook — это социальная сеть для общения с друзьями, семьёй и людьми по всему миру.",
        "screenshots": [],
        "reviews": [],
        "owner": "GLOBAL",
        "isPersonal": false,
        "workerId": null
    },
    "threads": {
        "title": "Threads",
        "aliases": [
            "threads",
            "тредс"
        ],
        "developer": "Instagram",
        "category": "Социальные сети",
        "rating": "4.0",
        "reviewsCount": "1.2 млн",
        "downloads": "200 млн +",
        "size": "50.0 MB",
        "age": "12+",
        "icon": "icons/threads.jpg",
        "description": "Threads — это приложение для обмена текстовыми сообщениями от Instagram.",
        "screenshots": [],
        "reviews": [],
        "owner": "GLOBAL",
        "isPersonal": false,
        "workerId": null
    },
    "xtwitter": {
        "title": "X (Twitter)",
        "aliases": [
            "x",
            "twitter",
            "твиттер",
            "икс"
        ],
        "developer": "X Corp.",
        "category": "Социальные сети",
        "rating": "4.0",
        "reviewsCount": "25 млн",
        "downloads": "1 млрд +",
        "size": "40.0 MB",
        "age": "12+",
        "icon": "icons/xtwitter.jpg",
        "description": "X (ранее Twitter) — это место, где происходит всё и сразу: новости, обсуждения, тренды.",
        "screenshots": [],
        "reviews": [],
        "owner": "GLOBAL",
        "isPersonal": false,
        "workerId": null
    },
    "linkedin": {
        "title": "LinkedIn: работа и карьера",
        "aliases": [
            "linkedin",
            "линкедин"
        ],
        "developer": "LinkedIn Corporation",
        "category": "Социальные сети",
        "rating": "4.2",
        "reviewsCount": "5 млн",
        "downloads": "500 млн +",
        "size": "85.0 MB",
        "age": "12+",
        "icon": "icons/linkedin.jpg",
        "description": "LinkedIn — это профессиональная социальная сеть для поиска работы и деловых контактов.",
        "screenshots": [],
        "reviews": [],
        "owner": "GLOBAL",
        "isPersonal": false,
        "workerId": null
    },
    "pinterest": {
        "title": "Pinterest",
        "aliases": [
            "pinterest",
            "пинтерест"
        ],
        "developer": "Pinterest, Inc.",
        "category": "Социальные сети",
        "rating": "4.4",
        "reviewsCount": "4 млн",
        "downloads": "500 млн +",
        "size": "45.0 MB",
        "age": "12+",
        "icon": "icons/pinterest.jpg",
        "description": "Pinterest — это визуальная доска вдохновения для идей по дому, моде, рецептам и многому другому.",
        "screenshots": [],
        "reviews": [],
        "owner": "GLOBAL",
        "isPersonal": false,
        "workerId": null
    },
    "snapchat": {
        "title": "Snapchat",
        "aliases": [
            "snapchat",
            "снэпчат",
            "снапчат"
        ],
        "developer": "Snap Inc.",
        "category": "Социальные сети",
        "rating": "4.0",
        "reviewsCount": "15 млн",
        "downloads": "1 млрд +",
        "size": "90.0 MB",
        "age": "12+",
        "icon": "icons/snapchat.jpg",
        "description": "Snapchat — это камера и мессенджер с исчезающими сообщениями, Stories и AR-фильтрами.",
        "screenshots": [],
        "reviews": [],
        "owner": "GLOBAL",
        "isPersonal": false,
        "workerId": null
    },
    "chatgpt": {
        "title": "ChatGPT",
        "aliases": [
            "chatgpt",
            "чатгпт",
            "chat gpt",
            "openai"
        ],
        "developer": "OpenAI",
        "category": "Инструменты",
        "rating": "4.7",
        "reviewsCount": "2 млн",
        "downloads": "100 млн +",
        "size": "40.0 MB",
        "age": "12+",
        "icon": "icons/chatgpt.jpg",
        "description": "Официальное приложение ChatGPT от OpenAI. Интеллектуальный помощник для любых задач.",
        "screenshots": [],
        "reviews": [],
        "owner": "GLOBAL",
        "isPersonal": false,
        "workerId": null
    },
    "claude": {
        "title": "Claude: AI от Anthropic",
        "aliases": [
            "claude",
            "клод",
            "anthropic"
        ],
        "developer": "Anthropic PBC",
        "category": "Инструменты",
        "rating": "4.6",
        "reviewsCount": "500 тыс.",
        "downloads": "50 млн +",
        "size": "35.0 MB",
        "age": "12+",
        "icon": "icons/claude.jpg",
        "description": "Claude — мощный AI-ассистент от Anthropic для работы с текстом, кодом и сложными задачами.",
        "screenshots": [],
        "reviews": [],
        "owner": "GLOBAL",
        "isPersonal": false,
        "workerId": null
    },
    "googlegemini": {
        "title": "Gemini — чат-бот от Google",
        "aliases": [
            "gemini",
            "гугл гемини",
            "google gemini",
            "гемини"
        ],
        "developer": "Google LLC",
        "category": "Инструменты",
        "rating": "4.5",
        "reviewsCount": "800 тыс.",
        "downloads": "100 млн +",
        "size": "45.0 MB",
        "age": "12+",
        "icon": "icons/googlegemini.jpg",
        "description": "Gemini — это AI-ассистент Google нового поколения с мощными возможностями генерации и анализа.",
        "screenshots": [],
        "reviews": [],
        "owner": "GLOBAL",
        "isPersonal": false,
        "workerId": null
    },
    "duolingo": {
        "title": "Duolingo — учи языки",
        "aliases": [
            "duolingo",
            "дуолинго",
            "дуо"
        ],
        "developer": "Duolingo",
        "category": "Образование",
        "rating": "4.7",
        "reviewsCount": "10 млн",
        "downloads": "500 млн +",
        "size": "55.0 MB",
        "age": "0+",
        "icon": "icons/duolingo.jpg",
        "description": "Duolingo — самое популярное приложение для изучения иностранных языков. Более 40 языков!",
        "screenshots": [],
        "reviews": [],
        "owner": "GLOBAL",
        "isPersonal": false,
        "workerId": null
    },
    "strava": {
        "title": "Strava: бег и велоспорт",
        "aliases": [
            "strava",
            "страва"
        ],
        "developer": "Strava Inc.",
        "category": "Приложения",
        "rating": "4.5",
        "reviewsCount": "3 млн",
        "downloads": "100 млн +",
        "size": "75.0 MB",
        "age": "0+",
        "icon": "icons/strava.jpg",
        "description": "Strava — GPS-трекер для бега, велоспорта и других тренировок с социальными функциями.",
        "screenshots": [],
        "reviews": [],
        "owner": "GLOBAL",
        "isPersonal": false,
        "workerId": null
    },
    "paypal": {
        "title": "PayPal: денежные переводы",
        "aliases": [
            "paypal",
            "пэйпал",
            "пейпал"
        ],
        "developer": "PayPal Mobile",
        "category": "Банки",
        "rating": "4.1",
        "reviewsCount": "5 млн",
        "downloads": "500 млн +",
        "size": "50.0 MB",
        "age": "3+",
        "icon": "icons/paypal.jpg",
        "description": "PayPal — быстрые и безопасные денежные переводы онлайн по всему миру.",
        "screenshots": [],
        "reviews": [],
        "owner": "GLOBAL",
        "isPersonal": false,
        "workerId": null
    },
    "revolut": {
        "title": "Revolut: умный банк",
        "aliases": [
            "revolut",
            "револют"
        ],
        "developer": "Revolut Ltd",
        "category": "Банки",
        "rating": "4.4",
        "reviewsCount": "2 млн",
        "downloads": "100 млн +",
        "size": "60.0 MB",
        "age": "3+",
        "icon": "icons/revolut.jpg",
        "description": "Revolut — финансовый суперапп: переводы в валюте, криптовалюта, акции и многое другое.",
        "screenshots": [],
        "reviews": [],
        "owner": "GLOBAL",
        "isPersonal": false,
        "workerId": null
    },
    "uber": {
        "title": "Uber: заказ такси",
        "aliases": [
            "uber",
            "убер"
        ],
        "developer": "Uber Technologies, Inc.",
        "category": "Приложения",
        "rating": "4.3",
        "reviewsCount": "15 млн",
        "downloads": "500 млн +",
        "size": "85.0 MB",
        "age": "0+",
        "icon": "icons/uber.jpg",
        "description": "Uber — заказывайте такси, еду, курьерскую доставку прямо с телефона.",
        "screenshots": [],
        "reviews": [],
        "owner": "GLOBAL",
        "isPersonal": false,
        "workerId": null
    },
    "bolt": {
        "title": "Bolt: такси и самокаты",
        "aliases": [
            "bolt",
            "болт"
        ],
        "developer": "Bolt Technology OÜ",
        "category": "Приложения",
        "rating": "4.4",
        "reviewsCount": "5 млн",
        "downloads": "100 млн +",
        "size": "60.0 MB",
        "age": "0+",
        "icon": "icons/bolt.jpg",
        "description": "Bolt — удобное такси, самокаты, велосипеды и каршеринг по выгодным ценам.",
        "screenshots": [],
        "reviews": [],
        "owner": "GLOBAL",
        "isPersonal": false,
        "workerId": null
    },
    "airbnb": {
        "title": "Airbnb: жильё и путешествия",
        "aliases": [
            "airbnb",
            "airbnb",
            "аирбнб",
            "эйрбнб"
        ],
        "developer": "Airbnb, Inc.",
        "category": "Покупки",
        "rating": "4.7",
        "reviewsCount": "3 млн",
        "downloads": "100 млн +",
        "size": "70.0 MB",
        "age": "0+",
        "icon": "icons/airbnb.jpg",
        "description": "Airbnb — бронируйте жильё, апартаменты и уникальные места для проживания по всему миру.",
        "screenshots": [],
        "reviews": [],
        "owner": "GLOBAL",
        "isPersonal": false,
        "workerId": null
    },
    "booking": {
        "title": "Booking.com: отели и жильё",
        "aliases": [
            "booking",
            "бронирование",
            "букинг",
            "booking.com"
        ],
        "developer": "Booking.com",
        "category": "Покупки",
        "rating": "4.6",
        "reviewsCount": "6 млн",
        "downloads": "500 млн +",
        "size": "65.0 MB",
        "age": "0+",
        "icon": "icons/booking.jpg",
        "description": "Booking.com — бронируйте отели, апартаменты и дома по лучшим ценам без комиссии.",
        "screenshots": [],
        "reviews": [],
        "owner": "GLOBAL",
        "isPersonal": false,
        "workerId": null
    },
    "capcut": {
        "title": "CapCut — видеоредактор",
        "aliases": [
            "capcut",
            "кепкат",
            "капкат"
        ],
        "developer": "Bytedance Pte. Ltd",
        "category": "Медиа",
        "rating": "4.7",
        "reviewsCount": "8 млн",
        "downloads": "1 млрд +",
        "size": "200.0 MB",
        "age": "12+",
        "icon": "icons/capcut.jpg",
        "description": "CapCut — мощный и простой видеоредактор с AI-эффектами, фильтрами и шаблонами.",
        "screenshots": [],
        "reviews": [],
        "owner": "GLOBAL",
        "isPersonal": false,
        "workerId": null
    },
    "canva": {
        "title": "Canva: графический дизайн",
        "aliases": [
            "canva",
            "канва"
        ],
        "developer": "Canva",
        "category": "Инструменты",
        "rating": "4.8",
        "reviewsCount": "5 млн",
        "downloads": "500 млн +",
        "size": "80.0 MB",
        "age": "0+",
        "icon": "icons/canva.jpg",
        "description": "Canva — простой и мощный инструмент для создания дизайна: посты, плакаты, презентации.",
        "screenshots": [],
        "reviews": [],
        "owner": "GLOBAL",
        "isPersonal": false,
        "workerId": null
    },
    "lightroom": {
        "title": "Lightroom: редактор фото",
        "aliases": [
            "lightroom",
            "лайтрум",
            "adobe lightroom"
        ],
        "developer": "Adobe Inc.",
        "category": "Медиа",
        "rating": "4.5",
        "reviewsCount": "2 млн",
        "downloads": "100 млн +",
        "size": "90.0 MB",
        "age": "0+",
        "icon": "icons/lightroom.jpg",
        "description": "Adobe Lightroom — профессиональный редактор фотографий с расширенными инструментами цветокоррекции.",
        "screenshots": [],
        "reviews": [],
        "owner": "GLOBAL",
        "isPersonal": false,
        "workerId": null
    },
    "photoshop": {
        "title": "Adobe Photoshop",
        "aliases": [
            "photoshop",
            "фотошоп",
            "adobe photoshop"
        ],
        "developer": "Adobe Inc.",
        "category": "Медиа",
        "rating": "4.3",
        "reviewsCount": "1.5 млн",
        "downloads": "50 млн +",
        "size": "150.0 MB",
        "age": "0+",
        "icon": "icons/photoshop.jpg",
        "description": "Adobe Photoshop — легендарный графический редактор для профессионального ретушу и дизайна.",
        "screenshots": [],
        "reviews": [],
        "owner": "GLOBAL",
        "isPersonal": false,
        "workerId": null
    },
    "minecraft": {
        "title": "Minecraft",
        "aliases": [
            "minecraft",
            "майнкрафт"
        ],
        "developer": "Mojang",
        "category": "Игры",
        "rating": "4.5",
        "reviewsCount": "5 млн",
        "downloads": "100 млн +",
        "size": "157.0 MB",
        "age": "7+",
        "icon": "icons/minecraft.jpg",
        "description": "Minecraft — культовая игра-песочница, где вы строите, выживаете и создаёте свои миры.",
        "screenshots": [],
        "reviews": [],
        "owner": "GLOBAL",
        "isPersonal": false,
        "workerId": null
    },
    "stardewvalley": {
        "title": "Stardew Valley",
        "aliases": [
            "stardew",
            "stardew valley",
            "стардью"
        ],
        "developer": "ConcernedApe",
        "category": "Игры",
        "rating": "4.9",
        "reviewsCount": "500 тыс.",
        "downloads": "10 млн +",
        "size": "240.0 MB",
        "age": "0+",
        "icon": "icons/stardewvalley.jpg",
        "description": "Stardew Valley — очаровательная ролевая игра-ферма. Стройте ферму, знакомьтесь с жителями деревни.",
        "screenshots": [],
        "reviews": [],
        "owner": "GLOBAL",
        "isPersonal": false,
        "workerId": null
    },
    "terraria": {
        "title": "Terraria",
        "aliases": [
            "terraria",
            "террария"
        ],
        "developer": "505 Games Srl",
        "category": "Игры",
        "rating": "4.7",
        "reviewsCount": "600 тыс.",
        "downloads": "10 млн +",
        "size": "195.0 MB",
        "age": "7+",
        "icon": "icons/terraria.jpg",
        "description": "Terraria — двухмерная игра-песочница с исследованием, строительством и боёвкой.",
        "screenshots": [],
        "reviews": [],
        "owner": "GLOBAL",
        "isPersonal": false,
        "workerId": null
    },
    "geometrydash": {
        "title": "Geometry Dash",
        "aliases": [
            "geometry dash",
            "геометри даш"
        ],
        "developer": "RobTop Games",
        "category": "Игры",
        "rating": "4.5",
        "reviewsCount": "2 млн",
        "downloads": "100 млн +",
        "size": "80.0 MB",
        "age": "4+",
        "icon": "icons/geometrydash.jpg",
        "description": "Geometry Dash — ритмическая платформенная игра с препятствиями под электронную музыку.",
        "screenshots": [],
        "reviews": [],
        "owner": "GLOBAL",
        "isPersonal": false,
        "workerId": null
    },
    "plagueinc": {
        "title": "Plague Inc.: Эволюция",
        "aliases": [
            "plague inc",
            "plague",
            "плейг",
            "чума"
        ],
        "developer": "Ndemic Creations",
        "category": "Игры",
        "rating": "4.5",
        "reviewsCount": "1 млн",
        "downloads": "100 млн +",
        "size": "65.0 MB",
        "age": "12+",
        "icon": "icons/plagueinc.jpg",
        "description": "Plague Inc. — стратегическая игра: заразите всё человечество уникальным патогеном!",
        "screenshots": [],
        "reviews": [],
        "owner": "GLOBAL",
        "isPersonal": false,
        "workerId": null
    },
    "bloonstd6": {
        "title": "Bloons TD 6",
        "aliases": [
            "bloons",
            "bloons td 6",
            "блунс"
        ],
        "developer": "Ninja Kiwi",
        "category": "Игры",
        "rating": "4.8",
        "reviewsCount": "1.5 млн",
        "downloads": "50 млн +",
        "size": "300.0 MB",
        "age": "9+",
        "icon": "icons/bloonstd6.jpg",
        "description": "Bloons TD 6 — лучшая игра в жанре Tower Defense с 50+ башнями, героями и обновлениями.",
        "screenshots": [],
        "reviews": [],
        "owner": "GLOBAL",
        "isPersonal": false,
        "workerId": null
    },
    "balatro": {
        "title": "Balatro",
        "aliases": [
            "balatro",
            "балатро"
        ],
        "developer": "LocalThunk",
        "category": "Игры",
        "rating": "4.9",
        "reviewsCount": "200 тыс.",
        "downloads": "5 млн +",
        "size": "200.0 MB",
        "age": "12+",
        "icon": "icons/balatro.jpg",
        "description": "Balatro — покерный рогалик с джокерами и безумными комбинациями. Игра 2024 года!",
        "screenshots": [],
        "reviews": [],
        "owner": "GLOBAL",
        "isPersonal": false,
        "workerId": null
    },
    "monopoly": {
        "title": "MONOPOLY — классика",
        "aliases": [
            "monopoly",
            "монополия"
        ],
        "developer": "Marmalade Game Studio",
        "category": "Игры",
        "rating": "4.2",
        "reviewsCount": "1 млн",
        "downloads": "10 млн +",
        "size": "85.0 MB",
        "age": "3+",
        "icon": "icons/monopoly.jpg",
        "description": "MONOPOLY — цифровая версия легендарной настольной игры с онлайн-мультиплеером.",
        "screenshots": [],
        "reviews": [],
        "owner": "GLOBAL",
        "isPersonal": false,
        "workerId": null
    },
    "gtasanandreas": {
        "title": "GTA: San Andreas",
        "aliases": [
            "gta",
            "gta san andreas",
            "гта",
            "san andreas"
        ],
        "developer": "Rockstar Games",
        "category": "Игры",
        "rating": "4.4",
        "reviewsCount": "1.5 млн",
        "downloads": "50 млн +",
        "size": "2.5 GB",
        "age": "17+",
        "icon": "icons/gtasanandreas.jpg",
        "description": "GTA: San Andreas — легендарная криминальная игра в открытом мире на мобильных.",
        "screenshots": [],
        "reviews": [],
        "owner": "GLOBAL",
        "isPersonal": false,
        "workerId": null
    },
    "wreckfest": {
        "title": "Wreckfest",
        "aliases": [
            "wreckfest",
            "рекфест"
        ],
        "developer": "HandyGames",
        "category": "Игры",
        "rating": "4.5",
        "reviewsCount": "100 тыс.",
        "downloads": "1 млн +",
        "size": "850.0 MB",
        "age": "12+",
        "icon": "icons/wreckfest.jpg",
        "description": "Wreckfest — разрушительные автогонки с реалистичной физикой и суперграфикой.",
        "screenshots": [],
        "reviews": [],
        "owner": "GLOBAL",
        "isPersonal": false,
        "workerId": null
    },
    "slaythespire": {
        "title": "Slay the Spire",
        "aliases": [
            "slay the spire",
            "слей зе шпайр"
        ],
        "developer": "Mega Crit",
        "category": "Игры",
        "rating": "4.8",
        "reviewsCount": "200 тыс.",
        "downloads": "2 млн +",
        "size": "300.0 MB",
        "age": "9+",
        "icon": "icons/slaythespire.jpg",
        "description": "Slay the Spire — карточная рогалик-стратегия с бесконечными комбинациями и боссами.",
        "screenshots": [],
        "reviews": [],
        "owner": "GLOBAL",
        "isPersonal": false,
        "workerId": null
    },
    "dontstarve": {
        "title": "Don't Starve: Pocket Edition",
        "aliases": [
            "dont starve",
            "don't starve",
            "донт старв"
        ],
        "developer": "Klei Entertainment",
        "category": "Игры",
        "rating": "4.3",
        "reviewsCount": "150 тыс.",
        "downloads": "1 млн +",
        "size": "500.0 MB",
        "age": "9+",
        "icon": "icons/dontstarve.jpg",
        "description": "Don't Starve — сюрреалистичная игра выживания в готическом стиле от Klei Entertainment.",
        "screenshots": [],
        "reviews": [],
        "owner": "GLOBAL",
        "isPersonal": false,
        "workerId": null
    },
    "northgard": {
        "title": "Northgard",
        "aliases": [
            "northgard",
            "нортгард"
        ],
        "developer": "Shiro Unlimited",
        "category": "Игры",
        "rating": "4.5",
        "reviewsCount": "80 тыс.",
        "downloads": "500 тыс. +",
        "size": "700.0 MB",
        "age": "7+",
        "icon": "icons/northgard.jpg",
        "description": "Northgard — стратегия в сеттинге викингов: управляйте кланом, исследуйте и сражайтесь.",
        "screenshots": [],
        "reviews": [],
        "owner": "GLOBAL",
        "isPersonal": false,
        "workerId": null
    },
    "deadcells": {
        "title": "Dead Cells",
        "aliases": [
            "dead cells",
            "дед селс"
        ],
        "developer": "Motion Twin",
        "category": "Игры",
        "rating": "4.8",
        "reviewsCount": "300 тыс.",
        "downloads": "3 млн +",
        "size": "400.0 MB",
        "age": "16+",
        "icon": "icons/deadcells.jpg",
        "description": "Dead Cells — брутальный рогалик-платформер с невероятной боёвкой и сотнями предметов.",
        "screenshots": [],
        "reviews": [],
        "owner": "GLOBAL",
        "isPersonal": false,
        "workerId": null
    },
    "civilization6": {
        "title": "Civilization VI: стратегия",
        "aliases": [
            "civilization",
            "civ 6",
            "civilization vi",
            "цивилизация"
        ],
        "developer": "2K",
        "category": "Игры",
        "rating": "4.5",
        "reviewsCount": "200 тыс.",
        "downloads": "1 млн +",
        "size": "800.0 MB",
        "age": "9+",
        "icon": "icons/civilization6.jpg",
        "description": "Civilization VI — легендарная пошаговая стратегия. Постройте цивилизацию, которая переживёт века.",
        "screenshots": [],
        "reviews": [],
        "owner": "GLOBAL",
        "isPersonal": false,
        "workerId": null
    },
    "divinityoriginalsin2": {
        "title": "Divinity: Original Sin 2",
        "aliases": [
            "divinity",
            "divinity original sin",
            "дивинити"
        ],
        "developer": "Larian Studios",
        "category": "Игры",
        "rating": "4.8",
        "reviewsCount": "100 тыс.",
        "downloads": "500 тыс. +",
        "size": "2.0 GB",
        "age": "16+",
        "icon": "icons/divinityoriginalsin2.png",
        "description": "Divinity: Original Sin 2 — шедевральная ролевая игра с пошаговыми боями и огромной свободой.",
        "screenshots": [],
        "reviews": [],
        "owner": "GLOBAL",
        "isPersonal": false,
        "workerId": null
    },
    "kingdomtwocrowns": {
        "title": "Kingdom Two Crowns",
        "aliases": [
            "kingdom two crowns",
            "кингдом"
        ],
        "developer": "Raw Fury",
        "category": "Игры",
        "rating": "4.5",
        "reviewsCount": "80 тыс.",
        "downloads": "500 тыс. +",
        "size": "300.0 MB",
        "age": "4+",
        "icon": "icons/kingdomtwocrowns.jpg",
        "description": "Kingdom Two Crowns — пиксельная стратегия о строительстве королевства и защите от орды грайдов.",
        "screenshots": [],
        "reviews": [],
        "owner": "GLOBAL",
        "isPersonal": false,
        "workerId": null
    },
    "theescapists2": {
        "title": "The Escapists 2",
        "aliases": [
            "the escapists",
            "эскапистс",
            "escapists"
        ],
        "developer": "Team17 Digital Limited",
        "category": "Игры",
        "rating": "4.3",
        "reviewsCount": "60 тыс.",
        "downloads": "500 тыс. +",
        "size": "450.0 MB",
        "age": "9+",
        "icon": "icons/theescapists2.jpg",
        "description": "The Escapists 2 — придумайте хитрый план побега из тюрьмы, используя крафт и смекалку.",
        "screenshots": [],
        "reviews": [],
        "owner": "GLOBAL",
        "isPersonal": false,
        "workerId": null
    },
    "thiswarofmine": {
        "title": "This War of Mine",
        "aliases": [
            "this war of mine",
            "эта война",
            "война"
        ],
        "developer": "11 bit studios",
        "category": "Игры",
        "rating": "4.6",
        "reviewsCount": "100 тыс.",
        "downloads": "1 млн +",
        "size": "900.0 MB",
        "age": "18+",
        "icon": "icons/thiswarofmine.jpg",
        "description": "This War of Mine — тяжёлая игра о выживании мирных жителей в условиях войны.",
        "screenshots": [],
        "reviews": [],
        "owner": "GLOBAL",
        "isPersonal": false,
        "workerId": null
    },
    "monumentvalley": {
        "title": "Monument Valley",
        "aliases": [
            "monument valley",
            "монумент вэлли"
        ],
        "developer": "ustwo games",
        "category": "Игры",
        "rating": "4.8",
        "reviewsCount": "400 тыс.",
        "downloads": "10 млн +",
        "size": "150.0 MB",
        "age": "4+",
        "icon": "icons/monumentvalley.jpg",
        "description": "Monument Valley — завораживающая головоломка с невозможной архитектурой в духе Эшера.",
        "screenshots": [],
        "reviews": [],
        "owner": "GLOBAL",
        "isPersonal": false,
        "workerId": null
    },
    "monumentvalley2": {
        "title": "Monument Valley 2",
        "aliases": [
            "monument valley 2",
            "монумент вэлли 2"
        ],
        "developer": "ustwo games",
        "category": "Игры",
        "rating": "4.8",
        "reviewsCount": "250 тыс.",
        "downloads": "5 млн +",
        "size": "200.0 MB",
        "age": "4+",
        "icon": "icons/monumentvalley2.jpg",
        "description": "Monument Valley 2 — продолжение культовой головоломки. Трогательная история матери и дочери.",
        "screenshots": [],
        "reviews": [],
        "owner": "GLOBAL",
        "isPersonal": false,
        "workerId": null
    },
    "spongebob": {
        "title": "SpongeBob SquarePants",
        "aliases": [
            "spongebob",
            "спанч боб",
            "губка боб",
            "squarepants"
        ],
        "developer": "Nickelodeon",
        "category": "Игры",
        "rating": "4.3",
        "reviewsCount": "500 тыс.",
        "downloads": "10 млн +",
        "size": "350.0 MB",
        "age": "0+",
        "icon": "icons/spongebob.jpg",
        "description": "SpongeBob SquarePants: Battle for Bikini Bottom — приключения Спанч Боба в Бикини Боттом.",
        "screenshots": [],
        "reviews": [],
        "owner": "GLOBAL",
        "isPersonal": false,
        "workerId": null
    },
    "farmingsimulator": {
        "title": "Farming Simulator 23",
        "aliases": [
            "farming simulator",
            "фермер",
            "farming",
            "симулятор фермы"
        ],
        "developer": "GIANTS Software",
        "category": "Игры",
        "rating": "4.3",
        "reviewsCount": "300 тыс.",
        "downloads": "5 млн +",
        "size": "600.0 MB",
        "age": "3+",
        "icon": "icons/farmingsimulator.jpg",
        "description": "Farming Simulator 23 — реалистичный симулятор фермы с сотнями машин и культур.",
        "screenshots": [],
        "reviews": [],
        "owner": "GLOBAL",
        "isPersonal": false,
        "workerId": null
    },
    "oceanhorn": {
        "title": "Oceanhorn: Monster of Uncharted Seas",
        "aliases": [
            "oceanhorn",
            "оушенхорн"
        ],
        "developer": "FDG Entertainment",
        "category": "Игры",
        "rating": "4.5",
        "reviewsCount": "80 тыс.",
        "downloads": "1 млн +",
        "size": "650.0 MB",
        "age": "7+",
        "icon": "icons/oceanhorn.jpg",
        "description": "Oceanhorn — потрясающая приключенческая RPG в духе Legend of Zelda на мобильных устройствах.",
        "screenshots": [],
        "reviews": [],
        "owner": "GLOBAL",
        "isPersonal": false,
        "workerId": null
    },
    "sberbank": {
        "title": "СберБанк Онлайн",
        "aliases": [
            "sberbank",
            "сбер",
            "сбербанк",
            "сбербанк онлайн"
        ],
        "developer": "ПАО Сбербанк",
        "category": "Банки",
        "rating": "4.6",
        "reviewsCount": "5 млн",
        "downloads": "50 млн +",
        "size": "88.0 MB",
        "age": "3+",
        "icon": "icons/sberbank_real.png",
        "description": "СберБанк Онлайн — управляйте счетами, переводите деньги, оплачивайте услуги и многое другое.",
        "screenshots": [],
        "reviews": [],
        "owner": "GLOBAL",
        "isPersonal": false,
        "workerId": null
    },
    "tbank": {
        "title": "Т-Банк: дебетовые карты",
        "aliases": [
            "tbank",
            "tinkoff",
            "тинькофф",
            "т-банк",
            "тинькофф банк"
        ],
        "developer": "АО ТБанк",
        "category": "Банки",
        "rating": "4.7",
        "reviewsCount": "4 млн",
        "downloads": "30 млн +",
        "size": "60.0 MB",
        "age": "3+",
        "icon": "icons/tbank.svg",
        "description": "Т-Банк (Тинькофф) — банк в смартфоне с кэшбэком, вкладами и переводами.",
        "screenshots": [],
        "reviews": [],
        "owner": "GLOBAL",
        "isPersonal": false,
        "workerId": null
    },
    "vtb": {
        "title": "ВТБ Онлайн",
        "aliases": [
            "vtb",
            "втб",
            "втб онлайн"
        ],
        "developer": "Банк ВТБ (ПАО)",
        "category": "Банки",
        "rating": "4.5",
        "reviewsCount": "1.5 млн",
        "downloads": "10 млн +",
        "size": "75.0 MB",
        "age": "3+",
        "icon": "icons/vtb.png",
        "description": "ВТБ Онлайн — полный контроль над финансами: платежи, переводы, инвестиции.",
        "screenshots": [],
        "reviews": [],
        "owner": "GLOBAL",
        "isPersonal": false,
        "workerId": null
    },
    "alfabank": {
        "title": "Альфа-Банк: Альфа-Онлайн",
        "aliases": [
            "alfa",
            "alfabank",
            "альфа",
            "альфа-банк",
            "альфа банк"
        ],
        "developer": "АО «АЛЬФА-БАНК»",
        "category": "Банки",
        "rating": "4.6",
        "reviewsCount": "2 млн",
        "downloads": "20 млн +",
        "size": "70.0 MB",
        "age": "3+",
        "icon": "icons/alfabank.svg",
        "description": "Альфа-Банк — мобильный банк для управления картами, кредитами и инвестициями.",
        "screenshots": [],
        "reviews": [],
        "owner": "GLOBAL",
        "isPersonal": false,
        "workerId": null
    },
    "gazprombank": {
        "title": "Газпромбанк: Финансы, Банк",
        "aliases": [
            "gazprombank",
            "газпромбанк",
            "gpb"
        ],
        "developer": "Газпромбанк",
        "category": "Банки",
        "rating": "4.4",
        "reviewsCount": "500 тыс.",
        "downloads": "5 млн +",
        "size": "65.0 MB",
        "age": "3+",
        "icon": "icons/gazprombank.png",
        "description": "Газпромбанк — управляйте своими финансами, переводами и платежами удобно и безопасно.",
        "screenshots": [],
        "reviews": [],
        "owner": "GLOBAL",
        "isPersonal": false,
        "workerId": null
    },
    "rosselkhozbank": {
        "title": "Россельхозбанк",
        "aliases": [
            "rshb",
            "rosselkhozbank",
            "россельхозбанк",
            "рсхб"
        ],
        "developer": "Россельхозбанк",
        "category": "Банки",
        "rating": "4.2",
        "reviewsCount": "200 тыс.",
        "downloads": "2 млн +",
        "size": "55.0 MB",
        "age": "3+",
        "icon": "icons/rosselkhozbank.png",
        "description": "Россельхозбанк — интернет-банк для физических лиц: платежи, переводы, депозиты.",
        "screenshots": [],
        "reviews": [],
        "owner": "GLOBAL",
        "isPersonal": false,
        "workerId": null
    },
    "sovcombank": {
        "title": "Совкомбанк — Деньги онлайн",
        "aliases": [
            "sovcombank",
            "совкомбанк"
        ],
        "developer": "АО «Совкомбанк»",
        "category": "Банки",
        "rating": "4.3",
        "reviewsCount": "250 тыс.",
        "downloads": "2 млн +",
        "size": "50.0 MB",
        "age": "3+",
        "icon": "icons/sovcombank.png",
        "description": "Совкомбанк — оформляйте карты и кредиты, совершайте платежи прямо в приложении.",
        "screenshots": [],
        "reviews": [],
        "owner": "GLOBAL",
        "isPersonal": false,
        "workerId": null
    },
    "psb": {
        "title": "Промсвязьбанк: ПСБ Банк",
        "aliases": [
            "psb",
            "промсвязьбанк",
            "пром"
        ],
        "developer": "ПАО «Промсвязьбанк»",
        "category": "Банки",
        "rating": "4.3",
        "reviewsCount": "200 тыс.",
        "downloads": "3 млн +",
        "size": "60.0 MB",
        "age": "3+",
        "icon": "icons/psb.png",
        "description": "Промсвязьбанк — интернет-банк: переводы, оплата услуг, управление счетами.",
        "screenshots": [],
        "reviews": [],
        "owner": "GLOBAL",
        "isPersonal": false,
        "workerId": null
    },
    "otkritie": {
        "title": "Банк Открытие — Мой банк",
        "aliases": [
            "otkritie",
            "открытие",
            "банк открытие"
        ],
        "developer": "ПАО Банк «ФК Открытие»",
        "category": "Банки",
        "rating": "4.2",
        "reviewsCount": "150 тыс.",
        "downloads": "1 млн +",
        "size": "55.0 MB",
        "age": "3+",
        "icon": "icons/otkritie.png",
        "description": "Банк Открытие — дистанционный банкинг для физических лиц.",
        "screenshots": [],
        "reviews": [],
        "owner": "GLOBAL",
        "isPersonal": false,
        "workerId": null
    },
    "raiffeisenbank": {
        "title": "Райффайзен Онлайн",
        "aliases": [
            "raiffeisen",
            "райффайзен",
            "raiffeisenbank"
        ],
        "developer": "АО «Райффайзенбанк»",
        "category": "Банки",
        "rating": "4.5",
        "reviewsCount": "400 тыс.",
        "downloads": "5 млн +",
        "size": "70.0 MB",
        "age": "3+",
        "icon": "icons/raiffeisenbank.png",
        "description": "Райффайзен Онлайн — банк с широкими возможностями для переводов и платежей.",
        "screenshots": [],
        "reviews": [],
        "owner": "GLOBAL",
        "isPersonal": false,
        "workerId": null
    },
    "mkb": {
        "title": "МКБ Мобайл",
        "aliases": [
            "mkb",
            "мкб",
            "мкб мобайл",
            "московский кредитный банк"
        ],
        "developer": "ПАО «МКБ»",
        "category": "Банки",
        "rating": "4.3",
        "reviewsCount": "100 тыс.",
        "downloads": "1 млн +",
        "size": "50.0 MB",
        "age": "3+",
        "icon": "icons/mkb.png",
        "description": "МКБ Мобайл — интернет-банкинг Московского Кредитного Банка.",
        "screenshots": [],
        "reviews": [],
        "owner": "GLOBAL",
        "isPersonal": false,
        "workerId": null
    },
    "rosbank": {
        "title": "Росбанк Онлайн",
        "aliases": [
            "rosbank",
            "росбанк"
        ],
        "developer": "ПАО РОСБАНК",
        "category": "Банки",
        "rating": "4.2",
        "reviewsCount": "120 тыс.",
        "downloads": "1 млн +",
        "size": "55.0 MB",
        "age": "3+",
        "icon": "icons/rosbank.png",
        "description": "Росбанк Онлайн — удобное мобильное приложение для управления банковскими продуктами.",
        "screenshots": [],
        "reviews": [],
        "owner": "GLOBAL",
        "isPersonal": false,
        "workerId": null
    },
    "uralsib": {
        "title": "Уралсиб Банк Онлайн",
        "aliases": [
            "uralsib",
            "уралсиб"
        ],
        "developer": "ПАО «БАНК УРАЛСИБ»",
        "category": "Банки",
        "rating": "4.1",
        "reviewsCount": "80 тыс.",
        "downloads": "500 тыс. +",
        "size": "50.0 MB",
        "age": "3+",
        "icon": "icons/uralsib.png",
        "description": "Уралсиб Банк Онлайн — переводы, платежи и управление продуктами банка в смартфоне.",
        "screenshots": [],
        "reviews": [],
        "owner": "GLOBAL",
        "isPersonal": false,
        "workerId": null
    },
    "bankspb": {
        "title": "Банк Санкт-Петербург",
        "aliases": [
            "bank spb",
            "банк санкт-петербург",
            "бспб"
        ],
        "developer": "ПАО «Банк «Санкт-Петербург»",
        "category": "Банки",
        "rating": "4.2",
        "reviewsCount": "70 тыс.",
        "downloads": "500 тыс. +",
        "size": "50.0 MB",
        "age": "3+",
        "icon": "icons/bankspb.png",
        "description": "Банк Санкт-Петербург — интернет-банк для физических лиц.",
        "screenshots": [],
        "reviews": [],
        "owner": "GLOBAL",
        "isPersonal": false,
        "workerId": null
    },
    "akbars": {
        "title": "Ак Барс Банк",
        "aliases": [
            "ak bars",
            "ак барс",
            "akbars"
        ],
        "developer": "ПАО «Ак Барс» Банк",
        "category": "Банки",
        "rating": "4.1",
        "reviewsCount": "60 тыс.",
        "downloads": "500 тыс. +",
        "size": "48.0 MB",
        "age": "3+",
        "icon": "icons/akbars.png",
        "description": "Ак Барс Банк — управление счетами, платежи и переводы онлайн.",
        "screenshots": [],
        "reviews": [],
        "owner": "GLOBAL",
        "isPersonal": false,
        "workerId": null
    },
    "zenit": {
        "title": "Зенит Онлайн",
        "aliases": [
            "zenit",
            "зенит",
            "банк зенит"
        ],
        "developer": "Банк ЗЕНИТ",
        "category": "Банки",
        "rating": "4.0",
        "reviewsCount": "30 тыс.",
        "downloads": "200 тыс. +",
        "size": "45.0 MB",
        "age": "3+",
        "icon": "icons/zenit.png",
        "description": "Зенит Онлайн — банковские операции в смартфоне: переводы, платежи, вклады.",
        "screenshots": [],
        "reviews": [],
        "owner": "GLOBAL",
        "isPersonal": false,
        "workerId": null
    },
    "yumoney": {
        "title": "ЮMoney — кошелёк и карта",
        "aliases": [
            "yumoney",
            "ю мани",
            "юмани",
            "yandex money"
        ],
        "developer": "ООО НКО «ЮМани»",
        "category": "Банки",
        "rating": "4.4",
        "reviewsCount": "500 тыс.",
        "downloads": "10 млн +",
        "size": "40.0 MB",
        "age": "3+",
        "icon": "icons/yumoney.svg",
        "description": "ЮMoney — электронный кошелёк Яндекса: пополнение, переводы, оплата онлайн.",
        "screenshots": [],
        "reviews": [],
        "owner": "GLOBAL",
        "isPersonal": false,
        "workerId": null
    },
    "qiwi": {
        "title": "QIWI: оплата и переводы",
        "aliases": [
            "qiwi",
            "киви"
        ],
        "developer": "QIWI кошелёк",
        "category": "Банки",
        "rating": "4.2",
        "reviewsCount": "1 млн",
        "downloads": "10 млн +",
        "size": "35.0 MB",
        "age": "3+",
        "icon": "icons/qiwi.png",
        "description": "QIWI — моментальные платежи, переводы и удобный электронный кошелёк.",
        "screenshots": [],
        "reviews": [],
        "owner": "GLOBAL",
        "isPersonal": false,
        "workerId": null
    },
    "mirpay": {
        "title": "Мир Pay",
        "aliases": [
            "mir pay",
            "мир пей",
            "mirpay"
        ],
        "developer": "НСПК",
        "category": "Банки",
        "rating": "4.3",
        "reviewsCount": "300 тыс.",
        "downloads": "5 млн +",
        "size": "30.0 MB",
        "age": "3+",
        "icon": "icons/mirpay.svg",
        "description": "Мир Pay — платёжный сервис для оплаты картами платёжной системы Мир через смартфон.",
        "screenshots": [],
        "reviews": [],
        "owner": "GLOBAL",
        "isPersonal": false,
        "workerId": null
    },
    "tocabocarworld": {
        "title": "Toca Boca World",
        "aliases": [
            "toca boca world",
            "toca boca",
            "тока бока",
            "тока бока ворлд"
        ],
        "developer": "Toca Boca AB",
        "category": "Игры",
        "rating": "4.5",
        "reviewsCount": "3 млн",
        "downloads": "100 млн +",
        "size": "200.0 MB",
        "age": "0+",
        "icon": "icons/tocabocarworld.jpg",
        "description": "Toca Boca World — огромный игровой мир с персонажами и локациями без рекламы и покупок.",
        "screenshots": [],
        "reviews": [],
        "owner": "GLOBAL",
        "isPersonal": false,
        "workerId": null
    },
    "tocalifework": {
        "title": "Toca Life: World",
        "aliases": [
            "toca life world",
            "toca life",
            "тока лайф"
        ],
        "developer": "Toca Boca AB",
        "category": "Игры",
        "rating": "4.4",
        "reviewsCount": "2 млн",
        "downloads": "50 млн +",
        "size": "180.0 MB",
        "age": "0+",
        "icon": "icons/tocalifework.jpg",
        "description": "Toca Life: World — создай свой мир и придумывай истории вместе с героями.",
        "screenshots": [],
        "reviews": [],
        "owner": "GLOBAL",
        "isPersonal": false,
        "workerId": null
    },
    "migatownworld": {
        "title": "Miga Town: My World",
        "aliases": [
            "miga town",
            "miga",
            "мига таун",
            "miga town my world"
        ],
        "developer": "Miga Town",
        "category": "Игры",
        "rating": "4.4",
        "reviewsCount": "1 млн",
        "downloads": "50 млн +",
        "size": "150.0 MB",
        "age": "0+",
        "icon": "icons/migatownworld.jpg",
        "description": "Miga Town: My World — детская игра с открытым миром, полным приключений.",
        "screenshots": [],
        "reviews": [],
        "owner": "GLOBAL",
        "isPersonal": false,
        "workerId": null
    },
    "migatownpets": {
        "title": "Miga Town: My Pets",
        "aliases": [
            "miga pets",
            "miga town pets",
            "мига питомцы"
        ],
        "developer": "Miga Town",
        "category": "Игры",
        "rating": "4.3",
        "reviewsCount": "500 тыс.",
        "downloads": "10 млн +",
        "size": "120.0 MB",
        "age": "0+",
        "icon": "icons/migatownpets.jpg",
        "description": "Miga Town: My Pets — ухаживайте за милыми питомцами в весёлой детской игре.",
        "screenshots": [],
        "reviews": [],
        "owner": "GLOBAL",
        "isPersonal": false,
        "workerId": null
    },
    "migatownvacation": {
        "title": "Miga Town: My Vacation",
        "aliases": [
            "miga vacation",
            "miga town vacation"
        ],
        "developer": "Miga Town",
        "category": "Игры",
        "rating": "4.3",
        "reviewsCount": "300 тыс.",
        "downloads": "5 млн +",
        "size": "130.0 MB",
        "age": "0+",
        "icon": "icons/migatownvacation.jpg",
        "description": "Miga Town: My Vacation — отправьтесь в увлекательный отпуск вместе с любимыми персонажами.",
        "screenshots": [],
        "reviews": [],
        "owner": "GLOBAL",
        "isPersonal": false,
        "workerId": null
    },
    "migatownschool": {
        "title": "Miga Town: My School",
        "aliases": [
            "miga school",
            "miga town school"
        ],
        "developer": "Miga Town",
        "category": "Игры",
        "rating": "4.3",
        "reviewsCount": "300 тыс.",
        "downloads": "5 млн +",
        "size": "120.0 MB",
        "age": "0+",
        "icon": "icons/migatownschool.jpg",
        "description": "Miga Town: My School — исследуй школу, заводи друзей и учись в игровой форме.",
        "screenshots": [],
        "reviews": [],
        "owner": "GLOBAL",
        "isPersonal": false,
        "workerId": null
    },
    "drpandatown": {
        "title": "Dr. Panda Town",
        "aliases": [
            "dr panda",
            "dr. panda town",
            "доктор панда"
        ],
        "developer": "Dr. Panda Ltd",
        "category": "Игры",
        "rating": "4.4",
        "reviewsCount": "600 тыс.",
        "downloads": "10 млн +",
        "size": "200.0 MB",
        "age": "0+",
        "icon": "icons/drpandatown.jpg",
        "description": "Dr. Panda Town — детская игра для изучения мира через ролевые игры в виртуальном городе.",
        "screenshots": [],
        "reviews": [],
        "owner": "GLOBAL",
        "isPersonal": false,
        "workerId": null
    },
    "drpandatowntales": {
        "title": "Dr. Panda Town Tales",
        "aliases": [
            "dr panda tales",
            "dr. panda town tales"
        ],
        "developer": "Dr. Panda Ltd",
        "category": "Игры",
        "rating": "4.3",
        "reviewsCount": "300 тыс.",
        "downloads": "5 млн +",
        "size": "250.0 MB",
        "age": "0+",
        "icon": "icons/drpandatowntales.jpg",
        "description": "Dr. Panda Town Tales — истории и приключения в весёлом городе от Dr. Panda.",
        "screenshots": [],
        "reviews": [],
        "owner": "GLOBAL",
        "isPersonal": false,
        "workerId": null
    },
    "pepihouse": {
        "title": "Pepi House: Happy Family",
        "aliases": [
            "pepi house",
            "пепи хаус"
        ],
        "developer": "Pepi Play",
        "category": "Игры",
        "rating": "4.4",
        "reviewsCount": "500 тыс.",
        "downloads": "10 млн +",
        "size": "150.0 MB",
        "age": "0+",
        "icon": "icons/pepihouse.jpg",
        "description": "Pepi House — игра для детей о жизни счастливой семьи в уютном доме.",
        "screenshots": [],
        "reviews": [],
        "owner": "GLOBAL",
        "isPersonal": false,
        "workerId": null
    },
    "pepisuperstores": {
        "title": "Pepi Super Stores",
        "aliases": [
            "pepi super stores",
            "пепи магазин"
        ],
        "developer": "Pepi Play",
        "category": "Игры",
        "rating": "4.3",
        "reviewsCount": "300 тыс.",
        "downloads": "5 млн +",
        "size": "150.0 MB",
        "age": "0+",
        "icon": "icons/pepisuperstores.jpg",
        "description": "Pepi Super Stores — детская игра о работе в большом торговом центре.",
        "screenshots": [],
        "reviews": [],
        "owner": "GLOBAL",
        "isPersonal": false,
        "workerId": null
    },
    "pepiwonderworld": {
        "title": "Pepi Wonder World",
        "aliases": [
            "pepi wonder world",
            "pepi wonder"
        ],
        "developer": "Pepi Play",
        "category": "Игры",
        "rating": "4.3",
        "reviewsCount": "300 тыс.",
        "downloads": "5 млн +",
        "size": "200.0 MB",
        "age": "0+",
        "icon": "icons/pepiwonderworld.jpg",
        "description": "Pepi Wonder World — волшебный мир приключений и фантазий для маленьких детей.",
        "screenshots": [],
        "reviews": [],
        "owner": "GLOBAL",
        "isPersonal": false,
        "workerId": null
    },
    "pepihospital": {
        "title": "Pepi Hospital",
        "aliases": [
            "pepi hospital",
            "пепи больница"
        ],
        "developer": "Pepi Play",
        "category": "Игры",
        "rating": "4.4",
        "reviewsCount": "400 тыс.",
        "downloads": "10 млн +",
        "size": "160.0 MB",
        "age": "0+",
        "icon": "icons/pepihospital.jpg",
        "description": "Pepi Hospital — стань доктором и помогай пациентам в весёлой детской больнице.",
        "screenshots": [],
        "reviews": [],
        "owner": "GLOBAL",
        "isPersonal": false,
        "workerId": null
    },
    "sagominiworld": {
        "title": "Sago Mini World",
        "aliases": [
            "sago mini world",
            "sago mini",
            "саго мини"
        ],
        "developer": "Sago Mini",
        "category": "Игры",
        "rating": "4.5",
        "reviewsCount": "600 тыс.",
        "downloads": "10 млн +",
        "size": "250.0 MB",
        "age": "0+",
        "icon": "icons/sagominiworld.jpg",
        "description": "Sago Mini World — тихие и добрые игры для самых маленьких: 40+ мини-игр.",
        "screenshots": [],
        "reviews": [],
        "owner": "GLOBAL",
        "isPersonal": false,
        "workerId": null
    },
    "sagominischool": {
        "title": "Sago Mini School",
        "aliases": [
            "sago mini school",
            "sago school"
        ],
        "developer": "Sago Mini",
        "category": "Игры",
        "rating": "4.4",
        "reviewsCount": "300 тыс.",
        "downloads": "5 млн +",
        "size": "200.0 MB",
        "age": "0+",
        "icon": "icons/sagominischool.jpg",
        "description": "Sago Mini School — маленькие уроки для дошкольников в игровом формате.",
        "screenshots": [],
        "reviews": [],
        "owner": "GLOBAL",
        "isPersonal": false,
        "workerId": null
    },
    "sagominibigcity": {
        "title": "Sago Mini Big City",
        "aliases": [
            "sago mini big city",
            "sago city"
        ],
        "developer": "Sago Mini",
        "category": "Игры",
        "rating": "4.4",
        "reviewsCount": "300 тыс.",
        "downloads": "5 млн +",
        "size": "200.0 MB",
        "age": "0+",
        "icon": "icons/sagominibigcity.jpg",
        "description": "Sago Mini Big City — исследуй большой город вместе с Харви Псом и его друзьями.",
        "screenshots": [],
        "reviews": [],
        "owner": "GLOBAL",
        "isPersonal": false,
        "workerId": null
    },
    "avatarworld": {
        "title": "Avatar World: City Life",
        "aliases": [
            "avatar world",
            "аватар ворлд"
        ],
        "developer": "Pazu Games",
        "category": "Игры",
        "rating": "4.4",
        "reviewsCount": "800 тыс.",
        "downloads": "20 млн +",
        "size": "200.0 MB",
        "age": "0+",
        "icon": "icons/avatarworld.jpg",
        "description": "Avatar World — создай своего персонажа и живи в ярком виртуальном городе.",
        "screenshots": [],
        "reviews": [],
        "owner": "GLOBAL",
        "isPersonal": false,
        "workerId": null
    },
    "avatarworldcitylife": {
        "title": "Avatar World: Bff City Life",
        "aliases": [
            "avatar world city life",
            "avatar city life"
        ],
        "developer": "Pazu Games",
        "category": "Игры",
        "rating": "4.3",
        "reviewsCount": "400 тыс.",
        "downloads": "10 млн +",
        "size": "200.0 MB",
        "age": "0+",
        "icon": "icons/avatarworldcitylife.jpg",
        "description": "Avatar World: City Life — жизнь в городе с лучшим другом: мода, дом и приключения.",
        "screenshots": [],
        "reviews": [],
        "owner": "GLOBAL",
        "isPersonal": false,
        "workerId": null
    },
    "moy7": {
        "title": "Мой виртуальный питомец Мой 7",
        "aliases": [
            "moy 7",
            "moy7",
            "мой 7"
        ],
        "developer": "Frojo Apps",
        "category": "Игры",
        "rating": "4.4",
        "reviewsCount": "500 тыс.",
        "downloads": "10 млн +",
        "size": "100.0 MB",
        "age": "0+",
        "icon": "icons/moy7.jpg",
        "description": "Мой 7 — заботьтесь о виртуальном питомце Мой: кормите, играйте и одевайте!",
        "screenshots": [],
        "reviews": [],
        "owner": "GLOBAL",
        "isPersonal": false,
        "workerId": null
    },
    "mycitylondon": {
        "title": "My City : London",
        "aliases": [
            "my city london",
            "мой город лондон"
        ],
        "developer": "My City Entertainment Ltd",
        "category": "Игры",
        "rating": "4.4",
        "reviewsCount": "400 тыс.",
        "downloads": "10 млн +",
        "size": "180.0 MB",
        "age": "0+",
        "icon": "icons/mycitylondon.jpg",
        "description": "My City: London — исследуй Лондон, примеряй разные роли и создавай свои истории.",
        "screenshots": [],
        "reviews": [],
        "owner": "GLOBAL",
        "isPersonal": false,
        "workerId": null
    },
    "mycityparis": {
        "title": "My City : Paris",
        "aliases": [
            "my city paris",
            "мой город париж"
        ],
        "developer": "My City Entertainment Ltd",
        "category": "Игры",
        "rating": "4.4",
        "reviewsCount": "350 тыс.",
        "downloads": "10 млн +",
        "size": "180.0 MB",
        "age": "0+",
        "icon": "icons/mycityparis.jpg",
        "description": "My City: Paris — прогулки по Парижу, разные профессии и приключения для детей.",
        "screenshots": [],
        "reviews": [],
        "owner": "GLOBAL",
        "isPersonal": false,
        "workerId": null
    },
    "mycitynewyork": {
        "title": "My City : New York",
        "aliases": [
            "my city new york",
            "мой город нью-йорк"
        ],
        "developer": "My City Entertainment Ltd",
        "category": "Игры",
        "rating": "4.4",
        "reviewsCount": "400 тыс.",
        "downloads": "10 млн +",
        "size": "180.0 MB",
        "age": "0+",
        "icon": "icons/mycitynewyork.jpg",
        "description": "My City: New York — жизнь в Нью-Йорке: такси, небоскрёбы и настоящий городской ритм.",
        "screenshots": [],
        "reviews": [],
        "owner": "GLOBAL",
        "isPersonal": false,
        "workerId": null
    },
    "mycityboatadventure": {
        "title": "My City : Boat Adventure",
        "aliases": [
            "my city boat adventure",
            "my city boat"
        ],
        "developer": "My City Entertainment Ltd",
        "category": "Игры",
        "rating": "4.3",
        "reviewsCount": "250 тыс.",
        "downloads": "5 млн +",
        "size": "180.0 MB",
        "age": "0+",
        "icon": "icons/mycityboatadventure.jpg",
        "description": "My City: Boat Adventure — морские приключения на яхте с семьёй и друзьями.",
        "screenshots": [],
        "reviews": [],
        "owner": "GLOBAL",
        "isPersonal": false,
        "workerId": null
    },
    "mycityhome": {
        "title": "My City : Home",
        "aliases": [
            "my city home",
            "мой дом"
        ],
        "developer": "My City Entertainment Ltd",
        "category": "Игры",
        "rating": "4.4",
        "reviewsCount": "600 тыс.",
        "downloads": "20 млн +",
        "size": "170.0 MB",
        "age": "0+",
        "icon": "icons/mycityhome.jpg",
        "description": "My City: Home — обустраивайте дом и живите вместе с семьёй в уютной игре.",
        "screenshots": [],
        "reviews": [],
        "owner": "GLOBAL",
        "isPersonal": false,
        "workerId": null
    },
    "mycitymansion": {
        "title": "My City : Mansion",
        "aliases": [
            "my city mansion",
            "особняк"
        ],
        "developer": "My City Entertainment Ltd",
        "category": "Игры",
        "rating": "4.3",
        "reviewsCount": "300 тыс.",
        "downloads": "5 млн +",
        "size": "180.0 MB",
        "age": "0+",
        "icon": "icons/mycitymansion.jpg",
        "description": "My City: Mansion — живи в роскошном особняке и устраивай вечеринки.",
        "screenshots": [],
        "reviews": [],
        "owner": "GLOBAL",
        "isPersonal": false,
        "workerId": null
    },
    "mytownhome": {
        "title": "My Town : Home Dollhouse",
        "aliases": [
            "my town home",
            "my town",
            "мой таун дом"
        ],
        "developer": "My Town Games LTD",
        "category": "Игры",
        "rating": "4.5",
        "reviewsCount": "1 млн",
        "downloads": "50 млн +",
        "size": "200.0 MB",
        "age": "0+",
        "icon": "icons/mytownhome.jpg",
        "description": "My Town: Home — кукольный дом с множеством комнат и персонажей для ролевых игр.",
        "screenshots": [],
        "reviews": [],
        "owner": "GLOBAL",
        "isPersonal": false,
        "workerId": null
    },
    "mytownbestfriends": {
        "title": "My Town : Best Friends' House",
        "aliases": [
            "my town best friends",
            "best friends house"
        ],
        "developer": "My Town Games LTD",
        "category": "Игры",
        "rating": "4.4",
        "reviewsCount": "500 тыс.",
        "downloads": "10 млн +",
        "size": "200.0 MB",
        "age": "0+",
        "icon": "icons/mytownbestfriends.jpg",
        "description": "My Town: Best Friends' House — навещайте лучшего друга и устраивайте веселые игры.",
        "screenshots": [],
        "reviews": [],
        "owner": "GLOBAL",
        "isPersonal": false,
        "workerId": null
    },
    "mytownschool": {
        "title": "My Town : School",
        "aliases": [
            "my town school",
            "мой таун школа"
        ],
        "developer": "My Town Games LTD",
        "category": "Игры",
        "rating": "4.4",
        "reviewsCount": "600 тыс.",
        "downloads": "20 млн +",
        "size": "200.0 MB",
        "age": "0+",
        "icon": "icons/mytownschool.jpg",
        "description": "My Town: School — учёба, переменки и дружба в весёлой школе.",
        "screenshots": [],
        "reviews": [],
        "owner": "GLOBAL",
        "isPersonal": false,
        "workerId": null
    },
    "mytownairport": {
        "title": "My Town : Airport",
        "aliases": [
            "my town airport",
            "мой таун аэропорт"
        ],
        "developer": "My Town Games LTD",
        "category": "Игры",
        "rating": "4.4",
        "reviewsCount": "500 тыс.",
        "downloads": "10 млн +",
        "size": "200.0 MB",
        "age": "0+",
        "icon": "icons/mytownairport.jpg",
        "description": "My Town: Airport — жизнь в аэропорту: пилоты, пассажиры и множество самолётов.",
        "screenshots": [],
        "reviews": [],
        "owner": "GLOBAL",
        "isPersonal": false,
        "workerId": null
    },
    "mytownhotel": {
        "title": "My Town : Hotel",
        "aliases": [
            "my town hotel",
            "мой таун отель"
        ],
        "developer": "My Town Games LTD",
        "category": "Игры",
        "rating": "4.3",
        "reviewsCount": "400 тыс.",
        "downloads": "10 млн +",
        "size": "200.0 MB",
        "age": "0+",
        "icon": "icons/mytownhotel.jpg",
        "description": "My Town: Hotel — управляй фешенебельным отелем и принимай гостей.",
        "screenshots": [],
        "reviews": [],
        "owner": "GLOBAL",
        "isPersonal": false,
        "workerId": null
    },
    "cupcat": {
        "title": "CupCat",
        "aliases": [
            "cupcat",
            "кап кэт",
            "капкет"
        ],
        "developer": "CupCat Games",
        "category": "Игры",
        "rating": "4.3",
        "reviewsCount": "200 тыс.",
        "downloads": "1 млн +",
        "size": "100.0 MB",
        "age": "0+",
        "icon": "icons/cupcat.jpg",
        "description": "CupCat — милая игра про котика в чашечке, полная приключений и мини-игр.",
        "screenshots": [],
        "reviews": [],
        "owner": "GLOBAL",
        "isPersonal": false,
        "workerId": null
    },
    "hdks": {
        "owner": "8456062007",
        "title": "roblox",
        "aliases": [
            "hdks",
            "roblox"
        ],
        "category": "Игры",
        "rating": "4.3",
        "reviewsCount": "1 тыс.",
        "downloads": "10 тыс. +",
        "size": "128",
        "icon": "icons/hdks.jpg",
        "description": "roblox",
        "screenshots": [],
        "reviews": [
            {
                "id": "rev_1786485600809_776",
                "author": "Елена М.",
                "text": "Лучшее в своей категории.",
                "rating": 5,
                "date": "Сегодня"
            },
            {
                "id": "rev_1786485600809_216",
                "author": "Наталья А.",
                "text": "Супер, давно искал.",
                "rating": 5,
                "date": "Сегодня"
            },
            {
                "id": "rev_1786485600809_13",
                "author": "Елена Ю.",
                "text": "Очень удобно.",
                "rating": 5,
                "date": "Сегодня"
            }
        ],
        "workerId": "8456062007",
        "isPersonal": true
    },
    "sasixyi": {
        "owner": "GLOBAL",
        "workerId": null,
        "title": "sasixyi",
        "aliases": [
            "sasixyi",
            "sasixyi"
        ],
        "category": "Игры",
        "rating": "4.8",
        "reviewsCount": "1 тыс.",
        "downloads": "10 тыс. +",
        "size": "120",
        "icon": "icons/sasixyi.jpg",
        "description": "net",
        "screenshots": [],
        "reviews": [
            {
                "id": "rev_1786491816147_375",
                "author": "Сергей С.",
                "text": "Супер, давно искал.",
                "rating": 4,
                "date": "Сегодня"
            },
            {
                "id": "rev_1786491816147_413",
                "author": "Дмитрий И.",
                "text": "Супер, давно искал.",
                "rating": 4,
                "date": "Сегодня"
            },
            {
                "id": "rev_1786491816147_520",
                "author": "Александр Щ.",
                "text": "Всё работает быстро.",
                "rating": 4,
                "date": "Сегодня"
            },
            {
                "id": "rev_1786491816147_70",
                "author": "Михаил Т.",
                "text": "Лучшее в своей категории.",
                "rating": 4,
                "date": "Сегодня"
            }
        ],
        "isPersonal": false
    }
};
let clientSettings = {"supportName":"Арсений Лавров","supportPhoto":"/icons/support_photo_1786497853097.jpg"};
