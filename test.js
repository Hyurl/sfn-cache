const Cache = require("./");
const assert = require("assert");
const redis = require("redis");

describe("new Cache()", () => {
    describe("new Cache()", () => {
        it("should create instance with no argument", () => {
            let cache = new Cache();
            assert.strictEqual(cache.connected, true);
            assert.strictEqual(cache.closed, false);
            cache.close();
        });
    });

    describe("new Cahce(redisUrl: string)", () => {
        it("should create instance with redis URL", () => {
            let cache = new Cache("redis://localhost:6379");
            assert.strictEqual(cache.connected, true);
            assert.strictEqual(cache.closed, false);
            assert.equal(cache.dsn, "redis://localhost:6379?prefix=sfn-cache:");
            cache.close();
        });
    });

    describe("new Cahce(options: redis.ClientOpts)", () => {
        it("should create instance with redis client options", () => {
            let cache = new Cache({ host: "localhost", port: 6379 });
            assert.strictEqual(cache.connected, true);
            assert.strictEqual(cache.closed, false);
            cache.close();
        });
    });

    describe("new Cahce(client: redis.RedisClient)", () => {
        it("should create instance with redis client", () => {
            let cache = new Cache(redis.createClient());
            assert.strictEqual(cache.connected, true);
            assert.strictEqual(cache.closed, false);
            cache.close();
        });
    });
});

describe("Cache.prototype.set()", () => {
    it("should set cache as expected", (done) => {
        let cache = new Cache();
        cache.set("abc", "1234567890").then(res => {
            assert.equal(res, "1234567890");
            return cache.get("abc");
        }).then(res => {
            assert.strictEqual(res, "1234567890");
        }).then(() => cache.close()).then(done).catch(err => {
            cache.close();
            done(err);
        });
    });
});

describe("Cache.prototype.get()", () => {
    it("should get cache as expected", (done) => {
        let cache = new Cache();
        cache.set("abc", { hello: "world" }).then(res => {
            assert.deepStrictEqual(res, { hello: "world" });
            return cache.get("abc");
        }).then(res => {
            assert.deepStrictEqual(res, { hello: "world" });
        }).then(() => cache.close()).then(done).catch(err => {
            cache.close();
            done(err);
        });
    });
});

describe("Cache.prototype.delete()", () => {
    it("should delete cache as expected", (done) => {
        let cache = new Cache();
        cache.set("abc", { hello: "world" }).then(res => {
            assert.deepStrictEqual(res, { hello: "world" });
            return cache.delete("abc");
        }).then(() => {
            return cache.get("abc");
        }).then(res => {
            assert.strictEqual(res, null);
        }).then(() => cache.close()).then(done).catch(err => {
            cache.close();
            done(err);
        });
    });
});

describe("Cache.prototype.destroy()", () => {
    it("should destroy cache as expected", (done) => {
        let cache = new Cache();
        cache.set("abc", { hello: "world" }).then(() => {
            return cache.set("abcd", 12345);
        }).then(() => {
            return cache.set("abcde", "Hello, World!");
        }).then(() => {
            return cache.destroy();
        }).then(() => {
            return cache.get("abc").then(res => {
                assert.strictEqual(res, null);
            });
        }).then(res => {
            return cache.get("abcd").then(res => {
                assert.strictEqual(res, null);
            });
        }).then(() => {
            return cache.get("abcde").then(res => {
                assert.strictEqual(res, null);
            });
        }).then(() => cache.close()).then(done).catch(err => {
            cache.close();
            done(err);
        });
    });
});

describe("Cache.prototype.close()", () => {
    it("should close the connection as expected", () => {
        let cache = new Cache();
        assert.strictEqual(cache.closed, false);
        cache.close();
        assert.strictEqual(cache.closed, true);
    });
});