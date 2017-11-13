/**
 * Created by roten on 10/6/17.
 */

module.exports = {
    loadDefualtsConfig: function (next) {
        Compareconfig.create({
            id: 'default',
            extraHotelsWords: ['standard', 'executive', 'deluxe', 'adjoining', 'lifestyle','lounge', 'access', 'business'],
            roomTypeWords: ['room', 'suite', 'penthouse', 'duplex'],
            bedTypeWords: ['king', 'twin', 'single', 'double', 'triple', 'bed', 'beds'],
            globalExtraHotelWordsPoint: 1,
            globalNumberPoint: 2,
            globalRoomTypePoint: 4,
            globalisedTypePoint: 4
        }, next);

    }
}