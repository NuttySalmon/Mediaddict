var config = { };
//mongo link config
//config.mongoUri = 'mongodb://user1:team10@ds257579.mlab.com:57579/rtr';
config.mongoUri = "mongodb://localhost/mediaddict";

//cookie age
config.cookieMaxAge = 30 * 24 * 3600 * 1000;

module.exports = config;
