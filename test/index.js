const suspend = require("../dist/index").default;
const agent = suspend.agent;

(async () => {
    console.log("= AGENT INFO =");
    console.log("Type: " + agent.type);
    let eula = agent.hasEula();
    console.log("Has EULA: " + eula);

    console.log("");
    console.log("Initializing agent...");
    await agent.init();
    console.log("Ok!");

    if (eula) {
        console.log("\n= BEGIN AGENT EULA =")
        console.log(await agent.getEula());
        console.log("= END AGENT EULA =\n");
    }

    console.log("Cleaning up agent...");
    await agent.cleanup();
    console.log("Ok!");
})().catch(console.error);
