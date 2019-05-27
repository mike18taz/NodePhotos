/**
 * Created by Downs on 4/19/2019.
 */
let mongo = require('mongodb').MongoClient;
var async = require('async'),
    local = require("../local.config.js");

var database = local.config.db_config.database
    ? local.config.db_config.database: 'PhotoAlbums';
var host = local.config.db_config.host
    ? local.config.db_config.host : 'localhost';
var port = local.config.db_config.port
    ? local.config.db_config.port
    : 27017;
var ps = local.config.db_config.poolSize
    ? local.config.db_config.poolSize : 5;

//Setup MongoDB connection

let murl = "mongodb://" + host + ":" + port;
/*
init(function (err, results) {
    if (err) {
        console.error("** FATAL ERROR ON STARTUP: ");
        console.error(err);
        process.exit(-1);
    }
console.log("Connected successfully to server");
*/

let db;

exports.init = function (callback) {
//function init(callback) {

    // 1. open database connection
    mongo.connect(murl, {"useNewUrlParser": true}, (err, client) => {
        if (err) {
            console.error(err);
            return
        }
        db = client.db(database, callback);
        console.log("** 1. open db server...");
    });
};

function init_db() {
    mongo.connect(murl, { "useNewUrlParser": true }, (err, client) => {
        if (err) {
            console.error(err);
            return
        }
        db = client.db(database);
        console.log("** 1. open db server...");
    });
    //return !!db;
}


function get_db_albums() {
        if (init_db()) {
            return db.collection("albums")
        }
}

function get_db_photos() {
        if (init_db()) {
            return db.collection("photos")
        }
}

function get_db_users() {
    if (init_db()) {
        return db.collection("users")
    }
}

exports.all_db = JSON.parse(JSON.stringify([get_db_albums(),get_db_photos(),get_db_users()]));

//exports.albums = get_db_albums();
//exports.photos = get_db_photos();
//exports.users = get_db_users();

/*
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

                callback(null, cb);
                //
            },
        ], console.log("Function Ran"), callback, function (error, success) {
            if (error) { alert('Something is wrong!'); }
            return alert(success + 'Done!');
        });
        //client.close();
    });
};



*/
