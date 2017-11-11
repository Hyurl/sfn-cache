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

- `new Cache([options: any])` Creates a cache channel.
- `cache.set(key: string, value: any[, ttl: number])` Stores or updates a 
    value.
- `cache.get(key: string)` Retrieves a value by a given key.
- `cache.delete(key: string)` Deletes a key from the cache.
- `cache.destroy()` Clears the cache entirely.
- `cache.close()` Closes the cache channel, if you don't close the channel, 
    the program will hang until the redis server closes the connection.

### new Cache()

- `[options]` A redis URL or an object sets the connection information, or a 
    redis client created by `redis.createClient()`. If pass an object, the 
    object can carry an optional `prefix`. If this argument is missing, then 
    connect to redis using default options.

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
const client = redis.createClient();
var cache = new Cache(client);
```

### cache.set()

- `key` A key string.
- `value` Any type that can be serialized to JSON.
- `[ttl]` Time-To-Live, a millisecond number, default is `0`, means persist.

See the example given above.

### cache.destroy()

Returns a promise, if this method is called, then all the cache data this 
instance connected to will be destroyed, so be careful when you are using it.
The cache **channel will be closed automatically** after calling this method, 
so no need to call `cache.close()` again.