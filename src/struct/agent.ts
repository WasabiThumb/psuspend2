import { ChildProcess } from "child_process";

export type SuspendProcessID = string | number;
export type SuspendAgentType = "unix" | "pstools";
export type SuspendAgentFunc = (process: ChildProcess | SuspendProcessID, suspend?: boolean) => Promise<void>;

export interface SuspendAgent {

    readonly type: SuspendAgentType;

    init(): Promise<void>;

    getEula(): Promise<string | null>;

    hasEula(): boolean;

    suspend: SuspendAgentFunc;

    unsuspend(process: ChildProcess | SuspendProcessID): Promise<void>;

    cleanup(): Promise<void>;

}
