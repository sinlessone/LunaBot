const express = require('express')
const {handleCommit} = require("../handlers/handleCommit");

const app = express();
const PORT = 3000;
module.exports = {listen}
async function listen(client) {
    app.use(express.json());

// This matches the path Smee forwards to
    app.post('/github', async (req, res) => {
        await handleCommit(client, req);
        res.status(200).send('Success');
    });

    app.listen(PORT, () => {
    });

}
// Middleware to automatically parse incoming JSON payloads
