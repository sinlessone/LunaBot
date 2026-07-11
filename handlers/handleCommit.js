module.exports = {
    async handleCommit(client, body) {

        const commitURL = body.commits[0].url
        const commitAuthor = body.commits[0].author.name
        const filesModified = body.commits[0].modified.length
        const commitBranch = body.ref.replace("refs/heads/", '')
        const commitMessage = body.commits[0].message
        console.log(body);
        console.log(commitURL, commitAuthor, filesModified)
    }
}