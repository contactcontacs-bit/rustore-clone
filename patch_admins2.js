const fs = require('fs');
let code = fs.readFileSync('bot.js', 'utf8');

const replacements = [
    'manage_admins', 'add_admin', 'remove_admin', 'my_private_mirrors', 'add_private_mirror'
];

for (const action of replacements) {
    const regex = new RegExp(`(bot\\.action\\(['"]${action}['"], \\(ctx\\) => \\{\\s*)if \\(!admins\\.includes\\(ctx\\.chat\\.id\\.toString\\(\\)\\)\\) return;`);
    code = code.replace(regex, `$1if (ctx.chat.id.toString() !== admins[0]) return;`);
}

fs.writeFileSync('bot.js', code, 'utf8');
console.log('Patched');
