const SmeeClient = require('smee-client'); // or import SmeeClient from 'smee-client'

async function startSmee() {
    if (!process.env.SMEE_URL) {
        console.error("SMEE_URL is not defined, please set it up in .env");
        return;
    }

    console.log("Connecting Smee client to:", process.env.SMEE_URL);

    const smee = new SmeeClient({
        source: process.env.SMEE_URL,
        target: 'http://localhost:3000/github',
    });

    // Start the client (returns an EventSource instance)
    const events = await smee.start();

    // Catch connection losses, including the ECONNRESET error
    events.addEventListener('error', (err) => {
        console.error("Smee connection lost (ECONNRESET / network drop). Reconnecting in 5 seconds...");

        // Cleanly close the dead EventSource to free up socket resources
        events.close();

        // Wait 5 seconds and attempt a clean restart
        setTimeout(startSmee, 5000);
    });
}



module.exports = {startSmee};
