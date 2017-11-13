/**
 * Created by roten on 7/25/17.
 */
const _ = require('lodash');

let _Handler = null;
const _roomPoints = new WeakMap();
const _rawRooms = new WeakMap();
const _hotelRoomLength = new WeakMap();
const _roomNameAvg = new WeakMap();
const _unTouch = new WeakMap();
class Classifier {
    get roomPoints() {
        return _roomPoints.get(_Handler);
    }

    get rawRooms() {
        return _rawRooms.get(_Handler);
    }

    get hotelRoomLength() {
        return _hotelRoomLength.get(_Handler);
    }

    get roomNameAvg() {
        return _roomNameAvg.get(_Handler);
    }

    get untouch() {
        return _unTouch.get(_Handler)
    }


    constructor(rawRooms, config) {
        _Handler = this;
        _roomPoints.set(_Handler, {});
        let rooms = [];
        let untouched = [];
        if (rawRooms.length <= 50) {
            rooms = rawRooms;
        }
        else {
            let sampleData = [];
            do {
                let index = Math.floor(Math.random() * rawRooms.length + 1)
                if (sampleData.indexOf(index) == -1) {
                    sampleData.push(index);
                }
            } while (sampleData.length <= 50);
            rawRooms.forEach((room, index) => {
                "use strict";
                if (sampleData.indexOf(index) == -1) {
                    untouched.push(room);
                }
                else {
                    rooms.push(room);
                }
            });
        }
        _rawRooms.set(_Handler, rooms);
        _unTouch.set(_Handler, untouched);
        _hotelRoomLength.set(_Handler, rooms.map(room => {
            return {id: room.id, length: room.roomName.length}
        }));
        _roomNameAvg.set(_Handler, _Handler.hotelRoomLength.reduce((p, v, i, ar) => {
            if (i == ar.length - 1) {
                return (p + v.length) / ar.length;
            }
            else {
                return p + v.length;
            }
        }, 0));


        // set dictitionery config
        // this.number = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];//2
        this.extraHotelsWords = config.get('extraHotelsWords');//['standard', 'executive', 'deluxe', 'adjoining', 'lifestyle','lounge', 'access', 'business'];// 1
        this.globalExtraHotelWordsPoint = config.get('globalExtraHotelWordsPoint');//1;
        this.number = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];//2
        this.globalNumberPoint = config.get('globalNumberPoint');//2;
        this.roomTypeWords = config.get('roomTypeWords');//['room', 'suite', 'penthouse', 'duplex'];// 4
        this.globalRoomTypePoint = config.get('globalRoomTypePoint');//4
        this.globalisedTypePoint = config.get('globalisedTypePoint');
        this.bedTypeWords = config.get('bedTypeWords');//['king', 'twin', 'single', 'double', 'triple', 'bed', 'beds'];// 4


    }

    pointBasePrice(priceA, priceB, specialPoint, percent, acceptableRange) {
        const rate = percent || 85;
        const failsRate = acceptableRange || 200

        if (priceA >= (0.001 * rate * priceB) - failsRate || priceA <= (0.001 * rate * priceB) + failsRate)
            return specialPoint || 3
        else
            return (-2 * specialPoint) || -3;
    }


    pushToRoomPoint(A, B, points) {
        let tmp = _Handler.roomPoints;

        if (tmp[JSON.stringify({a: A.id, b: B.id})] === undefined &&
            tmp[JSON.stringify({a: A.id, b: B.id})] === undefined) {
            tmp[JSON.stringify({a: A.id, b: B.id})] = {point: points, a: A, b: B};
        }
        _roomPoints.set(_Handler, tmp);
    }

    pointGenerator(mode, point, sp, i_row, j_row) {
        for (let i = 0; i < _Handler.rawRooms.length; i++) {
            for (let j = 0; j < _Handler.rawRooms.length; j++) {
                if (_Handler.rawRooms[i].id !== _Handler.rawRooms[j].id && Math.abs(_Handler.rawRooms[j].roomName.length - _Handler.rawRooms[i].roomName.length) < 9) {
                    let nounsPoint = _Handler.compareFunc(_Handler.rawRooms[i].roomPOS.nouns.filter(elem => {
                        return (elem.length !== 0);
                    }).sort(), _Handler.rawRooms[j].roomPOS.nouns.filter(elem => {
                        return (elem.length !== 0)
                    }).sort(), point.n || 0, sp.n || 0, mode)// mode 0 , normal 1,hard 2 , 3 f-society
                    let adjectivesPoint = _Handler.compareFunc(_Handler.rawRooms[i].roomPOS.adjectives.filter(elem => {
                        return (elem.length !== 0);
                    }).sort(), _Handler.rawRooms[j].roomPOS.adjectives.filter(elem => {
                        return (elem.length !== 0)
                    }).sort(), point.a || 0, sp.a || 0, mode)// mode 0 , normal 1,hard 2 , 3 f-society
                    let verbsPoint = _Handler.compareFunc(_Handler.rawRooms[i].roomPOS.verbs.filter(elem => {
                        return (elem.length !== 0);
                    }).sort(), _Handler.rawRooms[j].roomPOS.verbs.filter(elem => {
                        return (elem.length !== 0)
                    }).sort(), point.v || 0, sp.v || 0, mode)// mode 0 , normal 1,hard 2 , 3 f-society


                    let totalPoint = nounsPoint + adjectivesPoint + verbsPoint;

                    let avg = (_Handler.hotelRoomLength.filter(room => {
                            return room.id == _Handler.rawRooms[i].id
                        })[0].length + _Handler.hotelRoomLength.filter(room => {
                            return room.id == _Handler.rawRooms[j].id
                        })[0].length) / 2
                    let diff = _Handler.roomNameAvg - avg;

                    if (diff >= 0) {
                        // it's little then other should add some things
                        let tt = totalPoint / avg;
                        totalPoint += (tt * Math.abs(diff))
                    }
                    if (diff < 0) {
                        // its greater then should reduce some things
                        let tt = totalPoint / avg;
                        totalPoint -= (tt * Math.abs(diff))
                    }

                    let pricePoint = 0;

                    pricePoint = pricePoint == 0 ? _Handler.pointBasePrice(_Handler.rawRooms[i].roomDetails.b2CPrice, _Handler.rawRooms[j].roomDetails.b2CPrice, 10, 98, 100) : pricePoint == 0 ? 0 : pricePoint
                    pricePoint = pricePoint == 0 ? _Handler.pointBasePrice(_Handler.rawRooms[i].roomDetails.b2CPrice, _Handler.rawRooms[j].roomDetails.b2CPrice, 8.5, 95, 150) : pricePoint == 0 ? 0 : pricePoint
                    /*  pricePoint = pricePoint == 0 ? _Handler.pointBasePrice(_Handler.rawRooms[i].roomDetails.b2CPrice, _Handler.rawRooms[j].roomDetails.b2CPrice, 7, 90, 200) : pricePoint == 0 ? 0 : pricePoint
                     pricePoint = pricePoint == 0 ? _Handler.pointBasePrice(_Handler.rawRooms[i].roomDetails.b2CPrice, _Handler.rawRooms[j].roomDetails.b2CPrice, 5.5, 85, 200) : pricePoint == 0 ? 0 : pricePoint
                     pricePoint = pricePoint == 0 ? _Handler.pointBasePrice(_Handler.rawRooms[i].roomDetails.b2CPrice, _Handler.rawRooms[j].roomDetails.b2CPrice, 4, 80, 250) : pricePoint == 0 ? 0 : pricePoint
                     pricePoint = pricePoint == 0 ? _Handler.pointBasePrice(_Handler.rawRooms[i].roomDetails.b2CPrice, _Handler.rawRooms[j].roomDetails.b2CPrice, 3.5, 75, 100) : pricePoint == 0 ? 0 : pricePoint
                     pricePoint = pricePoint == 0 ? _Handler.pointBasePrice(_Handler.rawRooms[i].roomDetails.b2CPrice, _Handler.rawRooms[j].roomDetails.b2CPrice, 1.5, 70, 100) : pricePoint == 0 ? 0 : pricePoint
                     pricePoint = pricePoint == 0 ? _Handler.pointBasePrice(_Handler.rawRooms[i].roomDetails.b2CPrice, _Handler.rawRooms[j].roomDetails.b2CPrice, 1, 65, 50) : pricePoint == 0 ? 0 : pricePoint
                     pricePoint = pricePoint == 0 ? _Handler.pointBasePrice(_Handler.rawRooms[i].roomDetails.b2CPrice, _Handler.rawRooms[j].roomDetails.b2CPrice, 0.5, 60, 50) : pricePoint == 0 ? 0 : pricePoint
                     */
                    totalPoint += pricePoint
                    _Handler.pushToRoomPoint(_Handler.rawRooms[i], _Handler.rawRooms[j], totalPoint);
                }
            }
        }

    }


    printResults(validRooms) {

        let validStack = [];
        var finalData = {
            cat: {},
            notCat: []
        }
        Object.keys(validRooms).forEach(key => {
            finalData.cat[key] = {
                roomID: key, roomName: _Handler.rawRooms.filter(rooms => {
                    return rooms.id == key
                })[0].roomDetails.name, isMain: true, price: _Handler.rawRooms.filter(rooms => {
                    return rooms.id == key
                })[0].roomDetails.b2CPrice,
                boardCodeDescription: _Handler.rawRooms.filter(rooms => {
                    return rooms.id == key
                })[0].roomDetails.boardCodeDescription,
                supplierName: _Handler.rawRooms.filter(rooms => {
                    return rooms.id == key
                })[0].roomDetails.supplierName,
                sub: []
            };

            validStack.push(Number(key));
            let cc = 1;
            validRooms[key].forEach(elem => {
                finalData.cat[key].sub.push({
                    roomID: elem, roomName: _Handler.rawRooms.filter(rooms => {
                        return rooms.id == elem
                    })[0].roomDetails.name, isMain: false, price: _Handler.rawRooms.filter(rooms => {
                        return rooms.id == elem
                    })[0].roomDetails.b2CPrice,
                    boardCodeDescription: _Handler.rawRooms.filter(rooms => {
                        return rooms.id == elem
                    })[0].roomDetails.boardCodeDescription,
                    supplierName: _Handler.rawRooms.filter(rooms => {
                        return rooms.id == key
                    })[0].roomDetails.supplierName
                })

                validStack.push(Number(elem));
                cc++;
            })
        })
        const notListed = _Handler.rawRooms.filter(room => {
            return validStack.indexOf(Number(room.id)) === -1
        });
        notListed.forEach(room => {
            finalData.notCat.push({
                roomID: room.id,
                roomName: room.roomDetails.name,
                price: room.roomDetails.b2CPrice,
                boardCodeDescription: room.roomDetails.boardCodeDescription,
                supplierName: room.roomDetails.supplierName
            })
        })
        return finalData;
    }

    classification_private(roomPoints, firePoint, maxPoint) {
        let validRooms = []
        Object.keys(roomPoints).forEach(roomKey => {
            if (roomPoints[roomKey].point >= firePoint && roomPoints[roomKey].point <= maxPoint) {
                const keyA = Number(roomPoints[roomKey].a.id);
                const keyB = Number(roomPoints[roomKey].b.id);
                if (validRooms[keyA] !== undefined && validRooms[keyB] !== undefined) {
                    // add every thing under key B to key A
                    validRooms[keyB].forEach(elem => {
                        validRooms[keyA].push(elem);
                    });
                    // add B to A
                    validRooms[keyA].push(keyB);
                    // remove the key b and all child;
                    delete validRooms[keyB];
                }
                else if (validRooms[keyA] !== undefined && validRooms[keyB] === undefined) {
                    // in this case I'll search for b in other key if it's exist merge all together ...
                    let finedKey = Object.keys(validRooms).filter((validKey) => {
                        return validRooms[validKey].indexOf(Number(keyB)) !== -1
                    }).filter((key) => {
                        return Number(key) != Number(keyA)
                    });


                    if (finedKey.length === 0) {
                        // if not found add it directly to Key A
                        validRooms[keyA].push(keyB);
                    }
                    else {
                        // move all finedKey to keyA
                        finedKey.forEach(key => {
                            validRooms[key].forEach(elem => {
                                validRooms[keyA].push(elem);
                            })
                            validRooms[keyA].push(Number(key));
                            delete validRooms[key];
                        });
                    }


                }
                else if (validRooms[keyA] === undefined && validRooms[keyB] !== undefined) {
                    let finedKey = Object.keys(validRooms).filter((validKey) => {
                        return validRooms[validKey].indexOf(Number(keyA)) !== -1
                    }).filter(key => {
                        return Number(key) != Number(keyB)
                    });
                    // move all finedKey to keyB
                    if (finedKey.length === 0) {
                        validRooms[keyB].push(keyA);
                    }
                    else {
                        finedKey.forEach(key => {
                            validRooms[key].forEach(elem => {
                                validRooms[keyB].push(elem);
                            })
                            validRooms[keyB].push(Number(key));
                            delete validRooms[key];
                        });
                    }

                }
                else if (validRooms[keyA] === undefined && validRooms[keyB] === undefined) {
                    // first check that may exist this two key in other keys
                    let findA = Object.keys(validRooms).filter((validKey) => {
                        return validRooms[validKey].indexOf(keyA) !== -1
                    });
                    let findB = Object.keys(validRooms).filter((validKey) => {
                        return validRooms[validKey].indexOf(keyB) !== -1
                    });
                    if (findA.length === 0 && findB.length === 0) {
                        // key a & b not found so create a new key for A and store b on it
                        validRooms[keyA] = [];
                        validRooms[keyA].push(keyB);
                    }
                    else if (findA.length === 1 && findB.length === 0) {
                        // the key A find in an other key , and key B not found should add key B to the parent of Key A
                        validRooms[findA[0]].push(keyB);
                    }
                    else if (findA.length === 0 && findB.length === 1) {
                        validRooms[findB[0]].push(keyA);
                    }
                    else if (findA.length === 1 && findB.length === 1 && findA[0] != findB[0]) {
                        // get every thing in key B to key A
                        validRooms[findB[0]].forEach(bElem => {
                            validRooms[findA[0]].push(bElem);
                        })
                        validRooms[findA[0]].push(Number(findB[0]));
                        delete validRooms[findB[0]];
                    }
                    else if (findA[0] != findB[0]) {
                        throw new Error(" some thing ba happend ")
                    }
                }
            }
            Object.keys(validRooms).forEach(key => {
                validRooms[key] = validRooms[key].filter((item, i, allItems) => {
                    return i == allItems.indexOf(item)
                });
            })
        });

        return validRooms;
    }

    classification(cb) {

        let groups = [];
        let x = Object.keys(_Handler.roomPoints).map(elem => {
            if (groups[elem] == undefined)
                groups[elem] = [];
            return _Handler.roomPoints[elem].point

        });

        let pointAVG = x.reduce((p, v, i, arr) => {
            if (i === arr.length - 1) {
                return (p + v) / arr.length
            }
            else {
                return p + v;
            }

        }, 0)
        let filteredRoomPoint = Object.keys(_Handler.roomPoints).filter(key => {
            return _Handler.roomPoints[key].point > pointAVG / 2
        }).reduce((p, v) => {
            p[v] = _Handler.roomPoints[v]
            return p;
        }, {})


        require('./gaPickPointer')(Math.max(...x), Math.min(...x), _Handler.classification_private, filteredRoomPoint, (target) => {
            let trainingData = _Handler.printResults(_Handler.classification_private(filteredRoomPoint, target, Math.max(...x)), false);
            let trainData = Object.keys(trainingData.cat).reduce((p, catKey) => {
                trainingData.cat[catKey.toString()].sub.map(room => {
                    return room.roomName
                })
                    .forEach(trainRoom => {
                        p.push({
                            input: trainRoom.toLowerCase(),
                            output: trainingData.cat[catKey.toString()].roomName.toLowerCase()
                        })
                    })

                return p;
            }, []);
            var cp = require('child_process');
            var child = cp.fork(require('path').resolve(__dirname, 'ml.js'));
            child.on('message', function (mlSuggestions) {
                child.kill('SIGINT');
                let mainCat = Object.keys(trainingData.cat).map(key => {
                    return {
                        roomName: trainingData.cat[key.toString()].roomName,
                        price: trainingData.cat[key.toString()].price,
                        boardCodeDescription: trainingData.cat[key.toString()].boardCodeDescription,
                        child: trainingData.cat[key.toString()].sub
                    };
                })
                let finalized = mlSuggestions.map(elem => {
                    return {
                        catInfo: elem.catInfo
                            .map(suggestedCatName => {
                                    let finedCat = mainCat.filter(catName => {
                                        return catName.roomName.toLowerCase() === suggestedCatName.toLowerCase()
                                    }).reduce((p, v) => {
                                        p.roomName = v.roomName;
                                        //   p.id = v.id;
                                        p.avgPrice = (v.price + v.child.reduce((p, v) => {
                                                p += v.price;
                                                return p;
                                            }, 0)) / (1 + v.child.length);
                                        return p;
                                    }, {})
                                    return finedCat
                                }
                            ),

                        targetRoom: trainingData.notCat.filter(nonCat => {
                            return nonCat.roomID == elem.roomID
                        })
                    }
                }).reduce((p, v) => {

                    v.catInfo.forEach(catInfo => {
                        if (p[v.targetRoom[0].roomID.toString()] != undefined) {
                            /// it mean some body before add something here so let check the new group is better or not
                            let pr = (v.targetRoom[0].price * 100) / catInfo.avgPrice;
                            if (pr >= p[v.targetRoom[0].roomID.toString()].pr && pr <= 105) {
                                let tmp = catInfo;
                                tmp.pr = pr;
                                p[v.targetRoom[0].roomID.toString()] = tmp;
                            }
                        }
                        else {
                            let pr = (v.targetRoom[0].price * 100) / catInfo.avgPrice;
                            if (pr >= 95 && pr <= 105) {
                                let tmp = catInfo;
                                tmp.pr = pr;
                                p[v.targetRoom[0].roomID.toString()] = tmp;
                            }
                        }
                    });
                    return p;
                }, {})

                Object.keys(finalized).forEach(newKey => {
                    let catIndex = Object.keys(trainingData.cat).filter(catKey => {
                        return trainingData.cat[catKey].roomName.toLowerCase() == finalized[newKey].roomName.toLowerCase()
                    })
                    let child = trainingData.notCat.filter(notCat => {
                        return notCat !== undefined && notCat.roomID == newKey
                    })
                    let index = trainingData.notCat.indexOf(child[0]);
                    delete trainingData.notCat[index];
                    trainingData.cat[catIndex[0]].sub.push(child[0]);
                })
                cb(null, trainingData);

            });
            _Handler.untouch.forEach(room => {
                trainingData.notCat.push({
                    roomName: room.roomName,
                    price: room.roomDetails.b2CPrice,
                    boardCodeDescription: room.roomDetails.boardCodeDescription,
                    roomID: room.id,
                    supplierName: room.roomDetails.supplierName
                })
            })
            child.send({
                trainset: trainData, targetList: trainingData.notCat.map(elem => {
                    return {roomName: elem.roomName, roomID: elem.roomID}
                })
            })


        })


    }

}
Classifier.prototype.compareFunc = require('./compareFunctions/newCompare')
module.exports = Classifier;
