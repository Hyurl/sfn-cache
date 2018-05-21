var Cache = require("./");
var assert = require("assert");
var redis = require("redis");

describe("new Cache()", function () {
    describe("new Cache()", function () {
        it("should create instance with no argument", function () {
            var cache = new Cache();
            assert.strictEqual(cache.connected, true);
            assert.strictEqual(cache.closed, false);
            cache.close();
        });
    });

    describe("new Cahce(redisUrl: string)", function () {
        it("should create instance with redis URL", function () {
            var cache = new Cache("redis://localhost:6379");
            assert.strictEqual(cache.connected, true);
            assert.strictEqual(cache.closed, false);
            assert.equal(cache.dsn, "redis://localhost:6379?prefix=sfn-cache:");
            cache.close();
        });
    });

    describe("new Cahce(options: redis.ClientOpts)", function () {
        it("should create instance with redis client options", function () {
            var cache = new Cache({ host: "localhost", port: 6379 });
            assert.strictEqual(cache.connected, true);
            assert.strictEqual(cache.closed, false);
            cache.close();
        });
    });

    describe("new Cahce(client: redis.RedisClient)", function () {
        it("should create instance with redis client", function () {
            var cache = new Cache(redis.createClient());
            assert.strictEqual(cache.connected, true);
            assert.strictEqual(cache.closed, false);
            cache.close();
        });
    });
});

describe("Cache.prototype.set()", function () {
    it("should set cache as expected", function (done) {
        var cache = new Cache();
        cache.set("abc", "1234567890").then(function (res) {
            assert.equal(res, "1234567890");
            return cache.get("abc");
        }).then(function (res) {
            assert.strictEqual(res, "1234567890");
        }).then(function () {
            cache.close();
            done();
        }).catch(function (err) {
            cache.close();
            done(err);
        });
    });
});

describe("Cache.prototype.get()", function () {
    it("should get cache as expected", function (done) {
        var cache = new Cache();
        cache.set("abc", { hello: "world" }).then(function (res) {
            assert.deepStrictEqual(res, { hello: "world" });
            return cache.get("abc");
        }).then(function (res) {
            assert.deepStrictEqual(res, { hello: "world" });
        }).then(function () {
            cache.close();
            done();
        }).catch(function (err) {
            cache.close();
            done(err);
        });
    });
});

describe("Cache.prototype.delete()", function () {
    it("should delete cache as expected", function (done) {
        var cache = new Cache();
        cache.set("abc", { hello: "world" }).then(function (res) {
            assert.deepStrictEqual(res, { hello: "world" });
            return cache.delete("abc");
        }).then(function () {
            return cache.get("abc");
        }).then(function (res) {
            assert.strictEqual(res, null);
        }).then(function () {
            cache.close();
            done();
        }).catch(function (err) {
            cache.close();
            done(err);
        });
    });
});

describe("Cache.prototype.destroy()", function () {
    it("should destroy cache as expected", function (done) {
        var cache = new Cache();
        cache.set("abc", { hello: "world" }).then(function () {
            return cache.set("abcd", 12345);
        }).then(function () {
            return cache.set("abcde", "Hello, World!");
        }).then(function () {
            return cache.destroy();
        }).then(function () {
            return cache.get("abc").then(function (res) {
                assert.strictEqual(res, null);
            });
        }).then(function (res) {
            return cache.get("abcd").then(function (res) {
                assert.strictEqual(res, null);
            });
        }).then(function () {
            return cache.get("abcde").then(function (res) {
                assert.strictEqual(res, null);
            });
        }).then(function () {
            cache.close();
            done();
        }).catch(function (err) {
            cache.close();
            done(err);
        });
    });
});

describe("Cache.prototype.close()", function () {
    it("should close the connection as expected", function () {
        var cache = new Cache();
        assert.strictEqual(cache.closed, false);
        cache.close();
        assert.strictEqual(cache.closed, true);
    });
});