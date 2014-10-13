/**
 *
 *  创建数据库 建表
 *
 */

var mysql = require('mysql');
var xmlParser = require('xml-parser');
var fs = require('fs');
var config = require('../modules/mysql-controller.js').config;

// 缓存数据库名
// 连接时尚无数据库 不能直接进入 so 先删除config里的数据库名
var database = config.database;
delete config.database;

var connection = mysql.createConnection(config);
connection.connect();

// 删库
connection.query('DROP DATABASE ' + database, function(err, databases, fields) {
    // 建库
    connection.query('CREATE DATABASE ' + database, function(err, info, fields) {
        
        connection.query('USE ' + database, function() {
            // 读取预设的建表语句
            var xmlContent = fs.readFileSync(__dirname + '/../config/sqls.xml', 'utf8');
            xmlContent = xmlParser(xmlContent);
            
            // 循环建表
            xmlContent.root.children.forEach(function(v, i, a) {
                connection.query(v.content, function(err) {
                    if (err) {
                        console.log('---------');
                        console.log(v.content);
                        console.log(err);
                    } else {
                        console.log('ok');
                    }
                });
            });
        });

    });
});


