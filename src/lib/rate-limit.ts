interface RateLimitEntry {
    count: number;
    resetTime: number;
}

const cache = new Map<string, RateLimitEntry>();

export function rateLimit(key: string, limit: number = 60, windowMs: number = 60000) {
    const now = Date.now();
    const entry = cache.get(key);

    if (!entry || now > entry.resetTime) {
        cache.set(key, {
            count: 1,
            resetTime: now + windowMs
        });
        return { success: true, remaining: limit - 1, reset: now + windowMs };
    }

    if (entry.count >= limit) {
        return { success: false, remaining: 0, reset: entry.resetTime };
    }

    entry.count++;
    return { success: true, remaining: limit - entry.count, reset: entry.resetTime };
}

// Cleanup interval (every hour)
if (typeof global !== 'undefined') {
    setInterval(() => {
        const now = Date.now();
        for (const [key, value] of cache.entries()) {
            if (now > value.resetTime) {
                cache.delete(key);
            }
        }
    }, 3600000);
}
