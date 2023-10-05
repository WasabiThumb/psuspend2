const suspend = require("../../dist/index").default;
const base = require("./base");

async function simple() {
    await suspend.agent.cleanup();
    await suspend.agent.init();

    console.log(`Active agent type: ${suspend.agent.type} (eula=${suspend.agent.hasEula()})`);

    await base();
}

module.exports = simple;
