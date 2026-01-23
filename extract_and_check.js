const fs = require('fs');
const vm = require('vm');
const path = require('path');

const htmlFile = path.join(__dirname, 'admin.html');
const htmlContent = fs.readFileSync(htmlFile, 'utf8');

// Regex to extract script content
const scriptRegex = /<script>([\s\S]*?)<\/script>/gi;
let match;
let index = 0;

console.log(`Checking syntax for scripts in ${htmlFile}...`);

while ((match = scriptRegex.exec(htmlContent)) !== null) {
    index++;
    const scriptContent = match[1];
    const scriptFile = path.join(__dirname, `debug_script_${index}.js`);

    // Write to file for potential manual inspection
    fs.writeFileSync(scriptFile, scriptContent);

    try {
        // Try to compile the script to check for syntax errors
        new vm.Script(scriptContent);
        console.log(`✅ Script #${index} is valid.`);
    } catch (error) {
        console.error(`❌ Script #${index} has a SYNTAX ERROR!`);
        console.error(error.message);

        // Try to find the line number in the original HTML file
        // This is an approximation
        const linesBefore = htmlContent.substring(0, match.index).split('\n').length;
        // Error stack usually gives line/col in the extracted snippet
        // We'd need to parse the stack to get line number in snippet and add to linesBefore

        // Simple approach: log the line in the snippet
        const errorLine = parseInt(error.stack.split(':')[0].split('evalmachine.<anonymous>:')[1]) || 0;
        console.error(`   Error at snippet line: ${errorLine}`);
        console.error(`   Approximate HTML line: ${linesBefore + errorLine}`);
    }
}
