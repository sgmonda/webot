import { puppeteer, log } from '../deps.ts';
import type { Browser, Page } from '../deps.ts';
import { settings } from '../settings.ts';
export class Bot {
  constructor(public readonly email: string) { }

  public run = async () => {
    const { page, browser } = await openBrowser('https://es.surveymonkey.com/r/PremiosIvooxAudiencia2021');
    await page.waitForTimeout(1000);

    const sections = await page.$$('.survey-page-body');
    const button = await sections[0].$('button');
    button?.click();

    const questions = await page.$$('.questions > .question-row');
    log.info(`There are ${questions.length} questions`);
    await page.waitForTimeout(1000);

    // Question 1 (email verification)
    const email = this.email;
    const input = await questions[0].$('input');
    input?.type(email[0]);
    await page.waitForTimeout(100);
    input?.type(email.slice(1));
    await page.waitForTimeout(1000);
    (await questions[0].$('button'))?.click();

    // Question 2 (vote)
    const elements = (await questions[1].$$('.checkbox-button-container'));
    for (const el of elements) {
      const label = (await el.$('label > span:nth-child(2)'));
      const text = await page.evaluate(element => element.textContent, label);
      if (!text.toLowerCase().includes('tontunario')) continue;
      el.click();
      await page.waitForTimeout(1000);
    }

    for (let i = 2; i < 9; i++) {
      const q = questions[i];
      const els = await q.$$('.checkbox-button-container');
      const index = Math.floor(Math.random() * els.length);
      els[index]?.click();
      await page.waitForTimeout(1000);
    }

    // Question 10 (age)
    let question = questions[9];
    let checkboxes = await question.$$('label.answer-label');
    checkboxes[2]?.tap();
    await page.waitForTimeout(1000);

    // Question 10 (sex)
    question = questions[10];
    checkboxes = await question.$$('label.answer-label');
    checkboxes[Math.floor(Math.random() * 2)]?.tap();
    await page.waitForTimeout(1000);

    // Question 10 (sex)
    question = questions[11];
    checkboxes = await question.$$('label.answer-label');
    checkboxes[Math.floor(Math.random() * checkboxes.length)]?.tap();
    await page.waitForTimeout(1000);

    const actions = await page.$('.survey-submit-actions');
    (await actions?.$('button'))?.click();
    await page.waitForTimeout(1000 * 5);
    await page.close();
    await browser.close();

    log.info('Finished');
  }



  //   private searchAndLike = async (page: Page) => {
  //     for (const keyword of this.props.keywords) {
  //       await search(page, keyword);
  //       await likeAll(page);
  //     }
  //   }
  // }

  // const downloadVideos = async (account: Account) => {
  //   if (!account.reddit) return;
  //   log.info(`Downloading videos from reddit... `);
  //   const { page } = await openBrowser(account.reddit);
  //   await page.waitForTimeout(settings.NAVIGATION_DELAY);
  //   await scrollDown(page);
  //   const videos = await page.$$('video');
  //   for await (const video of videos) {
  //     try {
  //       const sources = await video.$$('source');
  //       const url: string = await page.evaluate(source => source.src, sources[0]);
  //       if (!url.startsWith('https://v.redd.it/')) continue;
  //       const [_, name] = url.match(/v\.redd\.it\/([^\/]+)\//) || [];

  //       const { browser: b, page: p } = await openBrowser(url);
  //       console.log('AUX', p);


  //       await download(url, `video/${name}.mp4`);
  //       // const source = await sources[0].asElement()?.getProperty('src');
  //       // console.log('SOURCE', source);
  //       await page.waitForTimeout(settings.NAVIGATION_DELAY);
  //     } catch (err) {
  //       console.error(err);
  //     }
  //   }
  // }

  // const download = async (url: string, path: string) => {
  //   const res = await fetch(url);
  //   if (!res.body) return;
  //   log.info(`Downloading "${url}" as "${path}"...`);
  //   const file = await Deno.open(path, { create: true, write: true });
  //   for await (const chunk of res.body) {
  //     await Deno.writeAll(file, chunk);
  //   }
  //   file.close();
  //   log.info(`Download finished as "${path}"...`);
  // };

  // const search = async (page: Page, keyword: string): Promise<void> => {
  //   const input = await page.$(settings.SELECTOR_SEARCH_INPUT);
  //   await page.evaluate(input => input.setSelectionRange(0, input.value.length), input);
  //   await page.type(settings.SELECTOR_SEARCH_INPUT, keyword, { delay: settings.HUMAN_DELAY });
  //   await page.keyboard.press('Enter');
  //   await page.waitForSelector(settings.SELECTOR_SEARCH_TAB);
  //   await page.click(settings.SELECTOR_SEARCH_TAB);
  //   await page.waitForTimeout(settings.NAVIGATION_DELAY);
  //   await scrollDown(page);
  // }

  // const likeAll = async (page: Page): Promise<void> => {
  //   const likeButtons = await page.$$(settings.SELECTOR_LIKE_BUTTONS);
  //   for (const button of likeButtons) {
  //     try {
  //       await page.evaluate((element) => element.click(), button); // Note: just "await button.click()" fails sometimes
  //       await page.waitForTimeout(settings.NAVIGATION_DELAY);
  //       log.info('👍 Like!');
  //     } catch (err) {
  //       console.error(err);
  //     }
  //   }
  // }



  // const login = async ({ username, password }: Account): Promise<{ page: Page, browser: Browser }> => {
  //   const { browser, page } = await openBrowser(settings.TWITTER_LOGIN_PAGE);
  //   await page.type(settings.SELECTOR_LOGIN_USERNAME, username, { delay: settings.HUMAN_DELAY });
  //   await page.type(settings.SELECTOR_LOGIN_PASSWORD, password, { delay: settings.HUMAN_DELAY });
  //   await page.click(settings.SELECTOR_LOGIN_BUTTON);
  //   await page.waitForSelector(settings.SELECTOR_SEARCH_INPUT);
  //   return { browser, page };
  // }
}

const isHeadless = Deno.args.includes('--headless');

const openBrowser = async (url: string): Promise<{ page: Page, browser: Browser }> => {
  const browser = await puppeteer.launch({
    headless: isHeadless,
    defaultViewport: { width: 1280, height: 800, isMobile: false },
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle2" });
  return { browser, page };
}

const scrollDown = async (page: Page): Promise<void> => {
  try {
    let previousHeight = 0;
    for (let i = 0; i < settings.SCROLL_TIMES; i++) {
      previousHeight = await page.evaluate('document.body.scrollHeight');
      await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
      await page.waitForFunction(`document.body.scrollHeight > ${previousHeight}`);
      await page.waitForTimeout(settings.NAVIGATION_DELAY);
    }
  } catch (err) {
    console.error(err);
  }
}

