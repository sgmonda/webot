import { Account } from "../mod.d.ts";
import { puppeteer } from '../deps.ts';
import type { Page } from '../deps.ts';
import { settings } from '../settings.ts';



export class Bot {
  constructor(readonly props: Account) {
    console.log('NEW BOT', JSON.stringify(this));
  }

  public run = async () => {
    const page = await login(this.props);

  }
}

const login = async ({ username, password }: Account): Promise<Page> => {
  const page = await openBrowser(settings.TWITTER_LOGIN_PAGE);
  await page.type(settings.SELECTOR_LOGIN_USERNAME, username, { delay: settings.HUMAN_DELAY });
  await page.type(settings.SELECTOR_LOGIN_PASSWORD, password, { delay: settings.HUMAN_DELAY });
  await page.click(settings.SELECTOR_LOGIN_BUTTON);
  await page.waitForTimeout(settings.NAVIGATION_DELAY);
  try {
    await page.select(settings.SELECTOR_HOME_MENU);
  } catch (err) {
    console.error(err);
    throw new Error('Login error. Are credentials right?');
  }
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



