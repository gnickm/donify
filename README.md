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
myFunction(true)
    .then((result) => {
        // result is 'Success'
    });

myFunction(false)
    .catch((err) => {
        // err is 'Failure'
    });

// If you provide a done function, it gets called instead
myFunction(true, (err, result) => {
    // err is null, result is 'Success'
});

myFunction(false, (err, result) => {
    // err is 'Failure', result is undefined
});
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
having to do it all in one go. It also allows you to have older, callback-based
packages seamlessly call your Promise based functions. I found myself writing
this code over and over, so decided to simply pull it into a package with all
the tests and stuff.

## License

[Apache 2.0](LICENSE)
