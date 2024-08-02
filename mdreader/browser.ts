import { Browser, Page } from "puppeteer";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

puppeteer.use(StealthPlugin());

class BrowserService {
  private browser: Browser | null = null;
  private browserReady: Promise<Browser>;

  constructor() {
    this.browserReady = this.init();
  }

  private async init(): Promise<Browser> {
    try {
      this.browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
      console.log("Browser launched");
      return this.browser;
    } catch (error) {
      console.error("Failed to launch browser:", error);
      throw error;
    }
  }

  async newPage(): Promise<Page> {
    try {
      const browser = await this.browserReady;
      const page = await browser.newPage();
      await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
      );
      await page.setViewport({ width: 1280, height: 800 });
      return page;
    } catch (error) {
      console.error("Failed to create new page:", error);
      throw error;
    }
  }

  async close() {
    if (this.browser) {
      try {
        await this.browser.close();
      } catch (error) {
        console.error("Failed to close browser:", error);
      } finally {
        this.browser = null;
      }
    }
  }
}

export const browserService = new BrowserService();
