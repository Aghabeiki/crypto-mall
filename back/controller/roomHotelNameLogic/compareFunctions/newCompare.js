/**
 * Created by roten on 7/12/17.
 */


let _ = require('lodash');

Array.prototype.arrayMatch = function (arrayB) {
    let arrayA = this;
    if (arrayB.length != arrayA.length) {
        return false;
    }
    else {
        let res = true;
        for (let i = 0; i < arrayB.length && res; i++) {
            res = res && (arrayA[i] == arrayB[i]);
        }
        return res;
    }

}
Array.prototype.removeDuplicate = function () {
    let that = this;
    return that.reduce((p, v) => {
        if (p.indexOf(v) == -1) {
            p.push(v);
        }
        return p;
    }, []);
}
Array.prototype.diffArray = function (arrayB) {
    let arrayFormatter = function (p, v) {
        let fined = false;
        for (let i = 0; i < p.length && !fined; i++) {
            if (p[i].key == v) {
                p[i].count++;
                fined = true;
            }
        }
        if (!fined) {
            p.push({key: v, count: 1});
        }
        return p;
    }
    let tmpArrayA = _.cloneDeep(this).sort().reduce(arrayFormatter, []);
    let tmpArrayB = _.cloneDeep(arrayB).sort().reduce(arrayFormatter, []);
    let diff = [];
    for (let i = 0; i < tmpArrayA.length; i++) {
        for (let j = 0; j < tmpArrayB.length; j++) {
            if (tmpArrayA[i] !== undefined && tmpArrayB[j] !== undefined && tmpArrayA[i].key == tmpArrayB[j].key) {
                diff.push({key: tmpArrayA[i].key, count: Math.abs(tmpArrayA[i].count - tmpArrayB[j].count)})
                delete tmpArrayB[j];
                delete tmpArrayA[i];
            }
        }
    }
    tmpArrayA.filter(elem => {
        return elem !== undefined
    }).forEach(elem => {
        diff.push(elem)
    });
    tmpArrayB.filter(elem => {
        return elem !== undefined
    }).forEach(elem => {
        diff.push(elem)
    })

    return diff.reduce((p, v) => {
        for (let i = 0; i < v.count; i++) {
            p.push(v.key);
        }
        return p;
    }, [])


}


let numberRoller = function (mode, matchPoint, globalPoint, diffLength, point) {
    let totalPoint = 0;
    switch (mode) {
        case 0:// easy
            totalPoint = matchPoint;
            break;
        case 1:// normal
            totalPoint = matchPoint - (globalPoint);
            break;
        case 2:// hard
            totalPoint = matchPoint - (globalPoint * diffLength);
            break;
        case 3 : // ferocity
            totalPoint = matchPoint - (globalPoint * diffLength * point);
            break;
        default:
            totalPoint = -100000000000000
            break;
    }

    return totalPoint;
}


pointCalculator = function (a, b, filterBy, globalPoint, point, rollChecker, mode) {
    let extractor = function (array) {
        return array.filter(elem => {
            return filterBy.indexOf(elem) !== -1
        }).sort()
    }
    let arrayA = extractor(_.cloneDeep(a));
    let arrayB = extractor(_.cloneDeep(b));
    if (arrayA.arrayMatch(arrayB)) {
        return arrayB.length * point * globalPoint;
    }
    else {
        let matchPoint = 0
        let diffLength = arrayA.diffArray(arrayB).length
        if (arrayA.removeDuplicate().sort().arrayMatch(arrayB.removeDuplicate().sort())) {
            // first all the index exist in different count
            matchPoint = arrayA.removeDuplicate().sort().length * point * globalPoint;

        }
        else {
            matchPoint = Math.abs(arrayB.length + arrayA.length - diffLength) / point

        }
        return rollChecker(mode, matchPoint, globalPoint, diffLength, point)
    }
}


module.exports = function (arrayA, arrayB, point, specialPoint, mode) { // 0 easy, 1 normal , 2 hard , 4 fsociety
    if (mode == undefined) {
        mode = {};
    }
    if (specialPoint === undefined) {
        specialPoint = 0;
    }
    if (point == undefined) {
        throw new Error("point is required, and should be more then 0");
    }
    let totalPointForPair = Math.abs(arrayA.length - arrayB.length) * specialPoint * -1;

    // working on number
    let numberPoint = pointCalculator(arrayA, arrayB, this.number, this.globalNumberPoint, 2, numberRoller, mode.n || 0)
    // working on extraHotelsWords
    let extraHotelsWordsPoint = pointCalculator(arrayA, arrayB, this.extraHotelsWords, this.globalExtraHotelWordsPoint, 2, numberRoller, mode.e || 0)

    let roomTypePoint = pointCalculator(arrayA, arrayB, this.roomTypeWords, this.globalRoomTypePoint, 2, numberRoller, mode.e || 0)

    let bedTypePoint = pointCalculator(arrayA, arrayB, this.bedTypeWords, this.globalisedTypePoint, 2, numberRoller, mode.e || 0)

    totalPointForPair += numberPoint + extraHotelsWordsPoint + roomTypePoint + bedTypePoint + specialPoint;

    return totalPointForPair;
}