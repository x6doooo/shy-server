var fs = require('fs');
var baseData = fs.readFileSync(__dirname + '/../config/codes.json', 'utf8');
baseData = JSON.parse(baseData);

var Handler = function() {
    this.baseData = baseData;
};

Handler.prototype.extend = function(data) {
    var base = this.baseData;
    var e = {};
    var key;
    for (key in base) {
        e[key] = base[key];
    }
    for (key in data) {
        e[key] = data[key];
    }
    this.baseData = e;
};

Handler.prototype.make = function(code, data, extendData) {
    var self = this;
    var info = {
        code: code,
        desc: self.baseData[code]
    };
    if (extendData) {
        for (var key in extendData) {
            info[key] = extendData[key];
        }
    }
    if (data) {
        info.data = data;
    }
    return info;
};

exports.create = function() {
    return new Handler();
};



