# Discord Activities Bot

A simple slash command bot for opening Discord voice channel activities, using [Cloudflare Workers](https://workers.cloudflare.com)

**[Add the bot](https://discord.com/api/oauth2/authorize?client_id=819778342818414632&scope=bot%20applications.commands)**  

After adding, use `/activity`

Bot code is in [src/bot.ts](https://github.com/advaith1/activities/blob/main/src/bot.ts)

Requires [Wrangler with custom builds](https://github.com/cloudflare/wrangler/releases/tag/v1.15.0-custom-builds-rc.0)

[Secrets](https://developers.cloudflare.com/workers/cli-wrangler/commands#secret): `publicKey`, `token`

Based on [`workers-typescript-template`](https://github.com/cloudflare/worker-typescript-template), modified for Webpack 5

`workers-typescript-template` Copyright (c) 2020 Cloudflare, Inc.
