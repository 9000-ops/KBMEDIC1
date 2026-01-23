
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'admin.html');
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

console.log('Scanning for Arabic characters...');
let found = false;

lines.forEach((line, index) => {
    // Regex for Arabic range: 0600-06FF
    if (/[\u0600-\u06FF]/.test(line)) {
        console.log(`Line ${index + 1}: ${line.trim().substring(0, 100)}...`);
        found = true;
    }
});

if (!found) {
    console.log('No Arabic characters found!');
}
