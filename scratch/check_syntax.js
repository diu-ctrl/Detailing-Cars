const fs = require('fs');
const path = require('path');

try {
  const adminHtml = fs.readFileSync(path.join(__dirname, '..', 'admin.html'), 'utf8');
  const scriptRegex = /<script>([\s\S]*?)<\/script>/gi;
  let match;
  let count = 0;
  while ((match = scriptRegex.exec(adminHtml)) !== null) {
    count++;
    const code = match[1];
    try {
      new Function(code);
      console.log(`Script block ${count} is syntactically valid.`);
    } catch (err) {
      console.error(`Syntax error in script block ${count}:`, err.message);
      process.exit(1);
    }
  }
  if (count === 0) {
    console.log("No script blocks found!");
  } else {
    console.log("All script blocks are syntactically valid.");
  }
} catch (err) {
  console.error("Error reading or parsing admin.html:", err);
  process.exit(1);
}
