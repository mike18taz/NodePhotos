/**
 * Created by Downs on 4/19/2019.
 */

$(function(){

    var tmpl,   // Main template HTML
        tdata = {};  // JSON data object that feeds the template

    // Initialise page
    var initPage = function() {

        // Load the HTML template
        $.get("/templates/admin_mod_photos.html", function(d){
            tmpl = d;
        });

        // Retrieve the server data and then initialise the page
        $.getJSON("/v1/albums_admin.json", function (d) {
            $.extend(tdata, d.data);
        });

        // When AJAX calls are complete parse the template
        // replacing mustache tags with vars
        $(document).ajaxStop(function () {
            var renderedPage = Mustache.to_html( tmpl, tdata );
            $("body").html( renderedPage );
        })
    }();
});