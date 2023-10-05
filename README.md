# PSuspend 2
![GitHub Workflow Status (with event)](https://img.shields.io/github/actions/workflow/status/WasabiThumb/psuspend2/node.js.yml?style=for-the-badge&logo=github)
![npm](https://img.shields.io/npm/dt/psuspend?style=for-the-badge&logo=npm&link=https%3A%2F%2Fwww.npmjs.com%2Fpackage%2Fpsuspend)


Pause and resume processes on all hosts, including Windows!

## Notice
On Windows, this uses PsSuspend, a part of [PsTools](https://learn.microsoft.com/en-us/sysinternals/downloads/pstools) by
Mark Russinovich from Windows SysInternals. Using the lib methods
counts as accepting the EULA for this software. The latest version + EULA will
be stealthily downloaded, or if unavailable a version included with this package
will be used. Both methods are quite efficient (~800 KB). You may, and are encouraged to,
show the EULA to the end user (see below) or sysadmin.

## Usage
```js
// es6
import suspend from "psuspend";
// commonjs
// const suspend = require("psuspend").default;

let process = require("child_process").exec(/* ... */);
suspend(process); // suspend
suspend(process, false); // unsuspend

let pid = 12345;
suspend(pid); // suspend PID 12345
suspend(pid, false); // unsuspend PID 12345
suspend(pid).then(() => {
    console.log("Suspended");
});
```

### Agent
The agent is the active backend for the PSuspend API. You can access it like so:
```js
const agent = suspend.agent;
agent.type; // "unix" or "pstools"
// "unix" method is a polyfill
// for non-windows hosts and requires
// no dependencies or initialization
```

### Lazy Init
The suspend agent is [lazy-init](https://en.wikipedia.org/wiki/Lazy_initialization),
meaning that the first call to ``suspend`` will take a slightly longer amount
of time than each subsequent call. If this is not desirable, call ``agent.init``
when appropriate:
```js
await suspend.agent.init(); // agent is ready to be used after this point
// OR
suspend.agent.init().catch(console.error); // agent is scheduled to initialize
```

You can also, if you prefer, use ``agent.cleanup`` when you are sure that the
agent will not be used for a long time. The agent will also cleanup automatically
at the end of the active process. Using the agent after it is cleaned will cause
it to re-initialize.
```js
await suspend.agent.cleanup();
```

### EULA
To pass on the active agent's EULA to the end user:
```js
if (suspend.agent.hasEula()) {
    const eula = await suspend.agent.getEula();
    console.log(eula); // Sysinternals Software License Terms...
}
```
Using the agent (``suspend``, ``agent.suspend``, ``agent.unsuspend``) effectively
accepts the EULA.

### Config
The configuration is only evaluated when the agent is initialized. See [this section](#lazy-init)
for info on when init occurs and how to forcefully reschedule it.
```js
// Since v2.1.0
// Disable fetching the latest binary from the internet,
// always use the bundled version
suspend.config.set("onlyOffline", true);

// Since v2.1.0
// Compatibility with the "ntsuspend" module on Windows.
// If this is not set to NONE, "ntsuspend" MUST
// be installed, otherwise you will get errors! It is
// an optional dependency since v2.1.0. It should
// be installed unless you specifically exclude optional
// dependencies, or are running this on a non-Windows system,
// in which case this config option is ignored.
// 0 : NONE (default)
// 1 : BELOW_WIN8_1 (only below Windows 8.1)
// 2 : ALWAYS
suspend.config.set("ntsInterop", NtSuspendInteropMode.BELOW_WIN8_1);
```

## Why not just ntsuspend?
The methods used by [ntsuspend](https://www.npmjs.com/package/ntsuspend)
(``NtSuspendProcess``, ``NtResumeProcess``) are deprecated components of the
Win32 API, and while removal of these methods is at the moment unlikely,
their use is discouraged. ``PsSuspend`` has been sanctioned and maintained by
Microsoft and supports **Windows 8.1** and higher (but may likely work on
versions as low as Windows 2000). If supporting older versions is important for
your project, consider ntsuspend either standalone or the ``ntsInterop`` option
in the [config](#config).