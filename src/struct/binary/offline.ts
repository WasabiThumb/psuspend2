import {SuspendBinaryProvider} from "../binary";
import { Readable } from "stream";
import ZipSuspendBinaryProvider from "./zip";
import * as path from "path";
import * as fs from "fs/promises";
import { createReadStream } from "fs";


const OfflineSuspendBinaryProvider: SuspendBinaryProvider = new class extends ZipSuspendBinaryProvider {

    protected async _getStream(): Promise<Readable> {
        const bundle: string = await this._findBundle();
        return createReadStream(bundle);
    }

    private async _findBundle(): Promise<string> {
        const me: string = path.dirname(__filename);
        let ret: string | null;

        ret = await this._findBundleGuess(path.resolve(me, "../../../static"));
        if (ret !== null) return ret;

        let head: string = me;
        for (let i=0; i < 8; i++) {
            const headStatic: string = path.join(head, "static");
            ret = await this._findBundleGuess(headStatic);
            if (ret !== null) return ret;
            head = path.resolve(head, "../");
        }

        return Promise.reject("Bundle could not be found for offline PSuspend binary");
    }

    private async _findBundleGuess(dir: string): Promise<string | null> {
        try {
            await fs.access(dir, fs.constants.F_OK);
        } catch (e) {
            return null;
        }

        const zip: string = path.join(dir, "pss_bundle.zip");

        try {
            await fs.access(dir, fs.constants.F_OK);
        } catch (e) {
            return null;
        }

        return zip;
    }

};

export default OfflineSuspendBinaryProvider;
