/**
 * Created by Downs on 4/19/2019.
 */

var fs = require('fs'),
    crypto = require("crypto"),
    local = require('../local.config.js'),
    db = require('../data/db.js'),
    path = require("path"),
    async = require('async'),
    backhelp = require("./backend_helpers.js");

exports.version = "0.1.0";


exports.create_album = function (data, callback) {
    var final_album;
    var write_succeeded = false;
    async.waterfall([
            // validate data.
            function (cb) {
                try {
                    backhelp.verify(data,
                        [ "name",
                            "title",
                            "date",
                            "description" ]);
                    if (!backhelp.valid_filename(data.name))
                        throw invalid_album_name();
                } catch (e) {
                    cb(e);
                }
                cb(null, data);
            },

            // create the album in mongo.
            function (album_data, cb) {
                var write = JSON.parse(JSON.stringify(album_data));
                write._id = album_data.name;
                db.albums.insertOne(write, { w: 1, safe: true }, cb);
            },

            // make sure the folder exists.
            function (new_album, cb) {
                write_succeeded = true;
                //final_album = new_album[0];
                final_album = data;

                fs.mkdir(local.config.static_content
                    + "albums/" + data.name, cb);
            }
        ],
        function (err, results) {
            // convert file errors to something we like.
            if (err) {
                if (write_succeeded)
                    db.albums.remove({ _id: data.name }, function () {});

                if (err instanceof Error && err.code == 11000)
                    callback(backhelp.album_already_exists());
                else if (err instanceof Error && err.errno != undefined)
                    callback(backhelp.file_error(err));
                else
                    callback(err);
            } else {
                console.log(final_album);
                callback(err, err ? null : final_album);
            }
        });
};


exports.album_by_name = function (name, callback) {
    db.albums.find({ name: name }).toArray(function (err, results) {
        if (err) {
            callback(err);
            return;
        }

        if (results.length == 0) {
            callback(null, null);
        } else if (results.length == 1) {
            callback(null, results[0]);
        } else {
            console.error("More than one album named: " + name);
            console.error(results);
            callback(backutils.db_error());
        }
    });
};


exports.photos_for_album = function (album_name, pn, ps, callback) {
    // var sort = { date: -1 };
    var sort = {};
    sort["date"] = -1;
    db.photos.find({ albumname: album_name })
        .skip(pn)
        .limit(ps)
        .sort(sort)
        .toArray(callback);
};

/*
exports.count_for_album = function (album_name, cb) {
    // var sort = { date: -1 };
    var sort = {};
    sort["date"] = -1;
    db.photos.find({albumname: album_name})
        .skip(0)
        .limit(25)
        .sort(sort)
        .toArray(cb);
};
 */

exports.albums_total = function (album_name, callback) {
    // var sort = { date: -1 };
    var sort = {};
    sort["date"] = -1;
    db.photos.find( {albumname: album_name} ).toArray(function(err, result) {
        if (err) throw err;
        //console.log(album_name);
        //console.log(result.length);

        callback(null, result.length);
        //console.log(callback);
        //return  result.length;
    });

};


exports.all_albums = function (sort_field, sort_desc, skip, count, callback) {
    var sort = {};
    sort[sort_field] = sort_desc ? -1 : 1;
    db.albums.find()
        .sort(sort)
        .limit(count)
        .skip(skip)
        .toArray(callback);
};



exports.add_photo = function (photo_data, path_to_photo, callback) {
    var final_photo;
    var new_path;
    var base_fn = path.basename(path_to_photo).toLowerCase();
    async.waterfall([
            // validate data
            function (cb) {
                try {
                    backhelp.verify(photo_data,
                        [ "albumname",
                            "description",
                            "date" ]);

                    //photo_data.filename = base_fn;
                    new_path = photo_data.filename.replace(/\s+/g,'');

                    if (!backhelp.valid_filename(photo_data.albumname))
                        throw invalid_album_name();
                } catch (e) {
                    cb(e);
                }

                cb(null, photo_data);
            },

            // add the photo to the collection
            function (pd, cb) {
                pd._id = pd.albumname + "_" + pd.filename;
                db.photos.insertOne(pd, { w: 1, safe: true }, cb);
            },

            // now copy the temp file to webstatic content
            function (new_photo, cb) {
                //final_photo = new_photo[0];
                final_photo = photo_data;


                var save_path = local.config.static_content + "albums/"
                    + photo_data.albumname + "/" + new_path;   //base_fn;

                backhelp.file_copy(path_to_photo, save_path, true, cb);
            }
        ],
        function (err, results) {
            // convert file errors to something we like.
            if (err && err instanceof Error && err.errno != undefined)
                callback(backhelp.file_error(err));
            else
                callback(err, err ? null : final_photo);
        });

};



function invalid_album_name() {
    return backhelp.error("invalid_album_name",
        "Album names can have letters, #s, _ and, -");
}
function invalid_filename() {
    return backhelp.error("invalid_filename",
        "Filenames can have letters, #s, _ and, -");
}
/*
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