import {Message} from 'discord.js';
import {v4 as uuidv4} from 'uuid';
import * as commands from './commands';
import {filter} from './wholesome';

export default async function parse(message: Message) {
	try {
		if (message.channel.type === 'text' && (message.channel.topic || '').includes('neato')) {
			if (/\[.*neato cmd.*]/.test(message.channel.topic)) {
				await parseCMD(message);
			} else if (/\[.*neato github.*]/.test(message.channel.topic)) {
				await message.channel.send('Sorry, this isn\'t implemented yet.');
			} else if (/\[.*neato wholesome.*]/.test(message.channel.topic)) {
				await filter(message);
			} else if (/\[.*neato null.*]/.test(message.channel.topic)) {
				await message.delete();
			} else if (/\[.*neato cringle.*]/.test(message.channel.topic)) {
				const emoji = message.guild.emojis.cache.find(emoji => emoji.name === 'cringle');
				await message.react(emoji);
			} else {
				await message.channel.send('I\'m not sure what this channel is for.');
			}
		}
	} catch (error) {
		const errorID = uuidv4();
		await message.channel.send(`Sorry, ${message.author.tag}, your command failed with error ID ${errorID}.`);
		console.error(errorID);
		console.error(error);
	}
}

async function parseCMD(message: Message) {
	const argv = message.content.split(' ');
	const cmd = argv[0];
	const argStrings = argv.slice(1);
	const args = {};
	for (const arg of argStrings) {
		if (arg.includes('=') && !arg.includes('_')) {
			const pair = arg.split('=');
			args[pair[0]] = pair[1];
		} else {
			await message.channel.send(`Sorry, ${message.author.tag}, your command's syntax is invalid.`);
			return;
		}
	}

	if (typeof commands[cmd] === 'function') {
		const result = await commands[cmd](args, message);
		await message.channel.send(result);
	} else {
		await message.channel.send(`Sorry, ${message.author.tag}, that command doesn't exist.`);
	}
}

