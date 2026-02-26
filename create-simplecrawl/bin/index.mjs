#!/usr/bin/env node

// ─────────────────────────────────────────────────────────────────────────────
// SimpleCrawl — interactive scaffolder for web scraping projects.
// Usage:
//   npm create simplecrawl            (interactive)
//   npm create simplecrawl my-project (sets destination)
//   npm create simplecrawl -- --engine ssr --arch 1-modular --dest my-project
// ─────────────────────────────────────────────────────────────────────────────

import { promises as fs } from "node:fs";
import path from "node:path";
import readline from "node:readline/promises";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEMPLATE_ROOT = path.resolve(__dirname, "..", "template");

// ─── Constants ─────────────────────────────────────────────────────────────
const ENGINES = /** @type {const} */ (["ssr", "csr", "hybrid"]);
const ENGINE_DESC = {
  ssr: "HTTP + Cheerio     (sites server-side rendered)",
  csr: "Playwright         (sites client-side / SPA)",
  hybrid: "Cheerio + Playwright fallback (melhor dos dois)",
};
const ENGINE_COLORS = { ssr: "\x1b[32m", csr: "\x1b[36m", hybrid: "\x1b[33m" };

const ARCHITECTURES = [
  "1-modular",
  "2-ddd-lite",
  "3-plugin-based",
  "4-queue-based",
];
const ARCH_DESC = {
  "1-modular": "Simples, 1-3 scrapers, fácil de começar",
  "2-ddd-lite": "DDD leve, domínios separados, escalável",
  "3-plugin-based": "Plugins dinâmicos, 6+ scrapers",
  "4-queue-based": "Filas (Redis/Bull), produção larga escala",
};
const ARCH_COLORS = {
  "1-modular": "\x1b[36m",
  "2-ddd-lite": "\x1b[35m",
  "3-plugin-based": "\x1b[33m",
  "4-queue-based": "\x1b[32m",
};

const RST = "\x1b[0m";
const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";

// ─── CLI parsing ───────────────────────────────────────────────────────────
function parseArgs() {
  const args = process.argv.slice(2);
  let engine = "";
  let arch = "";
  let dest = "";

  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--engine" || a === "-e") {
      engine = args[++i] ?? "";
      continue;
    }
    if (a === "--arch" || a === "-a") {
      arch = args[++i] ?? "";
      continue;
    }
    if (a === "--dest" || a === "-d") {
      dest = args[++i] ?? "";
      continue;
    }
    if (!a.startsWith("-") && !dest) {
      dest = a;
    }
  }

  return { engine, arch, dest };
}

// ─── Interactive select (↑/↓ + Enter) ─────────────────────────────────────
function select(label, options, descriptions, colors, defaultIdx = 0) {
  return new Promise((resolve) => {
    let idx = defaultIdx;

    const render = () => {
      process.stdout.write("\x1b[2J\x1b[H");
      console.log(`${BOLD}${label}${RST}\n`);
      options.forEach((opt, i) => {
        const ptr = i === idx ? "❯" : " ";
        const c = colors[opt] ?? "";
        const d = descriptions[opt]
          ? `${DIM}  — ${descriptions[opt]}${RST}`
          : "";
        const def = i === defaultIdx ? `${DIM} (padrão)${RST}` : "";
        console.log(`  ${ptr} ${c}${opt}${RST}${d}${def}`);
      });
      console.log(`\n  ${DIM}↑/↓ para navegar, Enter para confirmar${RST}`);
    };

    const onKey = (data) => {
      const k = data.toString();
      if (k === "\x03") process.exit(1);
      if (k === "\x1b[A") {
        idx = idx === 0 ? options.length - 1 : idx - 1;
        render();
        return;
      }
      if (k === "\x1b[B") {
        idx = idx === options.length - 1 ? 0 : idx + 1;
        render();
        return;
      }
      if (k === "\r") {
        process.stdin.setRawMode(false);
        process.stdin.pause();
        process.stdin.removeListener("data", onKey);
        process.stdout.write("\x1b[2J\x1b[H");
        resolve(options[idx]);
      }
    };

    render();
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on("data", onKey);
  });
}

// ─── File helpers ──────────────────────────────────────────────────────────
async function exists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function copyDir(src, dest) {
  await fs.mkdir(dest, { recursive: true });
  for (const entry of await fs.readdir(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) await copyDir(s, d);
    else {
      await fs.mkdir(path.dirname(d), { recursive: true });
      await fs.copyFile(s, d);
    }
  }
}

// ─── Main ──────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n  ${BOLD}🕷️  SimpleCrawl${RST} ${DIM}v0.1.0${RST}\n`);

  const { engine: argEngine, arch: argArch, dest: argDest } = parseArgs();

  // 1 — Engine
  const engine = ENGINES.includes(argEngine)
    ? argEngine
    : await select(
        "1/3 — Engine de extração (tipo de site):",
        [...ENGINES],
        ENGINE_DESC,
        ENGINE_COLORS,
        2,
      );

  // 2 — Architecture
  const arch = ARCHITECTURES.includes(argArch)
    ? argArch
    : await select(
        "2/3 — Arquitetura do projeto:",
        ARCHITECTURES,
        ARCH_DESC,
        ARCH_COLORS,
        0,
      );

  // 3 — Destination
  let dest = argDest;
  if (!dest) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    const answer = await rl.question(
      `  ${BOLD}3/3 — Nome do projeto${RST} ${DIM}(padrão: my-scraper)${RST}: `,
    );
    dest = answer.trim() || "my-scraper";
    rl.close();
  }

  const destDir = path.resolve(process.cwd(), dest);
  if (await exists(destDir)) {
    const entries = await fs.readdir(destDir);
    if (entries.length > 0) {
      console.error(`\n  ❌ Diretório ${dest} já existe e não está vazio.\n`);
      process.exit(1);
    }
  }

  // ── Scaffold ─────────────────────────────────────────────────────────────
  await fs.mkdir(destDir, { recursive: true });

  // Copy root files from template
  const rootItems = [
    "package.json",
    "tsconfig.json",
    "tsconfig.base.json",
    ".env.example",
    "docs",
    "examples",
  ];
  for (const item of rootItems) {
    const src = path.join(TEMPLATE_ROOT, item);
    if (!(await exists(src))) continue;
    const d = path.join(destDir, item);
    const stat = await fs.lstat(src);
    if (stat.isDirectory()) await copyDir(src, d);
    else {
      await fs.mkdir(path.dirname(d), { recursive: true });
      await fs.copyFile(src, d);
    }
  }

  // Copy architecture source
  const archSrc = path.join(
    TEMPLATE_ROOT,
    "src",
    "examples",
    "architectures",
    arch,
  );
  if (!(await exists(archSrc))) {
    console.error(`  ❌ Arquitetura não encontrada: ${archSrc}`);
    process.exit(1);
  }
  const destSrc = path.join(destDir, "src");
  await copyDir(archSrc, destSrc);

  // Copy shared infra
  const sharedDirs = ["domain", "utils"];
  for (const dir of sharedDirs) {
    const src = path.join(TEMPLATE_ROOT, "src", dir);
    if (await exists(src)) await copyDir(src, path.join(destSrc, dir));
  }

  // Copy base scrapers per engine
  const baseDir = path.join(TEMPLATE_ROOT, "src", "scrapers", "base");
  const destBase = path.join(destSrc, "scrapers", "base");
  await fs.mkdir(destBase, { recursive: true });

  if (engine === "csr" || engine === "hybrid") {
    const f = path.join(baseDir, "BaseScraper.ts");
    if (await exists(f))
      await fs.copyFile(f, path.join(destBase, "BaseScraper.ts"));
  }
  if (engine === "ssr" || engine === "hybrid") {
    const f = path.join(baseDir, "BaseHttpScraper.ts");
    if (await exists(f))
      await fs.copyFile(f, path.join(destBase, "BaseHttpScraper.ts"));
  }

  // Copy pipeline (BrowserPool only when browser engine)
  const pipelineSrc = path.join(TEMPLATE_ROOT, "src", "pipeline");
  const pipelineDest = path.join(destSrc, "pipeline");
  if (await exists(pipelineSrc)) {
    await fs.mkdir(pipelineDest, { recursive: true });
    for (const entry of await fs.readdir(pipelineSrc, {
      withFileTypes: true,
    })) {
      if (entry.name === "BrowserPool.ts" && engine === "ssr") continue;
      const s = path.join(pipelineSrc, entry.name);
      const d = path.join(pipelineDest, entry.name);
      if (entry.isDirectory()) await copyDir(s, d);
      else await fs.copyFile(s, d);
    }
  }

  // Rewrite package.json with project name and adjust deps
  const pkgPath = path.join(destDir, "package.json");
  if (await exists(pkgPath)) {
    const pkg = JSON.parse(await fs.readFile(pkgPath, "utf-8"));
    pkg.name = path.basename(dest);
    pkg.private = true;
    pkg.version = "0.1.0";

    // Remove playwright dep if SSR-only
    if (engine === "ssr") {
      delete pkg.dependencies?.playwright;
    }
    // Remove cheerio dep if CSR-only
    if (engine === "csr") {
      delete pkg.dependencies?.cheerio;
    }

    await fs.writeFile(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
  }

  // Create a minimal README
  const readme = `# ${path.basename(dest)}

Criado com [SimpleCrawl](https://github.com/Apenasgabs/1st.Crawler).

- **Engine:** ${engine} — ${ENGINE_DESC[engine]}
- **Arquitetura:** ${arch} — ${ARCH_DESC[arch]}

## Início rápido

\`\`\`bash
cd ${dest}
npm install
${engine !== "ssr" ? "npx playwright install --with-deps chromium" : "# Sem browser necessário (SSR)"}
npm run scrape:parallel
\`\`\`

Veja \`docs/\` para variáveis de ambiente e detalhes.
`;
  await fs.writeFile(path.join(destDir, "README.md"), readme);

  // ── Summary ──────────────────────────────────────────────────────────────
  console.log(`
  ${BOLD}✅ Projeto criado em ${dest}/${RST}

  ${DIM}Engine:${RST}       ${ENGINE_COLORS[engine]}${engine}${RST} — ${ENGINE_DESC[engine]}
  ${DIM}Arquitetura:${RST}  ${ARCH_COLORS[arch] ?? ""}${arch}${RST} — ${ARCH_DESC[arch]}

  ${BOLD}Próximos passos:${RST}

    cd ${dest}
    npm install${engine !== "ssr" ? "\n    npx playwright install --with-deps chromium" : ""}
    npm run scrape:parallel
`);
}

main().catch((err) => {
  console.error(`\n  ❌ ${err.message}\n`);
  process.exit(1);
});
