/**
 * Created by roten on 7/25/17.
 */
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;
const Classifier = require('./Classifier');
let workerDead = 0;
let array = {};
if (cluster.isMaster) {
    //  console.log(' hi here something started')
    process.on('message', function (rawRooms) {
        // Do work  (in this case just up-case the string
        //   console.log('process started');
        let split = Math.round(rawRooms.length / numCPUs);
        // console.log(split)
        let check = true;
        for (let i = 0; i < numCPUs && check; i++) {
            let worker = cluster.fork();
            worker.on('message', function (msg) {
                //     console.log('msg from cluster');
                Object.keys(msg).forEach(key => {
                    "use strict";
                    array[key] = msg[key];
                })
                workerDead++;
                //      console.log(workerDead);
                if (workerDead >= numCPUs) {
                    process.send(array);
                //    process.exit(0);
                }

            });
            let from = (i * split) == 0 ? (i * split) : (i * split) + 1;
            let to = i - 1 == numCPUs ? rawRooms.length : (i * split + split)

            if (to > rawRooms.length || to + split - 1 >= rawRooms.length) {
                to = rawRooms.length;
                //   console.log('worker ', i, ' from ', from, ' to ', to);
                worker.send({msgFromMaster: rawRooms.slice(from, to)});
                check = false;
            }
            else {
                // console.log('worker ', i, ' from ', from, ' to ', to);
                worker.send({msgFromMaster: rawRooms.slice(from, to)});
            }

        }

    });


}
else if (cluster.isWorker) {

    // console.log('cluster started');


    process.on('message', function (msg) {
        //   console.log('msg resive in worker ')
        //   console.log('process start')
        let cls = new Classifier(msg.msgFromMaster);
        cls.pointGenerator({n: 1, e: 3, b: 3, r: 3}, {n: 2, a: 2, v: 1}, {n: 4, a: 2, v: 2})
        //   console.log("process end ");
        process.send(cls.roomPoints);
        //  console.log('roompoint ', Object.keys(cls.roomPoints).length);
    });

}
