
var express = require('express');
var app = express();
// http = require('http'),
var async = require('async'),
    path = require("path"),
    m = require("morgan"),
    bp = require("body-parser"),
    cp = require("cookie-parser"),
    cs = require("cookie-session"),
    fs = require('fs'),
    url = require('url'),
    qs = require('querystring'),
    formidable = require('formidable');

/*
var db = require('../webapp/data/db.js'),
    album_hdlr = require('./handlers/albums.js'),
    page_hdlr = require('./handlers/pages.js'),
    user_hdlr = require('./handlers/users.js'),
    helpers = require('./handlers/helpers.js');
*/

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