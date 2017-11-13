/**
 * Created by roten on 7/25/17.
 */
const fs = require('fs');
const path = require('path');

global._ = require('lodash');
global.dynamo = require('dynamodb');
global.Joi = require('joi');
global.async = require('async');


module.exports = function (app) {
    "use strict";
    // preProcess
    // set app base path;
    app.locals.appPath = __dirname;
    // get app port and env
    app.locals.app = {};
    app.locals.app.port = process.env.PORT || 1338
    app.locals.app.envName = process.env.NODE_ENV || 'dev';
    console.log(`The application start in ${app.locals.app.envName} environment.`)
    // get app env mode
    // load local config if exist
    if (fs.existsSync(path.resolve(app.locals.appPath, 'config', 'local.js'))) {
        const local = require(path.resolve(app.locals.appPath, 'config', 'local'))
        if (local.port !== undefined) {
            app.locals.app.port = local.port;
        }
        if (local.env !== undefined) {
            app.locals.app.envName = local.env;
        }
    }
    {
        // load environment configuration
        const env = fs.readdirSync(path.resolve(app.locals.appPath, 'env')).filter(env => {
            return env.toLowerCase().endsWith('.js')
        }).filter(env => {
            return env.toLowerCase().replace('.js', '') == app.locals.app.envName.toLowerCase()
        })
        if (env.length != 1) {
            throw new Error("Environment configuration is not correct");
        } else {
            let envParams = require(path.resolve(app.locals.appPath, 'env', env[0]));
            Object.keys(envParams).forEach(envParam => {
                app.locals.app[envParam] = envParams[envParam];
            });
        }

    }

    // load app config
    {
        const config = fs.readdirSync(path.resolve(app.locals.appPath, 'config'))
            .filter(config => {
                return config.toLowerCase().endsWith('.js') && config[0] === config[0].toUpperCase()
            })
        app.locals.config = config.reduce((p, v) => {
            p[v.replace('.js', '')] = require(path.resolve(app.locals.appPath, "config", v))
            return p;
        }, {})

    }

    // load app Services
    {
        const services = fs.readdirSync(path.resolve(app.locals.appPath, 'service'))
            .filter(service => {
                return service.toLowerCase().endsWith('.js') && service[0] === service[0].toUpperCase()
            })
        app.locals.services = services.reduce((p, v) => {
            "use strict";
            p[v.replace('.js', '')] = require(path.resolve(app.locals.appPath, 'service', v));
            return p;
        }, {})
    }
    // load app databases
    {
        require('./models').load(app.locals.app.dbConfig);
    }
    // enable app service
    Object.keys(app.locals.config.Services).forEach(service => {
        "use strict";
        if (app.locals.config.Services[service]) {
            if (app.locals.services[service] === undefined || typeof (app.locals.services[service]) !== 'function') {
                throw new Error('app configuration is not correct , check service configuration');
                process.exit(1);
                return;
            }
            else {
                app.use(app.locals.services[service]);
            }
        }

    })

    return app;
}
