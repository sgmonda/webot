import { Account } from "../mod.d.ts";
import { puppeteer } from '../deps.ts';
import type { Page } from '../deps.ts';
import { settings } from '../settings.ts';

/** NOTE: To get URLs
 *   // const handles = await Promise.all(likeButtons.map(handle => handle.getProperty('href')));
     // const likeUrls = await Promise.all(handles.map(handle => handle?.jsonValue()))
 */

export class Bot {
  constructor(readonly props: Account) {
    console.log('NEW BOT', JSON.stringify(this));
  }

  public run = async () => {
    const page = await login(this.props);
    for (const keyword of this.props.keywords) {
      await search(page, keyword);
      await like(page);
    }
    await page.close();
  }
}

const search = async (page: Page, keyword: string): Promise<void> => {
  const input = await page.$(settings.SELECTOR_SEARCH_INPUT);
  await page.evaluate(input => input.setSelectionRange(0, input.value.length), input);
  await page.type(settings.SELECTOR_SEARCH_INPUT, keyword, { delay: settings.HUMAN_DELAY });
  await page.keyboard.press('Enter');
  await page.waitForSelector(settings.SELECTOR_SEARCH_TAB);
  await page.click(settings.SELECTOR_SEARCH_TAB);
  await page.waitForTimeout(settings.NAVIGATION_DELAY);
  await scrollDown(page);
}

const like = async (page: Page): Promise<void> => {
  const likeButtons = await page.$$(settings.SELECTOR_LIKE_BUTTONS);
  for (const button of likeButtons) {
    try {
      await page.evaluate((element) => element.click(), button); // Note: just "await button.click()" fails sometimes
      await page.waitForTimeout(settings.NAVIGATION_DELAY);
      console.log('👍 NEW LIKE!');
    } catch (err) {
      console.error(err);
    }
  }

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

const login = async ({ username, password }: Account): Promise<Page> => {
  const page = await openBrowser(settings.TWITTER_LOGIN_PAGE);
  await page.type(settings.SELECTOR_LOGIN_USERNAME, username, { delay: settings.HUMAN_DELAY });
  await page.type(settings.SELECTOR_LOGIN_PASSWORD, password, { delay: settings.HUMAN_DELAY });
  await page.click(settings.SELECTOR_LOGIN_BUTTON);
  await page.waitForSelector(settings.SELECTOR_SEARCH_INPUT);
  return page;
}

const openBrowser = async (url: string): Promise<Page> => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1280, height: 800, isMobile: false },
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle2" });
  return page;
}



