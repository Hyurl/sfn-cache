import * as redis from "redis";

declare class Cache {
    dsn: string;
    prefix: string;
    protected client: any;
    readonly connected: boolean;
    readonly closed: boolean;

    constructor(redisUrl?: string);
    constructor(options?: redis.ClientOpts);
    constructor(client?: redis.RedisClient);

    /**
     * Stores or updates a value.
     * @param ttl Time-To-Live (in milliseconds).
     */
    set(key: string, value: any, ttl?: number): Promise<any>;

    /** Retrieves a value by a given key. */
    get(key: string): Promise<any>;

    /** Deletes a key from the cache. */
    delete(key: string): Promise<void>;

    /** Clears all cache data entirely. */
    destroy(close?: boolean): Promise<void>;

    close(): void;
}

export = Cache;
// export default Cache;