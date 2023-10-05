const express = require("express");
const { Worker } = require("worker_threads");

const app = express();
const port = process.env.PORT || 3000;
const THREAD_COUNT = 4;

function createWorker() {
    return new Promise((resolve, reject) => {
        const worker = new Worker("./worker-optimized.js", {
            workerData: { thread_count: THREAD_COUNT },
        });

        worker.on("message", (data) => {
            resolve(data);
        });

        worker.on("error", (err) => {
            reject(`An error occured ${err}`);
        });
    });
}

app.get("/non-blocking", (req, res) => {
    res.status(200).send("This page is non-blocking.");
});

app.get("/blocking", async (req, res) => {
    const workerPromises = [];

    for (let i = 0; i < THREAD_COUNT; i++) {
        workerPromises.push(createWorker());
    }

    const threadResults = await Promise.all(workerPromises);
    const total =
        threadResults[0] +
        threadResults[1] +
        threadResults[2] +
        threadResults[3];

    res.status(200).send(`Result is ${total}`);
});

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});
