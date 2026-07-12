const {getaichannels, getcountingchannels, gethoneypotchannels, getreactionids} = require("./db") ;
const {setAiIds} = require("./setaiids") ;
const {setCountIds} = require("./setcountingids") ;
const {setreactids} = require("./setreactions") ;
const {setHoneypotids} = require("./sethoneypot") ;


    module.exports = async () => {
        const aichannels = await getaichannels()
        const countchannels = await getcountingchannels()
        const reactionids = await getreactionids()
        const honeypotchannels = await gethoneypotchannels()
        setAiIds(aichannels.map(item => item.ai_channel_id))
        setCountIds(countchannels.map(item => item.counting_channel_id))
        setreactids(reactionids.map(item => item.messageId))
        setHoneypotids(honeypotchannels.map(item => item.honeypot))
    }

