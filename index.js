const mkdir = require("mkdirp");
const yargs = require("yargs");
const fs = require("fs");
const util = require("util");
const path = require("path");
const EventEmitter = require("events");
const uuid = require("uuid").v4;

require("colors");

const worker_threads = require("worker_threads");

const sleep = ms => new Promise(res => setTimeout(res, ms));

function get_stack() {
    try {
        return JSON.parse(fs.readFileSync("stack.json", "utf8"));
    } catch (e) {
        if (e.code === "ENOENT") {
            return [];
        } else {
            throw e;
        }
    }
}

function write_stack(stack) {
    try {
        fs.writeFileSync("stack.json", JSON.stringify(stack), "utf8");
    } catch (e) {
        if (!e.code) write_stack(stack);
    }
}

function add_to_stack(stack, op, id) {
    stack.push({ op, id });

    write_stack(stack);
}

function remove_from_stack(stack, op, id) {
    const i = stack.findIndex(task => task.op === op && task.id === id);

    if (~i) {
        stack.splice(i, 1);

        write_stack(stack);
    }
}

function is_in_stack(stack, op, id) {
    const i = stack.findIndex(task => task.op === op && task.id === id);

    return !!~i;
}

function player_exists(id) {
    try {
        fs.statSync("dump/players/" + id + ".json");
    } catch (e) {
        return false;
    }
}

function match_exists(id) {
    try {
        fs.statSync("dump/matches/" + id + ".json");
    } catch (e) {
        return false;
    }
}

function save_player(id, player) {
    fs.writeFileSync("dump/players/" + id + ".json", JSON.stringify(player), "utf8");
}

function save_match(id, match) {
    fs.writeFileSync("dump/matches/" + id + ".json", JSON.stringify(match), "utf8");
}

const workerEvents = new EventEmitter;

(async () => {
    const argv = yargs
        .option("threads", {
            alias: "t",
            type: "number",
            description: "The number of threads to use for searching.",
            default: 3
        })
        .option("disable-output", {
            type: "boolean",
            description: "Disable console output."
        })
        .argv;

        
    const log = console.log.bind(console);
    console.log = (...fmt) => { if (!argv["disable-output"]) return log("[" + new Date().toISOString() + "]", util.format(...fmt)) };

    console.success = (...fmt) => console.log("[SUCCESS]".bgGreen, util.format(...fmt));
    console.info    = (...fmt) => console.log("[INFO   ]".bgBlue, util.format(...fmt));
    console.warn    = (...fmt) => console.log("[WARN   ]".bgYellow, util.format(...fmt));
    console.error   = (...fmt) => console.log("[ERROR  ]".bgRed, util.format(...fmt));

    await mkdir("dump/matches");
    await mkdir("dump/players");

    console.info("Starting crawler process with " + argv.threads + " thread(s)..");

    const threads = new Array(argv.threads).fill(null).map(() => {
        const worker = new worker_threads.Worker(path.resolve("thread.js"));

        return {
            is_free: true,
            worker
        }
    });

    const stack = get_stack().filter(({ id }) => !player_exists(id) && !match_exists(id));

    const threadQueue = [];

    const queuePop = new EventEmitter;

    function joinThreadQueue() {
        const id = uuid();

        threadQueue.push(id);

        return id;
    }

    function waitForThread(id) {
        return new Promise(resolve => {
            queuePop.on("pop", (popid, thread) => {
                if (!id || popid === id) {
                    resolve(thread);
                }
            })
        });
    }

    workerEvents.on("freed", thread => {
        const id = threadQueue.pop();

        queuePop.emit("pop", id, thread);
    });

    (async function loop() {
        let i = stack.length;

        if (!~threads.findIndex(thread => thread.is_free)) await waitForThread();

        while (i-- > Math.max(stack.length - (threads.length * 3), 0)) {
            (async function() {
                const task = stack[i];
                
                if (typeof task.thread === "undefined") {
                    // console.info("Allocating thread for operation " + task.op + " (" + task.id + ")");

                    let t = 0;

                    while (!threads[t].is_free) {
                        ++t;

                        if (t >= threads.length) {
                            const id = joinThreadQueue();
                            
                            // console.warn("No threads available, queuing for available thread (" + id + ").");

                            const thread = await waitForThread(id);

                            t = threads.indexOf(thread);
                            break;
                        }
                    }
                    
                    console.info("Found thread " + t + " available for operation " + task.op + " (" + task.id + ")");

                    threads[t].is_free = false;
                    task.thread = t;
                    
                    threads[t].worker.postMessage({ op: task.op, data: task.id });
                    
                    console.info("Posted operation for " + task.op + " (" + task.id + "), awaiting reply..");

                    function onReply(message) {
                        threads[t].worker.off("message", onReply);

                        remove_from_stack(stack, task.op, task.id);
                        
                        threads[t].is_free = true;

                        workerEvents.emit("freed", threads[t]);
                        
                        console.info("Reply for operation " + task.op + " (" + task.id + "), received, freed worker.");

                        if (message.data) {
                            if (message.op === "match" && task.op === "getmatch") {
                                save_match(message.data.match_id, message.data);

                                const players = message.data.clients.filter(player => !player_exists(player.user_id) && !is_in_stack(stack, "getmatches", player.user_id));

                                for (let i = 0; i < players.length; i++) {
                                    save_player(players[i].user_id, players[i]);

                                    add_to_stack(stack, "getmatches", players[i].user_id);
                                }
                            } else if (message.op === "matches" && task.op === "getmatches") {
                                const matches = message.data.filter(match => !match_exists(match.match_id) && !is_in_stack(stack, "getmatch", match.match_id));

                                for (let i = 0; i < matches.length; i++) {
                                    add_to_stack(stack, "getmatch", matches[i].match_id);
                                }
                            }
                        }
                    }
                    
                    threads[t].worker.on("message", onReply);
                }
            })();
        }

        await sleep(10);

        loop();
    })();
})();