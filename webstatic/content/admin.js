/**
 * Created by Downs on 4/19/2019.
 */

//const get_spotlight_pics = require("./spotlight").get_spotlight_pics;

$( function (){
    var tmpl, // Main template HTML
        tdata = {}; // JSON data object that feeds the template
// Initialize page
    var initPage = function () {
// Load the HTML template
        $.get("/templates/admin.html", function(d){ // 1
            tmpl = d;
        });
// Retrieve the server data and then initialize the page
        $.getJSON("/albums.json", function (d) { // 2
            $.extend(tdata, d.data);
            console.log(tdata);
        });

// When AJAX calls are complete parse the template
// replacing mustache tags with vars
        $(document).ajaxStop(function () {
            var renderedPage = Mustache.to_html(tmpl, tdata); // 3
            $("body").html(renderedPage);
        })
    }();
});
