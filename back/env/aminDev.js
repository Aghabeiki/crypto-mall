/**
 * Created by roten on 7/25/17.
 */
var AWS = require("aws-sdk");
var creds = new AWS.Credentials('akid', 'secret', 'session');
module.exports = {
    basePath: '/devAPI/V1',
    dbConfig: {
        region: "us-west-2",
        endpoint: "http://localhost:8000",
        credentials: creds
    }

}