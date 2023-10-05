const childProcess = require("child_process");
const util = require("../util/util.js");

function launchStall() {
    return childProcess.fork(__filename, [ "stall-exec" ]);
}

const doRun = (() => {
    for (let arg of process.argv) {
        if (arg === "stall-exec") return true;
    }
    return false;
})();

if (doRun) {
    const amt = 60;

    (async () => {
        console.log("Stalling for " + amt + " seconds");
        let seg = amt * 4;
        while (seg > 0) {
            const count = 1 + (seg % 4);
            const pad = 5 - count;
            await util.write(
                '\u001b[35;m' +
                "=".repeat(count) + " ".repeat(pad) +
                '\u001b[0m' +
                "\n"
            );
            await util.delay(250);
            seg--;
        }
        console.log("Staller finished!");
    })().catch(console.error);
}

module.exports = launchStall;
