import cpy from 'cpy';
import { ReportNotifier } from 'src/utils/report';
import * as path from 'path';
import { formatTime } from 'src/utils/time';
import { flatten } from 'src/utils/array';
import isGlob from 'is-glob';
import * as fs from 'fs';

export type CopySpec = {
    verbose?: boolean;
    progress?: boolean;
    files: CopyFile[];
};

export type CopyFile = {
    from: string;
    to: string;
    context?: string;
    flatten?: boolean;
    overwrite?: boolean;
    exclude?: string[] | string;
    concurrency?: number;
};

const defaultCopySpec: CopySpec = {
    verbose: false,
    progress: false,
    files: [],
};

const defaultFileSpec: Partial<CopyFile> = {
    flatten: false,
    overwrite: true,
    exclude: [],
    context: process.cwd(),
};

export async function copy(copySpec: CopySpec) {
    const start = Date.now();
    copySpec = { ...defaultCopySpec, ...copySpec };
    const reportNotifier = new ReportNotifier();
    const result = await Promise.all(
        copySpec.files.map(async fileSpec => {
            fileSpec = { ...defaultFileSpec, ...fileSpec };
            if (!Array.isArray(fileSpec.exclude)) {
                fileSpec.exclude = [fileSpec.exclude as string];
            }
            const fileValidationResult = validateFile(
                fileSpec.from,
                fileSpec.context
            );
            if (!fileValidationResult.exists) {
                if (copySpec.verbose) {
                    console.error(`File ${fileSpec.from} does not exist`);
                }
                return;
            }
            const destinationBaseName = path.basename(fileSpec.to);
            const sourceBaseName = path.basename(fileSpec.from);
            const isDir =
                !path.extname(fileSpec.to) &&
                !isUsingPlaceholder(fileSpec.to) &&
                (!fileValidationResult.isFile ||
                    sourceBaseName !== destinationBaseName);
            const dest = isDir
                ? path.resolve(fileSpec.to)
                : path.dirname(path.resolve(fileSpec.to));
            const promise = cpy(
                [
                    fileSpec.from,
                    ...(fileSpec.exclude || []).map(
                        fileToExclude => `!${fileToExclude}`
                    ),
                ],
                dest,
                {
                    rename: basename => {
                        const newFileName = isDir
                            ? basename
                            : path.basename(fileSpec.to);
                        const fileExt = path.extname(basename);
                        const fileName = path.basename(basename, fileExt);
                        return newFileName
                            .replace(/\[name]/g, fileName)
                            .replace(/\[ext]/g, fileExt.substr(1));
                    },
                    cwd: fileSpec.context,
                    overwrite: fileSpec.overwrite,
                    parents: !fileSpec.flatten,
                    ignoreJunk: true,
                    concurrency: fileSpec.concurrency,
                }
            );
            await promise.on('progress', progressData => {
                reportNotifier.onProgress(
                    fileSpec,
                    progressData,
                    !!copySpec.progress
                );
            });

            return promise;
        })
    )
        .then(result => {
            reportNotifier.stop();
            const copiedFiles = flatten(result.filter(element => element));
            if (copySpec.verbose) {
                for (const copiedFile of copiedFiles) {
                    console.info(`Copied ${copiedFile}`);
                }
            }
            return copiedFiles;
        })
        .catch(() => {
            reportNotifier.stop();
        });
    const end = Date.now();
    if (copySpec.verbose) {
        console.info(
            `Copied ${reportNotifier.totalFiles()} in ${formatTime(
                end - start
            )}`
        );
    }
    return result;
}

function isUsingPlaceholder(name) {
    const placeholders = ['[name]', '[ext]'];
    return placeholders.some(placeholder => name.includes(placeholder));
}

function validateFile(from, context = process.cwd()) {
    const isGlobPattern = isGlob(from);
    if (!isGlobPattern) {
        try {
            return {
                exists: true,
                isFile: fs.statSync(path.resolve(context, from)).isFile(),
            };
        } catch (e) {
            return {
                exists: false,
            };
        }
    }
    return {
        exists: true,
    };
}
