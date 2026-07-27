# 🌙 LunaBot

A feature-rich, all-in-one Discord bot built with **discord.js v14** — economy, moderation, an AI chatbot, invite tracking, giveaways, suggestions, reaction roles, a counting game, and more, all backed by PostgreSQL.

![Node](https://img.shields.io/badge/node-%3E%3D18-339933?logo=nodedotjs&logoColor=white)
![discord.js](https://img.shields.io/badge/discord.js-v14-5865F2?logo=discord&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/database-PostgreSQL-4169E1?logo=postgresql&logoColor=white)

---

## ✨ Features

### 💰 Economy
- **Register & earn** — `/register` creates an account in the economy system.
- **`/beg`** — beg for spare change (30s cooldown). Wealthy users (50k+) risk losing money "to the devil," while poorer users tend to get blessed instead.
- **`/rob`** — attempt to steal from another user (15m cooldown, requires the target to have at least $300; victims are protected from being robbed again for 30 minutes).
- **`/trade`** — send money directly to another user.
- **`/gamble`** and **`/slots`** — risk your balance for a chance at more.
- **`/blackjack`** — play blackjack against the bot for a wager, with interactive Hit/Stand buttons.
- **`/bless`** — give money to another user (owner/admin flavor command).
- **`/balance`** and **`/leaderboard`** — check your (or someone else's) balance and see server rankings.
- **Account marketplace** — `/list` and `/unlist` let users list and remove in-game "accounts" for sale with custom names, prices, and details, complete with buy/preview buttons.

### 🛡️ Moderation & Safety
- **`/ban`**, **`/unban`**, **`/kick`**, **`/timeout`** — full moderation suite with permission checks on both the user and the bot, plus role-hierarchy validation. Timeouts support up to 672 hours (28 days).
- **Prefix (`?`) equivalents** — `?ban`, `?softban`, and `?purge` are also available as classic text commands.
- **`/honeypot`** — designate a trap channel; anyone (other than admins/the server owner) who posts in it is instantly banned or softbanned, with their recent messages purged.
- **`/autorole`** — automatically assign a role to every new member.
- **`/welcomer`** — send a welcome embed to a chosen channel whenever someone joins.
- **`/reactionrole`** — attach reaction roles to a message so members can self-assign roles.

### 🤖 AI Chatbot
- Mention the bot in a designated channel (`/setaichannel`) to chat with it. Responses are generated via the **Mistral** API, with the last 15 messages of channel history and reply context passed in for continuity.
- **Image & GIF understanding** — if a message includes an image, GIF, or a link that unfurls to one, the bot uses **Groq** (Llama 4 Scout, vision) to describe it before replying, so it can react to memes and pictures naturally.
- Long replies are automatically sent as a `.txt` file attachment instead of a wall of text.
- Ships with a fully customizable personality system prompt — edit `utils/getresponse.js` to change how the bot talks.

### 🎉 Community & Engagement
- **Giveaways** — `/giveaway` starts a timed giveaway with a join button; a background scheduler picks winners and announces them automatically when it ends.
- **Suggestions** — `/setsuggestionchannel` wires up a suggestion box with upvote/downvote buttons and separate accepted/denied channels.
- **QOTD (Question of the Day)** — `/setupqotd` picks a channel to receive a daily question at midnight; `/addqotd` lets users submit questions, and `/sendqotd` posts one on demand. Falls back to AI-generated questions when the queue runs dry.
- **Counting game** — `/setupcounting` designates a channel for a community counting challenge, with `/checknum`, `/leaderboard`, and `/setcountingnumber` (admin), plus automatic sabotage detection if someone edits/deletes their count.
- **Invite tracking** — automatically records who invited whom; `/invites`, `/inviter`, `/clearinvites`, and `/clearallinvites` let you audit invite activity per user or per server.

### 🔧 Utility
- **`/ping`** — check bot latency.
- **`/lookup`** — detailed info about a user (account creation date, server join date, roles, avatar).
- **`/server`** — server stats (channel/member counts, roles, owner, creation date, description).
- **`/status`** — change the bot's presence text and online state (owner-only).
- **`/help [category]`** — categorized command reference (Fun, Economy, Moderation, Community, Utility, Main).

### 🔌 GitHub Integration
- A built-in **Smee.io + Express** webhook listener relays `push` and `star` GitHub webhook events into a configured Discord channel as rich embeds — handy for a bot-development server that wants live commit/star notifications.

---

## 🛠️ Tech Stack

| Layer | Tech |
|---|---|
| Runtime | Node.js, discord.js v14 |
| Database | PostgreSQL (via `pg`) |
| AI | Mistral (chat) & Groq / Llama 4 Scout (vision) |
| Image processing | `sharp` (GIF frame extraction), `unfurl.js` (link previews) |
| Scheduling | `node-cron` (giveaway checks, daily QOTD) |
| Webhooks | `express` + `smee-client` (GitHub → Discord relay) |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js 18+**
- A **Discord application & bot token** — [Discord Developer Portal](https://discord.com/developers/applications)
- A **PostgreSQL database** (e.g. a free instance on Supabase, Neon, Railway, or a local installation)
- API keys for **Mistral** and **Groq** if you want the AI chatbot features
- *(Optional)* A [Smee.io](https://smee.io) channel URL if you want GitHub webhook → Discord relaying

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/sinlessone/LunaBot.git
   cd LunaBot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**

   Copy `.env-example` to `.env` and fill in your values:
   ```bash
   cp .env-example .env
   ```

   | Variable | Description |
   |---|---|
   | `DISCORD_TOKEN` | Your bot's token from the Developer Portal |
   | `CLIENT_ID` | Your application's client/application ID |
   | `MISTRAL_API_KEY` | Powers the AI chatbot's text replies |
   | `GROQ_API_KEY` | Powers image/GIF description for the AI chatbot |
   | `DATABASE_URL` | PostgreSQL connection string, e.g. `postgres://user:pass@host:5432/dbname` |
   | `SMEE_URL` | Your Smee.io channel URL, for GitHub webhook forwarding (optional) |

4. **Configure `config.json`**

   ```json
   {
     "footer": "Made with luv ❤️",
     "footerUrl": "https://your-icon-url",
     "ownerID": "your-discord-user-id",
     "status": "your bot's status text",
     "appearance": "online"
   }
   ```
   `ownerID` gates owner-only commands (like `/status`) and unlocks the AI chatbot's "owner mode" — set this to your own Discord user ID.

5. **Run the bot**
   ```bash
   node "Discord bot.js"
   ```

   On startup, the bot will:
   - Connect to Smee (if configured) and start the local webhook listener
   - Initialize all required PostgreSQL tables automatically
   - Register/refresh all slash commands with Discord
   - Log in and start listening for events

   Slash commands are deployed globally on every startup (via `Deploy.js`), so it may take up to an hour for new/changed commands to propagate on Discord's end the first time.

---

## 📁 Project Structure

```
LunaBot-master/
├── Commands/            # Slash commands, grouped by category
│   ├── community/       # QOTD commands
│   ├── eco/             # Account marketplace, giveaways
│   ├── fun/             # Economy games, counting, AI channel setup
│   ├── invites/         # Invite tracking commands
│   ├── moderation/      # Ban/kick/timeout/autorole/welcomer/reaction roles
│   ├── suggestions/     # Suggestion channel setup
│   └── util/            # Ping, server info, lookup, help, status
├── chatcommands/         # Legacy "?"-prefixed text commands (ban/softban/purge)
├── buttons/               # Interaction button handlers (blackjack, giveaways, voting, etc.)
├── handlers/              # Event handlers (commands, chat, joins, reactions, honeypot, AI chat...)
├── utils/                 # Database layer, helpers, cooldowns, config loaders
├── data/                  # Shared embed presets
├── smee/                  # Express server for GitHub webhook relaying
├── Deploy.js              # Registers slash commands with Discord
├── Discord bot.js         # Main entry point
├── config.json            # Bot-level configuration (owner ID, status, footer)
└── .env-example           # Template for required environment variables
```

---

## 💬 A Note on the AI Personality

The AI chatbot's tone and behavior are defined by a system prompt inside `utils/getresponse.js`. It's set up as a sarcastic, informal Discord persona out of the box — feel free to rewrite it to fit your own server's vibe.

---

## 🤝 Contributing

Issues and pull requests are welcome. If you add a new slash command, drop it into the appropriate `Commands/` subfolder with a `data` (SlashCommandBuilder) and `execute` export, and it'll be picked up automatically.

## 📄 License

This Project uses an MIT license, Check LICENSE file for more information
