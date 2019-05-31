/**
 * Created by Downs on 4/19/2019.
 */

var helpers = require('./helpers.js'),
    album_data = require("../data/album.js"),
    async = require('async'),
    fs = require('fs'),
    formidable = require('formidable');

exports.version = "0.1.0";


/**
 * Album class.
 */
function Album (album_data) {
    this.name = album_data.name;
    this.date = album_data.date;
    this.title = album_data.title;
    this.description = album_data.description;
    this._id = album_data._id;
}

Album.prototype.name = null;
Album.prototype.date = null;
Album.prototype.title = null;
Album.prototype.description = null;

Album.prototype.response_obj = function () {
    return { name: this.name,
        date: this.date,
        title: this.title,
        description: this.description };
};
Album.prototype.photos = function (pn, ps, callback) {
    if (this.album_photos != undefined) {
        callback(null, this.album_photos);
        return;
    }

    album_data.photos_for_album(
        this.name,
        pn, ps,
        function (err, results) {
            if (err) {
                callback(err);
                return;
            }

            var out = [];
            for (var i = 0; i < results.length; i++) {
                out.push(new Photo(results[i]));
            }

            this.album_photos = out;
            callback(null, this.album_photos);
        }
    );
};
Album.prototype.add_photo = function (data, path, callback) {
    album_data.add_photo(data, path, function (err, photo_data) {
        if (err)
            callback(err);
        else {
            var p = new Photo(photo_data);
            if (this.all_photos)
                this.all_photos.push(p);
            else
                this.app_photos = [ p ];

            callback(null, p);
        }
    });
};




/**
 * Photo class.
 */
function Photo (photo_data) {
    this.filename = photo_data.filename;
    this.date = photo_data.date;
    this.albumname = photo_data.albumname;
    this.description = photo_data.description;
    this._id = photo_data._id;
}
Photo.prototype._id = null;
Photo.prototype.filename = null;
Photo.prototype.date = null;
Photo.prototype.albumname = null;
Photo.prototype.description = null;
Photo.prototype.response_obj = function() {
    return {
        filename: this.filename,
        date: this.date,
        albumname: this.albumname,
        description: this.description
    };
};


/**
 * Album module methods.
 */
exports.create_album = function (req, res) {

    async.waterfall([
            // make sure the albumname is valid
            function (cb) {
                console.log(req.body);
                if (!req.body || !req.body.name) {
                    cb(helpers.no_such_album());
                    return;
                }

                // UNDONE: we should add some code to make sure the album
                // doesn't already exist!
                cb(null);
            },

            function (cb) {
                album_data.create_album(req.body, cb);
            }
        ],
        function (err, results) {
            if (err) {
                helpers.send_failure(res, helpers.http_code_for_error(err), err);
            } else {
                console.log(results);
                var a = new Album(results);
                helpers.send_success(res, {album: a.response_obj() });
            }
        });
};


exports.album_by_name = function (req, res) {
    async.waterfall([
            // get the album
            function (cb) {
                if (!req.params || !req.params.album_name)
                    cb(helpers.no_such_album());
                else
                    album_data.album_by_name(req.params.album_name, cb);
            }
        ],
        function (err, results) {
            if (err) {
                helpers.send_failure(res, helpers.http_code_for_error(err), err);
            } else if (!results) {
                err = helpers.no_such_album();
                helpers.send_failure(res, helpers.http_code_for_error(err), err);

            } else {
                var a = new Album(album_data);
                helpers.send_success(res, { album: a.response_obj() });
            }
        });
};

/*
exports.list_all = function (req, res) {
    album_data.all_albums("date", true, 0, 25, function (err, results) {
        if (err) {
            helpers.send_failure(res, helpers.http_code_for_error(err), err);
        } else {
            var out = [];
            //var out_albums = [];
            var out_count = [];
            //var all_count = 0;
            if (results) {
                var all_count = 0;
                for (var i = 0; i < results.length; i++) {
                    //out_albums.push(new Album(results[i]).response_obj());
                    var album_obj = new Album(results[i]).response_obj();
                    // var album_name = out_albums[i].name;
                    var album_name = album_obj.name;
                    //var album_count = album_obj.length;
                    //console.log("name: " + album_name + ", count: " + album_count);
                    //album_data.photos_for_album(album_obj.name, 0, 25, function (err, rslts) {
                    //album_data.photos_for_album(album_name, 0, 25, function (err, rslts) {
                    album_data.count_for_album(album_name, function (erro, rst) {
                        var album_count = rst.length;
                        all_count += album_count;
                        out.push({name: album_name, count: album_count});
                    });



                        if (err) {
                            helpers.send_failure(res, helpers.http_code_for_error(err), err);
                        } else {
                            var album_count = 0;
                            if (rslts) {
                                album_count = rslts.length;
                                all_count += album_count;
                            }
                            //out_count.push(album_count);
                            //out.push({name: album_obj.name, count: album_count});
                            out.push({name: album_name, count: album_count});
                        }
                    });
                }


                }

            }
            helpers.send_success(res, {albums: out, allcount: all_count});
            // helpers.send_success(res, { albums: out, count: album_count, allcount = photos_count });
        }

    });
};
*/

exports.list_all_admin = function (req, res) {
    album_data.all_albums("date", true, 0, 25, function (err, results) {
        if (err) {
            helpers.send_failure(res, helpers.http_code_for_error(err), err);
        } else {
            var out = [];
            if (results) {
                for (var i = 0; i < results.length; i++) {
                    out.push(new Album(results[i]).response_obj());
                }
            }
            helpers.send_success(res, { albums: out });
        }
    });
};



exports.list_all = function (req, res) {
    album_data.all_albums("date", true, 0, 25, function (err, results) {
        if (err) {
            helpers.send_failure(res, helpers.http_code_for_error(err), err);
        } else {
            var out = [];
            if (results) {
                for (var i = 0; i < results.length; i++) {
                    out.push(new Album(results[i]).response_obj());
                }
            }
            //helpers.send_success(res, { albums: out });
            //helpers.send_success(res, handle_get_totals(out) );
            //helpers.send_success(res, get_totals(out,(err, albums_info) => {
             get_totals(out,(err, albums_info) => {
                if (err) {
                    helpers.invalid_resource();
                    return;
                }
                helpers.send_success(res, albums_info);
                //callback = { albumsinfo: albums_info};
                //get_totals(out);
            });
        }
    });
};

function handle_get_totals(albums, callback) {
    get_totals(albums,(err, albums_info) => {
        if (err) {
            helpers.invalid_resource();
            return;
        }
        callback = { albumsinfo: albums_info};
        //send_success(res, { albums: albums });
    });
}

function get_totals(albums, callback) {
    //if (err) {
     //   callback({ error: "file_error",
    //        message: JSON.stringify(err) });
    //    return;
   // }

    var albums_out = [];
    var total_count = 0;
   // async.waterfall([
    if (albums && albums.length > 1000) {

        async.forEach(albums, (element, cb) => {

            album_data.albums_total(element.name,  (err, result) => {
                if (err) {
                    console.log("error");
                    helpers.invalid_resource();
                    //return;
                }
                    var album_length = result;
                    //console.log("result: " + result);
                    //console.log(album_length);
                    albums_out.push({name: element.name, count: album_length});
                    total_count += album_length;

                    var the_data = {};
                    var is_ready = false;
                    if(albums_out.length === albums.length) {
                        is_ready = true;
                        the_data = {albums:albums_out.sort(), allcount: total_count};
                    }
                    cb(null, get(err, the_data, is_ready));

                });
        //console.log("total2: " + total_count);
        //cb(null, get(err, the_data));
        });
    } else {
        //cb(null, get(err, the_data, is_ready));
        callback(null, {});
    }

    //(err) => {
    //    callback(err, err ? null : {albums: albums_out.sort(), allcount: result});
    //}
        //(err) => {
        //    callback(err, err ? null : albums_out.sort(), total_count);
        //}
        //);
        //return callb;

    function get(err, the_data, is_ready) {
        if (err) {
            console.log("error: " + err);
        } else if (is_ready === true){
            callback(null, the_data);
        } else {
            //callback(null);
        }
    }
    //console.log("total3: " + total_count);
    //callback( null, {albums: albums_out.sort(), allcount: total_count}, console.log("callback total4: " + total_count) );



}


exports.photos_for_album = function(req, res) {
    var page_num = req.query.page ? req.query.page : 0;
    var page_size = req.query.page_size ? req.query.page_size : 1000;

    page_num = parseInt(page_num);
    page_size = parseInt(page_size);
    if (isNaN(page_num)) page_num = 0;
    if (isNaN(page_size)) page_size = 1000;

    var album;
    async.waterfall([
            function (cb) {
                // first get the album.
                if (!req.params || !req.params.album_name)
                    cb(helpers.no_such_album());
                else
                    album_data.album_by_name(req.params.album_name, cb);
            },

            function (album_data, cb) {
                if (!album_data) {
                    cb(helpers.no_such_album());
                    return;
                }
                album = new Album(album_data);
                album.photos(page_num, page_size, cb);
            },
            function (photos, cb) {
                var out = [];
                for (var i = 0; i < photos.length; i++) {
                    out.push(photos[i].response_obj());
                }
                cb(null, out);
            }
        ],
        function (err, results) {
            if (err) {
                helpers.send_failure(res, helpers.http_code_for_error(err), err);
                return;
            }
            if (!results) results = [];
            var out = { photos: results,
                album_data: album.response_obj() };
            helpers.send_success(res, out);
        });
};

/*
exports.add_photo_to_album = function (req, res) {
    var album;
    console.log(req.files);

    async.waterfall([
            // make sure we have everything we need.
            function (cb) {
                if (!req.body)
                    cb(helpers.missing_data("POST data"));
                else if (!req.files) // || !req.files.photo_file)
                    cb(helpers.missing_data("a file"));
                else if (!helpers.is_image(req.files[0].name)) //.photo_file))
                    cb(helpers.not_image());
                else
                // get the album
                    album_data.album_by_name(req.params.album_name, cb);
            },

            function (album_data, cb) {
                if (!album_data) {
                    cb(helpers.no_such_album());
                    return;
                }

                album = new Album(album_data);
                req.body.filename = req.files[0].name; //.photo_file;
                var default_path = "/" + album.name;
                //var this_path = req.files.
                console.log("Name: " + req.files[0].name + " file: " + JSON.stringify(req.files[0].path));
                album.add_photo(req.body, default_path, cb);
            }
        ],
        function (err, p) {
            if (err) {
                helpers.send_failure(res, helpers.http_code_for_error(err), err);
                return;
            }
            var out = { photo: p.response_obj(),
                album_data: album.response_obj() };
            helpers.send_success(res, out);
        });
};
 */


exports.add_photo_to_album = function (req, res) {
    var album;
    //console.log(req.files);

    var form = new formidable.IncomingForm();
    form.upload;
    form.parse(req, function (err, fields, files) {
        //var oldpath = files.photo_file.name.path;
        //var newpath = "/RegisServer/NodeSite" + folder + "/" + files.filename.name;
        //var newpath = appDir + folder + "/" + files.filename.name;
        //newpath = newpath.replace(/\s+/g,'');

        //fs.rename(oldpath, newpath, function (err) {
           // if (err) throw err;
        //});

        async.waterfall([
                // make sure we have everything we need.
                function (cb) {
                    if (!req.body)
                        cb(helpers.missing_data("POST data"));
                    else if (!files.photo_file) // || !req.files.photo_file)
                        cb(helpers.missing_data("a file"));
                    else if (!helpers.is_image(files.photo_file.name)) //.photo_file))
                        cb(helpers.not_image());
                    else
                    // get the album
                        album_data.album_by_name(fields.albumname, cb)
                    //album_data.album_by_name(req.params.album_name, cb);
                },

                function (album_data, cb) {
                    if (!album_data) {
                        cb(helpers.no_such_album());
                        return;
                    }

                    album = new Album(album_data);
                    req.body.filename = files.photo_file.name; //.photo_file;
                    req.body.albumname = fields.albumname;
                    req.body.description = fields.description;
                    req.body.date = fields.date;
                    var default_path = "/" + album.name;
                    //var this_path = req.files.
                    console.log("Name: " + files.photo_file.name + " file: " + JSON.stringify(files.photo_file.path));
                    album.add_photo(req.body, files.photo_file.path, cb);
                }
            ],
            function (err, p) {
                if (err) {
                    helpers.send_failure(res, helpers.http_code_for_error(err), err);
                    return;
                }
                var out = { photo: p.response_obj(),
                    album_data: album.response_obj() };
                helpers.send_success(res, out);
            });


    });
    //callback(null);

};

/*
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



function massage_album (d) {
    if (d.error != null) return d;
    var obj = { photos: [], other: []};
    var af = d.data.album_data;
    for (var i = 0; i < af.photos.length; i++) {
        var url = "/albums/" + af.short_name + "/" + af.photos[i].filename;
        var file_type = url.substr(url.length - 4).toLowerCase();
        if (file_type == ".jpg"||file_type == ".png") {
            obj.photos.push({ url: url, desc: af.photos[i].filename });
        } else {
            obj.other.push({ url: url, desc: af.photos[i].filename });
        }

    }
    return obj;
}

 */