/**
 * NodeExpressAuthServerDB
 * -- A Node.js file that starts an Express server and uses buffers or callbacks to transmit web traffic
 *    as well as session authentication and connection to a MongoDB database
 * -- Adapted from various files and scripts written by Marc Wandschneider in Learning Node.js book
 * Created by Downs on 4/18/2019.
 */

//const ngrok = require('ngrok');
var express = require('express');
var app = express();
// http = require('http'),
var async = require('async'),
    path = require("path"),
    m = require("morgan"),
    bp = require("body-parser"),
    //mult = require("multer"),
    //efu = require("express-fileupload"),
    //cbb = require("connect-busboy"),
    cp = require("cookie-parser"),
    cs = require("cookie-session"),
    fs = require('fs'),
    url = require('url'),
    qs = require('querystring'),
    formidable = require('formidable');
/*
(async function() {
    const url = await ngrok.connect(8080);
})();

 */

var db = require('../webapp/data/db.js'),
    album_hdlr = require('./handlers/albums.js'),
    page_hdlr = require('./handlers/pages.js'),
    user_hdlr = require('./handlers/users.js'),
    helpers = require('./handlers/helpers.js');

//var upload = mult({ dest: 'albums/' });
let appDir;

app.use(m('dev'));
//app.use(cbb());
//app.use(efu());
app.use(bp.json({ keepExtensions: true }));
app.use(bp.urlencoded({ extended: true, keepExtensions: true }));
app.use(express.static(__dirname + "/../webstatic"));
app.use(cp("kitten on  keyboard"));
app.use(cs({
    secret: "FLUFFY BUNNIES",
    maxAge: 86400000
}));

app.get('/v1/albums_admin.json', album_hdlr.list_all_admin);
app.get('/v1/albums.json', album_hdlr.list_all);
app.get('/v1/albums/:album_name.json', album_hdlr.album_by_name);
app.put('/v1/albums.json', requireAPILogin, album_hdlr.create_album);
//app.put('/v1/albums.json', requireAPILogin, upload.none(), album_hdlr.create_album);

app.get('/v1/albums/:album_name/photos.json', album_hdlr.photos_for_album);
//app.get('/v1/albums/spotlight/photos.json?page=0&page_size=1000', console.log("getting"));
app.put('/v1/albums/:album_name/photos.json',
    requireAPILogin, album_hdlr.add_photo_to_album);
//app.put('/v1/albums/:album_name/photos.json',
//    requireAPILogin, upload.fields([{name: 'photo_file', albumname: 'albumname', description: "description"}]), album_hdlr.add_photo_to_album);

//app.get('/v1/albums/:album_name/manager', requirePageLogin, album_hdlr.manage_album);



// add-on requests we support for the purposes of the web interface
// to the server.
app.get('/pages/admin/:sub_page',
    requirePageLogin, page_hdlr.generateAdmin);
//app.get('/pages/admin/spotlight',
//    requirePageLogin, page_hdlr.processSpotlight);

app.get('/pages/:page_name', page_hdlr.generate);
app.get('/pages/:page_name/:sub_page', page_hdlr.generate);
app.post('/service/login', user_hdlr.login);
app.get('/pages/logout', user_hdlr.logout);

app.put('/v1/users.json', user_hdlr.register);
app.get('/v1/users/:display_name.json', user_hdlr.user_by_display_name);


app.get("/", function (req, res) {
    res.redirect("/pages/home");
    res.end();
});

app.get('*', four_oh_four);

function four_oh_four(req, res) {
    res.writeHead(404, { "Content-Type" : "application/json" });
    res.end(JSON.stringify(helpers.invalid_resource()) + "\n");
}


function requireAPILogin(req, res, next) {
    // if they're using the API from the browser, then they'll be auth'd
    if (req.session && req.session.logged_in) {
        next();
        return;
    }
    var rha = req.headers.authorization;
    if (rha && rha.search('Basic ') === 0) {
        var creds = new Buffer(rha.split(' ')[1], 'base64').toString();
        var parts = creds.split(":");
        user_hdlr.authenticate_API(
            parts[0],
            parts[1],
            function (err, resp) {
                if (!err && resp) {
                    next();
                } else
                    need_auth(req, res);
            }
        );
    } else
        need_auth(req, res);
}


function requirePageLogin(req, res, next) {
    if (req.session && req.session.logged_in) {
        next();
    } else {
        res.redirect("/pages/login");
    }
}

function need_auth(req, res) {
    res.header('WWW-Authenticate',
        'Basic realm="Authorization required"');
    if (req.headers.authorization) {
        // no more than 1 failure / 5s
        setTimeout(function () {
            res.send('Authentication required\n', 401);
        }, 5000);
    } else {
        res.send('Authentication required\n', 401);
    }
}

//console.log(db.all_db);
//app.listen(8080);

db.init(function (err, results) {
    appDir = path.dirname(require.main.filename) + "\\";
//appDir = appDir.substring(0,appDir.length);
    console.log(appDir);
    if (err) {
        console.error("** FATAL ERROR ON STARTUP: ");
        console.error(err);
        process.exit(-1);
    }
    console.log(results);
    console.log("Initialization complete. Running Server.");
    //app.listen(3000);
    const port = process.env.PORT || 1337;
    app.listen(port);
});



// Determine webapp directory and current windows username

//let user_dir = os.userInfo().username;
//console.log(user_dir);


/*
// This function handles html pages and parts
function serve_static_file (file, res) {
    var rs = fs.createReadStream(file);

    rs.on('error', (e) => {
        res.writeHead(404, { "Content-Type" : "application/json" });
        var out = { error: "not_found",
            message: "'" + file + "' not found" };
        res.end(JSON.stringify(out) + "\n");
        return;
    });

    var ct = content_type_for_file(file);
    res.writeHead(200, { "Content-Type" : ct });
    rs.on('readable', () => {
            var d = rs.read();
            if (d) {
                if (typeof d == 'string')
                    res.write(d);
                else if (typeof d == 'object' && d instanceof Buffer)
                    res.write(d.toString('utf8'));
            }
        }
    );
    rs.on('end' , () => {
            res.end(); //
        }
    );

}

function serve_static_file_callback(file, res) {
    var rs = fs.createReadStream(file);
    rs.on('error', (e) => {
        res.writeHead(404, { "Content-Type" : "application/json" });
        var out = { error: "not_found",
            message: "'" + file + "' not found" };
        res.end(JSON.stringify(out) + "\n");
        return;
    });

    var ct = content_type_for_file(file);
    //console.log(ct);

    res.writeHead(200, { "Content-Type" : ct });
    rs.pipe(res);
}

function content_type_for_file (file) {
    var ext = path.extname(file);
    switch (ext.toLowerCase()) {
        case '.html': return "text/html";
        case ".js": return "text/javascript";
        case ".css": return 'text/css';
        case '.jpg': case '.jpeg': return 'image/jpeg';
        case '.png': return 'image/png';
        default: return 'text/plain';
    }
}

function get_spotlight_photos() {
    gsp.get_spotlight_pics();
}

function load_album_list(callback) {
    // For now, all directory in 'albums' subfolder is an album.
    fs.readdir("albums", (err, files) => {
        if (err) {
            callback({ error: "file_error",
                message: JSON.stringify(err) });
            return;
        }

        var only_dirs = [];
        var only_files = [];
        var count_files = 0;

        async.forEach(files, (element, cb) => {
                fs.stat("albums/" + element, (err, stats) => {
                        if (err) {
                            cb({ error: "file_error",
                                message: JSON.stringify(err) });
                            return;
                        }
                        if (stats.isDirectory()) {
                            var d_index = 0;

                            var directory_name = "albums/" + element + "/";
                            console.log(directory_name);
                            fs.readdirSync(directory_name).forEach(function (file) {
                                var statts;
                                statts = fs.statSync(directory_name + file);
                                if (statts.isFile()) {
                                    only_files.push({ filename: file });
                                    console.log(only_files[d_index]);
                                    d_index++;
                                    count_files++;
                                }
                            });
                            only_dirs.push({ name: element, count: d_index });

                        } else {
                            only_files.push({ filename: element});

                        }

                        cb(null);
                    }
                );
            },
            (err) => {
                callback(err, err ? null : only_dirs.sort(), only_files, count_files);
            });
    });
}

function load_album(album_name, page, page_size, callback) {
    fs.readdir("albums/" + album_name, (err, files) => {
        if (err) {
            if (err.code == "ENOENT") {
                callback(no_such_album());
            } else {
                callback({ error: "file_error",
                    message: JSON.stringify(err) });
            }
            return;
        }

        var only_photos = [];
        // var only_text_files = [];

        var path = "albums/" + album_name + "/";

        async.forEach(files, (element, cb) => {
                fs.stat(path + element, (err, stats) => {
                    if (err) {
                        cb({ error: "file_error",
                            message: JSON.stringify(err) });
                        return;
                    }
                    if (stats.isFile()) {
                        var obj = {
                            filename: element,
                            desc: element
                        };
                        // For now, push every type of file into same folder
                        if (element.toString().substr(element.toString().length - 4) == '.txt') {
                            console.log(element.toString());
                            only_photos.push(obj);
                            //only_text_files.push(obj);
                        } else {
                            only_photos.push(obj);
                        }
                    }
                    cb(null);
                });
            },
            function (err) {
                if (err) {
                    callback(err);
                } else {
                    var start = page * page_size;

                    var photos = only_photos.slice(start, start + page_size);
                    // var text_files = only_text_files.slice(start, start + page_size);
                    // var obj = { short_name: album_name.substring(1), text_files: text_files };
                    var obj = { short_name: album_name.substring(1),
                        photos: photos };
                    callback(null, obj);

                }
            });
        console.log("album loaded");

    });

}
*/
/**
 * All pages come from the same one skeleton HTML file that
 * just changes the name of the JavaScript loader that needs to be
 * downloaded.
 */
/*
function serve_page(req, res) {
    var page = get_page_name(req);
    //console.log(page);

    fs.readFile('basic.html', (err, contents) => {
        if (err) {
            send_failure(res, 500, err);
            return;
        }

        contents = contents.toString('utf8');

        // replace page name, and then dump to output.
        contents = contents.replace('{{PAGE_NAME}}', page);
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(contents);
    });
}

function handle_incoming_request(req, res) {
    console.log("INCOMING REQUEST: " + req.method + " " + req.url);

    // parse the query params into an object and get the path
    // without them. (2nd param true = parse the params).
    req.parsed_url = url.parse(req.url, true);
    var core_url = req.parsed_url.pathname;

    //console.log(core_url.substring(6,12));
    // test this fixed url to see what they're asking for
    if (req.method.toLowerCase() == "post" && core_url.substring(6, 12) == '/album') {
        // core_url.substr(6, 6) == '/album' &&
        console.log("attempt album file upload: " + core_url.substring(13));
        upload_file("albums/" + core_url.substring(13), req, res);
        console.log("album file uploaded");
    } else if (req.method.toLowerCase() == "post" && core_url.substring(6, 12) == '/home') {
        add_album(req, res);
        // Reload homepage after adding album.
        serve_page(req, res);
    } else if (core_url == '/pages/admin/spotlight') {
        get_spotlight_photos();
    } else if (core_url.substring(0, 7) == '/pages/') {
        serve_page(req, res);
    } else if (core_url.substring(0, 11) == '/templates/') {
        serve_static_file("templates/" + core_url.substring(11), res);
    } else if (core_url.substring(0, 9) == '/content/') {
        serve_static_file("content/" + core_url.substring(9), res);
    } else if (core_url == '/albums.json') {
        handle_list_albums(req, res);
    } else if (core_url.substr(0, 7) == '/albums'
        && core_url.substr(core_url.length - 5) == '.json') {
        handle_get_album(req, res);
    } else if (core_url.substr(0, 7) == '/albums') {
        serve_static_file_callback("albums/" + core_url.substring(8), res);
        console.log("album file loaded");
    } else {
        send_failure(res, 404, invalid_resource());
    }
}


function upload_file(folder, req, res) {
    var form = new formidable.IncomingForm();
    form.upload;
    form.parse(req, function (err, fields, files) {
        var oldpath = files.filename.path;
        //var newpath = "/RegisServer/NodeSite" + folder + "/" + files.filename.name;
        var newpath = appDir + folder + "/" + files.filename.name;
        newpath = newpath.replace(/\s+/g,'');

        fs.rename(oldpath, newpath, function (err) {
            if (err) throw err;

            // Create temporary page to describe action and redirect user.
            res.write('<a href="/pages/home">Home Page</a>');
            res.write('<br>File uploaded and moved!<br>Return to home.');
            res.end();



        });
    });
}

function handle_list_templates(req, res) {
    load_album_list((err, albums) => {
        if (err) {
            send_failure(res, 500, err);
            return;
        }

        send_success(res, { albums: albums });
    });
}

function handle_list_albums(req, res) {
    load_album_list((err, albums, files, countf) => {
        if (err) {
            send_failure(res, 500, err);
            return;
        }

        send_success(res, { albums: albums, files: files, countf: countf });
    });
}


function handle_get_album(req, res) {
    // get the GET params
    var album_name = get_album_name(req);
    var getp = get_query_params(req);
    var page_num = getp.page ? getp.page : 0;
    var page_size = getp.page_size ? getp.page_size : 1000;

    if (isNaN(parseInt(page_num))) page_num = 0;
    if (isNaN(parseInt(page_size))) page_size = 1000;

    load_album(album_name, page_num, page_size, (err, album_contents) => {
        if (err && err == "no_such_album") {
            send_failure(res, 404, err);
        }  else if (err) {
            send_failure(res, 500, err);
        } else {
            send_success(res, { album_data: album_contents });
        }
    });
}



function add_album(req, res) {
    var json_body = '';
    req.on('readable', () => {
        var d = req.read();
        if (d) {
            if (typeof d == 'string') {
                json_body += d;
            } else if (typeof d == 'object' && d instanceof Buffer) {
                json_body += d.toString('utf8');
            }
            json_body = qs.parse(json_body);
        }
    });

    req.on('end', () => {
        // Did we get a valid data?
        if (json_body) {

            try {
                // First convert to usable JSON
                var album_data = JSON.parse(JSON.stringify(json_body));
                if (!album_data.newalbumname) {
                    send_failure(res, 404, "missing_data: newalbumname");
                    return;
                }
            } catch (e) {
                // got a body, but not valid json
                console.log(json_body);
                send_failure(res, 403, bad_json());
                return;
            }

            // make the new album
            console.log(json_body);

            var album_name = "/RegisServer/NodeSite/albums/" + album_data.newalbumname;
            fs.mkdir(album_name,(err) => {
                if (err) throw err;
            });


        } else {
            send_failure(res, 403, bad_json());
            res.end();
        }
    });
}

function send_success(res, data) {
    res.writeHead(200, {"Content-Type": "application/json"});
    var output = { error: null, data: data };
    res.end(JSON.stringify(output) + "\n");
}
function send_failure(res, server_code, err) {
    var code = (err.code) ? err.code : err.name;
    res.writeHead(server_code, { "Content-Type" : "application/json" });
    res.end(JSON.stringify({ error: code, message: err.message }) + "\n");
}

function bad_json() {
    return { error: "invalid_json: ",
        message: "is not valid JSON." };
}
function invalid_resource() {
    return { error: "invalid_resource",
        message: "the requested resource does not exist." };
}
function no_such_album() {
    return { error: "no_such_album",
        message: "The specified album does not exist" };
}
function get_album_name(req) {
    var core_url = req.parsed_url.pathname;
    return core_url.substr(7, core_url.length - 12);
}
function get_query_params(req) {
    return req.parsed_url.query;
}
function get_page_name(req) {
    var core_url = req.parsed_url.pathname;
    var parts = core_url.split("/");
    return parts[2];
}


var s = http.createServer(handle_incoming_request);
*/
//app.listen(8080);