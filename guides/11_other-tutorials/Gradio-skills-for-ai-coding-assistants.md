# Gradio Skills for AI Coding Assistants

Tags: CLI, AI, AGENTS

AI coding assistants like [Claude Code](https://docs.anthropic.com/en/docs/claude-code), [Cursor](https://cursor.com), [Codex](https://openai.com/index/codex/), and [OpenCode](https://opencode.ai) can write better Gradio code when they have access to up-to-date API knowledge. Gradio **skills** solve this — they are structured reference files that get loaded into your assistant's context so it knows exactly how Gradio's components, events, and ecosystem work.

The `gradio skills add` command installs these reference files into the right location for your chosen assistant, so it can use them automatically.

## Prerequisites

Make sure you have Gradio installed along with a recent version of `huggingface_hub`:

```bash
pip install --upgrade gradio huggingface_hub
```

> `huggingface_hub >= 1.4.0` is required for the skills command.

## Installing the General Gradio Skill

The general Gradio skill gives your assistant comprehensive knowledge of the Gradio API — components, event listeners, layout patterns, and working examples.

To install, pass the flag for your assistant:

```bash
gradio skills add --cursor   # or --claude, --codex, --opencode
```

This downloads two files (`SKILL.md` and `examples.md`) into a central location (`.agents/skills/gradio/`) and creates **symlinks** from each assistant's skills directory (e.g., `.claude/skills/gradio/` for Claude Code) pointing to the central copy. This avoids duplicating files when you install for multiple assistants.

## Project-Level vs. Global Installation

By default, skills are installed **locally** in your current project directory. This means the assistant only has Gradio knowledge when working in that project.

To install **globally** (user-level, available in all projects):

```bash
gradio skills add --claude --global
```

Or using the short flag:

```bash
gradio skills add --claude -g
```

## Generating a Skill for a Specific HuggingFace Space

One of the most powerful features is generating a skill for any public HuggingFace Space. This gives your assistant full knowledge of that Space's API — endpoints, parameters, return types, and ready-to-use code snippets.

```bash
gradio skills add abidlabs/english-translator --claude
```

This connects to the Space, extracts its API schema, and generates a `SKILL.md` file with:

- A description of each API endpoint
- Parameter names, types, defaults, and whether they're required
- Return value types
- Code snippets in Python, JavaScript, and cURL

For private Spaces, set your Hugging Face token:

```bash
export HF_TOKEN=hf_xxxxx
gradio skills add my-org/private-space --claude
```



## Overwriting Existing Skills

If a skill is already installed, the command will exit with an error. To overwrite it:

```bash
gradio skills add --claude --force
```

## What Gets Installed

### General Gradio Skill

| File | Contents |
|------|----------|
| `SKILL.md` | Core API reference — component signatures, event listeners, layout patterns, ChatInterface, and links to detailed guides |
| `examples.md` | Complete working Gradio apps covering common patterns (forms, chatbots, streaming, image processing, etc.) |

### Space-Specific Skill

| File | Contents |
|------|----------|
| `SKILL.md` | Auto-generated API reference for the Space's endpoints, with code snippets in Python, JavaScript, and cURL |

## Example Workflow

Here's a typical workflow using skills with Claude Code:

1. **Install the skill** in your project:
   ```bash
   cd my-project
   gradio skills add --claude
   ```

2. **Start Claude Code** and ask it to build a Gradio app:
   ```
   > Build me a Gradio app with an image input that applies a sepia filter
     and displays the result
   ```

   Claude Code now has full knowledge of `gr.Image`, `gr.Interface`, event listeners, and can write correct, idiomatic Gradio code.

3. **Add a Space skill** if you want to integrate with an existing Space:
   ```bash
   gradio skills add abidlabs/english-translator --claude
   ```

   Now you can ask:
   ```
   > Use the english-translator Space API to add a translation feature
     to my app
   ```

