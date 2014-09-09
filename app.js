// depend
var express = require('express');
var busboy = require('connect-busboy');
var fs = require('fs');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');

// module
var log = require('./modules/log.js');

// routers
var routers = require('./modules/get-routers.js');

var passAuth = require('./modules/pass-auth.js');

exports.create = function(clusterID, envARG) {

    /**************************
     *
     *  配置
     *
     **************************/

    cluseterID = clusterID || 0;
    envARG = envARG || 0;


    // 配置
    var app = express();
    
    // 上传文件解析
    app.use(busboy());
    app.use(bodyParser());

    // cookie
    var cookieSecretString = fs.readFileSync('./config/cookie-secret', 'utf8');
    cookieSecretString = cookieSecretString.replace('\n', '');
    app.use(cookieParser(cookieSecretString));

    // log
    log.use(app);
    var logger = log.logger;
    logger.info('Create App at ', 'pid=' + clusterID, 'args=' + envARG);

    // 区分开发和生产环境
    // node service.js --dev //=> 开发环境
    var baseConfContent = fs.readFileSync(__dirname + '/config/baseConf.json');
    baseConfContent = JSON.parse(baseConfContent);

    var baseConf = {};
    if (envARG == '--dev') {
        app.set('env', 'development');

        // 静态资源: 由node处理
        baseConf = baseConfContent['development'];
        
        app.use('/statics', express.static(__dirname + '/statics'));
    } else {
        app.set('env', 'production');

        // 静态资源: 由nginx配置处理
        baseConf = baseConfContent['production'];
    }
    app.set('baseConf', baseConf);

    // html引擎
    app.engine('.html', require('ejs').__express);
    app.set('view engine', 'html'); 
    app.set('views', __dirname + '/views'); 


    // 校验
    /* cookie方法暂不用
    var cookie = req.param('cookie');
    console.log(req.signedCookies);
    res.cookie('test', '234', {
        signed: true
    });
    //redis.get(); 
    next();
    */
    app.all('*', passAuth);

    routers(app);


    
    return app;
};


