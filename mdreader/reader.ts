import TurndownService from "turndown";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import { browserService } from "./browser";

export async function urlToMarkdown(url: string): Promise<string> {
  console.time("puppeteer");
  const page = await browserService.newPage();
  await page.goto(url, {
    waitUntil: "networkidle2",
    timeout: 60000,
  });
  const documentContent = await page.evaluate(
    () => document.documentElement.outerHTML
  );
  console.timeEnd("puppeteer");

  console.time("dom");
  const dom = new JSDOM(documentContent);
  console.timeEnd("dom");

  console.time("Readability");
  let reader = new Readability(dom.window.document, {
    charThreshold: 0,
    keepClasses: true,
    nbTopCandidates: 500,
  });
  const article = reader.parse();
  console.timeEnd("Readability");

  console.time("turndown");
  const turndownService = new TurndownService();
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
  rules.forEach((rule) => turndownService.addRule(rule.name, rule as any));

  let markdown = turndownService.turndown(article?.content || "");
  console.timeEnd("turndown");
  await page.close();
  return markdown;
}
