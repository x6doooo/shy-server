var Validator = function() {};

Validator.isEmail = function(email) {
    return /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(email);
};

Validator.checkPassword = function(password) {
    return /^[A-Za-z0-9]{4,}$/.test(password);
};

module.exports = Validator;

