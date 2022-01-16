/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-magic-numbers */
'use strict';

const async          = require('async');
const Bluebird       = require('bluebird');
const chai           = require('chai');
const chaiAsPromised = require('chai-as-promised');

const donify = require('../lib/index');

// --------------------------------------------------------------------------

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('donify()', () => {
    describe('Positive use cases', () => {
        it('should execute done function when provided', (done) => {
            var promise = new Promise((resolve) => resolve('foo'));
            var retval = donify(promise, (err, result) => {
                expect(err).to.be.null;
                expect(result).to.equal('foo');
                done();
            });

            expect(retval).to.be.true;
        });

        it('should send the final result of a long promise chain to done', (done) => {
            var promise = Promise.resolve('This')
                .then(() => Promise.resolve('should'))
                .then(() => Promise.resolve('only'))
                .then(() => Promise.resolve('return'))
                .then(() => Promise.resolve('the'))
                .then(() => Promise.resolve('end'))
                .then(() => Promise.resolve('to'))
                .then(() => Promise.resolve('done'));
            var retval = donify(promise, (err, result) => {
                expect(err).to.be.null;
                expect(result).to.equal('done');
                done();
            });

            expect(retval).to.be.true;
        });

        it('should pass rejections as the err object to done', (done) => {
            var promise = new Promise((resolve, reject) => reject('fail'));
            var retval = donify(promise, (err, result) => {
                expect(err).to.equal('fail');
                expect(result).to.be.undefined;
                done();
            });

            expect(retval).to.be.true;
        });

        it('should return err to done on the first reject', (done) => {
            var promise = Promise.resolve('This')
                .then(() => Promise.resolve('should'))
                .then(() => Promise.reject('fail'))
                .then(() => Promise.resolve('on'))
                .then(() => Promise.resolve('the'))
                .then(() => Promise.resolve('first'))
                .then(() => Promise.reject('reject'));
            var retval = donify(promise, (err, result) => {
                expect(err).to.equal('fail');
                expect(result).to.be.undefined;
                done();
            });

            expect(retval).to.be.true;
        });

        it('should return a promise if done is excluded', () => {
            var retval = donify(Promise.resolve('foo'));

            expect(retval).to.be.a('Promise');
            return expect(retval).to.eventually.equal('foo');
        });

        it('should handle rejections normally if done is excluded', () => {
            var retval = donify(Promise.reject('fail'));

            expect(retval).to.be.a('Promise');
            return expect(retval).to.eventually.be.rejectedWith('fail');
        });
    });

    describe('Edge cases', () => {
        it('should ignore any non-function value for done', (done) => {
            expect(donify(Promise.resolve('foo'), 123)).to.eventually.equal('foo');
            expect(donify(Promise.resolve('foo'), {})).to.eventually.equal('foo');
            expect(donify(Promise.resolve('foo'), 'blah')).to.eventually.equal('foo');
            expect(donify(Promise.resolve('foo'), null)).to.eventually.equal('foo');
            done();
        });

        it('should reject any non-Promise value for promise', (done) => {
            const REJECT_ERROR =  new Error('First parameter in donify() must be a Promise');

            expect(donify(123)).to.eventually.be.rejectedWith(REJECT_ERROR);
            expect(donify({})).to.eventually.be.rejectedWith(REJECT_ERROR);
            expect(donify('blah')).to.eventually.be.rejectedWith(REJECT_ERROR);
            expect(donify(null)).to.eventually.be.rejectedWith(REJECT_ERROR);
            expect(donify(function() {
                // Stuff
            })).to.eventually.be.rejectedWith(REJECT_ERROR);
            done();
        });

        it('should call done(err) for any non-Promise value for promise and a done is specified', (done) => {
            async.each([
                123,
                {},
                'blah',
                null,
                function() {
                    // Stuff
                }
            ], (badPromise, next) => {
                donify(badPromise, (err, result) => {
                    expect(err).to.be.an('Error');
                    expect(err.message).to.equal('First parameter in donify() must be a Promise');
                    expect(result).to.be.undefined;
                    next();
                });
            }, done);
        });

        it('should handle other flavors of promises', () => {
            var retval = donify(new Bluebird((resolve) => resolve('foo')));

            return expect(retval).to.eventually.equal('foo');
        });

        it('should execute done with other flavors of promise', (done) => {
            var promise = new Bluebird((resolve) => resolve('foo'));
            var retval = donify(promise, (err, result) => {
                expect(err).to.be.null;
                expect(result).to.equal('foo');
                done();
            });

            expect(retval).to.be.true;
        });

        it('should handle async promises', () => {
            var retval = donify(async.times(5, (ndx, next) => next(null, ndx)));

            return expect(retval).to.eventually.have.members([0, 1, 2, 3, 4]);
        });

        it('should handle async promise with provided done', (done) => {
            donify(
                async.times(5, (ndx, next) => next(null, ndx)),
                function(err, result) {
                    expect(err).to.be.null;
                    expect(result).to.have.members([0, 1, 2, 3, 4]);
                    done();
                }
            );
        });

    });
});
