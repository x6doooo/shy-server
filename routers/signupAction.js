var Validator = require('../modules/validator.js');
var mysql = require('../modules/mysql-controller.js');
var mysqlController = mysql.controller;
var PasswordEncoder = require('../modules/passwordencoder.js');
var responseData = require('../modules/response-data.js').create();
var redis = require('../modules/redis.js');
var ClassParamsChecker = require('../modules/params-checker.js');

var passwordEncoder = new PasswordEncoder();
var handler = {};

// 修改email
var emailParamsChecker = ClassParamsChecker.create();
emailParamsChecker.params([
    { key: 'newEmail', required: true },
    { key: 'email',    required: true },
    { key: 'password', required: true }
]);
handler.email = function(req, res, baseConf) {

    var params = emailParamsChecker.check(req, res);
    if (params === undefined) return;
    
    var newEmail = params['newEmail'];
    var email = params['email'];
    var password = params['password'];

    // 验证邮箱格式
    if (!Validator.isEmail(newEmail)) {
        res.send(responseData.make(5));
        return;
    }
    // 验证邮箱是否已存在
    mysqlController._conn.query('SELECT COUNT(*) FROM users WHERE email="' + newEmail + '"', 
        function(err, data, fields) {
            if (err) {
                res.send(responseData.make(1));
                return;
            }
            if (data[0]['COUNT(*)'] !== 0) {
                res.send(responseData.make(6));
                return;
            }
            mysqlController._conn.query('UPDATE users SET email="' + newEmail + '" WHERE email="' + email + '"', function(err, data) {
                if (err) {
                    res.send(responseData.make(1));
                    return;
                }
                redis.hdel('users', email);
                redis.hset('users', newEmail, passwordEncoder.decode(password));
                res.send(responseData.make(0)); 
            });
        });
};

// 修改密码 
var passwordParamsChecker = ClassParamsChecker.create();
passwordParamsChecker.params([
    { key: 'email',       required: true },
    { key: 'password',    required: true },
    { key: 'newPassword', required: true }
]);
handler.password = function(req, res, baseConf) {
    var params = passwordParamsChecker.check(req, res);
    if (params === undefined) return;
    var email = params['email'];
    var password = params['password'];
    var newPassword = params['newPassword'];

    password = passwordEncoder.decode(password);
    newPassword = passwordEncoder.decode(newPassword);

    // 验证新密码格式
    if (!Validator.checkPassword(newPassword)) {
        res.send(responseData.make(8));
        return;
    }

    if (password === newPassword) {
        res.send(responseData.make(9));
        return;
    }
    var newPasswordMD5 = passwordEncoder.addSaltAndUseMD5(newPassword);
    mysqlController._conn.query('UPDATE users SET password="' + newPasswordMD5 + '" WHERE email="' + email + '"', function(err, data) {
        if (err) {
            res.send(responseData.make(1));
            return;
        }
        redis.hdel('users', email);
        redis.hset('users', email, newPassword);
        res.send(responseData.make(0)); 
    });

};

module.exports = function(req, res, baseConf) {
    
    var type = req.param('type');  // email or password;
    handler[type](req, res, baseConf);

};

