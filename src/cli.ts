#! /usr/bin/env node
import { exists, read } from 'src/utils/files';
import * as path from 'path';
import { CopySpec, copy } from 'src/index';

const SPEC_FILE = '.cpyspec.json';

async function run() {
    const copySpec = await getCopySpec();
    if (!copySpec) {
        console.log('No spec found!');
        process.exit(0);
    }
    return copy(copySpec);
}

run()
    .then(() => console.info('Completed!'))
    .catch(e => {
        console.error(`Failed to copy`, e);
    });

async function getCopySpec() {
    let copySpec: CopySpec | null = null;
    if (await exists(SPEC_FILE)) {
        copySpec = JSON.parse(await read(SPEC_FILE));
    } else if (await exists('package.json')) {
        const packageJson = require(path.resolve(
            process.cwd(),
            'package.json'
        ));
        copySpec = packageJson.copySpec;
    }
    return copySpec;
}
