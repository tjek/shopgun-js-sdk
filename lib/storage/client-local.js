const prefixKey = 'sgn-';

const storage = (() => {
    try {
        const storage = window.localStorage;

        storage[`${prefixKey}test-storage`] = 'foobar';
        delete storage[`${prefixKey}test-storage`];

        return storage;
    } catch (error) {
        return {};
    }
})();

export function get(key) {
    try {
        return JSON.parse(storage[`${prefixKey}${key}`]);
    } catch (error) {}
}

export function set(key, value) {
    try {
        storage[`${prefixKey}${key}`] = JSON.stringify(value);
    } catch (error) {}
}
