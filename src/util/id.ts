import {SuspendProcessID} from "../struct/agent";

export default class ProcessIDUtil {

    static validate(id: SuspendProcessID): Promise<number> {
        if (typeof id === "number") return Promise.resolve(id);
        let ret = parseInt(id);
        if (isNaN(ret)) return Promise.reject("Process ID " + id + " is not a number!");
        return Promise.resolve(ret);
    }

}
