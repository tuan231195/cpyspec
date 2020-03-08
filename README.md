# cpyspec

> Copy files using spec

## Overview
- This tool is a wrapper of [cpy](https://github.com/sindresorhus/cpy) to provider a simpler interface to copy multiple files/directories at once
- Support progress reporting


## Install

```
$ npm install cpyspec
```

## Usage

```js
const { copy } = require('cpyspec');

(async () => {
	await copy({
	    verbose: true,
        progress: true,
        files: [
            {
                from: 'package.json',
                to: 'build/package.json'
            },
            {
                from: '**/*.js',
                to: 'build',
                context: 'src'
            }
        ]
    });
})();
```

## API

### cpy(copySpec)

Returns a `Promise<string[]>` with the destination file paths.

#### CopySpec

An object with the following options:

##### verbose

Type: boolean

Whether to display all copied files. Default to false

##### progress

Type: boolean

Whether to show progress bar while copying

##### files

Type: `CopyFile[]`

The files to copy

#### CopyFile

Specify how to copy the files. It has the following options:

##### from

Type: `string`

A string/glob pattern that matches one or more files to be copied

##### to

Type: `string`

A string to specify the destination directory or the destination file.
If you specify a file as an option. You could use the following token in the string:

- [name]: the original file name
- [ext]: the file extension

##### context

Type: `string`

Default: `process.cwd()`

Working directory to find source files.

##### overwrite

Type: `boolean`
Default: `true`

Whether to overwrite existing files.

##### flatten

Type: `boolean`
Default: `false`

Whether or not to preserve the directory structure

##### concurrency

Type: `number`
Default: `(os.cpus().length || 1) * 2`

Number of files being copied concurrently.

##### exclude

Type: `string | string[]`

Glob pattern(s) to specify which files to exclude when copying

## CLI tool

```
npm i -g cpyspec
cpyspec
```

It will look for the copy spec in a file named .cpyspec.json or the copySpec key in package.json

e.g.
```
// package.json
"copySpec": {
    "verbose": false,
    "progress": false,
    "files": []
}
```