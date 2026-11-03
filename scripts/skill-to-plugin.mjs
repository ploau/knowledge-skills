#!/usr/bin/env node
/**
 * Fill templates/plugin into a harness plugin directory.
 *
 * The file map is templates/README.md.
 * Skill bodies are copied as-is. This script does not rewrite them.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "..");
const templateRoot = path.join(repoRoot, "templates/plugin");

function usage() {
  return `usage: node scripts/skill-to-plugin.mjs --out DIR [options]

Options:
  --name NAME            plugin name (default: skill frontmatter, else directory)
  --description TEXT     plugin description
  --version SEMVER       default: version in package.json
  --skill DIR            copy this skill directory into out/skills/<name>/
  --skills-dir DIR       scan this directory for SKILL.md folders
  --manifests-only       write manifests only; do not copy skills
  --harness NAME         repeatable. Limit copied templates to a path segment
`;
}

function parseArgs(argv) {
  const args = {
    out: "",
    name: "",
    description: "",
    version: "",
    skill: "",
    skillsDir: "",
    manifestsOnly: false,
    harnesses: [],
  };
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    const next = () => {
      const value = argv[i + 1];
      if (!value || value.startsWith("--")) {
        throw new Error(`missing value for ${token}`);
      }
      i += 1;
      return value;
    };
    if (token === "--out") args.out = next();
    else if (token === "--name") args.name = next();
    else if (token === "--description") args.description = next();
    else if (token === "--version") args.version = next();
    else if (token === "--skill") args.skill = next();
    else if (token === "--skills-dir") args.skillsDir = next();
    else if (token === "--manifests-only") args.manifestsOnly = true;
    else if (token === "--harness") args.harnesses.push(next());
    else if (token === "--help" || token === "-h") {
      console.log(usage());
      process.exit(0);
    } else {
      throw new Error(`unknown argument ${token}`);
    }
  }
  if (!args.out) throw new Error("pass --out");
  if (!args.version) args.version = readRepoVersion();
  return args;
}

function readRepoVersion() {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(repoRoot, "package.json"), "utf8"));
    if (typeof pkg.version === "string" && pkg.version) return pkg.version;
  } catch {
    // The generator still runs when package.json cannot be read.
  }
  return "0.1.0";
}

function readFrontmatter(skillDir) {
  const file = path.join(skillDir, "SKILL.md");
  const text = fs.readFileSync(file, "utf8");
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const data = {};
  if (!match) return data;
  let key = null;
  for (const raw of match[1].split("\n")) {
    const line = raw.replace(/\r$/, "");
    if (/^\s/.test(line) && key) {
      data[key] = `${data[key]} ${line.trim()}`.replace(/\s+/g, " ").trim();
      continue;
    }
    const idx = line.indexOf(":");
    if (idx <= 0) continue;
    key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if (value === ">-" || value === ">" || value === "|" || value === "|-") value = "";
    data[key] = value.replace(/^["']|["']$/g, "");
  }
  if (data.description) data.description = data.description.replace(/\s+/g, " ").trim();
  return data;
}

function displayNameFrom(pluginName) {
  return pluginName
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function jsonEscape(value) {
  return JSON.stringify(value).slice(1, -1);
}

function listSkills(dir) {
  if (!dir || !fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => fs.existsSync(path.join(dir, name, "SKILL.md")))
    .sort()
    .map((id) => ({ id, path: `skills/${id}/SKILL.md` }));
}

function walkFiles(root) {
  const files = [];
  const visit = (current) => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) visit(full);
      else if (entry.isFile()) files.push(full);
    }
  };
  if (fs.existsSync(root)) visit(root);
  return files;
}

function fill(text, tokens) {
  return text.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    if (!(key in tokens)) throw new Error(`missing token ${key}`);
    return tokens[key];
  });
}

const HARNESS_MARKERS = {
  "claude-code": [".claude-plugin"],
  "copilot-cli": [".claude-plugin"],
  cursor: [".cursor-plugin"],
  codex: [".codex-plugin", ".agents"],
  "grok-build": [],
};

function selected(rel, harnesses) {
  if (harnesses.length === 0) return true;
  const markers = harnesses.flatMap((name) => {
    if (!(name in HARNESS_MARKERS)) {
      throw new Error(
        `unknown harness ${name}. Known: ${Object.keys(HARNESS_MARKERS).join(", ")}`,
      );
    }
    return HARNESS_MARKERS[name];
  });
  return markers.some((marker) => rel.includes(marker));
}

function copyTree(root, outDir, tokens, harnesses) {
  for (const file of walkFiles(root)) {
    const rel = path.relative(root, file);
    if (!selected(rel, harnesses)) continue;
    const destination = path.join(outDir, rel);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    if (file.endsWith(".png")) {
      fs.copyFileSync(file, destination);
      continue;
    }
    const text = fs.readFileSync(file, "utf8");
    fs.writeFileSync(destination, fill(text, tokens));
  }
}

function copySkill(skillDir, outDir, skillName) {
  const destination = path.join(outDir, "skills", skillName);
  fs.mkdirSync(destination, { recursive: true });
  const visit = (current, target) => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const from = path.join(current, entry.name);
      const to = path.join(target, entry.name);
      if (entry.isDirectory()) {
        fs.mkdirSync(to, { recursive: true });
        visit(from, to);
      } else if (entry.isFile()) {
        fs.copyFileSync(from, to);
      }
    }
  };
  visit(skillDir, destination);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const outDir = path.resolve(args.out);
  let name = args.name;
  let description = args.description;
  if (args.skill) {
    const meta = readFrontmatter(path.resolve(args.skill));
    if (!name) name = meta.name || path.basename(path.resolve(args.skill));
    if (!description) description = meta.description || "";
  }
  if (!name) throw new Error("pass --name or --skill");
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(name)) {
    throw new Error(`plugin name must be kebab-case, got ${name}`);
  }
  if (!description) {
    description = "Harness-agnostic skills. Use the tools the current harness already exposes.";
  }

  const skillScanDir = args.skillsDir
    ? path.resolve(args.skillsDir)
    : path.join(outDir, "skills");
  if (args.skill && !args.manifestsOnly) {
    copySkill(path.resolve(args.skill), outDir, name);
  }
  const skills = listSkills(args.skill && !args.manifestsOnly ? path.join(outDir, "skills") : skillScanDir);

  const tokens = {
    pluginName: name,
    displayName: displayNameFrom(name),
    version: args.version,
    pluginDescription: jsonEscape(description),
  };

  copyTree(templateRoot, outDir, tokens, args.harnesses);
  console.log(`wrote plugin ${name} to ${outDir}`);
  console.log(`skills: ${skills.map((skill) => skill.id).join(", ") || "(none)"}`);
}

main();
