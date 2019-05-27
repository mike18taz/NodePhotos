/**
 * Created by Downs on 4/19/2019.
 */

var helpers = require('./helpers.js'),
    fs = require('fs');



exports.version = "0.1.0";


exports.generateAdmin = function (req, res) {
    req.params.page_name = 'admin';
    console.log(req.params.sub_page);
    if (req.params.sub_page === 'spotlight') {
         processSpotlight(req, res)
    } else {
        exports.generate(req, res);
    }

};

function processSpotlight(req, res) {
    console.log("process spotlight");
    gsp = require('./spotlight.js').get_spotlight_pics();
    req.params.page_name = 'admin';
    exports.generate(req, res);
}

exports.generate = function (req, res) {

    var page = req.params.page_name;
    if (req.params.sub_page && req.params.page_name === 'admin')
        page = req.params.page_name + "_" + req.params.sub_page;
    if (req.params.page_name === 'logout')
        req.session.logged_in = false;

    fs.readFile(
        'basic.html',
        function (err, contents) {
            if (err) {
                helpers.send_failure(res, helpers.http_code_for_error(err), err);
                return;
            }

            contents = contents.toString('utf8');

            // replace page name, and then dump to output.
            console.log(page);
            var title = " " + page.toUpperCase();
            contents = contents.replace('{{PAGE_TITLE}}', title);
            contents = contents.replace('{{PAGE_NAME}}', page);
            contents = contents.replace('{{ALBUM_NAME}}', page);
            res.writeHead(200, { "Content-Type": "text/html" });
            res.end(contents);
        }
    );
};

// if we made it here, then we're logged in. redirect to admin home
exports.login = function (req, res) {
    res.redirect("/pages/admin/home");
    res.end();
};