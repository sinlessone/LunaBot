let count_ids = []

function setCountIds(ids) {
    count_ids = ids;
}

function getCountIds() {
    return count_ids;
}

module.exports = {getCountIds, setCountIds}