/**
 * Script to remove all Arabic translations from HTML files
 * Removes data-ar attributes and data-placeholder-ar attributes
 */

const fs = require('fs');
const path = require('path');

function cleanArabicAttributes(filePath) {
    console.log(`Processing: ${filePath}`);

    let content = fs.readFileSync(filePath, 'utf8');
    let originalLength = content.length;

    // Remove data-ar attributes
    content = content.replace(/\s+data-ar="[^"]*"/g, '');

    // Remove data-placeholder-ar attributes
    content = content.replace(/\s+data-placeholder-ar="[^"]*"/g, '');

    // Remove toggleLanguage function calls
    content = content.replace(/onclick="toggleLanguage\(\)"/g, '');

    fs.writeFileSync(filePath, content, 'utf8');

    let savedBytes = originalLength - content.length;
    console.log(`✓ Cleaned ${filePath}`);
    console.log(`  Removed ${savedBytes} bytes of Arabic content`);
}

// Clean index.html
cleanArabicAttributes(path.join(__dirname, 'index.html'));

// Clean admin.html if it exists
const adminPath = path.join(__dirname, 'admin.html');
if (fs.existsSync(adminPath)) {
    cleanArabicAttributes(adminPath);
}

console.log('\n✓ All files cleaned successfully!');
console.log('The site is now French-only.');
