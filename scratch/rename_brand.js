const fs = require('fs');

// 1. Update index.html
let indexContent = fs.readFileSync('index.html', 'utf8');

// Replace brand names
indexContent = indexContent.replace(/DC Detailing/g, 'DC');
indexContent = indexContent.replace(/Detailing Logo/g, 'Logo');

// Replace contact details
indexContent = indexContent.replace(/\+91 98765 43210/g, '+91 99797 87087');
indexContent = indexContent.replace(/\+919876543210/g, '+919979787087');
indexContent = indexContent.replace(/919876543210/g, '919979787087');
indexContent = indexContent.replace(/9876543210/g, '9979787087');
indexContent = indexContent.replace(/hello@dcdetailing\.in/g, 'divyarajc2@gmail.com');

// Replace WhatsApp Link
// First replace the wa.me/qr link
indexContent = indexContent.replace(/https:\/\/wa\.me\/919979787087/g, 'https://wa.me/qr/KQJFSZ2WY5FSO1');
indexContent = indexContent.replace(/https:\/\/wa\.me\/qr\/KQJFSZ2WY5FSO1/g, 'https://wa.me/qr/KQJFSZ2WY5FSO1');

// Replace social links in footer brand block
// <a href="#" class="social-link" aria-label="Instagram">
indexContent = indexContent.replace(
  /<a href="#" class="social-link" aria-label="Instagram">/g,
  '<a href="https://www.instagram.com/divyraj.33" class="social-link" target="_blank" aria-label="Instagram">'
);
// <a href="#" class="social-link" aria-label="Facebook">
indexContent = indexContent.replace(
  /<a href="#" class="social-link" aria-label="Facebook">/g,
  '<a href="https://www.instagram.com/divyraj.33" class="social-link" target="_blank" aria-label="Facebook">'
);
// <a href="#" class="social-link" aria-label="Google">
indexContent = indexContent.replace(
  /<a href="#" class="social-link" aria-label="Google">/g,
  '<a href="https://www.instagram.com/divyraj.33" class="social-link" target="_blank" aria-label="Google">'
);
// Replace WhatsApp footer link: <a href="https://wa.me/919876543210" class="social-link" aria-label="WhatsApp">
// Since phone was replaced to 919979787087:
indexContent = indexContent.replace(
  /href="https:\/\/wa\.me\/919979787087" class="social-link"/g,
  'href="https://wa.me/qr/KQJFSZ2WY5FSO1" class="social-link" target="_blank"'
);
indexContent = indexContent.replace(
  /href="https:\/\/wa\.me\/919876543210" class="social-link"/g,
  'href="https://wa.me/qr/KQJFSZ2WY5FSO1" class="social-link" target="_blank"'
);

// WhatsApp Us link in Contact Us column:
indexContent = indexContent.replace(
  /<li><a href="https:\/\/wa\.me\/919979787087">/g,
  '<li><a href="https://wa.me/qr/KQJFSZ2WY5FSO1" target="_blank">'
);
indexContent = indexContent.replace(
  /<li><a href="https:\/\/wa\.me\/919876543210">/g,
  '<li><a href="https://wa.me/qr/KQJFSZ2WY5FSO1" target="_blank">'
);

// Let's add fullform (Detailing Cars) to tagline
indexContent = indexContent.replace(
  /<p class="footer-tagline">DC — /g,
  '<p class="footer-tagline">DC (Detailing Cars) — '
);

fs.writeFileSync('index.html', indexContent, 'utf8');
console.log('index.html updated successfully.');

// 2. Update script.js
if (fs.existsSync('script.js')) {
  let jsContent = fs.readFileSync('script.js', 'utf8');
  jsContent = jsContent.replace(/DC Detailing/g, 'DC');
  fs.writeFileSync('script.js', jsContent, 'utf8');
  console.log('script.js updated successfully.');
}

// 3. Update admin.html
if (fs.existsSync('admin.html')) {
  let adminContent = fs.readFileSync('admin.html', 'utf8');
  adminContent = adminContent.replace(/DC Detailing/g, 'DC');
  adminContent = adminContent.replace(/Detailing Logo/g, 'Logo');
  adminContent = adminContent.replace(/hello@dcdetailing\.in/g, 'divyarajc2@gmail.com');
  adminContent = adminContent.replace(/\+91 98765 43210/g, '+91 99797 87087');
  fs.writeFileSync('admin.html', adminContent, 'utf8');
  console.log('admin.html updated successfully.');
}

// 4. Update style.css
if (fs.existsSync('style.css')) {
  let cssContent = fs.readFileSync('style.css', 'utf8');
  cssContent = cssContent.replace(/DC DETAILING/g, 'DC');
  fs.writeFileSync('style.css', cssContent, 'utf8');
  console.log('style.css updated successfully.');
}
