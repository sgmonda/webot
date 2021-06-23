import type { Account } from './mod.d.ts';
import { Bot } from './src/Bot.ts';

const json = await Deno.readTextFile('./accounts.json');
const accounts = JSON.parse(json) as Account[];
const bots = accounts.map(account => new Bot(account));

await bots[0].run(); // @TODO Run all bots, not only the first one
