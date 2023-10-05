import * as fs from "fs/promises";
import { tmpdir } from "os";
import * as path from "path";
import { createWriteStream, WriteStream } from "fs";
import OnlineSuspendBinaryProvider from "./binary/online";
import SuspendConfig from "./config";


export type SuspendBinary = {
    readonly dir: string,
    readonly executable: string,
    readonly executable64: string,
    readonly eula: string
}

export interface SuspendBinaryProvider {

    get(config: SuspendConfig): Promise<SuspendBinary>

}

export const OmniSuspendBinaryProvider: SuspendBinaryProvider = {

    async get(config: SuspendConfig): Promise<SuspendBinary> {
        if (config.get<boolean>("onlyOffline")) {
            return await (require("./binary/offline")).default.get(config);
        }
        try {
            return await OnlineSuspendBinaryProvider.get(config);
        } catch (e) {
            console.warn("Failed to fetch latest PsSuspend binary, using volatile cache");
            return await (require("./binary/offline")).default.get(config);
        }
    }

};

export class SuspendBinaryBuilder {

    static async create(): Promise<SuspendBinaryBuilder> {
        const dir: string = await fs.mkdtemp(path.join(tmpdir(), "psuspend-"));
        return new SuspendBinaryBuilder(dir);
    }

    readonly dir: string;
    executable: string = "";
    executable64: string = "";
    eula: string = "";
    constructor(dir: string) {
        this.dir = dir;
    }

    write(type: "executable" | "executable64" | "eula", name: string): WriteStream {
        let fn: string = path.join(this.dir, name);
        this[type] = fn;
        return createWriteStream(fn, { mode: 0o775 });
    }

    build(): SuspendBinary {
        return {
            dir: this.dir,
            executable: this.executable,
            executable64: this.executable64,
            eula: this.eula
        };
    }

}
