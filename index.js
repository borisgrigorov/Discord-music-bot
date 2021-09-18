"use strict";
const Discord = require("discord.js");
const client = new Discord.Client();
const config = require("./config.json");
const Messages = require("./messages");
const messages = new Messages(client);

client.on("ready", () => {
  console.log("Logged in as user " + client.user.tag);
});

client.on("message", (msg) => {
    messages.onMessage(msg);
});

client.login(config.token);

