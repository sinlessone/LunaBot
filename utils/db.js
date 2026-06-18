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

async function getsuggestchannels() {
        return await queryall(null, "SELECT * FROM serverconfig");
}

async function getcountingchannels() {
        return await queryall(null, "SELECT counting_channel_id FROM serverconfig");
}

async function initDb() {
        // Standard table initializations using PostgreSQL schema rules
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
        suggestionChannelId TEXT,
        deniedChannelId TEXT,
        acceptedChannelId TEXT,
        autothread TEXT,
        ai_channel_id TEXT,
        counting_channel_id TEXT,
        current_number TEXT,
        current_number_message_id TEXT,
        last_counter TEXT,
        qotd_channel TEXT,
        qotd_enabled INTEGER DEFAULT 0
    )`);

        await pool.query(`CREATE TABLE IF NOT EXISTS qotd (
        question TEXT PRIMARY KEY,
        used INTEGER DEFAULT 0
    )`);

        await pool.query(`CREATE TABLE IF NOT EXISTS invites (
        serverId TEXT NOT NULL,
        inviterId TEXT NOT NULL,
        invitedId TEXT NOT NULL,
        inviteCode TEXT NOT NULL,
        validInvite INTEGER NOT NULL DEFAULT 1,
        PRIMARY KEY (invitedId, serverId)
    )`);

        await pool.query(`CREATE TABLE IF NOT EXISTS suggestions (
        suggestionId TEXT PRIMARY KEY,
        suggestionMessageId TEXT NOT NULL,
        suggestion TEXT NOT NULL,
        serverId TEXT NOT NULL,
        suggesterId TEXT NOT NULL,
        upvotes TEXT NOT NULL,
        downvotes TEXT NOT NULL,
        accepted INTEGER DEFAULT 0,
        denied INTEGER DEFAULT 0
    )`);

        await pool.query(`CREATE TABLE IF NOT EXISTS reactionroles (
        guildId TEXT,
        messageId TEXT,
        emoji TEXT,
        roleId TEXT
    )`);

        await pool.query(`CREATE TABLE IF NOT EXISTS votes (
        suggestionId TEXT NOT NULL,
        userId TEXT NOT NULL,
        voteType TEXT NOT NULL CHECK(voteType IN ('up', 'down')),
        PRIMARY KEY (suggestionId, userId),
        FOREIGN KEY (suggestionId) REFERENCES suggestions(suggestionId) ON DELETE CASCADE
    )`);

        await pool.query(`CREATE TABLE IF NOT EXISTS entries (
        userId TEXT NOT NULL,
        messageId TEXT NOT NULL,
        guildId TEXT NOT NULL,
        PRIMARY KEY (messageId, userId)            
    )`);

        await pool.query(`CREATE INDEX IF NOT EXISTS idx_entries_userId ON entries (userId)`);

        await pool.query(`CREATE TABLE IF NOT EXISTS giveaways (
        messageId TEXT PRIMARY KEY,
        channelId TEXT NOT NULL,
        serverId TEXT NOT NULL,
        isDone INTEGER NOT NULL DEFAULT 0,
        endsAt BIGINT NOT NULL,
        invites INTEGER NOT NULL DEFAULT 0,
        hostId TEXT NOT NULL,
        winnerCount INTEGER NOT NULL DEFAULT 1,
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
        db: pool // Exports the Supabase pool
};