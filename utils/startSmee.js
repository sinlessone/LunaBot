const SmeeClient = require('smee-client'); // or import SmeeClient from 'smee-client'

async function startSmee() {
    try {
        if (!process.env.SMEE_URL) {
            console.error("SMEE_URL is not defined, please set it up in .env");
            return;
        }

        console.log("Connecting Smee client to:", process.env.SMEE_URL);

        const smee = new SmeeClient({
            source: process.env.SMEE_URL,
            target: 'http://localhost:3000/github',
        });

        const events = await smee.start();

        events.addEventListener('error', (err) => {
            console.error("Smee connection lost (ECONNRESET / network drop). Reconnecting in 5 seconds...");

            events.close();

            setTimeout(startSmee, 5000);
        });
    } catch (e) {
        setTimeout(startSmee, 5000);
    }

}



module.exports = {startSmee};
