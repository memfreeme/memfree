# MemFree

<a href="https://www.memfree.me">
  <img alt="MemFree – Hybrid AI Search Engine" src=".assets/memfree-ai-search.gif" width="100%">
</a>

<h1 align="center"><a href="https://www.memfree.me">MemFree</a></h1>

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
    <img src="https://img.shields.io/chrome-web-store/v/dndjodcanbhkomcgihbhcejogiimdmpk?style=flat-square&color=blueviolet" alt="Chrome Web Store">
  </a>
  <a href="https://discord.com/invite/7QqyMSTaRq">
    <img src="https://img.shields.io/badge/chat-on%20Discord-blueviolet" alt="Discord Channel" />
  </a>

</h4>

<br/>

## What's the MemFree

MemFree is a <b>Hybrid AI Search Engine</b>.

With MemFree, you can instantly get Accurate Answers from your knowledge base and the whole internet.

## Key Capabilities

With MemFree, you can:

- **Search and ask questions** using text, images, files, and web pages.
- **Access results** in multiple formats, including text, mind maps, images, and videos, with just one click.
- **Compare, summarize, and analyze** multiple images effortlessly.
- **Summarize web pages and PDFs** and ask questions about their content.
- **Generate and explain code** with efficiency.
- **Ask academic and Twitter-based questions** using specialized AI models.
- **Perform tasks found in other AI tools** like ChatGPT Plus, Claude Pro, and Gemini Advanced.

## What Makes MemFree Valuable?

- **Efficient Knowledge Management**: MemFree eliminates the need for manual organization of notes, bookmarks, and documents. When you need information, simply search within MemFree to quickly find relevant answers, freeing up your memory and boosting productivity.
- **Time-Saving AI Summaries**: Instead of clicking through multiple Google search results, MemFree uses AI to instantly summarize the best content from web pages and your knowledge base, saving valuable time.
- **Cost-Effective Solution**: Avoid multiple subscriptions to services like ChatGPT Plus, Claude Pro, and Gemini Advanced. MemFree integrates their functionalities, significantly reducing monthly costs.

## MemFree Features

MemFree is equipped with powerful features that cater to various search and productivity needs:

- **Multiple AI Models**: Integrates ChatGPT, Claude, and Gemini for diverse AI capabilities.
- **Search Engines Supported**: Works with Google, Exa, and Vector.
- **Local File Format Compatibility**: Supports text, PDF, Docx, PPTX, and Markdown files.
- **Cross-Device Syncing**: Save and sync search history across multiple devices.
- **Multi-Language Support**: Available in English, Chinese, German, French, Spanish, Japanese, and Arabic.
- **Chrome Bookmark Sync**: One-click synchronization and indexing.
- **Result Sharing**: Easily share your search findings.
- **Contextual Continuous Search**: Search seamlessly based on context.
- **Automatic Web Search Decisions**: Automatically determines when to perform internet searches.
- **Serverless Vector Database**: Super-fast self-hosted database for advanced search capabilities.
- **Open Source Code**: Full transparency with open-source availability.
- **One-Click Deployment**: Deploy MemFree effortlessly with just a click.

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

### 3 Deploy Frontend with Netlify

<a href="https://app.netlify.com/start/deploy?repository=https://github.com/memfreeme/memfree&create_from_path=frontend/"><img src="https://www.netlify.com/img/deploy/button.svg" alt="Deploy to Netlify"></a>

### 4 One Command Deploy Backend with Fly.io

- [One Command Deploy MemFree Vector on Fly.io](https://www.memfree.me/docs/deploy-memfree-fly-io)

## Self-Hosted Installation

### Prerequisites

#### Install Bun

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

# Add your OpenAI API Key, Upstash Redis URL, and Serper API Key to .env

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

## Thanks to all Contributors

<p align="left">
 <a href="https://github.com/memfreeme/memfree/graphs/contributors">
  <img src="https://contributors-img.web.app/image?repo=memfreeme/memfree" />
 </a>
</p>

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

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=memfreeme/memfree&type=Date)](https://star-history.com/#memfreeme/memfree&Date)
