# MemFree

<a href="https://www.memfree.me">
  <img alt="MemFree – Hybrid AI Search Engine" src=".assets/memfree-ai-search.gif" width="100%">
</a>
<a href="https://www.memfree.me">
  <h1 align="center">MemFree</h1>
  <p align="center"><b>An Open Source Hybrid AI Search Engine</b></p>
</a>

<h4 align="center">
  <a href="https://twitter.com/ahaapple2023">
    <img src="https://img.shields.io/twitter/follow/llmreport?style=flat&label=%40ahaapple&logo=twitter&color=0bf&logoColor=fff" alt="Twitter" />
  </a>
  <a href="https://github.com/memfreeme/memfree/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/memfreeme/memfree?label=license&logo=github&color=f80&logoColor=fff" alt="License" />
  </a>
  <a href="https://github.com/memfreeme/memfree/issues">
    <img src="https://img.shields.io/github/commit-activity/m/memfreeme/memfree" alt="git commit activity" />
  </a>
    <a href="https://chromewebstore.google.com/detail/memfree/dndjodcanbhkomcgihbhcejogiimdmpk">
    <img src="https://img.shields.io/chrome-web-store/v/afpgkkipfdpeaflnpoaffkcankadgjfc?style=flat-square&color=blueviolet" alt="Chrome Web Store">
  </a>
  <a href="https://discord.com/invite/7QqyMSTaRq">
    <img src="https://img.shields.io/badge/chat-on%20Discord-blueviolet" alt="Discord Channel" />
  </a>

</h4>

<br/>

## What's the MemFree

MemFree is a <b>Hybrid AI Search Engine</b>.

With MemFree, you can instantly get Accurate Answers from your knowledge base and the whole internet.

## What can you do with MemFree

- Search and ask questions with **text, images, files, and web pages**.
- Get search results for **text, mind maps, images, and videos** with one click
- Compare, summarize and search **multiple images**.
- Summarize web pages and PDFs, and ask questions about their content
- Ask Twitter and Academic Questions
- Explain and generate code efficiently
- Perform most tasks available in ChatGPT Plus, Claude Pro, and Gemini Advanced.

## What value does MemFree bring to you

- **Streamlined Knowledge Management**: No need to manually organize your knowledge base (notes, bookmarks and documents). When you need information or answers, just search in memfree with one click, freeing up your memory capacity and improving your productivity.
- **Time-Saving Efficiency**: No need to click on multiple web pages one by one in the Google search results. Memfree uses AI to immediately summarize the best answers from multiple web pages and your knowledge base, saving you a lot of time every day.
- **Cost-Effective Solution**: No need to subscribe to multiple AI tools such as ChatGPT Plus, Claude Pro, and Gemini Advanced, which will significantly reduce your monthly subscription fees

## MemFree Feature List

- Multi AI Models: ChatGPT, Claude, Gemini

- Milti Search Engines: Google, Exa, Vector

- Multi Local file formats: Txt, PDF, Docx, PPTX, Markdown

- Save search history and search results and multi devices sync

- Multi languages support: English, Chinese, German, French, Spanish, Japanese and Arabic

- One-Click Chrome Bookmarks Sync and Indexing

- Share your search results

- Context-based continuous search

- Automatically decide whether to search the Internet
- Self-Hosted, Super-Fast Serverless Vector Database
- Full Code Open Source
- One-Click Deployment

## MemFree Hybrid AI Search Workflow

<img alt="MemFree Hybrid AI Search workflow" src="frontend/public/memfree-hybrid-ai-search.webp" width="100%">

## ChangeLog

[MemFree ChangeLog](https://feedback.memfree.me/changelog)

## Tech Stack

[Hybrid AI Search Full Tech Stack](https://www.memfree.me/blog/hybrid-ai-search-tech-stack)

## One-Click Deployment

[MemFree One-Click Deployment guide](https://www.memfree.me/docs/one-click-deploy-ai-search)

### 1 Deploy Backend with Zeabur

<a href="https://zeabur.com/templates/CE71SC?referralCode=memfree"><img src="https://zeabur.com/button.svg" alt="Deploy on Zeabur"/></a>

### 2 Deploy Frontend with Vercel

<a href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fmemfreeme%2Fmemfree&env=UPSTASH_REDIS_REST_URL,UPSTASH_REDIS_REST_TOKEN,OPENAI_API_KEY,MEMFREE_HOST,AUTH_SECRET,API_TOKEN&envDescription=https%3A%2F%2Fgithub.com%2Fmemfreeme%2Fmemfree%2Fblob%2Fmain%2Ffrontend%2Fenv-example&project-name=memfree&repository-name=memfree&demo-title=MemFree&demo-description=MemFree – Hybrid AI Search Engine&demo-url=https%3A%2F%2Fwww.memfree.me%2F&demo-image=https%3A%2F%2Fwww.memfree.me%2Fog.png&root-directory=frontend"><img src="https://vercel.com/button" alt="Deploy with Vercel"/></a>

### 3 One Command Deploy Backend with Fly.io

- [One Command Deploy MemFree Vector on Fly.io](https://www.memfree.me/docs/deploy-memfree-fly-io)

## Self-Hosted Installation

### Prerequisites

#### Intsall Bun

```
curl -fsSL https://bun.sh/install | bash
```

#### Upstash Redis

Create a Redis compatible database in seconds: [Upstash Redis](https://upstash.com/docs/redis/overall/getstarted)

#### OpenAI API Key

Get an OpenAI API Key: [OpenAI](https://platform.openai.com)

#### Serper API Key

Get a Serper API Key: [Serper](https://serper.dev/api-key)

### Frontend

```
cd frontend

bun i

cp env.example .env

bun run dev
```

### Vector Service

```
cd vector

bun i

bun run index.ts
```

### Extension

```
cd extension

bun i

bun run build
```

## Contributing

Here's how you can contribute:

- [Open an issue](https://github.com/memfreeme/memfree/issues) if you believe you've encountered a bug.
- Make a [pull request](https://github.com/memfreeme/memfree/pulls) to add new features/make quality-of-life improvements/fix bugs.

## Help and Support

- [MemFree Feedback](https://feedback.memfree.me/)
- [MemFree Discord](https://discord.com/invite/7QqyMSTaRq)

## Roadmap

- [MemFree Roadmap](https://feedback.memfree.me/roadmap)

## License

MemFree is backed by [MemFree](https://www.memfree.me/) and licensed under [MIT](https://github.com/memfreeme/memfree/blob/main/LICENSE).

## Credits

- [bun](https://github.com/oven-sh/bun) – Incredibly fast JavaScript runtime, bundler, test runner, and package manager – all in one
- [lancedb](https://github.com/lancedb/lancedb) – Developer-friendly, serverless vector database for AI applications
- [fastembed-rs](https://github.com/Anush008/fastembed-rs) – Library for generating vector embeddings, reranking in Rust
- [next-saas-stripe-starter](https://github.com/mickasmt/next-saas-stripe-starter) – Open-source SaaS Starter with User Roles & Admin Panel.
- [next-chrome-starter](https://github.com/ibnzUK/next-chrome-starter) – Next.js Chrome Extension Starter
- [ai-chatbot](https://github.com/vercel/ai-chatbot) – A full-featured, hackable Next.js AI chatbot built by Vercel
