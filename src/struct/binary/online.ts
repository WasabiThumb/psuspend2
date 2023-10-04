import {SuspendBinary, SuspendBinaryBuilder, SuspendBinaryProvider} from "../binary";
import * as unzipper from "unzipper";
import * as https from "https";
import {IncomingMessage} from "http";

const archiveURL: string = "https://download.sysinternals.com/files/PSTools.zip";
type OnlineSuspendBinaryArchiveEntry = {
    fileName: string,
    type: "executable" | "executable64" | "eula"
}

const OnlineSuspendBinaryArchiveEntries: OnlineSuspendBinaryArchiveEntry[] = [
    { fileName: "pssuspend.exe", type: "executable" },
    { fileName: "pssuspend64.exe", type: "executable64" },
    { fileName: "Eula.txt", type: "eula" }
];

const OnlineSuspendBinaryProvider: SuspendBinaryProvider = {

    async get(): Promise<SuspendBinary> {
        const builder = await SuspendBinaryBuilder.create();

        const stream = await new Promise<IncomingMessage>((res, rej) => {
            https.get(archiveURL, (stream) => {
                res(stream);
            }).on('error', rej);
        });

        await (await stream)
            .pipe(unzipper.Parse())
            .on("entry", (zipEntry: unzipper.Entry) => {
                if (zipEntry.type !== "File") {
                    zipEntry.autodrain();
                    return;
                }

                let entry: OnlineSuspendBinaryArchiveEntry | -1 = -1;
                for (let candidate of OnlineSuspendBinaryArchiveEntries) {
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

};

export default OnlineSuspendBinaryProvider;
