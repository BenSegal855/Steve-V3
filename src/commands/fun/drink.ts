import { ApplyOptions } from '@sapphire/decorators';
import type { Args, CommandOptions } from '@sapphire/framework';
import type { Message } from 'discord.js';
import { SteveCommand } from '@lib/extensions/SteveCommand';
import { send } from '@sapphire/plugin-editable-commands';

@ApplyOptions<CommandOptions>({
	description: 'DRINK'
})
export class UserCommand extends SteveCommand {

	public async messageRun(msg: Message, args: Args) {
		const response = await send(msg, `**${args.finished ? '' : `${await args.rest('string')} `}DRINK!**`);
		await response.react('🍻');
		return response;
	}

}
