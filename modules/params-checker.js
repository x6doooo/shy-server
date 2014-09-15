/**
 *
 * 检查request请求中的参数
 *
 * Usage:
 *
 *  var paramsChecker = require('./params-checker.js').create();
 *  
 *  //设置需要检查的访问参数
 *  paramsChecker.params({
 *      {
 *          key: 'user_id', //=> 参数名
 *          require: true   //=> 是否必须含有此参数
 *      },
 *      ...
 *  });
 *
 *  //检查
 *  app.post('/index', function(req, res) {
 *  
 *      // 检查失败 返回错误信息
 *      // 检查成功，将参数构成json存入params变量
 *      var params = paramsChecker.check(req, res);
 *
 *  });
 *
 *
 */

var Checker = function() {};

Checker.prototype.params = function(paramsConfigObject) {
    this.config = paramsConfigObject;
};

Checker.prototype.check = function(req, res) {
    var config = this.config;

    var currentConfigParam;
    var currentConfigParamKey;
    var value;

    var returnParams = {};

    for (var i = 0, len = config.length; i < len; i++) {
        currentConfigParam = config[i];
        currentConfigParamKey = currentConfigParam.key;
        value = req.param(currentConfigParamKey);
        if (value === undefined && currentConfigParam.required) {
            res.send({
                code: 7,
                desc: 'need ' + currentConfigParamKey
            });
            return;
        }
        returnParams[currentConfigParamKey] = value;
    }
    return returnParams;
};

exports.create = function() {
    return new Checker;
};


