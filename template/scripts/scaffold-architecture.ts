import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import readline from "readline/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface Options {
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
  let architecture = "";
  let destination = "new-template";
  let backup = true;
  let interactive = false;

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
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

  return { architecture, destination, backup, interactive };
};

const promptSelect = async (
  label: string,
  options: string[],
  defaultIndex: number,
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
        const color = ARCH_COLORS[option] ?? "";
        const text = `${pointer} ${color}${option}${COLOR_RESET}${suffix}`;
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
  defaults: Omit<Options, "architecture" | "interactive">,
): Promise<Omit<Options, "interactive">> => {
  const architecture = await promptSelect(
    "Arquitetura:",
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

  return { architecture, destination, backup };
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
    architecture: argArch,
    destination,
    backup,
    interactive,
  } = parseArgs();

  const shouldPrompt = interactive || !argArch;
  const resolved = shouldPrompt
    ? await promptInteractive({ destination, backup })
    : { architecture: argArch, destination, backup };

  const {
    architecture,
    destination: resolvedDest,
    backup: resolvedBackup,
  } = resolved;

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

  console.log(`✅ Template gerado em: ${destinationDir}`);
  console.log(`✅ Arquitetura aplicada: ${architecture}`);
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
