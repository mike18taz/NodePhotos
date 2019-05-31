var
    async = require('async'),
    path = require("path"),
    fs = require('fs'),
    os = require('os'); // Change ; to , here and uncomment next 4 lines for future development
    // http = require('http'),
    // url = require('url'),
    // qs = require('querystring'),
    // formidable = require('formidable');

var user_dir = os.userInfo().username;
console.log("Username: " + user_dir);
//var album_data = require("../data/album.js");
local = require("../config/env/local-development");

var create_album = false;

var today = new Date();
var date_added = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
//var appDir = path.dirname(require.main.filename) + "\\";
var appDir = local.config.static_content;
// var current_directory = appDir + "albums/spotlight/" + user_dir + date_added + "/";
var album_directory = user_dir + date_added;
//appDir = appDir.replace(/\\/g,"/").replace("app","static");
//var current_win_directory = appDir + "albums/" + album_directory;
var current_directory = appDir + "albums/" + album_directory;


function setup_dir(){

//appDir = appDir.substring(0,appDir.length - 7);
//console.log(appDir);


    var c_dir = "C:/Users/";

    var spotlight_dir = "/AppData/Local/Packages/Microsoft.Windows.ContentDeliveryManager_cw5n1h2txyewy/LocalState/Assets";

    return c_dir + user_dir + spotlight_dir;
}

//var user_spotlight_dir = c_dir + user_dir + spotlight_dir;

exports.get_spotlight_pics = function () {

    //var current_directory = appDir + "albums/spotlight/" + user_dir + date_added + "/";
    //if (album_data.create_album(req.body, cb)) {
    if (make_directory(current_directory)) {
        console.log("getting pics");
        get_pics(setup_dir());
    } else {
        console.log("Action already completed!");
    }


    //add_to_db(album_directory, create_album);
};

function add_to_db(album_dir, album_needed) {
    udb = require('./update_db.js');
    console.log("adding to db");
    udb.update_db(album_dir, album_needed, true);

}

function get_pics(directory) {
    //var directory = c_dir + user_dir + spotlight_dir;
    var src ="";
    var dest = "";

    load_pics(directory,(err, status) => { // , files, countf
        if (err) {
            console.log("failure: " + JSON.stringify(err));
            return;
        } else if (status) {
            add_to_db(album_directory, create_album);
        }

        //copy_files({ files: files, countf: countf });
        //send_success(res, { files: files, countf: countf });
    });
}

function copy_file(src, file_index, date_created, file_size) {

    var dest = current_directory + "/" + date_created + "_" + (file_size/1000).toFixed(0) + "_" + file_index + ".jpg";
    //dest = "/RegisServer/NodeSite/albums/spotlight/file" + file_index + ".jpg";


    fs.copyFile(src, dest, (err) => {
        if (err) {
            callback({ error: "file_error0",
                message: JSON.stringify(err) });
            return;
        }

    });

}

function make_new_directory(directory, callback) {
    fs.stat(directory, function(err, stats) {
        //Check if error defined and the error code is "not exists"
        if (err && err.errno === 34) {
            //Create the directory, call the callback.
            fs.mkdir(directory, callback);
        } else {
            //just in case there was a different error:
            callback(err)
        }
    });
}

function make_directory(directory) {
    if (fs.existsSync(directory)) {
        console.log("directory already exists: " + directory);
        return false;
    } else {
        try {
            fs.mkdirSync(directory);

            create_album = true;
            return true;
        } catch(e) {
            console.log("could not make new directory: " + directory);
            return false;
        }
    }
    /*
    try {
        var directory_made = fs.statSync(directory + "/");
        console.log("directory already exists: " + directory);
    } catch(e) {
        try {
            fs.mkdirSync(directory);
            create_album = true;
        } catch(e) {
            console.log("could not make new directory: " + directory);
        }

    }

     */
}

//var album_name = "/RegisServer/NodeSite/albums/" + album_data.newalbumname;
//fs.mkdir(album_name,(err) => {
 //   if (err) throw err;
//});

function copy_files(file_data) {
    files = file_data.files;
    forEach(files);

    src = files;
    dest = "";
    fs.copyFile(src, dest, (err) => {

    });

    fs.rename(src, dest, function (err) {
        if (err) throw err;

        // Create temporary page to describe action and redirect user.
        res.write('<a href="/pages/home">Home Page</a>');
        res.write('<br>File uploaded and moved!<br>Return to home.');
        res.end();



    });
}




function send_success(res, data) {
    res.writeHead(200, {"Content-Type": "application/json"});
    var output = { error: null, data: data };
    res.end(JSON.stringify(output) + "\n");
}


function load_pics(directory, callback) {
    // For now, all directory in 'albums' subfolder is an album.
    var status = false;
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
        var files_index = 0;

        async.forEach(files, (element, cb) => {
            //element = element + ".jpg";
            fs.stat(directory + "/" + element, (err, stats) => {
                        if (err) {
                            cb({ error: "file_error2",
                                message: JSON.stringify(err) });
                            return;
                        }
                        files_index++;
                    if (files_index === files.length && files_index > 0) {
                        status = true;
                    }
                        if (stats.isFile() && stats.size > 150000) {

                            var birth_time = stats.birthtime;
                            var date_created = birth_time.getFullYear() + birth_time.toLocaleString('en-us',
                                {month: 'short'}) + birth_time.getDate();

                            var file_name = element;
                            console.log(file_name);

                            only_files.push({ filename: file_name });
                            console.log(only_files[count_files]);

                            /*
                            var album = new Album(album_data);
                            req.body.filename = files.photo_file.name; //.photo_file;
                            req.body.albumname = fields.albumname;
                            req.body.description = fields.description;
                            req.body.date = fields.date;
                            var default_path = "/" + album.name;
                            //var this_path = req.files.
                            console.log("Name: " + files.photo_file.name + " file: " + JSON.stringify(files.photo_file.path));
                        
                            album.add_photo(req.body, files.photo_file.path, cb);
                            */


                            copy_file(directory + "/" + file_name, count_files, date_created, stats.size);

                            count_files++;

                            only_files.push({ name: element, index: count_files });

                        } else {
                            //only_dirs.push({ dirname: element});
                            //console.log(only_dirs[count_dirs]);
                            //count_dirs++;

                        }

                        cb(null);
                    }
                );
                if (files_index === files.length && files_index > 0) {
                    status = true;
                }

            },

            (err) => {
                callback(err, status); //, err ? null : only_files.sort(), count_files);
        });
        //add_to_db(album_directory, create_album);
    });
}