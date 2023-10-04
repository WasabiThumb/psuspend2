import {SuspendAgent, SuspendAgentFunc, SuspendProcessID} from "./struct/agent";
import UnixSuspendAgent from "./struct/agent/unix";
import PsToolsSuspendAgent from "./struct/agent/pstools";
import {ChildProcess} from "child_process";

const agent: SuspendAgent = (() => {
    if (process.platform.indexOf("win") === 0) {
        return new PsToolsSuspendAgent();
    }
    return new UnixSuspendAgent();
})();

export interface PSuspend extends SuspendAgentFunc {
    agent: SuspendAgent
}

const suspend: PSuspend = (() => {
    const fn: SuspendAgentFunc = ((process: ChildProcess | SuspendProcessID, suspend?: boolean) => {
        return agent.suspend(process, suspend);
    });
    (fn as unknown as any)["agent"] = agent;
    return fn as PSuspend;
})();

export default suspend;
