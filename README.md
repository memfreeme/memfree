# MemFree

AI search and ask everything with MemFree

## Overview

MemFree is a hybrid AI search engine that simultaneously performs searches on your personal knowledge base (such as bookmarks, notes, documents, etc.) and the Internet.

## Highlights

- Hybrid AI Search Engine
- Self-hosted Super Fast Serverless Vector Database
- Self-hosted Super Fast Local Embedding and Rerank Service
- One-Click Chrome Bookmarks Index
- Full Code Open Source
- One-Click Deployment On Production(Coming Soon)

## MemFree Public Build

- [MemFree Build Story 1 -- Why I Build MemFree](https://www.memfree.me/blog/memfree-build-1-why)
- [MemFree Build Story 2 -- Choose Zoho Email as your domain email](https://www.memfree.me/blog/memfree-build-2-zohu-mail)
- [MemFree Build Story 3 -- Clarity vs Google Analytics vs Vercel Analytics vs Plausible Vs Umami](https://www.memfree.me/blog/memfree-build-3-clarity)
- [MemFree Build Story 4 -- Bun stream response for gpt-4o image input](https://www.memfree.me/blog/memfree-build-4-bun-gpt-4o-stream)
- [Hybrid AI Search 1 -- how to build fast embedding service](https://www.memfree.me/blog/fast-local-embedding-service)
- [Hybrid AI Search 2 -- How to build Serverless Vector Search with LanceDB](https://www.memfree.me/blog/serverless-vector-search-lancedb)

## Installation

### Frontend

```
bun i

bun run dev
```

### Vector

```
bun i

bun run index.ts
```

### Queue

```
bun i

bun run index.ts
```

### Extension

```
bun i

bun run build
```

### Embedding

```
Install Rust: (optional)  curl --proto '=https' --tlsv1.2 https://sh.rustup.rs -sSf | sh

cargo build --release

./target/release/memfree-embedding
```

## One-Click Deployment

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
