/**
 * Created by roten on 10/6/17.
 */

const fs = require('fs');
const path = require('path');
const here = path.dirname(__filename);

module.exports = {
    load: function (configPath) {
        dynamo.AWS.config.update(configPath);
        return fs
            .readdirSync(here)
            .map(allThings => {
                return allThings.toLowerCase()
            }).filter(allThings => {
                "use strict";
                return allThings.endsWith('.js') && allThings.indexOf('/') == -1 && allThings !== 'index.js'
            }).map(allModels => {
                "use strict";
                return allModels.charAt(0).toUpperCase() + allModels.slice(1).toLowerCase()
            }).map(allModels => {
                "use strict";
                return {name: allModels, schema: require(path.resolve(here, allModels))};
            }).map((config) => {
                "use strict";
                return dynamo.define(config.name.replace('.js', ''), config.schema);
            })
    }
}