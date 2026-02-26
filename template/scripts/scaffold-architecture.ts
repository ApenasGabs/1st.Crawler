import { promises as fs } from "fs";
import path from "path";
import readline from "readline/promises";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── Engines de extração (decisão que vem ANTES da arquitetura) ────────────
const AVAILABLE_ENGINES = ["ssr", "csr", "hybrid"] as const;
type Engine = (typeof AVAILABLE_ENGINES)[number];

const ENGINE_DESCRIPTIONS: Record<Engine, string> = {
  ssr: "HTTP + Cheerio  (sites server-side rendered)",
  csr: "Playwright      (sites client-side / SPA)",
  hybrid: "Cheerio + Playwright fallback (melhor dos dois)",
};

const ENGINE_COLORS: Record<Engine, string> = {
  ssr: "\u001b[32m",
  csr: "\u001b[36m",
  hybrid: "\u001b[33m",
};

// ─── Arquiteturas de projeto ───────────────────────────────────────────────
interface Options {
  engine: Engine;
  architecture: string;
  destination: string;
  backup: boolean;
  interactive: boolean;
}

const AVAILABLE_ARCHITECTURES = [
  "1-modular",
  "2-ddd-lite",
  "3-plugin-based",
  "4-queue-based",
] as const;

const ARCH_COLORS: Record<string, string> = {
  "1-modular": "\u001b[36m",
  "2-ddd-lite": "\u001b[35m",
  "3-plugin-based": "\u001b[33m",
  "4-queue-based": "\u001b[32m",
};

const COLOR_RESET = "\u001b[0m";

const ROOT_FILES = [
  ".env.example",
  "README.md",
  "package.json",
  "package-lock.json",
  "tsconfig.json",
  "tsconfig.base.json",
  "docs",
  "examples",
];

const parseArgs = (): Options => {
  const args = process.argv.slice(2);
  let engine: Engine | "" = "";
  let architecture = "";
  let destination = "new-template";
  let backup = true;
  let interactive = false;

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === "--engine" || arg === "-e") {
      const val = (args[i + 1] ?? "") as Engine;
      if (AVAILABLE_ENGINES.includes(val)) engine = val;
      i += 1;
      continue;
    }
    if (arg === "--arch" || arg === "-a") {
      architecture = args[i + 1] ?? "";
      i += 1;
      continue;
    }
    if (arg === "--dest" || arg === "-d") {
      destination = args[i + 1] ?? "new-template";
      i += 1;
      continue;
    }
    if (arg === "--no-backup") {
      backup = false;
    }
    if (arg === "--interactive" || arg === "-i") {
      interactive = true;
    }
  }

  return {
    engine: engine || ("" as Engine),
    architecture,
    destination,
    backup,
    interactive,
  };
};

const promptSelect = async (
  label: string,
  options: string[],
  defaultIndex: number,
  descriptions?: Record<string, string>,
  colors?: Record<string, string>,
): Promise<string> => {
  return new Promise((resolve) => {
    let selectedIndex = defaultIndex;

    const render = (): void => {
      process.stdout.write("\u001b[2J\u001b[H");
      console.log(label);

      options.forEach((option, index) => {
        const isSelected = index === selectedIndex;
        const pointer = isSelected ? "❯" : " ";
        const suffix = index === defaultIndex ? " (padrao)" : "";
        const color = (colors ?? ARCH_COLORS)[option] ?? "";
        const desc = descriptions?.[option]
          ? `  — ${descriptions[option]}`
          : "";
        const text = `${pointer} ${color}${option}${COLOR_RESET}${desc}${suffix}`;
        console.log(text);
      });

      console.log("\nUse ↑/↓ para navegar e Enter para confirmar.");
    };

    const onKeyPress = (data: Buffer): void => {
      const key = data.toString();

      if (key === "\u0003") {
        process.exit(1);
      }

      if (key === "\u001b[A") {
        selectedIndex =
          selectedIndex === 0 ? options.length - 1 : selectedIndex - 1;
        render();
        return;
      }

      if (key === "\u001b[B") {
        selectedIndex =
          selectedIndex === options.length - 1 ? 0 : selectedIndex + 1;
        render();
        return;
      }

      if (key === "\r") {
        process.stdin.setRawMode(false);
        process.stdin.pause();
        process.stdin.removeListener("data", onKeyPress);
        process.stdout.write("\u001b[2J\u001b[H");
        resolve(options[selectedIndex]);
      }
    };

    render();

    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on("data", onKeyPress);
  });
};

const promptInteractive = async (
  defaults: Omit<Options, "architecture" | "engine" | "interactive">,
): Promise<Omit<Options, "interactive">> => {
  // ── Passo 1: Engine de extração ──────────────────────────────────────────
  const engine = (await promptSelect(
    "1/2 — Engine de extração (tipo de site):",
    [...AVAILABLE_ENGINES],
    2, // hybrid como padrão
    ENGINE_DESCRIPTIONS,
    ENGINE_COLORS,
  )) as Engine;

  // ── Passo 2: Arquitetura do projeto ──────────────────────────────────────
  const architecture = await promptSelect(
    "2/2 — Arquitetura do projeto:",
    [...AVAILABLE_ARCHITECTURES],
    0,
  );

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const destAnswer = await rl.question(
    `Destino (padrao: ${defaults.destination}): `,
  );
  const destination = destAnswer.trim() || defaults.destination;

  const backupAnswer = await rl.question(
    `Backup automatico? (Y/n, padrao: ${defaults.backup ? "Y" : "n"}): `,
  );
  const normalized = backupAnswer.trim().toLowerCase();
  const backup =
    normalized === ""
      ? defaults.backup
      : !["n", "nao", "no"].includes(normalized);

  await rl.close();

  return { engine, architecture, destination, backup };
};

const exists = async (targetPath: string): Promise<boolean> => {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
};

const copyFile = async (source: string, destination: string): Promise<void> => {
  await fs.mkdir(path.dirname(destination), { recursive: true });
  await fs.copyFile(source, destination);
};

const copyDir = async (source: string, destination: string): Promise<void> => {
  await fs.mkdir(destination, { recursive: true });
  const entries = await fs.readdir(source, { withFileTypes: true });

  await Promise.all(
    entries.map(async (entry) => {
      const srcPath = path.join(source, entry.name);
      const destPath = path.join(destination, entry.name);

      if (entry.isDirectory()) {
        await copyDir(srcPath, destPath);
      } else {
        await copyFile(srcPath, destPath);
      }
    }),
  );
};

const backupDestination = async (destination: string): Promise<void> => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupDir = path.join(process.cwd(), "backup", timestamp);
  await fs.mkdir(backupDir, { recursive: true });
  await fs.rename(
    destination,
    path.join(backupDir, path.basename(destination)),
  );
};

const scaffold = async (): Promise<void> => {
  const rootDir = path.resolve(__dirname, "..");
  const {
    engine: argEngine,
    architecture: argArch,
    destination,
    backup,
    interactive,
  } = parseArgs();

  const shouldPrompt = interactive || !argArch || !argEngine;
  const resolved = shouldPrompt
    ? await promptInteractive({ destination, backup })
    : { engine: argEngine, architecture: argArch, destination, backup };

  const {
    engine,
    architecture,
    destination: resolvedDest,
    backup: resolvedBackup,
  } = resolved;

  // ── Validar engine ───────────────────────────────────────────────────────
  if (!AVAILABLE_ENGINES.includes(engine)) {
    throw new Error(
      `Engine invalida: ${engine}. Opcoes: ${AVAILABLE_ENGINES.join(", ")}`,
    );
  }

  // ── Validar arquitetura ──────────────────────────────────────────────────
  if (
    !AVAILABLE_ARCHITECTURES.includes(
      architecture as (typeof AVAILABLE_ARCHITECTURES)[number],
    )
  ) {
    throw new Error(
      `Arquitetura invalida: ${architecture}. Opcoes: ${AVAILABLE_ARCHITECTURES.join(
        ", ",
      )}`,
    );
  }

  const sourceDir = path.join(
    rootDir,
    "src",
    "examples",
    "architectures",
    architecture,
  );

  if (!(await exists(sourceDir))) {
    throw new Error(`Arquitetura nao encontrada em: ${sourceDir}`);
  }

  const destinationDir = path.resolve(process.cwd(), resolvedDest);

  if (await exists(destinationDir)) {
    if (resolvedBackup) {
      await backupDestination(destinationDir);
    } else {
      throw new Error(
        `Destino ja existe (${destinationDir}). Use --no-backup para sobrescrever ou apague manualmente.`,
      );
    }
  }

  await fs.mkdir(destinationDir, { recursive: true });

  await Promise.all(
    ROOT_FILES.map(async (entry) => {
      const srcPath = path.join(rootDir, entry);
      const destPath = path.join(destinationDir, entry);

      if (!(await exists(srcPath))) {
        return;
      }

      const stat = await fs.lstat(srcPath);
      if (stat.isDirectory()) {
        await copyDir(srcPath, destPath);
      } else {
        await copyFile(srcPath, destPath);
      }
    }),
  );

  const destSrc = path.join(destinationDir, "src");
  await fs.mkdir(destSrc, { recursive: true });
  await copyDir(sourceDir, destSrc);

  // ── Copiar base scrapers conforme engine ─────────────────────────────────
  const baseDir = path.join(rootDir, "src", "scrapers", "base");
  const destBase = path.join(destSrc, "scrapers", "base");
  await fs.mkdir(destBase, { recursive: true });

  if (engine === "csr" || engine === "hybrid") {
    await copyFile(
      path.join(baseDir, "BaseScraper.ts"),
      path.join(destBase, "BaseScraper.ts"),
    );
  }
  if (engine === "ssr" || engine === "hybrid") {
    await copyFile(
      path.join(baseDir, "BaseHttpScraper.ts"),
      path.join(destBase, "BaseHttpScraper.ts"),
    );
  }

  // ── Copiar BrowserPool apenas quando há browser ──────────────────────────
  if (engine === "csr" || engine === "hybrid") {
    const pipelineDir = path.join(rootDir, "src", "pipeline");
    const destPipeline = path.join(destSrc, "pipeline");
    await fs.mkdir(destPipeline, { recursive: true });
    const poolSrc = path.join(pipelineDir, "BrowserPool.ts");
    if (await exists(poolSrc)) {
      await copyFile(poolSrc, path.join(destPipeline, "BrowserPool.ts"));
    }
  }

  console.log(`\n✅ Template gerado em: ${destinationDir}`);
  console.log(
    `   Engine:       ${ENGINE_COLORS[engine]}${engine}${COLOR_RESET} — ${ENGINE_DESCRIPTIONS[engine]}`,
  );
  console.log(
    `   Arquitetura:  ${ARCH_COLORS[architecture] ?? ""}${architecture}${COLOR_RESET}`,
  );

  if (engine === "ssr") {
    console.log(
      "\n💡 Dica: use BaseHttpScraper (fetch + cheerio) como base dos seus scrapers.",
    );
    console.log(
      "   Playwright NÃO foi incluído — instale-o apenas se precisar de fallback.",
    );
  } else if (engine === "hybrid") {
    console.log(
      "\n💡 Dica: use BaseHttpScraper para sites SSR e BaseScraper para sites CSR/SPA.",
    );
    console.log("   Ambas as bases foram incluídas no template.");
  } else {
    console.log(
      "\n💡 Dica: use BaseScraper (Playwright) como base dos seus scrapers.",
    );
  }
};

const main = async (): Promise<void> => {
  try {
    await scaffold();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`❌ ${message}`);
    process.exit(1);
  }
};

void main();
