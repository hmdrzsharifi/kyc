const Keycloak = require('keycloak-connect');
const sessionConfig = require('./session-config');  // Import session config
const path = require('path');

const keycloakConfig = path.resolve(__dirname, 'keycloak.json');
// تعریف تنظیمات Keycloak بدون نیاز به keycloak.json
const keycloak = new Keycloak({
    store: sessionConfig.memoryStore,

} , {
    realm: 'platform',  // نام realm شما
    clientId: 'test1',  // شناسه client شما
    clientSecret: '41xGHbhuUcl9ZbwiS8QqstiBjzkZ9jMj',  // رمز client شما
    authServerUrl: 'http://saramad.dev.modernisc.com:6060',// آدرس سرور Keycloak

});

module.exports = keycloak;