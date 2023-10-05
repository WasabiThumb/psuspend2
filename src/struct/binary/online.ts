import {SuspendBinaryProvider} from "../binary";
import * as https from "https";
import {IncomingMessage} from "http";
import ZipSuspendBinaryProvider from "./zip";
import {Readable} from "stream";

const archiveURL: string = "https://download.sysinternals.com/files/PSTools.zip";

const OnlineSuspendBinaryProvider: SuspendBinaryProvider = new class extends ZipSuspendBinaryProvider {

    protected async _getStream(): Promise<Readable> {
        return await new Promise<IncomingMessage>((res, rej) => {
            https.get(archiveURL, (stream) => {
                res(stream);
            }).on('error', rej);
        });
    }

};

export default OnlineSuspendBinaryProvider;
