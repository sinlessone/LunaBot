# 🌙 LunaBot

A feature-rich Discord bot built with Discord.js that brings economy, moderation, utility, and fun commands to your server!

---

## ✨ Features

### 💰 Economy System
- **User Registration & Accounts**: Register with `/register` to start earning currency
- **Beg Command**: Try your luck begging for money with `/beg` (cooldown: 30s)
    - Wealthy users (50k+) have a 20% chance of losing money to "the devil"
    - Poor users consistently receive blessings from kind-hearted individuals
- **Rob & Steal**: Use `/rob` to attempt stealing from other users (cooldown: 15m)
    - Victims can't be robbed again for 30 minutes
    - Requires at least 300$ to attempt a robbery
- **Account Marketplace**: List and manage accounts for sale
    - Create listings with `/list` (owner-only command)
    - Include custom pricing and additional information
    - Buyers can instantly purchase or view Terms of Service

### 🛡️ Moderation Tools
- **Kick Members**: `/kick` - Remove users from your server with optional reasons
    - Permission checks for both user and bot
    - Role hierarchy validation
- **Timeout Members**: `/timeout` - Mute users for specified durations
    - Support for up to 672 hours (28 days)
    - Custom reason logging
    - Role hierarchy protection
- **Admin Controls**:  Specialized commands for server administrators

### 🎮 Fun & Games
- **Counting Game**:  Community counting challenge
    - Track current counting number with `/counting`
    - Set custom starting numbers with `/setcountingnumber` (admin-only)
    - Leaderboard tracking for competitive servers
    - Support for multiple numeral systems
    - Automatic server disqualification for manual number setting

### 📊 Utility Commands
- **Ping**: `/ping` - Check bot latency and responsiveness
- **User Lookup**: `/lookup` - Get detailed information about users
    - Account creation date & time
    - Join date for server members
    - Role information
    - Avatar display
- **Server Info**: `/server` - Display comprehensive server statistics
    - Server name, icon, and owner
    - Channel counts (text & voice)
    - Member statistics (humans vs bots)
    - Role information
    - Server creation date
    - Server description (if available)
- **Status Command**: `/status` - Change bot status and online appearance (owner-only)

---

## 🚀 Getting Started

### Prerequisites
- Node. js 16.0 or higher
- A Discord bot token from [Discord Developer Portal](https://discord.com/developers/applications)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/sinlessone/LunaBot.git
   cd LunaBot