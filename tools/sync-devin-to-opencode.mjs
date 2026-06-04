#!/usr/bin/env node
/**
 * sync-devin-to-opencode.mjs
 *
 * Sincroniza a configuração canônica em `.devin/` para o formato OpenCode
 * (`.opencode/` + `opencode.json` na raiz).
 *
 * Mapeamento:
 *   .devin/agents/<name>/AGENT.md            -> .opencode/agent/<name>.md
 *   .devin/skills/<name>/SKILL.md            -> .opencode/skill/<name>/SKILL.md
 *       (com subpastas templates/, references/ copiadas)
 *   .devin/skills/<name>/SKILL.md (subagent) -> .opencode/agent/<name>.md (mode: subagent)
 *
 * Permissões (Devin -> OpenCode):
 *   Read(<p>)  -> permission.read.<p>
 *   Write(<p>) -> permission.edit.<p>
 *   Exec(<c>)  -> permission.bash.<c>     (literal; acrescente '*' para casar args)
 *
 * Uso:
 *   node tools/sync-devin-to-opencode.mjs
 *   npm run sync:agents
 */

import { readFile, writeFile, mkdir, rm, readdir, cp, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, dirname, relative, basename } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SRC = join(ROOT, ".devin");
const OUT = join(ROOT, ".opencode");
const CONFIG_OUT = join(ROOT, "opencode.json");

const log = (msg) => console.log(`[sync] ${msg}`);
const warn = (msg) => console.warn(`[sync][warn] ${msg}`);

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return entries.filter((e) => e.isDirectory()).map((e) => join(dir, e.name));
}

function parseScalar(v) {
  if (v === "true") return true;
  if (v === "false") return false;
  if (v === "null") return null;
  return v.replace(/^["']|["']$/g, "").trim();
}

function parseFrontmatter(text) {
  if (!text.startsWith("---")) return { fm: {}, body: text };
  const end = text.indexOf("\n---", 3);
  if (end === -1) return { fm: {}, body: text };
  const raw = text.slice(3, end);
  const body = text.slice(end + 4).replace(/^\r?\n/, "");
  const lines = raw.split(/\r?\n/);
  const fm = {};
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim() || line.trim().startsWith("#")) {
      i++;
      continue;
    }
    const m = line.match(/^(\s*)([A-Za-z_][\w-]*):\s*(.*)$/);
    if (!m) {
      i++;
      continue;
    }
    const [, indent, key, rest] = m;
    if (indent.length === 0) {
      if (rest === "" || rest === "|") {
        const childIndent = 2;
        const child = {};
        i++;
        while (i < lines.length) {
          const next = lines[i];
          if (next.trim() === "") {
            i++;
            continue;
          }
          const cm = next.match(/^(\s*)([A-Za-z_][\w-]*):\s*(.*)$/);
          if (!cm) break;
          const [, ci, ck, cr] = cm;
          if (ci.length < childIndent) break;
          if (ci.length === childIndent) {
            if (cr === "" || cr === "|") {
              const list = [];
              i++;
              while (i < lines.length) {
                const li = lines[i];
                if (li.trim() === "") {
                  i++;
                  continue;
                }
                const lm = li.match(/^(\s*)-\s*(.*)$/);
                if (!lm) break;
                if (lm[1].length < childIndent + 2) break;
                list.push(lm[2].replace(/^["']|["']$/g, "").trim());
                i++;
              }
              child[ck] = list;
            } else {
              child[ck] = parseScalar(cr);
              i++;
            }
          } else {
            break;
          }
        }
        fm[key] = child;
      } else {
        fm[key] = parseScalar(rest);
        i++;
      }
    } else {
      i++;
    }
  }
  return { fm, body };
}

function toYamlValue(v) {
  if (typeof v === "string") return v.replace(/"/g, '\\"');
  return String(v);
}

function buildAgentFrontmatter({ name, description, mode, permission }) {
  const lines = ["---"];
  if (description) lines.push(`description: ${description.replace(/"/g, '\\"')}`);
  if (mode) lines.push(`mode: ${mode}`);
  if (permission && Object.keys(permission).length > 0) {
    lines.push("permission:");
    for (const [tool, rules] of Object.entries(permission)) {
      if (typeof rules === "string") {
        lines.push(`  ${tool}: ${rules}`);
      } else {
        lines.push(`  ${tool}:`);
        for (const [pattern, action] of Object.entries(rules)) {
          lines.push(`    "${pattern}": ${action}`);
        }
      }
    }
  }
  lines.push("---", "");
  return lines.join("\n");
}

function buildSkillFrontmatter({ name, description }) {
  const lines = ["---"];
  lines.push(`name: ${name}`);
  if (description) lines.push(`description: ${description.replace(/"/g, '\\"')}`);
  lines.push("---", "");
  return lines.join("\n");
}

function mapPermissions(devinPerms) {
  if (!devinPerms) return undefined;
  const allow = devinPerms.allow || [];
  const ask = devinPerms.ask || [];
  const all = new Map();
  for (const rule of allow) all.set(rule, "allow");
  for (const rule of ask) if (!all.has(rule)) all.set(rule, "ask");

  const result = {};
  for (const [rule, action] of all.entries()) {
    const m = rule.match(/^(Read|Write|Exec|Edit)\((.+)\)$/);
    if (!m) {
      warn(`Regra de permissão não reconhecida: ${rule}`);
      continue;
    }
    const [, type, pattern] = m;
    const tool = type === "Read" ? "read" : type === "Write" || type === "Edit" ? "edit" : "bash";
    if (!result[tool]) result[tool] = {};
    result[tool][pattern] = action;
  }
  return Object.keys(result).length > 0 ? result : undefined;
}

async function copyDir(srcDir, destDir) {
  if (!existsSync(srcDir)) return;
  await mkdir(destDir, { recursive: true });
  await cp(srcDir, destDir, { recursive: true });
  log(`  copy ${relative(ROOT, srcDir)} -> ${relative(ROOT, destDir)}`);
}

async function syncAgents() {
  const agentsDir = join(SRC, "agents");
  if (!existsSync(agentsDir)) return [];
  const entries = await walk(agentsDir);
  const created = [];
  for (const agentDir of entries) {
    const name = basename(agentDir);
    const mdPath = join(agentDir, "AGENT.md");
    if (!existsSync(mdPath)) continue;
    const text = await readFile(mdPath, "utf8");
    const { fm, body } = parseFrontmatter(text);
    const permission = mapPermissions(fm.permissions);
    const mode = fm.subagent === true ? "subagent" : "all";
    const fmYaml = buildAgentFrontmatter({
      name,
      description: fm.description,
      mode,
      permission,
    });
    const outPath = join(OUT, "agent", `${name}.md`);
    await mkdir(dirname(outPath), { recursive: true });
    await writeFile(outPath, fmYaml + body);
    created.push({ name, type: "agent", mode });
    log(`agent: ${name} (mode: ${mode})`);
  }
  return created;
}

async function syncSkills() {
  const skillsDir = join(SRC, "skills");
  if (!existsSync(skillsDir)) return [];
  const entries = await walk(skillsDir);
  const created = [];
  for (const skillDir of entries) {
    const name = basename(skillDir);
    const mdPath = join(skillDir, "SKILL.md");
    if (!existsSync(mdPath)) continue;
    const text = await readFile(mdPath, "utf8");
    const { fm, body } = parseFrontmatter(text);
    const isSubagent = fm.subagent === true;
    if (isSubagent) {
      const permission = mapPermissions(fm.permissions);
      const fmYaml = buildAgentFrontmatter({
        name,
        description: fm.description,
        mode: "subagent",
        permission,
      });
      const outPath = join(OUT, "agent", `${name}.md`);
      await mkdir(dirname(outPath), { recursive: true });
      await writeFile(outPath, fmYaml + body);
      created.push({ name, type: "agent", mode: "subagent" });
      log(`agent (from skill subagent): ${name}`);
    } else {
      const fmYaml = buildSkillFrontmatter({ name, description: fm.description });
      const outDir = join(OUT, "skill", name);
      await mkdir(outDir, { recursive: true });
      await writeFile(join(outDir, "SKILL.md"), fmYaml + body);
      await copyDir(join(skillDir, "templates"), join(outDir, "templates"));
      await copyDir(join(skillDir, "references"), join(outDir, "references"));
      await copyDir(join(skillDir, "examples"), join(outDir, "examples"));
      created.push({ name, type: "skill" });
      log(`skill: ${name}`);
    }
  }
  return created;
}

async function buildConfig(created) {
  const skills = created.filter((c) => c.type === "skill").map((c) => c.name);
  const agents = created.filter((c) => c.type === "agent");
  const config = {
    $schema: "https://opencode.ai/config.json",
    instructions: ["AGENTS.md"],
    default_agent: "feature-workflow-ts",
    skills: {
      paths: [".opencode/skill"],
    },
    agent: {},
  };
  for (const a of agents) {
    config.agent[a.name] = { mode: a.mode };
  }
  await writeFile(CONFIG_OUT, JSON.stringify(config, null, 2) + "\n");
  log(`opencode.json (${agents.length} agent(s), ${skills.length} skill(s))`);
}

async function main() {
  if (!existsSync(SRC)) {
    console.error(`[sync][error] pasta ${relative(ROOT, SRC)} não encontrada`);
    process.exit(1);
  }
  if (existsSync(OUT)) {
    await rm(OUT, { recursive: true, force: true });
    log(`limpo ${relative(ROOT, OUT)}`);
  }
  await mkdir(OUT, { recursive: true });
  const agents = await syncAgents();
  const skills = await syncSkills();
  const all = [...agents, ...skills];
  await buildConfig(all);
  const totalAgents = all.filter((c) => c.type === "agent").length;
  const totalSkills = all.filter((c) => c.type === "skill").length;
  log(`concluído. ${totalAgents} agent(s), ${totalSkills} skill(s).`);
}

main().catch((err) => {
  console.error("[sync][fatal]", err);
  process.exit(1);
});
