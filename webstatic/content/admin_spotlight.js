/**
 * Created by Downs on 4/19/2019.
 */

$(function(){

    var tmpl,   // Main template HTML
        tdata = {};  // JSON data object that feeds the template

    // Initialise page
    var initPage = function() {

        // Load the HTML template
        $.get("/templates/admin_home.html", function(d){
            tmpl = d;
        });

        // When AJAX calls are complete parse the template
        // replacing mustache tags with vars
        $(document).ajaxStop(function () {
            var renderedPage = Mustache.to_html( tmpl, tdata );
            $("body").html( renderedPage );
        })
    }();
});

window.onload = function () {
    alert("Files loaded successfully from your Spotlight directory to the site!");
};

function verifyAction() {
    alert("Spotlight photos added already!");
}