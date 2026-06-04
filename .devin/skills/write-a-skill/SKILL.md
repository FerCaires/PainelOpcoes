---
name: write-a-skill
description: Create, review, and improve agent skills — writing new SKILL.md files from scratch or auditing and refining existing ones. Use when the user wants to create, write, build, or draft a new skill; capture a workflow as a skill; review, audit, improve, or refine an existing skill; or asks "how do I make a skill for X" or "can you review/improve this skill". Also trigger when the user pastes or uploads a skill file and asks for feedback or suggestions.
---

# Writing & Reviewing Skills

## Which mode are you in?

- **Creating** a new skill → follow [Creating a Skill](#creating-a-skill)
- **Reviewing/improving** an existing skill → follow [Reviewing a Skill](#reviewing-a-skill)

---

## Creating a Skill

### Step 1 — Capture Intent

If the conversation already shows a completed workflow, extract intent from it first (tools used, steps taken, corrections made, output format). Confirm with the user before proceeding.

Otherwise, ask:
- What should this skill enable Claude to do?
- When should it trigger? (key phrases, file types, contexts)
- What's the expected output?
- Does it need executable scripts or just instructions?
- Any reference materials or examples to include?

### Step 2 — Draft the Skill

See [Skill Anatomy & Standards](#skill-anatomy--standards) below.

### Step 3 — Test Qualitatively

Run 2–3 representative prompts using the skill and review outputs with the user:
- Does the output match expectations?
- Are edge cases handled?
- Is anything missing or confusing?

Use substantive, multi-step prompts — simple one-liners ("read this PDF") rarely trigger skills regardless of description quality.

### Step 4 — Iterate

Refine based on feedback. Common fixes:
- Description not triggering → add more keywords, make it more explicit
- Instructions too vague → add a concrete example or checklist
- Too long → move advanced content to `references/`
- Missing edge cases → add a dedicated section

---

## Reviewing a Skill

When the user shares an existing skill for review, follow this process:

### Step 1 — Read and Diagnose

Read the full skill (SKILL.md and any bundled files). Then produce a **structured diagnosis** with three sections:

**Strengths** — what's already working well (be specific)

**Issues** — problems found, each with:
- Severity: 🔴 Critical / 🟡 Minor / 🔵 Suggestion
- What's wrong and why it matters

**Proposed changes** — a concrete diff-style summary of what will change and why

Common issues to look for:

| Area | What to check |
|------|--------------|
| Description | Vague triggers? Under 1024 chars? Covers adjacent use cases? Pushy enough? |
| Length | SKILL.md over 500 lines? Content that should be in `references/`? |
| Structure | Missing Quick Start? Steps match what the user observes? |
| Completeness | Edge cases handled? Examples present? Bundled resources referenced? |
| Correctness | Outdated limits (e.g., 100-line cap instead of 500)? Wrong info? |
| Clarity | Ambiguous steps? Internal jargon the user wouldn't know? |

### Step 2 — Confirm Before Rewriting

Present the diagnosis and ask the user:
- Do these issues match your experience with the skill?
- Anything to add, remove, or reprioritize before I rewrite?
- Should I preserve the original structure or restructure freely?

### Step 3 — Rewrite

Produce the improved skill following [Skill Anatomy & Standards](#skill-anatomy--standards). Preserve the original `name` frontmatter field unless the user asks to change it.

### Step 4 — Explain the Changes

After presenting the improved version, provide a brief changelog:
- What was changed and why
- Any trade-offs or decisions the user should be aware of

---

## Skill Anatomy & Standards

### File Structure

```
skill-name/
├── SKILL.md           # Main instructions (required, <500 lines)
├── references/        # Detailed docs loaded as needed
│   └── topic.md
├── scripts/           # Utility scripts for deterministic tasks
│   └── helper.py
└── assets/            # Templates, fonts, icons used in output
```

### Progressive Disclosure (3 levels)

| Level | What | When loaded |
|-------|------|-------------|
| 1 | name + description | Always (~100 words max) |
| 2 | SKILL.md body | When skill triggers (<500 lines ideal) |
| 3 | Bundled resources | On demand |

Reference bundled files from SKILL.md with clear guidance on when to read them. For reference files >300 lines, include a table of contents.

### SKILL.md Template

```md
---
name: skill-name
description: What it does. Use when [specific triggers, keywords, file types, contexts].
---

# Skill Name

## Quick Start
[Minimal working example — the most common use case]

## Workflows
[Step-by-step processes; use checklists for multi-step tasks]

## Advanced Features
[See references/topic.md for X]
```

### Writing the Description

The description is **the primary trigger mechanism** — Claude decides whether to load a skill based solely on this. Make it specific and a little "pushy" to avoid undertriggering.

**Format** (max 1024 chars):
- First sentence: what the skill does
- "Use when [specific triggers]" — include keywords, file types, contexts
- "Also trigger when [adjacent use case]" if relevant

**Good:**
```
Extract text, tables, and images from PDF files; merge, split, fill forms, and encrypt documents.
Use when working with .pdf files, or when the user mentions PDFs, forms, document extraction,
or merging/splitting files. Also trigger when the user uploads a PDF and asks anything about it.
```

**Bad:** `Helps with documents.`

### When to Add Scripts

Add to `scripts/` when the operation is deterministic (validation, formatting, conversion) or the same code would be regenerated repeatedly. Scripts save tokens and improve reliability.

### When to Split into Reference Files

Split into `references/` when SKILL.md approaches 500 lines, content covers distinct domains, or advanced features are rarely needed.

### Principle of Least Surprise

Describe behavior from the user's perspective. Steps should match what the user observes, not Claude's internal process.

---

## Final Checklist

- [ ] Description includes "Use when [specific triggers]"
- [ ] Description max 1024 chars and "pushy" enough
- [ ] SKILL.md under 500 lines
- [ ] Quick Start section present with a concrete example
- [ ] No time-sensitive information
- [ ] Consistent terminology throughout
- [ ] Bundled resources referenced clearly from SKILL.md
- [ ] Tested with at least 2 realistic prompts