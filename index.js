const redis = require("redis");
const parse = require("parse-redis-url")(redis).parse;

/**
 * Simple Friendly Node.js Cache.
 */
class Cache {
    /**
     * Creates a cache channel.
     * @param {string|object} [options] A redis url or an object sets the 
     *  connection information, or a redis client created by 
     *  `redis.createClient()`. If this argument is missing, then connect to 
     *  redis using default options.
     */
    constructor(arg = {}) {
        if (typeof arg.setex == "function") { // redis client instance
            this.client = arg;
        } else {
            let options = typeof arg == "string" ? parse(arg) : arg;
            let { host, port, password, db, prefix } = options;

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

    /** `true` if the channel is open. */
    get connected() {
        return !this.closed;
    }

    /** `true` if the channel is closed. */
    get closed() {
        return this.client ? this.client["closing"] : false;
    }

    /**
     * Stores or updates a value.
     * @param {string} key 
     * @param {any} value 
     * @param {number} [ttl] 
     */
    set(key, value, ttl = 0) {
        return new Promise((resolve, reject) => {
            try {
                key = this.prefix + key;
                let _value = JSON.stringify(value);

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
     * Retrieves a value by a given key.
     * @param {string} key 
     */
    get(key) {
        return new Promise((resolve, reject) => {
            this.client.get(this.prefix + key, (e, data) => {
                if (e) {
                    reject(e)
                } else {
                    try {
                        resolve(data ? JSON.parse(data) : null);
                    } catch (e) {
                        reject(e);
                    }
                }
            });
        });
    }

    /**
     * Deletes a key from the cache.
     * @param {string} key 
     */
    delete(key) {
        return new Promise((resolve, reject) => {
            this.client.del(this.prefix + key, (e, res) => {
                e ? reject(e) : resolve(null);
            });
        });
    }

    /** Clears all cache data entirely. */
    destroy(close = false) {
        return new Promise((resolve, reject) => {
            this.client.keys(this.prefix + "*", (e, data) => {
                if (e) {
                    reject(e);
                } else if (data.length) {
                    let del = (data) => {
                        let key = data.shift();
                        
                        this.client.del(key, (e, res) => {
                            if (e) {
                                reject(e);
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
        }).then(() => {
            return close ? this.close() : undefined;
        });
    }

    /** Closes the cache channel. */
    close() {
        delete Cache.Clients[this.dsn];
        this.client.quit();
    }
}

Cache.Clients = {};

module.exports = Cache;