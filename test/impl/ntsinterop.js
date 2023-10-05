const suspend = require("../../dist/index").default;
const base = require("./base");
const {NtSuspendInteropMode} = require("../../dist/struct/config");

async function simple() {
    await suspend.agent.cleanup();

    console.log("Configuring agent to use interop...");
    suspend.config.set("ntsInterop", NtSuspendInteropMode.ALWAYS);

    await suspend.agent.init();

    await base();
}

module.exports = simple;
