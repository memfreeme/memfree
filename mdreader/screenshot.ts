import puppeteer from "puppeteer";
import path from "path";

async function captureScreenshot(
  url: string,
  outputPath: string
): Promise<void> {
  try {
    const browser = await puppeteer.launch();

    const page = await browser.newPage();

    await page.setViewport({ width: 1920, height: 1080 });

    await page.goto(url, { waitUntil: "networkidle0" });

    const pageHeight = await page.evaluate(
      () => document.documentElement.scrollHeight
    );

    await page.setViewport({ width: 1920, height: pageHeight });

    await page.screenshot({
      path: outputPath,
      fullPage: true,
      type: "png",
    });

    await browser.close();

    console.log(`Screenshot saved to: ${outputPath}`);
  } catch (error) {
    console.error("Error capturing screenshot:", error);
  }
}

const url = "https://www.ahaapple.com/";
const outputPath = path.join(__dirname, "screenshot.png");

await captureScreenshot(url, outputPath);
