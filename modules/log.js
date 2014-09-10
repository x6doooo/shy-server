var log4js = require('log4js');
log4js.configure({
	appenders: [{
        type: 'console'
    },{
		type: "dateFile",
		filename: 'logs/log.log',
		pattern: "_yyyy-MM-dd",
		alwaysIncludePattern: true,
		category: 'normal'
	}],
	replaceConsole: true,
	levels: {
		dateFileLog: 'INFO'
	}
});

var dateFileLog = log4js.getLogger('normal');

exports.logger = dateFileLog;

exports.use = function(app) {
	app.use(log4js.connectLogger(dateFileLog, {
		level: 'auto',
		format: ':method :url'
	}));
}
