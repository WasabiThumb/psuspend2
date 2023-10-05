import {SuspendAgent, SuspendAgentFunc, SuspendProcessID} from "./struct/agent";
import UnixSuspendAgent from "./struct/agent/unix";
import PsToolsSuspendAgent from "./struct/agent/pstools";
import {ChildProcess} from "child_process";
import SuspendConfig from "./struct/config";

const config: SuspendConfig = new SuspendConfig();

const agent: SuspendAgent = ((c: SuspendConfig) => {
    if (process.platform.indexOf("win") === 0) {
        return new PsToolsSuspendAgent(c);
    }
    return new UnixSuspendAgent(c);
})(config);

//

export interface PSuspend extends SuspendAgentFunc {
    agent: SuspendAgent,
    config: SuspendConfig
}

const suspend: PSuspend = (() => {
    const fn: SuspendAgentFunc = ((process: ChildProcess | SuspendProcessID, suspend?: boolean) => {
        return agent.suspend(process, suspend);
    });
    const set = ((k: keyof PSuspend, v: any) => {
        (fn as unknown as any)[k] = v;
    });
    set("agent", agent);
    set("config", config);
    return fn as PSuspend;
})();

export default suspend;
