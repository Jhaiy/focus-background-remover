import { ApiError } from '../utils/api.error.ts';

export function createLimiter(maxConcurrentRequests: number) {
    let activeRequests = 0;
    return async function limit<T>(fn: () => Promise<T>): Promise<T> {
        if (activeRequests >= maxConcurrentRequests) {
            throw new ApiError(503, 'Server busy, try again shortly');
        }
        activeRequests++;
        try {
            return await fn();
        } finally {
            activeRequests--;
        }
    };
}
