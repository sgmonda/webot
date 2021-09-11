import { log } from "./deps.ts";
import { Bot } from './src/Bot.ts';

const randWord = () => Math.random().toString(36).slice(3, 7);

let emails = (await Deno.readTextFile("./emails.txt")).split('\n');
emails = [...emails, ...emails, ...emails, ...emails].map(email => email.replace('@', randWord() + '@'));
const bots = emails.map((email: string) => new Bot(email));

for await (const bot of bots) {
  log.info(`Running bot "${bot.email}"...`);
  try {
    await bot.run();
    console.log('BOT SUCCESS');
  } catch (err) {
    console.log('BOT failure', err);
  }
}

