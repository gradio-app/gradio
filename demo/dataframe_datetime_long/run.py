import random

import gradio as gr

ROWS = 5000
rng = random.Random(42)

headers = [
    "date",
    "str_short",
    "str_long",
    "num",
    "bool",
    "markdown",
    "html",
]
datatype = ["date", "str", "str", "number", "bool", "markdown", "html"]

WORDS = [
    "alpha", "beta", "gamma", "delta", "epsilon", "zeta", "eta", "theta",
    "iota", "kappa", "lambda", "mu", "nu", "xi", "omicron", "pi",
]

MD_WRAPPERS = [
    lambda s: f"**{s}**",
    lambda s: f"*{s}*",
    lambda s: f"`{s}`",
    lambda s: f"[{s}](https://example.com)",
    lambda s: f"# {s}",
    lambda s: s,
]

HTML_WRAPPERS = [
    lambda s: f"<b>{s}</b>",
    lambda s: f"<i>{s}</i>",
    lambda s: f'<span style="color: tomato">{s}</span>',
    lambda s: f'<a href="https://example.com" target="_blank">{s}</a>',
    lambda s: f"<code>{s}</code>",
    lambda s: s,
]


def random_text(min_words: int, max_words: int) -> str:
    n = rng.randint(min_words, max_words)
    return " ".join(rng.choice(WORDS) for _ in range(n))


def random_md() -> str:
    return rng.choice(MD_WRAPPERS)(random_text(1, 8))


def random_html() -> str:
    return rng.choice(HTML_WRAPPERS)(random_text(1, 8))


data = [
    [
        f"2026-01-{(i % 28) + 1:02d}",
        rng.choice(WORDS),
        random_text(2, 6),
        round(rng.random() * 1000, 2),
        rng.random() > 0.5,
        random_md(),
        random_html(),
    ]
    for i in range(ROWS)
]

with gr.Blocks() as demo:
    gr.Markdown(
        f"### Reproduction for #13279: {ROWS} rows × mixed dtypes (markdown/html/date/number/bool/str)"
    )
    gr.Dataframe(
        value=data, headers=headers, datatype=datatype, interactive=False # type: ignore
    )

if __name__ == "__main__":
    demo.launch()
