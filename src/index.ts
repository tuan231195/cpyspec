import cpy from 'cpy';
import { ReportNotifier } from 'src/utils/report';
import * as path from 'path';
import { formatTime } from 'src/utils/time';

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
    overwrite: false,
    exclude: [],
    context: process.cwd(),
};

export async function copy(copySpec: CopySpec) {
    const start = Date.now();
    copySpec = { ...defaultCopySpec, ...copySpec };
    const reportNotifier = new ReportNotifier();
    await Promise.all(
        copySpec.files.map(async fileSpec => {
            fileSpec = { ...defaultFileSpec, ...fileSpec };
            if (!Array.isArray(fileSpec.exclude)) {
                fileSpec.exclude = [fileSpec.exclude as string];
            }
            const isDir = !path.extname(fileSpec.to);
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
            if (copySpec.progress) {
                const copiedFiles = await promise.on(
                    'progress',
                    progressData => {
                        reportNotifier.onProgress(fileSpec, progressData);
                    }
                );
                if (copySpec.verbose) {
                    for (const copiedFile of copiedFiles) {
                        console.info(`Copied ${copiedFile}`);
                    }
                }
            }

            return promise;
        })
    );
    const end = Date.now();
    if (copySpec.verbose) {
        console.info(
            `Copied ${reportNotifier.totalFiles()} in ${formatTime(
                end - start
            )}`
        );
    }
}
