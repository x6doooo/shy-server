var App = require('./app.js');
var cluster = require('cluster');

var env = process.argv[process.argv.length - 1];

var numCPUs = require('os').cpus().length;

// 开发环境只起两个进程
if (env == '--dev') {
    numCPUs = 2;
}

if (cluster.isMaster) {

    for (var i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', function(worker, code, signal) {
        console.log('worker ' + worker.process.pid + ' died');
        cluster.fork();
    });

} else {

    var service = App.create(process.pid, env);
    service.listen(1337, '127.0.0.1');
    console.log('service start listen http://127.0.0.1:1337');

}


