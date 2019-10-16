
// eslint-disable-next-line no-extend-native
Object.defineProperties(Array.prototype, {
    flatMap: {
        value(lambda) {
            return Array.prototype.concat.apply([], this.map(lambda));
        },
        writeable:  false,
        enumerable: false
    }
});

function Option(val) {
    const value = val;

    const map = (fn) => {
        if (value !== undefined && value !== null) {
            return Some(fn(value));
        }

        return None;
    };

    const getOrElse = (defaultVal) => {
        if (value !== undefined && value !== null) {
            return value;
        }

        return defaultVal;
    };

    const isDefined = () => value !== undefined && value !== null;

    const isNotDefined = () => !isDefined();

    return Object.freeze({
        map,
        getOrElse,
        isDefined,
        isNotDefined,
    });
}

const None = Option();

function Some(value) {
    if (typeof value !== 'undefined') {
        return Option(value);
    }
    return None;
}

const applyForStatus = (action, callback) => (data) => {
    if (!data || Object.prototype.toString.call(data) !== '[object Object]') return {};

    if (!data.status || data.status !== action) return data;

    return callback(data.data);
};

const filterByStatus = action => (data) => {
    if (!data || Object.prototype.toString.call(data) !== '[object Object]') return false;

    if (!data.status || data.status !== action) return false;

    return true;
};

const filter = callback => (...args) => !!callback(...args);

const pipe = (...fns) => startVal => fns.reduce((v, f) => f(v), startVal);

const isEmpty = val => {
    if (val === null || val === undefined || val !== val)
        return true;

    if (['[]', {}].includes(JSON.stringify(val)))
        return true;

    if (val === '')
        return true;

    return false;
};

module.exports = {
    Option,
    None,
    Some,
    applyForStatus,
    filterByStatus,
    filter,
    pipe,
    isEmpty,
};
