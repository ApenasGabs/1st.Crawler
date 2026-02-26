import fs from "fs";
import Joi from "joi";
import type { ScrapedRecord } from "../domain/types";

const schema = Joi.object<ScrapedRecord>({
  id: Joi.string().required(),
  source: Joi.string().required(),
  title: Joi.string().required(),
  url: Joi.string().uri().required(),
  // Campos opcionais — ajuste conforme seu domínio
  description: Joi.string().optional(),
  price: Joi.alternatives(Joi.number().min(0), Joi.string()).optional(),
  location: Joi.alternatives(Joi.string(), Joi.object()).optional(),
  metadata: Joi.object().optional(),
});

const inputFiles = [
  "data/scrapers/siteA.json",
  "data/scrapers/siteB.json",
].filter((f) => fs.existsSync(f));
const raw: ScrapedRecord[] = inputFiles.flatMap(
  (f) => JSON.parse(fs.readFileSync(f, "utf-8")) as ScrapedRecord[],
);

const seen = new Set<string>();
const deduped: ScrapedRecord[] = [];
for (const item of raw) {
  if (!seen.has(item.id)) {
    const { error } = schema.validate(item);
    if (!error) {
      deduped.push(item);
      seen.add(item.id);
    }
  }
}

fs.mkdirSync("data", { recursive: true });
fs.writeFileSync("data/merged.json", JSON.stringify(deduped, null, 2));
console.log(`Merged ${deduped.length} items from ${inputFiles.length} files`);
