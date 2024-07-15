# MemFree

<a href="https://www.memfree.me">
  <img alt="memfree – Hybrid AI Search Engine: Instantly Get Accurate Answers from the Internet, Bookmarks, Notes, and Docs" src=".assets/memfree-preview.gif" width="100%">
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
  <a href="https://discord.com/invite/7QqyMSTaRq">
    <img src="https://img.shields.io/badge/chat-on%20Discord-blueviolet" alt="Discord Channel" />
  </a>

</h4>

<br/>

## Introduction

MemFree is a hybrid AI search engine that simultaneously performs searches on your personal knowledge base (such as bookmarks, notes, documents, etc.) and the Internet.

## Highlights

- Hybrid AI Search Engine
- Self-hosted Super Fast Serverless Vector Database
- Self-hosted Super Fast Local Embedding and Rerank Service
- One-Click Chrome Bookmarks Index
- Full Code Open Source
- One-Click Deployment On Production(Coming Soon)

## Tech Stack

- [Hybrid AI Search Full Tech Stack](https://www.memfree.me/blog/hybrid-ai-search-tech-stack)

## MemFree Public Build

- [Hybrid AI Search 3 -- The Full Tech Stack](https://www.memfree.me/blog/hybrid-ai-search-tech-stack)
- [Hybrid AI Search 1 -- how to build fast embedding service](https://www.memfree.me/blog/fast-local-embedding-service)
- [Hybrid AI Search 2 -- How to build Serverless Vector Search with LanceDB](https://www.memfree.me/blog/serverless-vector-search-lancedb)
- [MemFree Build Story 1 -- Why I Build MemFree](https://www.memfree.me/blog/memfree-build-1-why)
- [MemFree Build Story 2 -- Choose Zoho Email as your domain email](https://www.memfree.me/blog/memfree-build-2-zohu-mail)
- [MemFree Build Story 3 -- Clarity vs Google Analytics vs Vercel Analytics vs Plausible Vs Umami](https://www.memfree.me/blog/memfree-build-3-clarity)
- [MemFree Build Story 4 -- Bun stream response for gpt-4o image input](https://www.memfree.me/blog/memfree-build-4-bun-gpt-4o-stream)

## One-Click Deployment

### Deploy Frontend with Vercel

<a href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fmemfreeme%2Fmemfree&env=UPSTASH_REDIS_REST_URL,UPSTASH_REDIS_REST_TOKEN,OPENAI_API_KEY,SERPER_API_KEY,AUTH_SECRET&envDescription=https%3A%2F%2Fgithub.com%2Fmemfreeme%2Fmemfree%2Fblob%2Fmain%2Ffrontend%2Fenv-example&project-name=memfree&repository-name=memfree&demo-title=MemFree&demo-description=MemFree – Hybrid AI Search Engine&demo-url=https%3A%2F%2Fwww.memfree.me%2F&demo-image=https%3A%2F%2Fwww.memfree.me%2Fog.png&root-directory=frontend"><img src="https://vercel.com/button" alt="Deploy with Vercel"/></a>

### Deploy Backend

Coming Soon

## Self-Hosted Installation

### Prerequisites

#### Intsall Bun

```
curl -fsSL https://bun.sh/install | bash
```

#### Upstash Redis

Create a Redis compatible database in seconds: [Upstash Redis](https://upstash.com/docs/redis/overall/getstarted)

#### Serper Dev API Key

Get a Serper Dev API Key: [Serper Dev](https://serper.dev)

#### OpenAI API Key

Get an OpenAI API Key: [OpenAI](https://platform.openai.com)

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

### Queue Service

```
cd queue

bun i

bun run index.ts
```

### Extension

```
cd extension

bun i

bun run build
```

### Embedding Service

```
Install Rust: (optional)  curl --proto '=https' --tlsv1.2 https://sh.rustup.rs -sSf | sh

cd embedding

cargo build --release

./target/release/memfree-embedding
```

## Contributing

Here's how you can contribute:

- [Open an issue](https://github.com/memfreeme/memfree/issues) if you believe you've encountered a bug.
- Make a [pull request](https://github.com/memfreeme/memfree/pulls) to add new features/make quality-of-life improvements/fix bugs.

## Roadmap

## Help and Support

- [MemFree Discord](https://discord.com/invite/7QqyMSTaRq)

## Credits

- [bun](https://github.com/oven-sh/bun) – Incredibly fast JavaScript runtime, bundler, test runner, and package manager – all in one
- [lancedb](https://github.com/lancedb/lancedb) – Developer-friendly, serverless vector database for AI applications
- [fastembed-rs](https://github.com/Anush008/fastembed-rs) – Library for generating vector embeddings, reranking in Rust
- [next-saas-stripe-starter](https://github.com/mickasmt/next-saas-stripe-starter) – Open-source SaaS Starter with User Roles & Admin Panel.
- [next-chrome-starter](https://github.com/ibnzUK/next-chrome-starter) – Next.js Chrome Extension Starter
- [search_with_ai](https://github.com/yokingma/search_with_ai) – Free Search with AI
