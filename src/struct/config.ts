
// CONFIG VALUES
export enum NtSuspendInteropMode {
    /** Never try to use the ntsuspend package, only use this package's method */
    NONE,
    /** Use the ntsuspend package (MUST BE INSTALLED), for windows hosts below windows 8.1 */
    BELOW_WIN8_1,
    /** Always use the ntsuspend package (MUST BE INSTALLED), bypassing this package's windows method entirely */
    ALWAYS
}

// CONFIG KEYS
export type SuspendConfigKey<T> = T extends boolean ? SuspendConfigBooleanKey :
    T extends NtSuspendInteropMode ? SuspendConfigInteropModeKey :
    never;

type SuspendConfigBooleanKey = "onlyOffline";
type SuspendConfigInteropModeKey = "ntsInterop";

// CONFIG
export default class SuspendConfig {

    private readonly _map: { [k: string]: any } = {};
    private readonly _defaults: { [k: string]: any } = {};

    constructor() {
        this._setDefault("onlyOffline", false)
            ._setDefault("ntsInterop", NtSuspendInteropMode.NONE);
    }

    get<T>(key: SuspendConfigKey<T>): T {
        let ret: any | undefined = this._map[key as string];
        if (typeof ret !== "undefined") return ret as T;
        ret = this._defaults[key as string];
        if (typeof ret !== "undefined") return ret as T;
        throw "Config key \"" + key + "\" has no default value! Notify the package author!";
    }

    set<T>(key: SuspendConfigKey<T>, value?: T): this {
        if (typeof value === "undefined") {
            delete this._map[key as string];
        } else {
            this._map[key as string] = value as any;
        }
        return this;
    }

    private _setDefault<T>(key: SuspendConfigKey<T>, value: T): this {
        this._defaults[key as string] = value as any;
        return this;
    }

}