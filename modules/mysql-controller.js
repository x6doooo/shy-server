var mysql = require('mysql');
var util = require('util');
var fs = require('fs');

var config = JSON.parse(fs.readFileSync(__dirname + '/../config/mysql-config.json'));

var MySQLController = function(newConfs) {
    this._config = config = newConfs || config;
    this._conn = mysql.createConnection(config);
};

MySQLController.prototype = {
    constructor: MySQLController,
    insert: function(table, keys, values, cb) {
        var valuesString = '';
        for (var i = 0, len = values.length; i < len; i++) {
            tem = values[i];
            if (typeof tem == 'string') {
                values[i] = '"' + tem + '"';
            } else  if (tem === undefined) {
                values[i] = 'NULL';
            }
        }
        keys = keys.join(',');
        values = values.join(',');
        var sqlContent = util.format('INSERT INTO %s (%s) VALUES (%s)', table, keys, values);
        this._conn.query(sqlContent, cb);
    },
    select: function(table, keys, options, cb) {
        var sqlContent = util.format('SELECT %s FROM %s %s', keys, tables, options);
        this._conn.query(sqlContent, cb);
    }
};

exports.controller = new MySQLController;
exports.config = config;

