import { CopyFile } from 'src/index';
import { ProgressData } from 'cpy';
import { sum } from 'src/utils/array';

export class ReportNotifier {
    private progressMap: Map<CopyFile, ProgressData>;
    constructor() {
        this.progressMap = new Map<CopyFile, ProgressData>();
    }

    onProgress(copyFileSpec: CopyFile, progressData: ProgressData) {
        const oldProgressData = this.progressMap.get(copyFileSpec);
        this.progressMap.set(copyFileSpec, progressData);
        if (
            oldProgressData?.completedFiles != progressData.completedFiles ||
            oldProgressData?.totalFiles != progressData.totalFiles
        ) {
            this.report();
        }
    }

    report() {
        const totalFiles = this.totalFiles();
        const totalCopiedFiles = this.totalCopiedFiles();
        console.info(`Copied ${totalCopiedFiles}/${totalFiles}`);
    }
    totalFiles() {
        return sum(this.progressMap.values(), 'totalFiles');
    }

    totalCopiedFiles() {
        return sum(this.progressMap.values(), 'completedFiles');
    }
}
