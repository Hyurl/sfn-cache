var redis = require("redis");
var parse = require("parse-redis-url")(redis).parse;

/**
 * Simple Friendly Node.js Cache.
 */
var Cache = (function () {
    /**
     * Creates a cache channel.
     * @param {string|object} [options] A redis url or an object sets the 
     *  connection information, or a redis client created by 
     *  `redis.createClient()`. If this argument is missing, then connect to 
     *  redis using default options.
     */
    function Cache(arg) {
        arg = arg || {};

        if (typeof arg.setex == "function") { // redis client instance
            this.client = arg;
        } else {
            var options = typeof arg == "string" ? parse(arg) : arg,
                host = options.host,
                port = options.port,
                password = options.password,
                db = options.db,
                prefix = options.prefix;

            host = host || "127.0.0.1";
            port = port || 6379;
            this.prefix = prefix || 'sfn-cache:';

            // Data Source Name.
            this.dsn = "redis://";

            if (password) this.dsn += `anonymous:${password}@`;

            this.dsn += host + ":" + port;

            if (db) this.dsn += `/${db}`;

            if (this.prefix) this.dsn += `?prefix=${this.prefix}`;

            // Same DSN refers to same client.
            if (!Cache.Clients[this.dsn]) {
                options.prefix = null;
                Cache.Clients[this.dsn] = redis.createClient(port, host, options);
            }

            this.client = Cache.Clients[this.dsn];
        }
    }

    Object.defineProperties(Cache.prototype, {
        connected: {
            enumerable: true,
            configurable: true,
            get: function () {
                return !this.closed;
            }
        },
        closed: {
            enumerable: true,
            configurable: true,
            get: function () {
                return this.client ? this.client["closing"] : false;
            }
        }
    });

    /**
     * Stores or updates a value.
     * @param {string} key 
     * @param {any} value 
     * @param {number} [ttl] 
     */
    Cache.prototype.set = function (key, value, ttl) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            try {
                key = _this.prefix + key;
                var _value = JSON.stringify(value);

                if (_value === undefined) {
                    resolve(null);
                } else if (ttl > 0) {
                    _this.client.psetex(key, ttl, _value, function (err) {
                        err ? reject(err) : resolve(value);
                    });
                } else {
                    _this.client.set(key, _value, function (err) {
                        err ? reject(err) : resolve(value);
                    });
                }
            } catch (err) {
                reject(err);
            }
        });
    }

    /**
     * Retrieves a value by a given key.
     * @param {string} key 
     */
    Cache.prototype.get = function (key) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.client.get(_this.prefix + key, function (err, data) {
                if (err) {
                    reject(err)
                } else {
                    try {
                        resolve(data ? JSON.parse(data) : null);
                    } catch (err) {
                        reject(err);
                    }
                }
            });
        });
    }

    /**
     * Deletes a key from the cache.
     * @param {string} key 
     */
    Cache.prototype.delete = function (key) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.client.del(_this.prefix + key, function (err, res) {
                err ? reject(err) : resolve(null);
            });
        });
    }

    /** Clears all cache data entirely. */
    Cache.prototype.destroy = function (close) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.client.keys(_this.prefix + "*", function (err, data) {
                if (err) {
                    reject(err);
                } else if (data.length) {
                    var del = function (data) {
                        var key = data.shift();

                        _this.client.del(key, function (err, res) {
                            if (err) {
                                reject(err);
                            } else {
                                data.length ? del(data) : resolve(null);
                            }
                        });
                    };
                    del(data);
                } else {
                    resolve(null);
                }
            });
        }).then(function () {
            return close ? this.close() : undefined;
        });
    }

    /** Closes the cache channel. */
    Cache.prototype.close = function () {
        delete Cache.Clients[this.dsn];
        this.client.quit();
    }

    Cache.Clients = {};

    return Cache;
}());

module.exports = Cache;
module.exports.default = Cache;