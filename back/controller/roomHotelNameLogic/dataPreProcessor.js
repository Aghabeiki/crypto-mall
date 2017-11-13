/**
 * Created by roten on 7/25/17.
 */
const WordPOS = require('wordpos'),
    wordpos = new WordPOS();
const _ = require('lodash');
String.prototype.replaceAll = function (search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};
String.prototype.numberToWords = function () {
    const numberToWords = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
    let str = this;
    for (let i = 0; i < 10; i++)
        str = str.replaceAll(i.toString(), numberToWords[i]);
    return str;
}

module.exports = function (availableRooms, hotelID, cb) {
    "use strict";

    let roomRawID = 0;
    let res = {
        failed: [],
        rawRooms: []
    }
    const EV = require('events').EventEmitter;
    const ev = new EV();
    let ItemCounter = 0;
    ev.on('done', (results) => {
        ItemCounter++;
        res.rawRooms.push(results);
        if (ItemCounter >= roomRawID) cb(null, res);
    })
    ev.on('error', (results) => {
        ItemCounter++;
        res.failed.push(results)
        if (ItemCounter >= roomRawID) cb(null, res);
    })
    let processed = null;
    try {
        processed = availableRooms.reduce((p, v) => {
            v.availableRoomTypes
                .filter(roomRawType => {
                    return hotelID == null || roomRawType.hotelId === hotelID
                })
                .map(roomRawType => {
                    let roomName = roomRawType.name
                        .replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, ' ')
                        .replace(/-/g, ' ')
                        .numberToWords()
                        .toLocaleLowerCase()
                        .replaceAll('de luxe', 'deluxe')
                        .split(' ').filter((item, i, allItems) => {
                            return i == allItems.indexOf(item)
                        }).join(' ')
                        .replaceAll('plus', '')
                        .replaceAll('  ', ' ');
                    let tmp = roomRawType;
                    tmp.processedRoomName = roomName;
                    tmp.supplierName=v.supplierName;
                    tmp.roomID = roomRawID++
                    return tmp;
                }).forEach(room => {
                p.push(room);
            })
            return p;
        }, [])
    }
    catch (e) {
        return cb(e);
    }

    processed.forEach(item => {
        wordpos.getPOS(item.processedRoomName.toLocaleLowerCase(), (res) => {
            if (res == undefined) {
                ev.emit('error', {
                    roomName: item.processedRoomName.toLocaleLowerCase(),
                    roomDetails: item,
                    roomID: item.roomID
                })
            }
            else {
                ev.emit('done', {
                    id: item.roomID,
                    roomPOS: res,
                    roomName: item.processedRoomName.toLocaleLowerCase(),
                    roomDetails: item
                })

            }
        });
    })

}