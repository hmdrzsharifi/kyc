// session-config.js
const session = require('express-session');

// ایجاد store در حافظه برای ذخیره‌سازی نشست‌ها
const memoryStore = new session.MemoryStore();

const sessionConfig = {
    secret: 'pdr@102030',  // رمز عبور برای session
    resave: false,  // جلوگیری از ذخیره دوباره نشست‌ها
    saveUninitialized: true,  // ذخیره نشست‌های غیرمجاز
    store: memoryStore  // استفاده از store حافظه برای ذخیره‌سازی نشست‌ها
};

module.exports = { memoryStore, sessionConfig };
