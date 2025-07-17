const fs = require('fs');
const path = require('path');

export default function handler(req, res) {
  const html = fs.readFileSync(path.join(process.cwd(), 'dist', 'index.html'), 'utf8');
  res.setHeader('Content-Type', 'text/html');
  res.status(200).end(html);
} 