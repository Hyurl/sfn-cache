const Cache = require("./");

(async() => {
    try {
        var cache = new Cache(),
            data = await cache.set("a", [1, 2, 3], 10000),
            _data = await cache.get("a");
        console.log("Initial data:", data, "\n");
        console.log("Data retrieved from cache:", _data);
    } catch (e) {
        console.log(e);
    }
    cache.close();
})();