# Local Design AI 🎨

A local-first design tool that generates unique, creative web interfaces using AI. Built with modern web technologies and focused on rapid design ideation and experimentation.

> [!IMPORTANT]
> Disclamer: This is just a POC, the designs it produces are absolutely terrible. Just wanted to see if I could do this myself.

<img width="1512" alt="Screenshot 2024-11-03 at 14 25 11" src="https://github.com/user-attachments/assets/088aaba2-9039-4177-ba82-ea73ecc50a95">

## Features

- 🖼️ Generate complete UI designs from text prompts
- 🎭 Multiple creative design styles (Editorial, Artistic, Brutalist, etc.)
- 🚀 Real-time design generation with progress updates
- 💻 Runs completely local - no cloud dependencies
- 🛠️ Clean, semantic HTML and CSS output
- 📱 Responsive designs by default

## Tech Stack ⚒️

- **Frontend Framework**: SvelteKit 2.x + TypeScript
- **Desktop Framework**: Tauri 2.x (Rust)
- **Server**: Bun + Elysia.js
- **UI Components**: Skeleton UI + Tailwind CSS
- **Data Fetching**: TanStack Query
- **Build Tools**: Vite + PostCSS

## Prerequisites

#### Install Bun

```bash
curl -fsSL https://bun.sh/install | bash
```

#### Install Ollama

```bash
curl https://ollama.ai/install.sh | sh
```

#### Pull the CodeLlama model

```bash
ollama pull codellama
```

## Run Locally

1. Clone the project

```bash
  git clone https://github.com/KelechiOdom10/ui-designer.git
```

2. Go to the project directory

```bash
  cd ui-designer
```

3. Create a local `.env` file at the root of the project with any required environment variables. An example configuration can be found in `.env.example`.
   &nbsp;

4. Install dependencies

```bash
  bun install
```

6. Run the local development server

- To run the backend server:

```bash
  bun run dev:server
```

- In a new terminal, run the Tauri development environment:

```bash
  bun run tauri dev
```

## Authors

- [@KelechiOdom10](https://github.com/KelechiOdom10)

## License

[MIT](https://choosealicense.com/licenses/mit/)

## Contributing

Contributions are always welcome! Please feel free to submit a Pull Request.

## Acknowledgements

- Inspired by [Galileo AI](https://www.usegalileo.ai/)
- Built with Bun and SvelteKit
