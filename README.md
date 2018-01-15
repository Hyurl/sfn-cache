# SFN-Cache

**Simple Friendly Node.js Cache.**

This package relies on Redis, so you must have a Redis server started first.

## Install

```sh
npm install sfn-cache --save
```

## Import

```javascript
const Cache = require("sfn-cache");
```

## Example

```javascript
(async() => {
    try {
        var cache = new Cache(),
            data = await cache.set("a", [1, 2, 3], 10000), // TTL 10s. 
            _data = await cache.get("a");
        // data is [1,2,3]
        console.log("Initial data:", data, "\n");
        // _data should be the same as data.
        console.log("Data retrieved from cache:", _data);
    } catch (e) {
        console.log(e);
    }
    cache.close();
})();
```

## API

- `new Cache(dsn?: string)` Creates a cache channel with a redis URL.
- `new Cache(options?: { [x: string]: any })`
    - `options` All available options for `redis.createClient()`.

- `cache.set(key: string, value: any, ttl?: number): Promise<any>` Stores or 
    updates a value.
    - `ttl` Time-To-Live (in milliseconds).

- `cache.get(key: string): Promise<any>` Retrieves a value by a given key.
- `cache.delete(key: string): Promise<void>` Deletes a key from the cache.
- `destroy(): Promise<void>` Clears the cache entirely, the cache will be 
    closed after calling this method.
- `close(): void` Closes the cache channel, if you don't close the channel, 
    the program will hang until the redis server closes the connection.
- `cache.connected` If the channel is open, it will be `true`.
- `cache.closed` Opposite to `connected`.

### new Cache()

```javascript
// Simplest way:
var cache = new Cache();

// Pass a redis URL:
var cache = new Cache("redis://127.0.0.1:6379");

// Pass an object:
var cache = new Cache({
    host: "127.0.0.1",
    port: 6379,
    password: "my-p@ssw0rd",
    database: 1,
    prefix: "my-cache:"
});

// Pass a redis client:
const redis = require("redis");
var client = redis.createClient();
var cache = new Cache(client);
```