import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { resolve } from "node:path";

const OUT_DIR = resolve(process.cwd(), "out");
const CANONICAL_BASE_PATH = (process.env.BASE_PATH_CANONICAL || "Mermaid-Retina").replace(
  /^\/+|\/+$/g,
  ""
);
const COMPAT_BASE_PATH = CANONICAL_BASE_PATH.toLowerCase();

if (!existsSync(OUT_DIR)) {
  process.exit(0);
}

if (!CANONICAL_BASE_PATH || CANONICAL_BASE_PATH === COMPAT_BASE_PATH) {
  process.exit(0);
}

const sourceDir = resolve(OUT_DIR, CANONICAL_BASE_PATH);
const targetDir = resolve(OUT_DIR, COMPAT_BASE_PATH);

if (!existsSync(sourceDir)) {
  process.exit(0);
}

if (existsSync(targetDir)) {
  rmSync(targetDir, { recursive: true, force: true });
}

mkdirSync(targetDir, { recursive: true });
cpSync(sourceDir, targetDir, { recursive: true });

console.log(
  `[duplicate-basepath-case] Created compatibility path: /${COMPAT_BASE_PATH} from /${CANONICAL_BASE_PATH}`
);
