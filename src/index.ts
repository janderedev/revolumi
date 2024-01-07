import * as dotenv from "dotenv";
dotenv.config();

import { Client, Message } from "revolt.js";
import { commands } from "./commands.js";
import { cat } from "./lib/owo.js";
import fs from 'fs';

const prefix = process.env.PREFIX || "real!"; // amazing prefix!
// Array.from(controllers.client.getReadyClient().servers.get('01F80118K1F2EYD9XAMCPQ0BCT').channels.keys()).join(',')
const allowedChannels = process.env.ALLOWED_CHANNELS?.split(',');

const stream = fs.createWriteStream('./command.log', {
  flags: 'a',
  mode: 0o0666,
})
function logCommand(message: Message, args: string[]) {
  const payload = {
    ts: new Date().toISOString(),
    author: {
      self: message.author_id == client.user?._id,
      id: message.author_id,
      name: message.author?.username, // too lazy to update revolt.js so it includes discrim, this is just for convenience anyway
    },
    command: args,
    channel: message.channel_id,
    server: message.channel?.server_id,
  };

  stream.write(JSON.stringify(payload) + '\n');
}

let client = new Client();

client.on("ready", async () =>
  console.info(`Logged in as ${client.user?.username}!`)
);

client.on("message", async msg => {
  if (!msg.content) return;
  if (
    process.env.CATTIFY?.toLowerCase() !== 'false' &&
    msg.author_id === client.user?._id &&
    (await cat(msg.content)) !== msg.content
  ) {
    try {
      msg.edit({ content: await cat(msg.content) });
    } catch(e) {
      console.error(e);
    }
  }
  if (!msg.content.startsWith(prefix) || msg.content.length >= 2000) return;
  if (allowedChannels && msg.author_id != client.user?._id && !allowedChannels.includes(msg.channel_id)) return;

  let splitted = msg.content.substring(5).split(" ");
  console.log(splitted);
  let fullArgs = [...splitted];
  let command = commands.get(splitted.shift() ?? "") ?? ((_: string) => null);
  let args = splitted.join(" ");
  let res: string | null = await command(args);
  logCommand(msg, fullArgs);
  console.log(res);

  try {
    if (res && res.length <= 1999) {
      if (msg.author_id === client.user?._id) msg.edit({ content: res });
      else msg.channel?.sendMessage('\u200b' + res);
    } else {
      msg.react('01GE404PWVWCVDPZHQR9DTC599');
    }
  } catch(e) {
    console.error(e);
  }
});

client.useExistingSession({
  token: process.env.TOKEN ?? "sus"
});
