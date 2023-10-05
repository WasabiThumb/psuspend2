const suspend = require("../../dist/index").default;
const base = require("./base");

async function simple() {
    await suspend.agent.cleanup();

    console.log("Configuring agent to use offline binary...");
    suspend.config.set("onlyOffline", true);

    await suspend.agent.init();

    await base();
}

module.exports = simple;
