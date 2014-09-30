var routers = {
    newUserAction: {
        // path: '/apis/testpath'   => 如果和key相同，可以不写
        method: 'post'
    },
    /**/
    signupAction: {
        method: 'post'
    },
    newPostAction: {
        method: 'post'
    },
    uploadPostImageAction: {
        method: 'post'
    },
    postListAction: {
        method: 'post'
    },
};

module.exports = function(app) {
    var func;
    var path;
    var method;
    var tem;
    var cb;
    for (var key in routers) {
        tem = routers[key];
        path = tem.path || '/' + key;
        method = tem.method || 'get';
        cb = (function(key) {
            return function(req, res, next) {
                require('../routers/' + key + '.js')(req, res, next);
            };
        })(key);
        app[method](path, cb);
    }
};


