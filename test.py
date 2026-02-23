import gradio as gr


class HTMLAccordion(gr.HTML):
    def __init__(self, title_html: str, open: bool = False, **kwargs):
        html_template = """
        <section class='acc ${open ? "open" : ""}'>
            <button class='acc-btn' type='button'>
                <span>${title_html}</span>
                <span class='acc-icon'>▾</span>
            </button>
            <div class='acc-body'></div>
        </section>
        @children
        """
        css_template = """
        border: 1px solid var(--border-color-primary);
        border-radius: var(--radius-md);
        overflow: hidden;
        margin-bottom: 10px;
        .acc-btn { width: 100%; border: none; text-align: left; padding: 10px 12px; display: flex; justify-content: space-between; background: var(--background-fill-primary); color: var(--body-text-color); cursor: pointer; }
        .acc-body { display: none; padding: 12px; background: var(--background-fill-primary); }
        .acc.open .acc-body { display: block; border-top: 1px solid var(--border-color-primary); }
        .acc.open .acc-icon { transform: rotate(180deg); }
        """
        js_on_load = """
        const root = element.querySelector('.acc');
        const button = element.querySelector('.acc-btn');
        const body = element.querySelector('.acc-body');
        if (!root || !button || !body) return;

        if (!element.dataset.movedChildren) {
            const nodes = Array.from(element.children).filter((node) => node !== root);
            nodes.forEach((node) => {
                if (node === body) return;
                if (node.contains(body) || body.contains(node)) return;
                body.appendChild(node);
            });
            element.dataset.movedChildren = "1";
        }

        if (!button.dataset.boundClick) {
            button.addEventListener('click', () => root.classList.toggle('open'));
            button.dataset.boundClick = "1";
        }
        """
        super().__init__(
            title_html=title_html,
            open=open,
            html_template=html_template,
            css_template=css_template,
            js_on_load=js_on_load,
            **kwargs,
        )


h = HTMLAccordion("<b>Section 1</b> <span style='color:#2563eb;'>HTML title</span>", open=True)

h.push_to_hub()