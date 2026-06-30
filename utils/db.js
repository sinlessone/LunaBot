const { Pool, types } = require('pg');
require('dotenv').config();

types.setTypeParser(20, (val) => parseInt(val, 10));

const dbUrl = new URL(process.env.DATABASE_URL);

const pool = new Pool({
        user: dbUrl.username ? decodeURIComponent(dbUrl.username) : undefined,
        password: dbUrl.password ? decodeURIComponent(dbUrl.password) : undefined,
        host: dbUrl.hostname,
        port: dbUrl.port ? parseInt(dbUrl.port, 10) : 5432,
        database: dbUrl.pathname ? dbUrl.pathname.slice(1) : 'postgres',
        ssl: {
                rejectUnauthorized: false
        }
});

// Automatically maps "?" placeholders to PostgreSQL's "$1, $2, $3..." format
function convertPlaceholders(sql) {
        let index = 1;
        return sql.replace(/\?/g, () => `$${index++}`);
}

async function execute(db, sql, params = []) {
        const pgSql = convertPlaceholders(sql);
        await pool.query(pgSql, params);
}

async function queryone(db, sql, params = []) {
        const pgSql = convertPlaceholders(sql);
        const res = await pool.query(pgSql, params);
        return res.rows[0] || null;
}

async function queryall(db, sql, params = []) {
        const pgSql = convertPlaceholders(sql);
        const res = await pool.query(pgSql, params);
        return res.rows;
}

async function serverindb(serverid) {
        return !!(await queryone(null, "SELECT * FROM serverconfig WHERE server_id=?", [serverid]));
}

async function exists(db, id) {
        const result = await queryone(db, "SELECT * FROM users WHERE user_id=?", [id]);
        return !!result;
}

async function registerserver(id) {
        await execute(null, "INSERT INTO serverconfig(server_id) VALUES(?) ON CONFLICT (server_id) DO NOTHING", [id]);
}

async function getaichannels() {
        return await queryall(null, "SELECT ai_channel_id FROM serverconfig");
}

async function getreactionids() {
        return await queryall(null, "SELECT messageId FROM reactionroles");
}
async function gethoneypotchannels() {
        return await queryall(null, "SELECT honeypot FROM serverconfig");
}


async function getsuggestchannels() {
        return await queryall(null, "SELECT * FROM serverconfig");
}

async function getcountingchannels() {
        return await queryall(null, "SELECT counting_channel_id FROM serverconfig");
}

async function initDb() {
        await pool.query(`CREATE TABLE IF NOT EXISTS users (
        user_id TEXT PRIMARY KEY,
        balance BIGINT NOT NULL,
        lastrobbing BIGINT,
        highestbalance BIGINT,
        lastmugged BIGINT
    )`);

        await pool.query(`CREATE TABLE IF NOT EXISTS accounts (
        acc_id TEXT PRIMARY KEY,
        acc_name TEXT NOT NULL,
        acc_details TEXT NOT NULL,
        acc_price BIGINT NOT NULL,
        server_id TEXT NOT NULL,
        channel_id TEXT NOT NULL,
        message_id TEXT NOT NULL              
    )`);

        await pool.query(`CREATE TABLE IF NOT EXISTS serverconfig (
        server_id TEXT PRIMARY KEY,
        suggestionchannelid TEXT,
        deniedChannelId TEXT,
        acceptedChannelId TEXT,
        autothread TEXT,
        ai_channel_id TEXT,
        counting_channel_id TEXT,
        current_number TEXT,
        current_number_message_id TEXT,
        last_counter TEXT,
        altered_count INTEGER DEFAULT 0,
        qotd_channel TEXT,
        qotd_enabled INTEGER DEFAULT 0,
        honeypot TEXT,
        softbanorban INTEGER DEFAULT 0,
        honeypotmessage TEXT
        
                                
    )`);

        await pool.query(`CREATE TABLE IF NOT EXISTS qotd (
        question TEXT PRIMARY KEY,
        used INTEGER DEFAULT 0
    )`);

        await pool.query(`CREATE TABLE IF NOT EXISTS invites (
        serverid TEXT NOT NULL,
        inviterid TEXT NOT NULL,
        invitedid TEXT NOT NULL,
        invitecode TEXT NOT NULL,
        validinvite INTEGER NOT NULL DEFAULT 1,
        PRIMARY KEY (invitedid, serverid)
    )`);

        await pool.query(`CREATE TABLE IF NOT EXISTS suggestions (
        suggestionid TEXT PRIMARY KEY,
        suggestionMessageid TEXT NOT NULL,
        suggestion TEXT NOT NULL,
        serverid TEXT NOT NULL,
        suggesterid TEXT NOT NULL DEFAULT 0,
        upvotes INTEGER NOT NULL DEFAULT 0,
        downvotes INTEGER NOT NULL,
        accepted INTEGER DEFAULT 0,
        denied INTEGER DEFAULT 0
    )`);

        await pool.query(`CREATE TABLE IF NOT EXISTS reactionroles (
        guildid TEXT,
        messageid TEXT,
        emoji TEXT,
        roleid TEXT
    )`);

        await pool.query(`CREATE TABLE IF NOT EXISTS votes (
        suggestionid TEXT NOT NULL,
        userid TEXT NOT NULL,
        votetype TEXT NOT NULL CHECK(votetype IN ('up', 'down')),
        PRIMARY KEY (suggestionid, userid),
        FOREIGN KEY (suggestionid) REFERENCES suggestions(suggestionid) ON DELETE CASCADE
    )`);

        await pool.query(`CREATE TABLE IF NOT EXISTS entries (
        userid TEXT NOT NULL,
        messageid TEXT NOT NULL,
        guildid TEXT NOT NULL,
        PRIMARY KEY (messageid, userid)            
    )`);

        await pool.query(`CREATE INDEX IF NOT EXISTS idx_entries_userId ON entries (userId)`);

        await pool.query(`CREATE TABLE IF NOT EXISTS giveaways (
        messageid TEXT PRIMARY KEY,
        channelid TEXT NOT NULL,
        serverid TEXT NOT NULL,
        isdone INTEGER NOT NULL DEFAULT 0,
        endsat BIGINT NOT NULL,
        invites INTEGER NOT NULL DEFAULT 0,
        hostid TEXT NOT NULL,
        winnercount INTEGER NOT NULL DEFAULT 1,
        prize TEXT NOT NULL,
        participants INTEGER NOT NULL DEFAULT 0
    )`);
}

module.exports = {
        execute,
        queryall,
        queryone,
        initDb,
        exists,
        registerserver,
        serverindb,
        getaichannels,
        getsuggestchannels,
        getcountingchannels,
        getreactionids,
        gethoneypotchannels,
        db: pool // Exports the Supabase pool
};