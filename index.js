const Redis = require("redis");
const parse = require("parse-redis-url")(Redis).parse

/**
 * Simple Friendly Node.js Cache.
 */
class Cache {
    /**
     * Creates a cache channel.
     * @param {String|Object} [options] A redis url or an object sets the 
     *  connection information, or a redis client created by 
     *  `redis.createClient()`. If this argument is missing, then connect to 
     *  redis using default options.
     */
    constructor(options = {}) {
        options = typeof options == "string" ? parse(options) : options;
        var { host, port, password, db, prefix, setex } = options;

        if ('function' === typeof setex) {
            this.client = options;
        } else if (!port && !host) {
            this.client = new Redis.createClient();
            if (password)
                this.client.auth(password);
            if (db)
                this.client.select(db);
        } else {
            options.prefix = null;
            this.client = new Redis.createClient(port, host, options);
        }

        this.prefix = prefix || 'sfn-cache:';
    }

    /** `true` if the channel is open. */
    get connected() {
        return !this.closed;
    }

    /** `true` if the channel is closed. */
    get closed() {
        return this.client ? this.client.closing : true;
    }

    /**
     * Stores or updates a value.
     * @param {String} key 
     * @param {Any} value 
     * @param {Number} [ttl] 
     */
    set(key, value, ttl = 0) {
        return new Promise((resolve, reject) => {
            try {
                key = this.prefix + key;
                var _value = JSON.stringify(value);
                if (_value === undefined) {
                    resolve(null);
                } else if (ttl > 0) {
                    this.client.psetex(key, ttl, _value, (e) => {
                        e ? reject(e) : resolve(value);
                    });
                } else {
                    this.client.set(key, _value, (e) => {
                        e ? reject(e) : resolve(value);
                    });
                }
            } catch (e) {
                reject(e);
            }
        });
    }

    /**
     * Retrieves a value by a given key, if no value, `null` will be returned.
     * @param {String} key 
     */
    get(key) {
        key = this.prefix + key;
        return new Promise((resolve, reject) => {
            this.client.get(key, (e, data) => {
                if (e) {
                    reject(e)
                } else {
                    try {
                        data = data ? JSON.parse(data) : null;
                        resolve(data);
                    } catch (e) {
                        reject(e);
                    }
                }
            });
        });
    }

    /**
     * Deletes a key from the cache.
     * @param {String} key 
     */
    delete(key) {
        key = this.prefix + key;
        return new Promise((resolve, reject) => {
            this.client.del(key, (e, res) => {
                e ? reject(e) : resolve(res);
            });
        });
    }

    /**
     * Clears the cache entirely, the cache will be closed after calling this
     * method.
     */
    destroy() {
        return new Promise((resolve, reject) => {
            this.client.keys(this.prefix + "*", (e, data) => {
                if (e) {
                    reject(e);
                } else if (data.length) {
                    var del = (data) => {
                        var key = data.shift();
                        this.client.del(key, (e, res) => {
                            if (e) {
                                reject(e);
                            } else {
                                data.length ? del(data) : resolve(res);
                            }
                        });
                    };
                    del(data);
                } else {
                    resolve(null);
                }
            });
        }).then(() => {
            return this.close();
        });
    }

    /** Closes the cache channel. */
    close() {
        return this.client.quit();
    }
}

module.exports = Cache;