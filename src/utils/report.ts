import { CopyFile } from 'src/index';
import { ProgressData } from 'cpy';
import { sum } from 'src/utils/array';
import cliProgress from 'cli-progress';

export class ReportNotifier {
    private progressMap: Map<CopyFile, ProgressData>;
    private cliProgress: cliProgress.SingleBar;
    private started: boolean;
    constructor() {
        this.progressMap = new Map<CopyFile, ProgressData>();
        this.cliProgress = new cliProgress.SingleBar(
            {
                clearOnComplete: true,
            },
            cliProgress.Presets.shades_classic
        );
        this.started = false;
    }

    onProgress(
        copyFileSpec: CopyFile,
        progressData: ProgressData,
        showProgress: boolean
    ) {
        const oldProgressData = this.progressMap.get(copyFileSpec);
        this.progressMap.set(copyFileSpec, progressData);
        if (showProgress) {
            if (
                oldProgressData?.completedFiles !=
                    progressData.completedFiles ||
                oldProgressData?.totalFiles != progressData.totalFiles
            ) {
                this.report();
            }
        }
    }

    report() {
        const totalFiles = this.totalFiles();
        const totalCopiedFiles = this.totalCopiedFiles();
        if (!this.started) {
            this.started = true;
            this.cliProgress.start(totalFiles, totalCopiedFiles);
        } else {
            this.cliProgress.setTotal(totalFiles);
            this.cliProgress.update(totalCopiedFiles);
        }
    }

    stop() {
        this.started = false;
        this.cliProgress.stop();
    }

    totalFiles() {
        return sum(this.progressMap.values(), 'totalFiles');
    }

    totalCopiedFiles() {
        return sum(this.progressMap.values(), 'completedFiles');
    }
}
