/**
 * Created by Downs on 7/19/2019.
 */
let mongo = require('mongodb').MongoClient;
var async = require('async'),
    local = require("../local.config.js");
    //local = require("../config/env/local-development"); //this for cosmodb
    
//var database = local.config.db.database; //this for cosmodb

//
var database = local.config.db_config.database
    ? local.config.db_config.database: 'PhotoAlbums';
var host = local.config.db_config.host
    ? local.config.db_config.host : 'localhost';
var port = local.config.db_config.port
    ? local.config.db_config.port
    : 27017;
var ps = local.config.db_config.poolSize
    ? local.config.db_config.poolSize : 5;
//

exports.albums = null;
exports.photos = null;
exports.users = null;

//Setup MongoDB connection

let murl = "mongodb://" + host + ":" + port;
//let murl = local.config.db.uri; //this for cosmodb
/*
init(function (err, results) {
    if (err) {
        console.error("** FATAL ERROR ON STARTUP: ");
        console.error(err);
        process.exit(-1);
    }
console.log("Connected successfully to server");
*/

exports.init = function (callback) {
//function init(callback) {

    // 1. open database connection

    mongo.connect(murl, { "useNewUrlParser": true }, (err, client) => {
        if (err) {
            console.error(err);
            return
        }
        let db = client.db(database);
        console.log("** 1. open MongoDB server...");
        //console.log("** 1. open Cosmos DB server...");

        async.waterfall([

            // 2. create collections for our albums and photos. if
            //    they already exist, then we're good.
            function (cb) {
                console.log("** 2. create albums and photos collections.");
                var collect0 = db.collection("albums", cb);
                //collect0.insertOne({status:'initiated'});
            },

            function (albums_coll, cb) {

                console.log("** 3. export albums collection." + albums_coll);
                exports.albums = albums_coll;
                var collect1 = db.collection("photos", cb);
                //collect1.insertOne({status:'initiated'});
            },

            function (photos_coll, cb) {
                console.log("** 4. export photos collection." + photos_coll);
                exports.photos = photos_coll;
                var collect2 = db.collection("users", cb);
                //collect2.insertOne({status:'initiated'});
            },

            function (users_coll, cb) {
                exports.users = users_coll;

                console.log("** 5. export users collection." + users_coll);
                var clear = db.collection("users", cb);
                //callback(users_coll, cb);
                callback(null, cb);
                //
            },
/*
            function (nothing, cb) {
                //exports.users = users_coll;
                var nothing = [1];
                //console.log("** 5. export users collection." + users_coll);

                //callback(users_coll, cb);
                callback(null, cb);
                //
            },

 */




        ], console.log("Function Ran"), callback, function (error, success) { //callback = cb
            if (error) { alert('Something is wrong!'); }
            return alert(success + 'Done!');
        });
        //client.close();
    });
};



