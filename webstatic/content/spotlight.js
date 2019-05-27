
/*
var
    async = require('async'),
    path = require("path"),
    fs = require('fs'),
    os = require('os'); // Change ; to , here and uncomment next 4 lines for future development
    // http = require('http'),
    // url = require('url'),
    // qs = require('querystring'),
    // formidable = require('formidable');

var appDir = path.dirname(require.main.filename) + "\\";
//appDir = appDir.substring(0,appDir.length - 7);
//console.log(appDir);

var user_dir = os.userInfo().username;
console.log("Username: " + user_dir);

var c_dir = "C:/Users/";

var spotlight_dir = "/AppData/Local/Packages/Microsoft.Windows.ContentDeliveryManager_cw5n1h2txyewy/LocalState/Assets";
//var user_spotlight_dir = c_dir + user_dir + spotlight_dir;

exports.get_spotlight_pics = function () {
    get_pics(c_dir, user_dir, spotlight_dir);
};



function get_pics(c_dir, user_dir, spotlight_dir) {
    var directory = c_dir + user_dir + spotlight_dir;
    var src ="";
    var dest = "";

    load_pics(directory,(err) => { // , files, countf
        if (err) {
            console.log("failure: " + JSON.stringify(err));
            return;
        }

        //copy_files({ files: files, countf: countf });
        //send_success(res, { files: files, countf: countf });
    });
}

function copy_file(src, file_index) {

    dest = appDir + "albums/spotlight/file" + file_index + ".jpg";
    //dest = "/RegisServer/NodeSite/albums/spotlight/file" + file_index + ".jpg";
    fs.copyFile(src, dest, (err) => {
        if (err) {
            callback({ error: "file_error0",
                message: JSON.stringify(err) });
            return;
        }

    });

}

function copy_files(file_data) {
    files = file_data.files;
    forEach(files)

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

        async.forEach(files, (element, cb) => {
            //element = element + ".jpg";
            fs.stat(directory + "/" + element, (err, stats) => {
                        if (err) {
                            cb({ error: "file_error2",
                                message: JSON.stringify(err) });
                            return;
                        }
                        if (stats.isFile() && stats.size > 150000) {


                            var file_name = element;
                            console.log(file_name);

                            only_files.push({ filename: file_name });
                            console.log(only_files[count_files]);


                            copy_file(directory + "/" + file_name, count_files);

                            count_files++;

                            only_files.push({ name: element, index: count_files });

                        } else {
                            only_dirs.push({ dirname: element});
                            console.log(only_dirs[count_dirs]);
                            count_dirs++;

                        }

                        cb(null);
                    }
                );
            },
            (err) => {
                callback(err); //, err ? null : only_files.sort(), count_files);
            });
    });
}
*/
