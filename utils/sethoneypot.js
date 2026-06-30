let honeypot_ids = []

function setHoneypotids(ids) {
    honeypot_ids = ids;
}

function getHoneypotids() {
    return honeypot_ids;
}

module.exports = {setHoneypotids, getHoneypotids}
