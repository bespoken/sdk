export function decrypt(value: any): string;
export function encrypt(value: any): string;
export const locks: {};
export function mutexAcquire(lockName?: string, waitTime?: number, attempt?: number, maxAttempts?: number): any;
export function mutexRelease(lockName?: string): Promise<void>;
export function sleep(sleepTime: any): Promise<any>;
