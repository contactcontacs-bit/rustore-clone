const fs = require('fs');
const vm = require('vm');

let content = fs.readFileSync('data.js', 'utf8');
let match = content.match(/const appsData = (\{[\s\S]*?\});\s*$/);
if (match) {
    let objText = match[1];
    const sandbox = {};
    vm.createContext(sandbox);
    vm.runInContext(`var appsData = ${objText};`, sandbox);
    
    fs.writeFileSync('data.json', JSON.stringify(sandbox.appsData, null, 2));
    console.log("Successfully extracted to data.json");
} else {
    console.log("Could not find appsData");
}
