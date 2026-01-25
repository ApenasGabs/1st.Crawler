import fs from "fs";
import Joi from "joi";
import type { Imovel } from "../domain/types";

const schema = Joi.object<Imovel>({
  id: Joi.string().required(),
  source: Joi.string().required(),
  title: Joi.string().required(),
  price: Joi.number().min(0).required(),
  location: Joi.object({
    city: Joi.string().required(),
    state: Joi.string().required(),
  }).required(),
  url: Joi.string().uri().required(),
});

const inputFiles = [
  "data/scrapers/siteA.json",
  "data/scrapers/siteB.json",
].filter((f) => fs.existsSync(f));
const raw: Imovel[] = inputFiles.flatMap(
  (f) => JSON.parse(fs.readFileSync(f, "utf-8")) as Imovel[],
);

const seen = new Set<string>();
const deduped: Imovel[] = [];
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
fs.writeFileSync("data/imoveis.json", JSON.stringify(deduped, null, 2));
console.log(`Merged ${deduped.length} items from ${inputFiles.length} files`);
