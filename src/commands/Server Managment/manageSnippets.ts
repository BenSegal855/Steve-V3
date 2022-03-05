import { ApplyOptions } from '@sapphire/decorators';
import type { Args } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';
import type { SubCommandPluginCommandOptions } from '@sapphire/plugin-subcommands';
import type { Message } from 'discord.js';
import { SteveCommand } from '../../lib/extensions/SteveCommand';
import { sendLoadingMessage } from '../../lib/utils';

@ApplyOptions<SubCommandPluginCommandOptions>({
	description: 'Add, remove or edit snips.',
	requiredUserPermissions: 'MANAGE_MESSAGES',
	aliases: ['mannagesnippet', 'managesnips', 'managesnip'],
	runIn: 'GUILD_ANY',
	detailedDescription: {
		usage: '<add|remove|edit> <snip name> [snip contents]',
		examples: [
			'add bed Go to sleep!!!!!',
			'edit tacos It\'s TACO TIME',
			'remove "Unhelpful snip"'
		],
		extendedHelp: `If you want the snippet name to be more than one work, put it in quotes.
		*Note: Doing this will still allow auto snips, users will just need to use a \`-\` in place of any spaces.*`
	},
	subCommands: [
		'add',
		'remove',
		'edit',
		{ input: 'create', output: 'add' },
		{ input: 'delete', output: 'remove' },
		{ input: 'update', output: 'edit' }
	]
})
export class UserCommand extends SteveCommand {

	public async add(msg: Message, args: Args) {
		if (!msg.guildId) {
			return send(msg, 'You must be in a server to manage snips!');
		}

		const response = await sendLoadingMessage(msg);

		const snipName = (await args.pick('string')).toLocaleLowerCase();
		const content = await args.rest('string');
		const snipId = snipName.replace(' ', '-');

		await this.client.db.snips.insertOne({
			guildId: msg.guildId,
			snipId,
			snipName,
			content
		});

		return response.edit(`Created new snippet **${snipName}**${snipId === snipName ? '' : ` with snippet id of **${snipId}**`}.`);
	}

	public async remove(msg: Message, args: Args) {
		const response = await sendLoadingMessage(msg);

		const snip = await args.pick('snippet');

		await this.client.db.snips.findOneAndDelete(snip);

		return response.edit(`Deleted **${snip.snipName}**.`);
	}

	public async edit(msg: Message, args: Args) {
		const response = await sendLoadingMessage(msg);

		const snip = await args.pick('snippet');
		const content = await args.rest('string');

		await this.client.db.snips.findOneAndUpdate(snip, { $set: { content }});

		return response.edit(`**${snip.snipName}** has been updated.`);
	}

}
