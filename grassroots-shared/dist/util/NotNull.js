export function notNull(x, msg) {
    if (x === null) {
        throw new Error(msg);
    }
    return x;
}
