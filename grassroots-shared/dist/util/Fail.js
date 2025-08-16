export function fail(msg) {
    throw new Error(msg !== null && msg !== void 0 ? msg : "Unexpected failure");
}
