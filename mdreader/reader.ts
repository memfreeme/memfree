import TurndownService from "turndown";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import { browserService } from "./browser";

function createTurndownService(url: string): TurndownService {
  const rules = [
    {
      name: "header",
      filter: ["h1", "h2", "h3"],
      replacement: (content: string, node: HTMLElement) => {
        const level = node.tagName.toLowerCase();
        const prefix = "#".repeat(parseInt(level[1], 10));
        return `${prefix} ${content}\n\n`;
      },
    },
    {
      name: "absolute-image-paths",
      filter: "img",
      replacement: (content: string, node: HTMLElement) => {
        const src = node.getAttribute("src");
        if (src) {
          const absoluteSrc = new URL(src, url).href;
          return `![${node.getAttribute("alt") || ""}](${absoluteSrc})`;
        }
        return "";
      },
    },
  ];

  const turndownService = new TurndownService();
  rules.forEach((rule) => turndownService.addRule(rule.name, rule as any));
  return turndownService;
}

async function createNewPage(url: string) {
  let page;
  try {
    page = await browserService.newPage();
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      if (["image", "stylesheet", "font"].includes(req.resourceType())) {
        req.abort();
      } else {
        req.continue();
      }
    });
    await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: 20000,
    });
    return page;
  } catch (error) {
    if (page) await page.close();
    console.error("Failed to create new page:", error);
    return null;
  }
}

export async function urlToMarkdown(url: string): Promise<string> {
  console.time(`urlToMarkdown ${url}`);
  const page = await createNewPage(url);
  if (!page) {
    throw new Error("Failed to create new page");
  }

  try {
    const documentContent = await page.evaluate(
      () => document.documentElement.outerHTML
    );

    const dom = new JSDOM(documentContent, {
      url: url,
    });

    let reader = new Readability(dom.window.document, {
      charThreshold: 0,
      keepClasses: true,
      nbTopCandidates: 20,
    });
    const article = reader.parse();

    dom.window.close();

    const turndownService = createTurndownService(url);
    let markdown = turndownService.turndown(article?.content || "");
    markdown = `Title: ${article?.title}\n${markdown}`;
    return markdown;
  } catch (error) {
    console.error("Failed to convert URL to markdown:", url, error);
    return "";
  } finally {
    await page.close();
    console.timeEnd(`urlToMarkdown ${url}`);
  }
}
