/**
 * Created by Downs on 4/19/2019.
 */

exports.config = {
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