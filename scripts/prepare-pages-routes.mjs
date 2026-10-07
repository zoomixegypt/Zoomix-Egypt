import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

const entry = await readFile("build/index.html", "utf8");
const routes = ["studio", "route-finder"];

await Promise.all(
  routes.map(async (route) => {
    const target = join("build", route, "index.html");
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, entry, "utf8");
  }),
);
