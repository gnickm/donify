# donify
> The opposite of promisify - convert a promise into a done callback

## Usage
```javascript
const donify = require('donify');

const myFunction = function(flag, done) {
    var promise = new Promise((resolve, reject) => {
        if(flag) {
            return resolve('Success');
        }
        return reject('Failure');
    });

    return donify(promise, done);
};

// If done is not defined, it returns the underlying promise
var promiseSuccess = myFunction(true);
promiseSuccess.then((result) => {
    // result is 'Success'
});

var promiseSuccess = myFunction(false);
promiseSuccess.catch((err) => {
    // err is 'Failure'
});

// If you provide a done function, it gets called instead
var doneSuccess = myFunction(true, (err, result) => {
    // err is null, result is 'Success'
});
// doneSuccess is true

var doneFailure = myFunction(false, (err, result) => {
    // err is 'Failure', result is undefined
});
// doneFailure is true
```

## Installation
Install with [npm](http://github.com/isaacs/npm):

```bash
$ npm install donify
```

## Why
I can feel you judging this project, saying "For all things holy, why would you
ever want to do this?!?!?!" As it turns out, when refactoring a huge project
from callbacks to Promises, this is really helpful. By *donifying* your
functions, you can incrementally convert from callbacks to Promises without
having to do it all in one go. For example, say you have this legacy function:

```javascript
const myLegacyFunction = function(params, done) {
    someCallbackFunction(params, (err, results) => {
        done(err, results);
    });
};
```

You can easily rewrite it as:

```javascript
const donify = require('donify');
const {promisify} = require('util');

const myLegacyFunction = function(params, done) {
    var promise = promisify(someCallbackFunction)(params);

    return donify(promise, done);
};
```

This retains 100% backward compatibility for your existing code but allows you
to start refactoring to promises by eliminating the done callbacks as needed.
It also allows you to have older, callback-based packages seamlessly call your
Promise based functions.

I found myself writing this code over and over, so decided to simply pull it
into a package with all the tests and stuff.

## License

[Apache 2.0](LICENSE)
