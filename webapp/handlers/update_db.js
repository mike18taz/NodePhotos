/**
 * Update DB - load directory files directly to MongoDB
 * Created by Downs on 7/19/2019.
 */
let Mongo = require('mongodb').MongoClient;
var async = require('async'),
    Server = require('mongodb').Server,
    path = require("path"),
    fs = require('fs'),
    os = require('os'),
    local = require("../local.config.js");
        //local = require("../config/env/local-development");


//let murl = local.config.db.uri;
//let database = local.config.db.database;
//var ps = local.config.db.poolSize
 //   ? local.config.db_config.poolSize : 5;


    
var database = local.config.db_config.database
    ? local.config.db_config.database: 'PhotoAlbums';
var host = local.config.db_config.host
    ? local.config.db_config.host : 'localhost';
var port = local.config.db_config.port
    ? local.config.db_config.port
    : 27017;
var ps = local.config.db_config.poolSize
    ? local.config.db_config.poolSize : 5;



//Setup directory information
//var appDir = path.dirname(require.main.filename) + "\\";
//appDir = appDir.substring(0,appDir.length - 7);
//console.log(appDir);

var user_dir = os.userInfo().username;
//console.log("Username: " + user_dir);

var c_dir = "C:/";
//var album_name = "spotlight";
//var albums_dir = "RegisServer/NodeSite/webstatic/albums/";
var appDir = local.config.static_content;
var albums_dir = appDir + "albums/";
//var album_dir = ""; //spotlight/userDATE/

exports.update_db = function (album_dir, album_needed, ready_to_update) {

    if (ready_to_update) {
        console.log("updating db");
        get_pics(c_dir, album_dir, album_needed);
        console.log("db updated");
    }

};



//Setup MongoDB connection

function link_files_to_db({ files: files}, album_needed, album_dir) {

    //var mongoclient = new Mongo(murl, {useNewUrlParser: true, autoReconnect: true, poolSize: ps});
    var mongoclient = new Mongo(new Server(host, port,
        {auto_reconnect: true, poolSize: ps}), {useNewUrlParser: true});

    mongoclient.connect(function (err) { // , mongoClient
        var db = mongoclient.db(database);
        if (err) {
            console.error(err);
            return
        } else {
            if (files.length > 0) {

                db.collection("photos").insertMany(files, {upsert: true}, function (err, result) {
                    if (err) {
                        console.error(err);
                        return
                    } else {
                        console.log("success");
                    }
                    if (result == 1) {

                        console.log(result);
                    }
                    //assert.strictEqual(null, err);
                    //assert.strictEqual(1, result);

                });
            }

            if (album_needed) {
                db.collection("albums").insertOne({name: album_dir, date: new Date()}, function (err, res) {
                    if (err) throw err;
                    console.log("Album: " + album_dir + " added.");
                });
            }

            console.log("closing db");
            mongoclient.close();

        }
    });
}


function get_pics(c_dir, album_dir, album_needed) {
    var directory = albums_dir + album_dir; // excluded c_dir
    var src ="";
    var dest = "";

    load_pics(directory, album_dir,(err, files) => {
        if (err) {
            callback({ error: "file_error11: loading",
                message: JSON.stringify(err) });
            return;
        }
        if (files.length > 0) {
            link_files_to_db({ files: files }, album_needed, album_dir);
        }

        //send_success(res, { files: files, countf: countf });
    });
}




function load_pics(directory, album_dir, callback) {
    // For now, all directory in 'albums' subfolder is an album.
    fs.readdir(directory, (err, files) => {
        if (err) {
            callback({ error: "file_error1",
                message: JSON.stringify(err) });
            return;
        }

        var only_dirs = [];
        var only_files = [];
        var count_dirs = 0;
        var count_files = 0;
        files.sort();

        async.forEach(files, (element, cb) => {
            fs.stat(directory + "/" + element, (err, stats) => {
                        if (err) {
                            cb({ error: "file_error2",
                                message: JSON.stringify(err) });
                            return;
                        }
                if (stats.isDirectory()) {
                    var d_index = 0;
                    var directory_name = directory + element;
                    //console.log(directory_name);
                    fs.readdirSync(directory_name + "/").forEach(function (file) {
                        var statts;
                        statts = fs.statSync(directory_name + "/" + file);

                        if (statts.isFile()) {
                            var date_created = statts.birthtime;
                            //console.log(element);

                            var ext = path.extname(file);
                            var descript = file.replace(ext,"");

                            only_files.push({
                                filename: file, description: descript, index: count_files,
                                albumname: element, date: date_created
                            });

                            console.log(only_files[count_files]);
                            count_files++;
                        }
                    });

                    } else {
                    //only_dirs.push({dirname: element});
                    //console.log(only_dirs[count_dirs]);
                    count_dirs++;
                    var date_created = stats.birthtime;
                    //console.log(element);

                    var ext = path.extname(element);
                    var descript = element.replace(ext,"");

                    only_files.push({
                        filename: element, description: descript, index: count_files,
                        albumname: album_dir, date: date_created
                    });

                    console.log(only_files[count_files]);
                    count_files++;
                    }
                    //path.basename(path.dirname(directory))
                    cb(null, only_files);
                    }
                );
            },
            (err) => {
                //callback(err, err ? null : only_files.sort());
                callback(err, only_files.sort());
            });
    });
}