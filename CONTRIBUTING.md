# Contributing to MemFree

Thank you for considering contributing to MemFree! We appreciate your support and the time you're taking to make MemFree better. Here’s a guide to help you get started with your contributions.

## How to Contribute

1. **Open an New Issue**: If you believe you've encountered a bug, please [open an issue](https://github.com/memfreeme/memfree/issues) with detailed information.

2. **Resolve any Issue**: You can resolve any issue mentioned in [issue section](https://github.com/memfreeme/memfree/issues) by getting assigned to yourself and start contributing by making PR mention the issue number.

3. **Make a Pull Request**: If you have new features to add, quality-of-life improvements, or bug fixes, feel free to make a pull request. Ensure your code adheres to our code style and includes appropriate tests.
4. **Feedback and Support**: Share your thoughts and feedback on our [Discord](https://discord.com/invite/7QqyMSTaRq) or via the [MemFree Feedback Form](https://feedback.memfree.me/).

## Code Style and Formatting

To maintain consistency across the codebase, please ensure you run the following command before submitting a pull request:

```bash
npm run prettier
```

## Features You Can Contribute

- **Search Engines and AI Models**: Integrate additional search engines or AI models to enhance search capabilities.
- **File Format Support**: Add support for new file formats (e.g., TXT, PDF, DOCX, PPTX, Markdown).
- **Multi-Language Support**: Expand language support beyond English, Chinese, German, French, Spanish, Japanese, and Arabic.
- **Bookmark Sync and Indexing**: Improve or add features related to Chrome bookmarks sync and indexing.

## Setup Instructions

### Prerequisites

Before contributing, ensure you have the following set up:

- **Bun**: Install Bun via `curl -fsSL https://bun.sh/install | bash`
- **Upstash Redis**: Create a Redis compatible database via [Upstash Redis](https://upstash.com/redis)
- **OpenAI API Key**: Get your API key from [OpenAI](https://openai.com)
- **Serper API Key**: Obtain an API key from [Serper](https://serper.dev)

### Frontend Setup

```
cd frontend

bun icp env-example .env

bun run dev
```

### Vector Service Setup

```
cd vector

bun i

bun run index.ts
```

### Extension Setup

```
cd extension

bun i

bun run build
```

## Testing Guidelines

Please refer to the [Testing Guidelines](./frontend/TESTING_GUIDELINES.md) for details on how to test your changes.

## One-Click Deployment

MemFree offers a straightforward one-click deployment process:

Deploy Backend with Zeabur: Deploy on [Zeabur](https://zeabur.com/templates/CE71SC?referralCode=memfree)

Deploy Frontend with Vercel: Deploy with [Vercel](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fmemfreeme%2Fmemfree&env=UPSTASH_REDIS_REST_URL%2CUPSTASH_REDIS_REST_TOKEN%2COPENAI_API_KEY%2CMEMFREE_HOST%2CAUTH_SECRET%2CAPI_TOKEN&envDescription=https%3A%2F%2Fgithub.com%2Fmemfreeme%2Fmemfree%2Fblob%2Fmain%2Ffrontend%2Fenv-example&project-name=memfree&repository-name=memfree&demo-title=MemFree&demo-description=MemFree+%E2%80%93+Hybrid+AI+Search+Engine&demo-url=https%3A%2F%2Fwww.memfree.me%2F&demo-image=https%3A%2F%2Fwww.memfree.me%2Fog.png&root-directory=frontend&teamSlug=parths-projects-9035e642)

One Command Deploy Backend with Fly.io: [One command deploy MemFree Vector on Fly.io](https://www.memfree.me/docs/deploy-memfree-fly-io)

## Roadmap

To get a sense of our planned features and improvements, check out our [Roadmap](https://feedback.memfree.me/roadmap).

## License

MemFree is backed by [MemFree](https://www.memfree.me/) and licensed under the [MIT](https://github.com/memfreeme/memfree/blob/main/LICENSE) license. See the LICENSE file for details.

**Happy contributing!**
