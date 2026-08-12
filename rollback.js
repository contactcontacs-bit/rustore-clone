const fs = require('fs');

function fixHtml(file) {
    let c = fs.readFileSync(file, 'utf8');
    
    // Find the end of search.js
    let searchStr = '<script src="search.js?v=1002"></script>';
    let idx = c.indexOf(searchStr);
    
    if (idx !== -1) {
        c = c.substring(0, idx + searchStr.length);
        
        if (file === 'index.html') {
            c += '\n    <script src="marquee.js?v=1002"></script>\n    <script src="sidebar.js?v=1002"></script>\n</body>\n</html>\n';
        } else {
            c += '\n    <script src="sidebar.js?v=1002"></script>\n</body>\n</html>\n';
        }
        
        fs.writeFileSync(file, c);
        console.log(`Fixed ${file}`);
    } else {
        console.log(`Could not find search.js in ${file}`);
    }
}

fixHtml('index.html');
fixHtml('app.html');
