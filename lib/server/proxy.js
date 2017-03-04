/* eslint no-console: ["error", { allow: ["warn", "error", "log"] }] */

var port = 8889;
var Proxy = require('http-mitm-proxy');
var stub = require('./stub');
var proxy;
var stopped = false;

module.exports = {
    start() {
        proxy = Proxy();

        proxy.onError(function(ctx, err, errorKind) {
            if (stopped) {
                return;
            }
            // ctx may be null
            var url = (ctx && ctx.clientToProxyRequest) ? ctx.clientToProxyRequest.url : '';
            console.error(errorKind + ' on ' + url + ':', err);
        });

        proxy.onRequest(function(ctx) {
            var stubForCurrentScheme = ctx.isSSL ? stub.https : stub.http;
            var mw = stubForCurrentScheme(ctx.clientToProxyRequest);

            mw.apply(this, arguments);
        });

        return new Promise((resolve, reject) => {
            proxy.listen({ port: port, silent: true }, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    },

    stop() {
        stopped = true;
        proxy.close();
    }
};