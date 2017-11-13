/**
 * Created by roten on 10/9/17.
 */

module.exports = {
    hashKey: 'id',
    schema: {
        id: Joi.string(),
        configTag:Joi.string(),
        input: Joi.array(),
        output: Joi.object()
    }
}