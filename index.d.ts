declare class Cache {
    dsn: string;
    prefix: string;
    protected client: any;
    readonly connected: boolean;
    readonly closed: boolean;

    /**
     * @param dsn A redis url.
     */
    constructor(dsn?: string);

    constructor(options?: {
        [x: string]: any,
        host: string,
        port?: number,
        password?: string,
        db?: string | number,
        prefix?: string
    });

    /**
     * Stores or updates a value.
     * @param ttl Time-To-Live (in milliseconds).
     */
    set(key: string, value: any, ttl?: number): Promise<any>;

    /** Retrieves a value by a given key. */
    get(key: string): Promise<any>;

    /** Deletes a key from the cache. */
    delete(key: string): Promise<void>;

    /**
     * Clears the cache entirely, the cache will be closed after calling this
     * method.
     */
    destroy(): Promise<void>;

    close(): void;
}

export = Cache;