var fs = require('fs');
var crypto = require('crypto');

// 读取md5盐等密码配置
var tokenAndSalt = fs.readFileSync(__dirname + '/../config/tokenandsalt.json');
tokenAndSalt = JSON.parse(tokenAndSalt);

// class
var PasswordEncoder = function(config) {
    this.setConfig(config);
};

PasswordEncoder.prototype = {
    constructor: PasswordEncoder,
    setConfig: function(config) {
        this.config = config || tokenAndSalt;
        this.config.aeskey = new Buffer(this.config.aeskey, 'hex');
        this.config.aesiv = new Buffer(this.config.aesiv, 'hex');
    },
    // 根据token生成随机字符片段
    // num: 字符片段长度
    /*
    getRandomCharWithNumber: function(num) {
        var dict = this.config.dict;
        var dictLength = dict.length;
        var randomChar = '';
        var idx;
        while(num--) {
            idx = ~~(Math.random() * dictLength);
            randomChar += dict.charAt(idx);
        }
        return randomChar;
    },
    */
    // 生成随机密码
    getRandomPassword: function() {
        // 密码可用字符
        var pwBaseString = this.config.pwBaseString;
        var pwBaseStringLength = pwBaseString.length;

        // 密码最小长度
        var pwMinLength = this.config.pwMinLength;
        
        var temPassword = '';
        for (var i = 0; i < pwMinLength; i++) {
            temPassword += pwBaseString.charAt(~~(Math.random() * pwBaseStringLength));
        }
        return temPassword;
    },

    encrypt: function(password) {
        var cipher = crypto.createCipheriv('aes-256-cbc', this.config.aeskey, this.config.aesiv);
        var crypted = cipher.update(password,'utf8','base64');
        crypted += cipher.final('base64');
        return crypted;
    },

    decrypt: function(password) {
        var decipher = crypto.createDecipheriv('aes-256-cbc', this.config.aeskey, this.config.aesiv);
        var dec = decipher.update(password,'base64','utf8');
        dec += decipher.final('utf8');
        return dec;
    },
    /*
    // 按照token插入随机字符
    encode: function(password) {
        var token = this.config.token.split(',');
        password = password.trim();

        var startPosition;
        var endPosition;
        var randomChar;

        for (var i = 0, len = token.length; i < len;) {
            startPosition = token[i++];
            endPosition = token[i++];
            password = password.split('');
            randomChar = this.getRandomCharWithNumber(endPosition - startPosition + 1);
            password.splice(startPosition, 0, randomChar);
            password = password.join('');
        }
        return password;
    },
    // 按照token删除随机字符
    decode: function(password) {
        var startPosition;
        var endPosition;
        var token = this.config.token.split(',');
        password = password.split('');
        for (var i = token.length - 1; i >= 0; ) {
            endPosition = token[i--];
            startPosition = token[i--];
            password.splice(startPosition, endPosition - startPosition + 1);
        }
        return password.join('');
    },
    */
    // 加盐 -> MD5
    // 密码入库
    // 登录校验
    addSaltAndUseMD5: function(password) {
        password = this.config.saltPrefix + password + this.config.saltSuffix;
        password = new Buffer(password, 'utf8');
        return crypto.createHash('md5').update(password).digest('hex');
    }
};

module.exports = PasswordEncoder;

