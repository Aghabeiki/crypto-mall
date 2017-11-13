/**
 * Created by roten on 7/25/17.
 */

module.exports = function (req, res, next) {
    const basePath = req.app.locals.app.basePath;
    if (basePath === undefined) return next();
    else if (basePath == '') return next()
    else if (req.url.startsWith(basePath)) {
        req.url = req.url.replace(basePath, '')
        next();
    }
    else {
        if (req.method.toLowerCase() === 'get') {
            next();
        }
        else {
            res.status(404).json({ error_message: 'route not found.' });
        }
    }

}