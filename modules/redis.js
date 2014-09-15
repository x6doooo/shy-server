var redis = require('redis');
var fs = require('fs');

var config = fs.readFileSync(__dirname + '/../config/redis-config.json');
config = JSON.parse(config);

var client = redis.createClient(config.port, config.addr, config.option);

module.exports = client;


