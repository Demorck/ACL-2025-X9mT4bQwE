export async function mergeRenderOptionsMiddleware(req, res, next) {
    const originalRender = res.render;

    res.render = function (view, options = {}, callback) {
        options = { ...res.locals, ...options };
        return originalRender.call(this, view, options, callback);
    };

    next();
}