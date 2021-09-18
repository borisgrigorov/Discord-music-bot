const Discord = require("discord.js");
const ytdl = require("ytdl-core");
const config = require("./config.json");

module.exports = class Messages {
    constructor(client) {
        this.client = client;
    }

    onMessage(msg) {
        if (this.isMessageCommand(msg, config.prefix)) {
            var commands = this.getCommandWithParams(msg);
            if (commands[0] == "ping") {
                var ping = Date.now() - msg.createdTimestamp;
                msg.reply("Pong! (" + ping + "ms)");
            } else if (commands[0] == "hello") {
                msg.reply("Hi!");
            } else if (commands[0] == "leave") {
                if (this.voice) {
                    this.voice.disconnect();
                    msg.channel.send("Bye.");
                    this.isPlaying = false;
                } else {
                    msg.channel.send("I'm not connected, so I can't leave.");
                }
            } else if (commands[0] == "play" || commands[0] == "p") {
                this.play(msg, commands);
            } else if (commands[0] == "pause") {
                this.pause(msg, commands);
            } else if (commands[0] == "resume") {
                this.resume(msg, commands);
            } else if (commands[0] == "volume") {
                this.volume(msg, commands);
            } else if (commands[0] == "er") {
                this.earrape(msg, commands);
            } else {
                msg.channel.send("Unknown command");
            }
        }
    }
    isMessageCommand(msg, command) {
        if (msg.content.charAt(0) == command) {
            return true;
        } else {
            return false;
        }
    }

    getCommandWithParams(msg) {
        return msg.content.slice(1).split(" ");
    }

    async play(msg, commands) {
        var user = await msg.channel.guild.members.cache.get(msg.author.id);
        if (commands.length < 2) {
            msg.channel.send("Specify Youtube link.");
            return;
        } else if (!user.voice.channel) {
            msg.channel.send(
                "You have to be in voice channel to use this command."
            );
        } else if (
            /^(https?\:\/\/)?((www\.)?youtube\.com|youtu\.?be)\/.+$/.test(
                commands[1]
            )
        ) {
            msg.channel.startTyping();
            var metadata = await ytdl.getBasicInfo(commands[1]);
            msg.channel.send("**Playing** " + metadata.videoDetails.title);
            this.client.channels.cache
                .get(user.voice.channel.id)
                .join()
                .then((voice) => {
                    this.player = voice.play(
                        ytdl(commands[1], { quality: "highestaudio" })
                    );
                    this.voice = voice;
                    this.isPlaying = true;
                });
            msg.channel.stopTyping();
        } else {
            msg.channel.send("Invalid link");
        }
    }

    async pause(msg, commands) {
        var user = await msg.channel.guild.members.cache.get(msg.author.id);
        if (!user.voice.channel) {
            msg.channel.send(
                "You have to be in voice channel to use this command."
            );
        } else {
            if (this.isPlaying == true) {
                this.player.pause();
                this.isPlaying = false;
                msg.channel.send("**Paused**");
            } else {
                msg.channel.send("Nothing is playing rn");
            }
        }
    }

    async resume(msg, commands) {
        var user = await msg.channel.guild.members.cache.get(msg.author.id);
        if (!user.voice.channel) {
            msg.channel.send(
                "You have to be in voice channel to use this command."
            );
        } else {
            if (this.isPlaying == false && this.player != null) {
                this.player.resume();
                this.isPlaying = true;
                msg.channel.send("**Resumed**");
            } else {
                msg.channel.send("Nothing is playing rn");
            }
        }
    }

    async volume(msg, commands) {
        var user = await msg.channel.guild.members.cache.get(msg.author.id);
        if (!user.voice.channel) {
            msg.channel.send(
                "You have to be in voice channel to use this command."
            );
        } else if (commands[1] > 50000 || commands[1] <= 0) {
            msg.channel.send("Enter value between 0.1 and 1.0");
        } else {
            if (this.player != null) {
                this.player.setVolume(commands[1]);
                msg.channel.send("Volume set to **" + commands[1] + "**");
            } else {
                msg.channel.send("Nothing is playing rn");
            }
        }
    }

    async earrape(msg, commands) {
        var user = await msg.channel.guild.members.cache.get(msg.author.id);
        if (!user.voice.channel) {
            msg.channel.send(
                "You have to be in voice channel to use this command."
            );
        } else if (commands[1] > 60 || commands[1] <= 0) {
            msg.channel.send("Enter value between 60 and 1");
        } else {
            if (this.player != null) {
                this.player.setVolume(500);
                msg.channel.send(
                    "Earraping for **" + commands[1] + "** seconds"
                );
                setTimeout(() => {
                    try {
                        this.player.setVolume(1);
                    } catch (e) {}
                }, commands[1] * 1000);
            } else {
                msg.channel.send("Nothing is playing rn");
            }
        }
    }
};
