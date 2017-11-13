/**
 * Created by roten on 7/25/17.
 */

const preProcess = require('./roomHotelNameLogic/dataPreProcessor')
const Classifier = require('./roomHotelNameLogic/Classifier');
let cleanObj = (o) => {
    if (o && o === o)
        if (typeof o === 'boolean') return o;
        else if (typeof o === 'number') return o;
        else if (typeof o === 'string') return o;
        else if (Array.isArray(o)) {
            let x = [], i = -1, l = o.length, r = 0;
            while (++i < l) if (o[i]) x[r++] = cleanObj(o[i]);
            return x;
        } else if (typeof o === 'object') {
            for (const k in o) o[k] ? o[k] = cleanObj(o[k]) : delete o[k];
            return o;
        } else
            return 'Argument Error - Unknown Item';
}
module.exports = {
    dataStandardise: function (req, res) {
        "use strict";
        const availableRooms = req.body['availableRooms'];
        if (availableRooms == undefined || !Array.isArray(availableRooms)) {
            res.stat(400).json({error_message: "'availableRooms' is required"})
        }
        const hotelID = req.body['hotelID'] || null;

        try {
            preProcess(availableRooms, hotelID, (err, results) => {
                if (err) {
                    return res.status(400).json({error_message: err.message});
                }
                else {

                    res.json(results);

                }
            });
        } catch (e) {
            return res.status(400).json({error_message: "input data is not valid"});
        }

    },

    classifier: function (req, res) {
        /*   var cp = require('child_process');
         var child = cp.fork(require('path').resolve(req.app.locals.appPath, "controller", "roomHotelNameLogic", "forkProcessor.js"));
         child.on('message', function (m) {
         res.json(Object.keys(m).length)
         child.kill('SIGINT');
         });
         child.send(results.rawRooms)*/

        let recode = {};
        recode.id = new Date().toISOString();
        let configTag = recode.configTag = req.query['config'] || 'default';
        recode.input = cleanObj(_.cloneDeep(req.body['rawRooms']));
        Compareconfig.get(configTag, {ConsistentRead: true}, function (err, config) {
            if (err) {
                res.status(500).json({error_message: err});
            }
            else if (config !== null) {
                let cls = new Classifier(req.body['rawRooms'], config);
                console.log('point calc start')
                cls.pointGenerator({n: 1, e: 3, b: 3, r: 3}, {n: 2, a: 2, v: 1}, {n: 4, a: 2, v: 2})
                console.log('point calc end ')
                console.log(' classification start')
                cls.classification((err, classified) => {
                    "use strict";
                    console.log('classifcation end')
                    if (err) {
                        res.status(400).json({error_message: err.message});
                    }
                    else {
                        let hotelIds = Object.keys(req.body['rawRooms'].reduce((p, room) => {
                            if (p[room.roomDetails.hotelId] == undefined) {
                                p[room.roomDetails.hotelId] = [];
                            }
                            p[room.roomDetails.hotelId].push(room);

                            return p;
                        }, {}));

                        recode.output = cleanObj(classified);
                    //    delete recode.output.notCat;
                        if (hotelIds.length == 1 || 1==1) {
                            let out = {};
                            out[hotelIds[0]] = classified;
                            res.json(classified);
                      /*      Requestlogger.create(recode, (err) => {
                                if (err) {
                                    console.trace(err);
                                }
                            });*/
                        }
                        else {
                            res.status(400).json({error_message: 'in each request u just can put one hotel'});
                        }
                    }
                })
            }
            else {
                res.status(400).json({error_message: "the config name is not valid "})
            }
        });
    }
}
