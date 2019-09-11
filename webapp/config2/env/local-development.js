/**
 * Created by Downs on 7/23/2019.
 */

'use strict';

module.exports.config = {
  db: {
    uri: 'mongodb://nodephotosdb:YXhSzR5ihOx4lqelBVSpk30dIg3NqRElcpN6QPhqJQ114VwpCrvdmr3JX0Ja4NbUgq3qccjjfLWwI3sx5NDP2w==@nodephotosdb.documents.azure.com:10255/mean-dev?ssl=true&sslverifycertificate=false',
    poolSize: "5",
    user: "Regis",
    password: "regis123",
    database: "PhotoAlbums",
  },

  static_content: "../webstatic/"
};