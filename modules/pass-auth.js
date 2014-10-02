var PasswordEncoder = require('./passwordencoder.js');
var redis = require('./redis.js');
var mysqlController = require('./mysql-controller.js').controller;
var util = require('util');

// password Controller
var passwordEncoder = new PasswordEncoder();

var responseData = require('./response-data.js').create();

var logger = require('./log.js').logger;

var paramsChecker = require('./params-checker.js').create();

paramsChecker.params([
    { key: 'user_symbol', required: true },
    { key: 'password',    required: true }
])

module.exports = function(req, res, next) {
    var path = req.path;

    // TODO: 打log user、ip、method

    if (path === '/newUserAction' ||
        path === '/postTest') 
    {
        next();
        return;
    }

    var params = paramsChecker.check(req, res);
    if (params === undefined) return;

    // 验证
    var userSymbol = params['user_symbol'];
    var password = params['password'];

    redis.hget('users', userSymbol, function(err, data) {
        if (err) {
            res.send(responseData.make(1));
            return;
        }
        password = passwordEncoder.decrypt(password);

        if (data) {
            if (data === password) {
                next();
            } else {
                res.send(responseData.make(4));
            }
            return;
        }
        
        // redis里没有信息 去mysql里找
        var sqlSentence = util.format('SELECT password FROM users WHERE user_symbol="%s"', userSymbol);
        mysqlController._conn.query(sqlSentence, function(err, data) {
            
            if (err || data.length === 0) {
                res.send(responseData.make(1));
                return;
            }

            var temPassword = passwordEncoder.addSaltAndUseMD5(password);

            if (temPassword === data[0].password) {
                redis.hset('users', userSymbol, password, function() {});
                next();
            } else {
                res.send(responseData.make(4));
                return;
            }

        });

    });
};
