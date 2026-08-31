# Gradio Skills for AI Coding Assistants

Tags: CLI, AI, AGENTS

AI coding assistants like [Claude Code](https://docs.anthropic.com/en/docs/claude-code), [Cursor](https://cursor.com), [Codex](https://openai.com/index/codex/), and [OpenCode](https://opencode.ai) can write better Gradio code when they have access to up-to-date API knowledge. Gradio **skills** solve this — they are structured reference files that get loaded into your assistant's context so it knows exactly how Gradio's components, events, and ecosystem work.

The `gradio skills add` command installs these reference files into the shared skills location used by compatible assistants, so they can use them automatically.

## Prerequisites

Make sure you have Gradio installed along with a recent version of `huggingface_hub`:

```bash
pip install --upgrade gradio huggingface_hub
```

> `huggingface_hub >= 1.4.0` is required for the skills command.

## Installing the General Gradio Skill

The general Gradio skill gives your assistant comprehensive knowledge of the Gradio API — components, event listeners, layout patterns, and working examples.

To install for Codex, Cursor, OpenCode, and other assistants that use the shared `.agents/skills` directory:

```bash
gradio skills add
```

This downloads the Gradio and HF Gradio skill files into the central `.agents/skills/` location. To also create a link from an assistant-specific skills directory, pass its flag: `--claude`, `--cursor`, `--codex`, or `--opencode`. On Windows systems without permission to create symlinks, Gradio copies the skill into the assistant-specific directory instead.

## Project-Level vs. Global Installation

By default, skills are installed **locally** in your current project directory. This means the assistant only has Gradio knowledge when working in that project.

To install **globally** (user-level, available in all projects):

```bash
gradio skills add --global
```

Or using the short flag:

```bash
gradio skills add -g
```

## Generating a Skill for a Specific HuggingFace Space

One of the most powerful features is generating a skill for any public HuggingFace Space. This gives your assistant full knowledge of that Space's API — endpoints, parameters, return types, and ready-to-use code snippets.

```bash
gradio skills add abidlabs/english-translator
```

This connects to the Space, extracts its API schema, and generates a `SKILL.md` file with:

- A description of each API endpoint
- Parameter names, types, defaults, and whether they're required
- Return value types
- Code snippets in Python, JavaScript, and cURL

For private Spaces, set your Hugging Face token:

```bash
export HF_TOKEN=hf_xxxxx
gradio skills add my-org/private-space
```



## Overwriting Existing Skills

If a skill is already installed, the command will exit with an error. To overwrite it:

```bash
gradio skills add --force
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
