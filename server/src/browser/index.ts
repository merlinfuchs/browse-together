import { KeyInput, Page, Browser as PupBrowser, launch } from "puppeteer";

const height = 1080;
const width = 1920;

export class Browser {
  inner: PupBrowser;
  page: Page;

  screenshotPromise: Promise<Buffer> | null = null;

  constructor(inner: PupBrowser, activePage: Page) {
    this.inner = inner;
    this.page = activePage;
  }

  getCurrentFrame() {
    if (this.screenshotPromise) {
      return this.screenshotPromise;
    }

    this.screenshotPromise = new Promise(async (resolve) => {
      const tryScreenshot = async () => {
        try {
          const img = await Promise.race([
            this.page.screenshot({
              type: "jpeg",
              quality: 75,
              optimizeForSpeed: true,
            }),
            new Promise<Buffer>((_, reject) =>
              setTimeout(
                () => reject("Screenshot timed out, retrying ..."),
                250
              )
            ),
          ]);

          this.screenshotPromise = null;
          resolve(img);
        } catch (e) {
          console.error(e);
          await this.page.bringToFront();
          await this.page.evaluate(() => requestAnimationFrame(() => {}));
          setTimeout(tryScreenshot, 50);
        }
      };

      tryScreenshot();
    });

    return this.screenshotPromise;
  }

  async getFaviconUrl() {
    const { host } = new URL(this.page.url());
    const faviconUrl = `https://www.google.com/s2/favicons?domain=${host}&sz=256`;
    return await fetch(faviconUrl)
      .then((res) => res.blob())
      .then(async (blob) => {
        const buf = Buffer.from(await blob.arrayBuffer());
        return `data:${blob.type};base64,${buf.toString("base64")}`;
      });
  }

  goto(url: string) {
    return this.page.goto(url);
  }

  goBack() {
    return this.page.goBack();
  }

  goForward() {
    return this.page.goForward();
  }

  refresh() {
    return this.page.reload();
  }

  getUrl() {
    return this.page.url();
  }

  async click(x: number, y: number, button?: "left" | "right") {
    await this.page.mouse.click(x * width, y * height, {
      button,
    });
  }

  async scroll(deltaX: number, deltaY: number) {
    await this.page.mouse.wheel({ deltaX, deltaY });
  }

  async keyUp(key: string) {
    await this.page.keyboard.up(key as KeyInput);
  }

  async keyDown(key: string) {
    await this.page.keyboard.down(key as KeyInput);
  }

  async close() {
    await this.inner.close();
  }
}

export async function createBrowser() {
  const inner = await launch({
    defaultViewport: {
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
    },
    args: [
      "--headless=new",
      "--disable-infobars",
      "--no-sandbox",
      "--window-size=1920,1080",
      "--disable-setuid-sandbox",
      "--ozone-override-screen-size=1920,1080",
    ],
  });

  const pages = await inner.pages();
  if (pages.length > 0) {
    await pages[0].goto("https://duckduckgo.com/");

    for (let i = 1; i < pages.length; i++) {
      await pages[i].close();
    }

    return new Browser(inner, pages[0]);
  } else {
    const page = await inner.newPage();
    await page.goto("https://duckduckgo.com/");
    return new Browser(inner, page);
  }
}
