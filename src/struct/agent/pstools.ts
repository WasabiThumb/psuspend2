import {SuspendAgent, SuspendProcessID} from "../agent";
import {ChildProcess, exec} from "child_process";
import {OmniSuspendBinaryProvider, SuspendBinary} from "../binary";
import * as fs from "fs/promises";
import ProcessIDUtil from "../../util/id";
import SuspendConfig, {NtSuspendInteropMode} from "../config";
import * as os from "os";


export default class PsToolsSuspendAgent implements SuspendAgent {

    readonly type: "pstools" = "pstools";
    private readonly _config: SuspendConfig;
    constructor(config: SuspendConfig) {
        this._config = config;
    }

    private _binaryPromise: Promise<SuspendBinary> | undefined = undefined;
    private _ntsPromise: Promise<INTSuspend> | undefined = undefined;
    private _mode: "binary" | "nts" | "unset" = "unset";
    private _hasInit: boolean = false;

    private _get<T extends "binary" | "nts">(mode: T): Promise<T extends "binary" ? SuspendBinary : INTSuspend> {
        if (mode === "binary") {
            if (!this._hasInit) {
                this._binaryPromise = OmniSuspendBinaryProvider.get(this._config);
                this._hasInit = true;
            }
            return this._binaryPromise as unknown as any;
        } else {
            if (!this._hasInit) {
                this._ntsPromise = Promise.resolve(require("ntsuspend") as unknown as Promise<INTSuspend>);
                this._hasInit = true;
            }
            return this._ntsPromise as unknown as any;
        }
    }

    private _getMode(): "binary" | "nts" {
        let ret: "binary" | "nts";
        if (this._mode === "unset") {
            const interop: NtSuspendInteropMode = this._config.get("ntsInterop");
            const useInterop: boolean = (() => {
                switch (interop) {
                    case NtSuspendInteropMode.ALWAYS:
                        return true;
                    case NtSuspendInteropMode.NONE:
                        return false;
                    case NtSuspendInteropMode.BELOW_WIN8_1:
                        const release: string = os.release();
                        const match = /^(\d+)\.(\d+)(\.[^.]+)?$/.exec(release);
                        if (!match) return true;
                        const major: number = parseInt(match[1]);
                        if (major < 6) return true;
                        const minor: number = parseInt(match[2]);
                        if (minor < 3) return true;
                }
                return false;
            })();
            ret = useInterop ? "nts" : "binary";
            this._mode = ret;
        } else {
            ret = this._mode;
        }
        return ret;
    }

    init(): Promise<void> {
        return this._get(this._getMode()).then<void>(() => {});
    }

    async cleanup(): Promise<void> {
        if (!this._hasInit) return;
        this._hasInit = false;
        this._hasAcceptedEula = false;
        if (this._mode === "binary") {
            try {
                await fs.rm((await (this._binaryPromise as Promise<SuspendBinary>)).dir, {
                    force: true,
                    recursive: true
                });
            } catch (e) { }
        }
        this._mode = "unset";
    }

    async getEula(): Promise<string | null> {
        if (this._getMode() !== "binary") return null;
        const binary = await this._get("binary");
        return fs.readFile(binary.eula, { encoding: 'utf8' });
    }

    hasEula(): boolean {
        return this._getMode() === "binary";
    }

    private _hasAcceptedEula: boolean = false;
    async suspend(p: ChildProcess | SuspendProcessID, suspend: boolean = true): Promise<void> {
        let pid: number;
        if (typeof p === "object") {
            if (!p.pid) return Promise.reject("Cannot suspend a child process that did not spawn correctly");
            pid = p.pid;
        } else {
            pid = await ProcessIDUtil.validate(p);
        }

        const mode = this._getMode();
        if (mode === "nts") {
            const nts = await this._get("nts");
            if (suspend) {
                if (!nts.suspend(pid)) return Promise.reject("NTSuspend failed to suspend PID " + pid);
            } else {
                if (!nts.resume(pid)) return Promise.reject("NTSuspend failed to unsuspend PID " + pid);
            }
            return Promise.resolve<void>(undefined);
        }

        const binary = await this._get(mode);
        const arch = process.arch;

        let executable: string;
        if (arch === "x64" || arch === "arm64" || arch === "ppc64" || arch === "s390x") {
            executable = binary.executable64;
        } else {
            executable = binary.executable;
        }

        if (!this._hasAcceptedEula) {
            this._hasAcceptedEula = true;
            try {
                await this._awaitExec(executable, "/accepteula");
            } catch (e) { }
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


interface INTSuspend {
    suspend(pid: number): boolean;
    resume(pid: number): boolean;
}