const sqlite3 = require('sqlite3');
const path = require("path");
const fs = require('fs')

const dataDir = path.join(__dirname, '..', 'data');
const dbpath = path.join(__dirname, '..', 'data', 'discord.db')
if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
}


const db = new sqlite3.Database(dbpath);
        async function execute(db, sql, params = []) {
                if (params.length > 0) {
                        return new Promise((resolve, reject) => {
                                db.run(sql, params, (err) => {
                                        if (err) reject(err)
                                        resolve()
                                });
                        });
                }
                return new Promise((resolve, reject) => {
                        db.exec(sql, (err) => {
                                if (err) reject(err)
                                resolve()
                            });
                });
        }


        async function queryone(db, sql, params = []) {
                return new Promise((resolve, reject) => {
                        db.get(sql, params, (err, row) => {
                                if (err) reject(err)
                                resolve(row)
                        });
                });
        }


        async function queryall(db, sql, params = []) {
                return new Promise((resolve, reject) => {
                        db.all(sql, params, (err, rows) => {
                                if (err) reject(err)
                                resolve(rows)
                        });
                });
        }


        async function serverindb(serverid) {
        return !!(await queryone(db, "SELECT * FROM serverconfig WHERE server_id=?", [serverid]));
        }


        async function initDb() {
        await execute(db, `CREATE TABLE IF NOT EXISTS users (
        user_id TEXT PRIMARY KEY,
        balance INTEGER NOT NULL,
        lastrobbing INTEGER,
        highestbalance INTEGER,
        lastmugged INTEGER
        )
        `);
        await execute(db, `
        CREATE TABLE IF NOT EXISTS accounts (
        acc_id TEXT PRIMARY KEY,
        acc_name TEXT NOT NULL,
        acc_details TEXT NOT NULL,
        acc_price INTEGER NOT NULL,
        server_id TEXT NOT NULL,
        channel_id TEXT NOT NULL,
        message_id TEXT NOT NULL              
        )
        `);
        await execute(db, `
        CREATE TABLE IF NOT EXISTS serverconfig (
        server_id TEXT PRIMARY KEY,
        suggestionChannelId TEXT,
        deniedChannelId TEXT,
        acceptedChannelId TEXT,
        autothread TEXT,
        ai_channel_id TEXT,
        counting_channel_id TEXT,
        current_number TEXT,
        last_counter TEXT,
        qotd_channel INTEGER
        )
        `);
            await execute(db, `CREATE TABLE IF NOT EXISTS qotd (
        question TEXT PRIMARY KEY,
        used INTEGER DEFAULT 0
        )
        `);
            await execute(db, `CREATE TABLE IF NOT EXISTS invites (
        serverId TEXT PRIMARY KEY,
        inviterId TEXT NOT NULL,
        invitedId TEXT NOT NULL,
        inviteCode TEXT NOT NULL
        )
        `);
            await execute(db, `CREATE TABLE IF NOT EXISTS suggestions (
        suggestionId TEXT PRIMARY KEY,
        suggestionMessageId TEXT NOT NULL,
        suggestion TEXT NOT NULL,
        serverId TEXT NOT NULL,
        suggesterId TEXT NOT NULL,
        upvotes TEXT NOT NULL,
        downvotes TEXT NOT NULL,
        accepted INTEGER DEFAULT 0,
        denied INTEGER DEFAULT 0
        )
        `);
            await execute(db, `ALTER TABLE serverconfig ADD COLUMN qotd_channel TEXT`)
            await execute(db, `CREATE TABLE IF NOT EXISTS votes (
        suggestionId TEXT NOT NULL,
        userId TEXT NOT NULL,
        voteType TEXT NOT NULL CHECK(voteType IN ('up', 'down')),
        PRIMARY KEY (suggestionId, userId),
        FOREIGN KEY (suggestionId) REFERENCES suggestions(suggestionId) ON DELETE CASCADE
        )
        `);
        }


        async function exists(db, id) {
                const exists = await queryone(db, "SELECT * FROM users WHERE user_id=?", [id]);
                return !!exists;
        }


        async function registerserver(id) {
        await execute(db, "INSERT INTO serverconfig(server_id) VALUES(?)", [id]);
        }

        async function getaichannels() {
        return await queryall(db, "SELECT ai_channel_id FROM serverconfig");
        }
        async function getsuggestchannels() {
        return await queryall(db, "SELECT * FROM serverconfig");
        }
        async function getcountingchannels() {
        return await queryall(db, "SELECT counting_channel_id FROM serverconfig");
        }
module.exports = { execute, queryall, queryone, initDb, exists, registerserver, serverindb, getaichannels, getsuggestchannels, getcountingchannels, db}