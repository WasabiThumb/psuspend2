const util = require("./util/util");

const impls = [
    "simple",
    "offline",
    "ntsinterop"
];

(async () => {
    console.log("Running tests...");
    await util.delay(500);

    for (let i=0; i < impls.length; i++) {
        const name = impls[i];
        await util.write('\u001b[1m');
        console.log(`${i + 1} / ${impls.length} : ${name}`);
        await util.write('\u001b[0m');
        console.log("");
        await util.delay(200);

        const testFunction = require("./impl/" + name);
        await testFunction();

        console.log("");
    }

    console.log("All tests completed successfully!");
})().catch(console.error);
