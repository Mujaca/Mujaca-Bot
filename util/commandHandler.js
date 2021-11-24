const { SlashCommandBuilder, SlashCommandUserOption } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { ClientVoiceManager } = require('discord.js');
const fs = require('fs');
const { command, args } = require('../commands/ping');
const client = require('../util/client');
const logger = require('./logger');
require('dotenv').config()

const commandCallbacks = new Map();

const commands = []
	

fs.readdirSync("./commands/").forEach(async file => {
  var command = require(`../commands/${file}`);
  commandCallbacks.set(command.command,command.callback);
	var slashCommand = new SlashCommandBuilder().setName(command.command).setDescription(command.description);
	if(command.args.length > 0) {
		command.args.forEach(arg => {
			switch(arg.type) {
				case "string": slashCommand.addStringOption(option => option.setName(arg.name).setDescription(arg.description).setRequired(arg.required)); break;
				case "number": slashCommand.addNumberOption(option => option.setName(arg.name).setDescription(arg.description).setRequired(arg.required)); break;
				case "integer": slashCommand.addIntegerOption(option => option.setName(arg.name).setDescription(arg.description).setRequired(arg.required)); break;
				case "boolean": slashCommand.addBooleanOption(option => option.setName(arg.name).setDescription(arg.description).setRequired(arg.required)); break;
				case "user": slashCommand.addUserOption(option => option.setName(arg.name).setDescription(arg.description).setRequired(arg.required)); break;
				case "channel": slashCommand.addChannelOption(option => option.setName(arg.name).setDescription(arg.description).setRequired(arg.required)); break;
				case "role": slashCommand.addRoleOption(option => option.setName(arg.name).setDescription(arg.description).setRequired(arg.required)); break;
				case "mention": slashCommand.addMentionableOption(option => option.setName(arg.name).setDescription(arg.description).setRequired(arg.required)); break;
			}
		})
	}
  commands.push(slashCommand);
})
commands.map(command => command.toJSON());

const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);

(async () => {
	try {
		await rest.put(
			//Routes.applicationGuildCommands(client.application.id, process.env.TESTSERVER),
			Routes.applicationCommands(client.application.id),
			{ body: commands },
		);

		logger.log('Successfully registered application commands.');
	} catch (error) {
		console.error(error);
	}
})();


client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;
	const { commandName } = interaction;
	if(commandCallbacks.get(commandName)) {
    commandCallbacks.get(commandName)(interaction);
  }
});