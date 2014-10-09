var mysql = require('../modules/mysql-controller.js');
var uniqID = require('../modules/uniqid.js');
var Timer = require('../modules/timer.js');
var PasswordEncoder = require('../modules/passwordencoder.js');
var logger = require('../modules/log.js').logger;
var redis = require('../modules/redis.js');

var mysqlController = mysql.controller;

// password编解码控制器
var passwordEncoder = new PasswordEncoder();

var responseData = require('../modules/response-data.js').create();

var app = process.expressApplicationInstance;
// 新用户
// 随机symbol
// 随机密码（4位数字）
// 返回给客户端

module.exports = function(req, res, next) {
    // 根据时间戳生成随机email
    var timestamp = Timer.timestamp(true);
    var symbol = uniqID.makeByKey('user_id') + '-' + process.pid + '-' + timestamp + '@' + app.get('baseConf').domain;
    
    // 随机密码
    var temPassword = passwordEncoder.getRandomPassword();

    // 随机密码求md5 入库
    var temPasswordUseMD5 = passwordEncoder.addSaltAndUseMD5(temPassword);

    var keys = ['user_symbol', 'password', 'time'];
    var values = [symbol, temPasswordUseMD5, timestamp];

    mysqlController.insert('users', keys, values, function(err, data) {
        // 报错
        if (err) {
            res.send(responseData.make(1));
            return;
        }
        
        // redis记录状态
        redis.hset('users', symbol, temPassword, function(err, code) {
            if (err) {
                logger.info(err);
            }
        });

        // 返回给客户端
        res.send(responseData.make(0, {
            uid: data.insertId,
            symbol: symbol,
            password: passwordEncoder.encrypt(temPassword)
        }));
    });
};


