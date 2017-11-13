const express = require('express')
const bodyParser = require('body-parser');
const AppConfigLoader = require('./AppConfigLoader');
const app = AppConfigLoader(express());
const router = require('./router');
const timeout = require('connect-timeout'); //express v4
const path = require('path');
console.log('hotel-name app get start');
console.log('all requirement loaded successfully')
async.waterfall([
    // load db
    (done) => {
        "use strict";
        console.log('db configuration get start')
        dynamo.createTables((err) => {
            "use strict";
            if (err) {
                console.trace(err);
                done(new Error('DB not loaded'));
            }
            else {
                console.log('db config loaded successfully');
                console.log('db tables config start load');
                Object.keys(dynamo.models).forEach(name => {
                    global[name] = dynamo.models[name]
                });
                console.log('db tables load globally');
                done(null)
            }
        })
    },
    // load bootstrap
    (done) => {
        "use strict";
        console.log('bootstrap script get start')
        let bootstrap = require('./config/bootstrap') || {};
        async.waterfall(Object.keys(bootstrap).map(name => {
            return (done) => {
                bootstrap[name](done);
            }
        }), (err) => {
            if (err) {
                done(new Error('boot strap failed'));
            }
            else {
                done(null);
            }
            console.log('bootstrap script running end')
        })
    },
    // start app
    (done) => {
        console.log('express.js loading get start')
        app.use(bodyParser.json({ limit: '50mb' }));
        app.use(bodyParser.urlencoded({
            extended: true
        }));
        // Point static path to dist
        app.use(express.static(path.join(__dirname, 'dist')));
        app.use(app.locals.app.basePath, router);
        app.get('*', (req, res) => {
            res.sendFile(path.join(__dirname, 'dist/index.html'));
        });
        app.use(timeout(120000000));
        app.use((req, res, next) => {
            if (!req.timedout) next();
        });
        app.listen(app.locals.app.port, done);
    }
],
    (err) => {
        if (err) {
            console.log(err);
        }
        else {
            console.log(`app listening on port '${app.locals.app.port}'!`)
        }
    }
);

