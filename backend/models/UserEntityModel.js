const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize('postgres://admin:admin@saramad.dev.modernisc.com:5432/userdb'); // آدرس دیتابیس را تنظیم کنید
//
// const UserEntity = sequelize.define('UserEntity', {
//     id: {
//         type: DataTypes.STRING,
//         primaryKey: true,
//         autoIncrement: true,
//         allowNull: false,
//     },
//     // apps: {
//     //     type: DataTypes.STRING, // نوع ستون را مطابق نیاز تغییر دهید
//     //     allowNull: true,       // اگر این ستون می‌تواند خالی باشد، `true` تنظیم کنید
//     // },
//     email: {
//         type: DataTypes.STRING,
//         allowNull: false,
//     },
//     firstname: {
//         type: DataTypes.STRING,
//         allowNull: false,
//     },
//     lastname: {
//         type: DataTypes.STRING,
//         allowNull: false,
//     },
//     password: {
//         type: DataTypes.STRING,
//         allowNull: false,
//     },
//     username: {
//         type: DataTypes.STRING,
//         allowNull: false,
//         unique: true, // یکتا بودن مقدار
//     },
// }, {
//     tableName: 'userentity', // نام جدول در دیتابیس
//     timestamps: false,       // اگر جدول شما ستون‌های createdAt و updatedAt ندارد
// });
//
// module.exports = UserEntity;
const UserEntity = sequelize.define('UserEntity', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
    },
    email_verified: {
        type: DataTypes.BOOLEAN, // مطابق نیاز تغییر دهید (true/false)
        allowNull: true, // اگر می‌تواند خالی باشد
    },
    createdtimestamp: {
        type: DataTypes.BIGINT, // مناسب برای نگهداری زمان به صورت عدد بزرگ
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    firstname: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    lastname: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    password_hash: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true, // مقدار یکتا
    },
}, {
    tableName: 'users', // نام جدول در پایگاه داده
    timestamps: false,  // اگر جدول شما ستون‌های createdAt و updatedAt ندارد
});

module.exports = UserEntity;
