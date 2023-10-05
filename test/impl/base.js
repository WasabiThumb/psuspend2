const launchStall = require("../task/stall");
const util = require("../util/util");
const {default: suspend} = require("../../dist/index");

async function base() {
    console.log("Agent initialized, Launching stall task");
    const process = launchStall();

    await util.delay(4000);

    console.log("Suspending stall task...");
    await suspend(process);
    console.log("Suspended");

    await util.delay(4000);

    console.log("Unsuspending stall task...");
    await suspend(process, false);
    console.log("Unsuspended");

    await util.delay(4000);

    console.log("Killing stall task...");
    process.kill("SIGINT");
}

module.exports = base;