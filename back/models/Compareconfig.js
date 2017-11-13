/**
 * Created by roten on 10/6/17.
 */

module.exports = {
    hashKey: 'id',
    schema: {
        id: Joi.string(),
        extraHotelsWords: dynamo.types.stringSet(),
        roomTypeWords: dynamo.types.stringSet(),
        bedTypeWords: dynamo.types.stringSet(),
        globalExtraHotelWordsPoint: Joi.number(),
        globalNumberPoint: Joi.number(),
        globalRoomTypePoint: Joi.number(),
        globalisedTypePoint: Joi.number()
    }
}