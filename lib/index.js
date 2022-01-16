'use strict';

// Per spec, a legit promise has a .then() function and that's about it...
const isPromise = function(value) {
    return Boolean(value && typeof value.then === 'function');
};

module.exports = function(promise, done) {
    if(done && done instanceof Function) {
        if(isPromise(promise)) {
            promise.then((results) => done(null, results)).catch(done);
            return true;
        }

        done(new Error('First parameter in donify() must be a Promise'));
        return false;
    }

    if(isPromise(promise)) {
        return promise;
    }
    return Promise.reject(new Error('First parameter in donify() must be a Promise'));
};
