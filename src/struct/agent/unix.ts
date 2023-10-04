import {SuspendAgent, SuspendProcessID} from "../agent";
import {ChildProcess, exec} from "child_process";
import ProcessIDUtil from "../../util/id";

export default class UnixSuspendAgent implements SuspendAgent {

    readonly type: "unix" = "unix";

    suspend(process: ChildProcess | SuspendProcessID, suspend: boolean = true): Promise<void> {
        if (typeof process === "object") {
            process.kill(suspend ? 'SIGSTOP' : 'SIGCONT');
            return Promise.resolve();
        } else {
            return new Promise(async (res, rej) => {
                process = await ProcessIDUtil.validate(process as SuspendProcessID);
                exec(`kill -${suspend ? 'SIGSTOP' : 'SIGCONT'} ${process}`, (err) => {
                    if (!!err) {
                        rej(err);
                    } else {
                        res();
                    }
                });
            });
        }
    }

    unsuspend(process: ChildProcess | SuspendProcessID): Promise<void> {
        return this.suspend(process, false);
    }

    async init(): Promise<void> { }

    async cleanup(): Promise<void> { }

    getEula(): Promise<string | null> {
        return Promise.resolve(null);
    }

    hasEula(): boolean {
        return false;
    }

}
