import fs from 'fs';
import { promisify } from 'util';

const readFileAsync = promisify(fs.readFile).bind(fs);
const existsAsync = promisify(fs.exists).bind(fs);

export function read(file) {
    return readFileAsync(file, {
        encoding: 'utf-8',
    });
}

export function exists(file) {
    return existsAsync(file);
}
