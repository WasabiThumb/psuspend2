import {SuspendBinary, SuspendBinaryBuilder, SuspendBinaryProvider} from "../binary";
import * as unzipper from "unzipper";
import { Readable } from "stream";

type ZipSuspendBinaryArchiveEntry = {
    fileName: string,
    type: "executable" | "executable64" | "eula"
}

const ZipSuspendBinaryArchiveEntries: ZipSuspendBinaryArchiveEntry[] = [
    { fileName: "pssuspend.exe", type: "executable" },
    { fileName: "pssuspend64.exe", type: "executable64" },
    { fileName: "Eula.txt", type: "eula" }
];

export default abstract class ZipSuspendBinaryProvider implements SuspendBinaryProvider {

    protected abstract async _getStream(): Promise<Readable>;

    async get(): Promise<SuspendBinary> {
        const builder = await SuspendBinaryBuilder.create();
        const stream = await this._getStream();

        await stream
            .pipe(unzipper.Parse())
            .on("entry", (zipEntry: unzipper.Entry) => {
                if (zipEntry.type !== "File") {
                    zipEntry.autodrain();
                    return;
                }

                let entry: ZipSuspendBinaryArchiveEntry | -1 = -1;
                for (let candidate of ZipSuspendBinaryArchiveEntries) {
                    if (zipEntry.path.indexOf(candidate.fileName) >= 0) {
                        entry = candidate;
                        break;
                    }
                }
                if (entry === -1) {
                    zipEntry.autodrain();
                    return;
                }

                zipEntry.pipe(builder.write(entry.type, entry.fileName));
            })
            .promise();

        return builder.build();
    }

}
