/**
 * Created by Downs on 7/19/2019.
 */

var helpers = require('./helpers.js'),
    user_data = require("../data/user.js"),
    async = require('async'),
    bcrypt = require('bcryptjs'),
    fs = require('fs');

exports.version = "0.1.0";


function User (user_data) {
    if (user_data != null) {
        this.uuid = user_data["uuid"];
        this.username = user_data["username"];
        this.display_name = user_data["display_name"];
        this.password = user_data["password"];
        this.first_seen_date = user_data["first_seen_date"];
        this.last_modified_date = user_data["last_modified_date"];
        this.deleted = user_data["deleted"];
    } else {
        console.log("User not Found. Try Again");
    }
}

User.prototype.uuid = null;
User.prototype.username = null;
User.prototype.display_name = null;
User.prototype.password = null;
User.prototype.first_seen_date = null;
User.prototype.last_modified_date = null;
User.prototype.deleted = false;
User.prototype.check_password = function (pw, callback) {
    bcrypt.compare(pw, this.password, callback);
};
User.prototype.response_obj = function () {
    return {
        uuid: this.uuid,
        username: this.username,
        display_name: this.display_name,
        first_seen_date: this.first_seen_date,
        last_modified_date: this.last_modified_date
    };
};



exports.register = function (req, res) {
    async.waterfall([
            function (cb) {
                var em = req.body.username;
                if (!em) //|| em.indexOf("@") == -1)
                    cb(helpers.invalid_username());
                else if (!req.body.display_name)
                    cb(helpers.missing_data("display_name"));
                else if (!req.body.password)
                    cb(helpers.missing_data("password"));
                else
                    cb(null);
            },

            // register da user.
            function (cb) {
                user_data.register(
                    req.body.username.toLowerCase(),
                    req.body.display_name,
                    req.body.password,
                    cb);
            },

            // mark user as logged in
            function (user_data, cb) {
                req.session.logged_in = true;
                req.session.logged_in_display_name = req.body.display_name;
                req.session.logged_in_date = new Date();
                cb(null, user_data);
            }
        ],
        function (err, user_data) {
            if (err) {
                helpers.send_failure(res, helpers.http_code_for_error(err), err);
            } else {
                var u = new User(user_data);
                helpers.send_success(res, {user: u.response_obj() });
            }
        });
};


exports.login = function (req, res) {
    var em = req.body.username
        ? req.body.username.trim().toLowerCase()
        : "";

    async.waterfall([
            function (cb) {
                if (!em)
                    cb(helpers.missing_data("username"));
                else if (req.session
                    && req.session.logged_in_username == em)
                    cb(helpers.error("already_logged_in", ""));
                else if (!req.body.password)
                    cb(helpers.missing_data("password"));
                else
                    cb(null);
            },

            // first get the user by the email address.
            function (cb) {
                user_data.user_by_username(em, cb);
            },

            // check the password
            function (user_data, cb) {
                var u = new User(user_data);
                u.check_password(req.body.password, cb);
            },

            function (auth_ok, cb) {
                if (!auth_ok) {
                    cb(helpers.auth_failed());
                    return;
                }

                req.session.logged_in = true;
                req.session.logged_in_username = req.body.username;
                req.session.logged_in_date = new Date();
                cb(null);
            }
        ],
        function (err, results) {
            if (!err || err.message == "already_logged_in") {
                helpers.send_success(res, { logged_in: true });
            } else {
                helpers.send_failure(res, helpers.http_code_for_error(err), err);
            }
        });
};

exports.logout = function (req, res) {
    req.session.logged_in = false;
    /*
    var em = req.body.username
        ? req.body.username.trim().toLowerCase()
        : "";

    async.waterfall([
            function (cb) {
                if (!em)
                    cb(helpers.missing_data("username"));
                else if (req.session
                    && req.session.logged_in_username == em)
                    cb(helpers.error("already_logged_in", ""));
                else if (!req.body.password)
                    cb(helpers.missing_data("password"));
                else
                    cb(null);
            },

            // first get the user by the email address.
            function (cb) {
                user_data.user_by_username(em, cb);
            },

            // check the password
            function (user_data, cb) {
                var u = new User(user_data);
                u.check_password(req.body.password, cb);
            },

            function (auth_ok, cb) {
                if (!auth_ok) {
                    cb(helpers.auth_failed());
                    return;
                }

                req.session.logged_in = true;
                req.session.logged_in_username = req.body.username;
                req.session.logged_in_date = new Date();
                cb(null);
            }
        ],
        function (err, results) {
            if (!err || err.message == "already_logged_in") {
                helpers.send_success(res, { logged_in: true });
            } else {
                helpers.send_failure(res, helpers.http_code_for_error(err), err);
            }
        });

     */
};

exports.user_by_display_name = function (req, res) {
    async.waterfall([
            // first get the user by the username.
            function (cb) {
                user_data.user_by_display_name(req.body.username, cb);
            }
        ],
        function (err, u) {
            if (!err) {
                helpers.send_success(res, { user: u.response_obj() });
            } else {
                helpers.send_failure(res, helpers.http_code_for_error(err), err);
            }
        });
};


exports.authenticate_API = function (un, pw, callback) {
    async.waterfall([
            function (cb) {
                user_data.user_by_username(un, cb);
            },

            function (user_data, cb) {
                var u = new User(user_data);
                u.check_password(pw, cb);
            }
        ],
        function (err, results) {
            if (!err) {
                callback(null, un);
            } else {
                callback(new Error("bogus credentials"));
            }
        });
};
