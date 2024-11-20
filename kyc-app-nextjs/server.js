const fs = require('fs');
const https = require('https');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// تنظیمات SSL
const httpsOptions = {
    key: fs.readFileSync('./server.key'), // مسیر فایل کلید
    cert: fs.readFileSync('./server.crt'), // مسیر فایل گواهی
};

app.prepare().then(() => {
    // ایجاد سرور HTTPS
    https.createServer(httpsOptions, (req, res) => {
        handle(req, res);
    }).listen(3000, (err) => {
        if (err) throw err;
        console.log('> Ready on https://localhost:3000');
    });
});
