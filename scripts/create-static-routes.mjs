import { copyFile, mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const siteRoot = resolve("dist");
const outputDirectory = resolve(siteRoot, "pfi");
const entryFile = resolve(outputDirectory, "index.html");

for (const route of ["assessment", "results"]) {
  const routeDirectory = resolve(outputDirectory, route);
  await mkdir(routeDirectory, { recursive: true });
  await copyFile(entryFile, resolve(routeDirectory, "index.html"));
}

await writeFile(
  resolve(siteRoot, "pfi.html"),
  `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="refresh" content="0; url=/pfi/" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="canonical" href="/pfi/" />
    <title>Payments Franchise Index</title>
  </head>
  <body>
    <p><a href="/pfi/">Continue to the Payments Franchise Index</a></p>
  </body>
</html>
`,
  "utf8",
);
