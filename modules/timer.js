/*  
 *  1、
 *  Timer(new Date())
 *  2、
 *  t = Timer(new Date())
 *  Timer(t);
 *  3、
 *  Timer('2012-01-01')
 */

var Timer = function(date) {
    return new Timer.prototype.init(date);
};

Timer.prototype = {
    constructor: Timer,
    init: function(date) {
        var type = Object.prototype.toString.call(date);
        if (date instanceof Timer) {
            return date;
        }
        if (type == '[object Date]') {
            this.initDate(date);
        } else if (type == '[object String]') {
            this.parse(date);
        }
        return this;
    },
    date: function() {
        return new Date(this._date + this._offset);
    },
    initDate: function(date) {
        this._offset = -date.getTimezoneOffset() * 60 * 1000;
        this._date = date.getTime() - this._offset;
    },
    parse: function(str) {
        
        //  2014-07-21 13:32:24.012 GMT+0800
        //  2014-07-21 13:32:24
        //  2014-07-21
        var tem;
        if (/(\d+-\d+-\d+)/.test(str)) {
            tem = RegExp.$1.split('-');
        } else {
            throw new Error('TIME解析失败');
            return;
        }

        if (/(\d+:\d+:\d+)/.test(str)) {
            tem = tem.concat(RegExp.$1.split(':'));
        } else {
            tem = tem.concat([0, 0, 0]);
        }

        if (/\.(\d+)/.test(str)) {
            tem.push(RegExp.$1);
        } else {
            tem.push(0);
        }
        
        var tz;
        if (/GMT((\+\d+)|(\-\d+))/.test(str)) {
            tz = RegExp.$1;
        }
        tem[1]--;

        var t = Date.UTC.apply(null, tem);
        t = new Date(t);
        this.initDate(t);

        if (tz) {
            this.timezone(tz);
        }
        this._date -= this._offset;

        return this;
    },
    // tz:
    // 800  => 东8区
    // 0    => 世界时
    // -700 => 西7区
    timezone: function(tz) {
        if (tz !== undefined) {
            return this._setTZ(tz);
        }
        return this._offset2tz();
    },
    _offset2tz: function() {
        var src_t = this._offset / 60 / 1000;
        var t = Math.abs(src_t);
        h = ~~(t / 60);
        m = t - h * 60;
        h < 10 && (h = '0' + h);
        m < 10 && (m = '0' + m);
        if (src_t >= 0) {
            return '+' + h + m;
        } else {
            return '-' + h + m;
        }
    },
    _setTZ: function(tz) {
        this._tz = tz;
        var h = ~~(tz / 100);
        var m = tz - h * 100;
        tz = (h * 3600 + m * 60) * 1000;
        this._offset = tz;
        return this;
    },
    toString: function(fmt, tz) {
        var self = this;
        var oldTZ = self.timezone();
        self.timezone(tz);
        var date = self.date();//new Date(self._date + self._offset);
        fmt = fmt || 'yyyy-MM-dd hh:mm:ss.S';
        if (/(y+)/.test(fmt)) {
            var fullYear = date.getFullYear();
            fmt = fmt.replace(RegExp.$1, (fullYear + "").substr(4 - RegExp.$1.length));
        }
        if (/(Z)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, 'GMT' + self._offset2tz());
        }
        if (/(A)/.test(fmt)) {
            var op = Timer.noon[1];
            if (date.getHours() < 13) {
                op = Timer.noon[0];
            }
            fmt = fmt.replace(RegExp.$1, op);
        }
        if (/(DAY)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, Timer.week[date.getDay()]);
        }
        if (/(MONTH)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, Timer.month[date.getMonth()]);
        }
            
        var k, v;
        var o = {
            'M+': date.getMonth() + 1,
            'd+': date.getDate(),
            'H+': date.getHours(),
            'h+': (function() {
                var t = date.getHours();
                if(t > 12) {
                    t -= 12;
                }
                return t;
            })(),
            'm+': date.getMinutes(),
            's+': date.getSeconds(),
            'q+': Math.floor((date.getMonth() + 3) / 3),
            'S': date.getMilliseconds() 
        };
        for (k in o) {
            v = o[k];
            if (new RegExp("(" + k + ")").test(fmt)) {
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? v : (("00" + v).substr(("" + v).length)));
            }
        }
        self.timezone(oldTZ);
        return fmt;
    },
    add: function(pos, num) {
        var oldTZ = this.timezone();
        var t = this.date();
        var ms = {
            'y': 'FullYear',
            'M': 'Month',
            'd': 'Date',
            'h': 'Hours',
            'H': 'Hours',
            'm': 'Minutes',
            's': 'Seconds',
            'S': 'Milliseconds'
        };
        var m = ms[pos];
        var get = 'get' + m;
        var set = 'set' + m;
        var value = t[get]() + num;
        t[set](value);
        this.initDate(t);
        this.timezone(oldTZ);
        return this;
    }
};
Timer.prototype.init.prototype = Timer.prototype;

// Class Methods
// return ms
Timer.offset = function(from, to) {
    if (!(from instanceof Timer)) {
        from = Timer(from);
    }
    if (!(to instanceof Timer)) {
        to = Timer(to);
    }
    return to._date - from._date;
};

// 获取当前的世界时时间戳
Timer.timestamp = function(needUTC) {
    var t = new Date();
    if (needUTC) {
        return t.getTime() + t.getTimezoneOffset() * 60 * 1000;
    }
    return +t;
};


module.exports = Timer;


