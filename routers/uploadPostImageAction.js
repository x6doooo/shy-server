var fs = require('fs');
var Timer = require('../modules/timer.js');
var responseData = require('../modules/response-data.js').create();
var uniqID = require('../modules/uniqid.js');
var pc = require('../modules/params-checker.js').create();

// color-thief还没安装依赖
//var ColorThief = require('../modules/color-thief.js');

var crypto = require('crypto');
pc.params([
    { key: 'email',    required: true },
    { key: 'password', required: true }
]);

module.exports = function(req, res, baseConf) {
    
    var params = pc.check(req, res);
    if (params === undefined) return;

    var fstream;
    var t;
    var fileTypeName;
    req.pipe(req.busboy);
    req.busboy.on('file', function (fieldname, file, filename) {
        
        fileTypeName = '.' + filename.split('.')[1];
        t = Timer.timestamp(true);
        filename = new Buffer(filename + params.email + t, 'utf8');
        filename = crypto.createHash('md5').update(filename).digest('hex');

        filename = uniqID.makeByKey('image') + '-' + filename + '-' + t + fileTypeName;

        logger.info("Uploading: " + filename);
        fstream = fs.createWriteStream(__dirname + '/statics/upload/' + filename);
        file.pipe(fstream);
        fstream.on('close', function () {    
            logger.info("Upload Finished of " + filename);              
            
            //TODO: 结束之后 用color-thief处理文件名 加上色值
            res.send(responseData.make(0));
        });
        fstream.on('error', function() {
            res.send(responseData.make(11));
        });
    });
};


