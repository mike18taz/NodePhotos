/**
 * Created by Downs on 7/19/2019.
 */

'use strict';

/*
module.exports.config = {
  db: {
    uri: 'mongodb://nodephotosdb:YXhSzR5ihOx4lqelBVSpk30dIg3NqRElcpN6QPhqJQ114VwpCrvdmr3JX0Ja4NbUgq3qccjjfLWwI3sx5NDP2w==@nodephotosdb.documents.azure.com:10255/mean-dev?ssl=true&sslverifycertificate=false'
  }
};
*/
module.exports.config = {
    db_config: {
        host: "localhost",
        port: "27017",
        poolSize: "5",
        user: "Regis",
        password: "regis123",
        database: "PhotoAlbums",

        pooled_connections: 125,
        idle_timeout_millis: 30000
    },

    static_content: "../webstatic/"
};