/**
 * Created by Downs on 4/19/2019.
 */

var async = require('async'),
    bcrypt = require('bcryptjs'),
    db = require("../data/db.js"),
    uuid = require('uuid'),
    backhelp = require("./backend_helpers.js");


exports.version = "0.1.0";

exports.user_by_uuid = function (uuid, callback) {
    if (!uuid)
        callback(backhelp.missing_data("uuid"));
    else
        user_by_field("user_uuid", uuid, callback);
};

exports.user_by_display_name = function (dn, callback) {
    if (!dn)
        callback(backhelp.missing_data("display_name"));
    else
        user_by_field("display_name", dn, callback);
};

exports.user_by_username = function (username, callback) {
    if (!username)
        callback(backhelp.missing_data("username"));
    else
        user_by_field("username", username, callback);
};


exports.register = function (username, display_name, password, callback) {
    async.waterfall([
            // validate ze params
            function (cb) {
                if (!username)
                    cb(backhelp.missing_data("username"));
                else if (!display_name)
                    cb(backhelp.missing_data("display_name"));
                else if (!password)
                    cb(backhelp.missing_data("password"));
                else
                // generate a password hash
                    bcrypt.hash(password, 10, cb);
            },

            // create the user in mongo.
            function (hash, cb) {
                var userid = uuid();
                // username must be unique, so use it as id
                var write = {
                    //_id: _id,
                    uuid: userid,
                    username: username,
                    display_name: display_name,
                    password: hash,
                    first_seen_date: now_in_s(),
                    last_modified_date: now_in_s(),
                    deleted: false
                };
                db.users.insertOne(write, { w: 1, safe: true }, cb);
            },

            // fetch and return the new user.
            function (results, cb) {
                cb(null, results[0]);
            }
        ],
        function (err, user_data) {
            if (err) {
                if (err instanceof Error && err.code == 11000)
                    callback(backhelp.user_already_registered());
                else
                    callback (err);
            } else {
                callback(null, user_data);
            }
        });
};



function user_by_field (field, value, callback) {
    var o = {};
    o[field] = value;
//db.albums.find...
    db.users.find( o ).toArray(function (err, results) {
        if (err) {
            callback(err);
            return;
        }
        if (results.length == 0) {
            db.users.find( o ).toArray();
            callback(null, null);
        } else if (results.length == 1) {
            callback(null, results[0]);
        } else {
            console.error("More than one user matching field: " + value);
            console.error(results);
            callback(backutils.db_error());
        }
    });
}


function now_in_s() {
    return Math.round((new Date()).getTime() / 1000);
}
