const fs = require('fs');

function patchHtml(file) {
    let html = fs.readFileSync(file, 'utf8');
    
    const workerFilterCode = `
    const urlParams = new URLSearchParams(window.location.search);
    const workerId = urlParams.get('worker');
    
    let filteredAppsData = {};
    for(let k in appsData) {
        if(!appsData[k].workerId || appsData[k].workerId == workerId) {
            filteredAppsData[k] = appsData[k];
        }
    }
    const originalAppsData = appsData;
    appsData = filteredAppsData; // Override for rendering
    `;
    
    if(!html.includes('filteredAppsData')) {
        // Insert right after settings.js load or data.js load
        html = html.replace(/<script src="data\.js\?v=\d+"><\/script>/, `$&
        <script>
        ${workerFilterCode}
        </script>`);
        fs.writeFileSync(file, html, 'utf8');
        console.log('Patched ' + file);
    }
}
patchHtml('app.html');
patchHtml('index.html');
