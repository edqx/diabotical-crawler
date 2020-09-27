const worker_threads = require("worker_threads");
const diabotical = require("./diab.js");

worker_threads.parentPort.on("message", async message => {
    if (message.op === "getmatches") {
        worker_threads.parentPort.postMessage({ op: "matches", data: await diabotical.getMatches(message.data) });
    } else if (message.op === "getmatch") {
        worker_threads.parentPort.postMessage({ op: "match", data: await diabotical.getMatch(message.data) });
    } else if (message.op === "getprofile") {
        worker_threads.parentPort.postMessage({ op: "profile", data: await diabotical.getUser(message.data) });
    }
});