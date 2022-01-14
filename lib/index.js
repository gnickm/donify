'use strict';

module.exports = function(promise, done) {
    if(promise instanceof Promise) {
        if(done && done instanceof Function) {
            promise.then((results) => done(null, results)).catch(done);
            return true;
        }
        return promise;
    }

    return Promise.reject('First parameter in donify() must be a Promise');
};
