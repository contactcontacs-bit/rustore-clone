const fs = require('fs');

let c = fs.readFileSync('bot.js', 'utf8');

// Update initial settings schema
c = c.replace(/globalSettings = { tgLink: 'https:\/\/t\.me\/lizaa_hrr', videoLink: '' };/, 
"globalSettings = { tgLink: 'https://t.me/lizaa_hrr', hasVideo: false };");

// Update settings menu text
c = c.replace(/\n🎥 Ссылка на видео-инструкцию: \${globalSettings.videoLink \|\| 'Не задано'}/, 
"\\n🎥 Видео-инструкция: ${globalSettings.hasVideo ? 'Загружена ✅' : 'Не загружена ❌'}");

c = c.replace(/\n🎥 Видео-инструкция: \${globalSettings\.videoLink \|\| 'Не задано'}/, 
"\\n🎥 Видео-инструкция: ${globalSettings.hasVideo ? 'Загружена ✅' : 'Не загружена ❌'}");

// Change callback data
c = c.replace(/edit_setting_videoLink/g, 'upload_video');

// Handle upload_video action
const videoUploadAction = `
bot.action('upload_video', (ctx) => {
    userState[ctx.chat.id] = { step: 'upload_video' };
    ctx.reply('🎥 Отправьте видео-файл для инструкции (желательно в формате MP4):', { reply_markup: { inline_keyboard: [[{ text: '❌ Отмена', callback_data: 'settings' }]] } });
    ctx.answerCbQuery().catch(()=>{});
});
`;
c = c.replace("bot.action(/^edit_setting_(.+)$/,", videoUploadAction + "\nbot.action(/^edit_setting_(.+)$/,");


// Add video handler
const videoHandler = `
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
`;

c = c.replace("bot.on('photo', async (ctx) => {", videoHandler + "\nbot.on('photo', async (ctx) => {");

fs.writeFileSync('bot.js', c);
console.log('Added video upload functionality to bot.js');
