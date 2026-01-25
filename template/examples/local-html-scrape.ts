// Exemplo simples: abrir arquivo local e extrair título
import fs from "fs";

const main = async (): Promise<void> => {
  const html =
    "<html><head><title>Exemplo Local</title></head><body><h1>Olá</h1></body></html>";
  fs.mkdirSync("tmp", { recursive: true });
  fs.writeFileSync("tmp/example.html", html);

  // Sem Playwright: demonstra processamento local
  const title = /<title>(.*?)<\/title>/.exec(html)?.[1] ?? "Sem título";
  console.log({ title });
};

void main();
