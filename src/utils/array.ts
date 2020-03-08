export function sum<T>(array: Array<T> | IterableIterator<T>, key: keyof T) {
    return [...array].reduce((aggregated, element) => {
        return aggregated + (element[key] as any);
    }, 0);
}

export function flatten(arr) {
    return [].concat(...arr);
}
