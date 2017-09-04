const ASSERT = require('assert');

describe('API Specs', function () {
    const HTTP = require('http');
    let Acts = null;

    beforeEach(function () {
        Acts = require('./../index');
        Acts.createServer(__dirname, {
            server: {
                address: 'localhost',
                port: 8086,
                api: {
                    allowedMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'CUSTOM']
                }
            }
        });
    });

    afterEach(function () {
        Acts.shutdown();
        Acts = null;
    });

    it('testing GET Method', function (done) {
        Acts.start(function () {
            let req = HTTP.request({
                protocol: 'http:',
                host: 'localhost',
                port: 8086,
                path: '/api/test',
                method: 'GET'
            });
            req.on('response', resp => {
                ASSERT.equal(resp.statusCode, 200, 'invalid status code on GET');
                resp.on('data', d => {
                    let body = d.toString('utf8');
                    ASSERT.equal(JSON.parse(body), 'test ok', 'invalid request body');
                    done();
                });
            });
            req.on('abort', err => {
                done(err);
            });
            req.end();
        });
    });

    it('testing POST Method', function (done) {
        Acts.start(function () {
            let req = HTTP.request({
                protocol: 'http:',
                host: 'localhost',
                port: 8086,
                path: '/api/test',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            req.on('response', resp => {
                ASSERT.equal(resp.statusCode, 200, 'invalid status code on POST');
                resp.on('data', d => {
                    let body = d.toString('utf8');
                    ASSERT.deepEqual(JSON.parse(body), {hallo:'welt'}, 'invalid request body');
                    done();
                });
            });
            req.on('abort', err => {
                done(err);
            });
            req.end(JSON.stringify({hallo: 'welt'}));
        });
    });

    it('testing PUT Method', function (done) {
        Acts.start(function () {
            let req = HTTP.request({
                protocol: 'http:',
                host: 'localhost',
                port: 8086,
                path: '/api/test',
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            req.on('response', resp => {
                ASSERT.equal(resp.statusCode, 200, 'invalid status code on PUT');
                resp.on('data', d => {
                    let body = d.toString('utf8');
                    ASSERT.deepEqual(JSON.parse(body), {hallo:'welt'}, 'invalid request body');
                    done();
                });
            });
            req.on('abort', err => {
                done(err);
            });
            req.end(JSON.stringify({hallo: 'welt'}));
        });
    });

    it('testing PATCH Method', function (done) {
        Acts.start(function () {
            let req = HTTP.request({
                protocol: 'http:',
                host: 'localhost',
                port: 8086,
                path: '/api/test',
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            req.on('response', resp => {
                ASSERT.equal(resp.statusCode, 200, 'invalid status code on PATCH');
                resp.on('data', d => {
                    let body = d.toString('utf8');
                    ASSERT.deepEqual(JSON.parse(body), {hallo:'welt'}, 'invalid request body');
                    done();
                });
            });
            req.on('abort', err => {
                done(err);
            });
            req.end(JSON.stringify({hallo: 'welt'}));
        });
    });

    it('testing DELETE Method', function (done) {
        Acts.start(function () {
            let req = HTTP.request({
                protocol: 'http:',
                host: 'localhost',
                port: 8086,
                path: '/api/test',
                method: 'DELETE'
            });
            req.on('response', resp => {
                ASSERT.equal(resp.statusCode, 200, 'invalid status code on DELETE');
                resp.on('data', d => {
                    let body = d.toString('utf8');
                    ASSERT.deepEqual(JSON.parse(body), 'delete ok', 'invalid request body');
                    done();
                });
            });
            req.on('abort', err => {
                done(err);
            });
            req.end();
        });
    });
});