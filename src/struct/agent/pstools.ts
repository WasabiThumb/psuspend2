import {SuspendAgent, SuspendProcessID} from "../agent";
import {ChildProcess, exec} from "child_process";
import {OmniSuspendBinaryProvider, SuspendBinary} from "../binary";
import * as fs from "fs/promises";
import ProcessIDUtil from "../../util/id";


export default class PsToolsSuspendAgent implements SuspendAgent {

    readonly type: "pstools" = "pstools";

    private _binaryPromise: Promise<SuspendBinary> | undefined = undefined;
    private _binaryPromiseInit: boolean = false;

    private _getBinary(): Promise<SuspendBinary> {
        if (!this._binaryPromiseInit) {
            this._binaryPromise = OmniSuspendBinaryProvider.get();
            this._binaryPromiseInit = true;
        }
        return this._binaryPromise as Promise<SuspendBinary>;
    }

    init(): Promise<void> {
        return this._getBinary().then<void>(() => {});
    }

    async cleanup(): Promise<void> {
        if (!this._binaryPromiseInit) return;
        this._binaryPromiseInit = false;
        try {
            await fs.rm((await (this._binaryPromise as Promise<SuspendBinary>)).dir, {force: true, recursive: true});
        } catch (e) { }
    }

    async getEula(): Promise<string> {
        const binary = await this._getBinary();
        return fs.readFile(binary.eula, { encoding: 'utf8' });
    }

    hasEula(): boolean {
        return true;
    }

    private _hasAcceptedEula: boolean = false;
    async suspend(p: ChildProcess | SuspendProcessID, suspend: boolean = true): Promise<void> {
        const binary = await this._getBinary();
        const arch = process.arch;

        let executable: string;
        if (arch === "x64" || arch === "arm64" || arch === "ppc64" || arch === "s390x") {
            executable = binary.executable64;
        } else {
            executable = binary.executable;
        }

        if (!this._hasAcceptedEula) {
            this._hasAcceptedEula = true;
            await this._awaitExec(executable, "/accepteula");
        }

        let pid: number;
        if (typeof p === "object") {
            if (!p.pid) return Promise.reject("Cannot suspend a child process that did not spawn correctly");
            pid = p.pid;
        } else {
            pid = await ProcessIDUtil.validate(p);
        }

        return this._awaitExec(executable, `${suspend ? '' : '-r '}${pid}`);
    }

    unsuspend(process: ChildProcess | SuspendProcessID): Promise<void> {
        return this.suspend(process, false);
    }

    private _awaitExec(executable: string, cmd: string): Promise<void> {
        return new Promise<void>((res, rej) => {
            exec(`${executable} ${cmd}`, (err) => {
                if (!!err) {
                    rej(err);
                } else {
                    res();
                }
            });
        });
    }

}
