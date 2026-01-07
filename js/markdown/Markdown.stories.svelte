<script module>
	import { defineMeta } from "@storybook/addon-svelte-csf";
	import Markdown from "./Index.svelte";
	import { wrapProps } from "../storybook/wrapProps";

	const { Story } = defineMeta({
		title: "Components/Markdown",
		component: Markdown,
		argTypes: {
			rtl: {
				options: [true, false],
				description: "Whether to render right-to-left",
				control: { type: "boolean" },
				defaultValue: false
			},
			height: {
				description: "Maximum height of the Markdown component",
				control: { type: "text" },
				defaultValue: "200px"
			}
		}
	});

	const defaultValue = "Here's some **bold** text. And some *italics* and some `code`";
</script>

<Story name="Simple inline Markdown" args={{}}>
	{#snippet template(args)}
		<Markdown {...wrapProps({ value: defaultValue, latex_delimiters: [], height: args.height, ...args })} />
	{/snippet}
</Story>

<Story name="Multiline Markdown" args={{
	value: `
This should
all be in one line.

---

This should be

in two separate lines.`
}}>
	{#snippet template(args)}
		<Markdown {...wrapProps({ latex_delimiters: [], height: args.height, ...args })} />
	{/snippet}
</Story>

<Story name="Markdown with Mermaid" args={{
	value: `
\`\`\`mermaid
graph TD
A --> B
\`\`\`
`
}}>
	{#snippet template(args)}
		<Markdown {...wrapProps({ latex_delimiters: [], height: args.height, ...args })} />
	{/snippet}
</Story>

<Story name="Markdown with Wide Content (Horizontal Scrolling)" args={{
	value: `| ids                 | ids                 | ids                 |
| ---------------------------------- | ---------------------------------- | ---------------------------------- |
| abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz   | abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz   | abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz   |
| abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz   | abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz   | abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz   |
| abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz   | abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz   | abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz   |
`
}}>
	{#snippet template(args)}
		<Markdown {...wrapProps({ latex_delimiters: [], height: args.height, ...args })} />
	{/snippet}
</Story>

<Story name="Right aligned Markdown" args={{ rtl: true }}>
	{#snippet template(args)}
		<Markdown {...wrapProps({ value: defaultValue, latex_delimiters: [], height: args.height, ...args })} />
	{/snippet}
</Story>

<Story name="Markdown with LaTeX" args={{
	value: "What is the solution of $y=x^2$?",
	latex_delimiters: [{ left: "$", right: "$", display: false }]
}}>
	{#snippet template(args)}
		<Markdown {...wrapProps({ height: args.height, ...args })} />
	{/snippet}
</Story>

<Story name="Markdown with header links" args={{
	value: "# Visit [Gradio](https://gradio.app) for more information",
	header_links: true
}}>
	{#snippet template(args)}
		<Markdown {...wrapProps({ latex_delimiters: [], height: args.height, ...args })} />
	{/snippet}
</Story>

<Story name="Markdown with Long Content (Vertical Scrolling)" args={{
	value: `# Heading\n${"This is some text.\n".repeat(100)}`,
	height: "200px"
}}>
	{#snippet template(args)}
		<Markdown {...wrapProps({ latex_delimiters: [], height: args.height, ...args })} />
	{/snippet}
</Story>

<Story name="Markdown with Copy Button and Container" args={{
	value: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies sed, dolor. Cras elementum ultrices diam. Maecenas ligula massa, varius a, semper congue, euismod non, mi. Proin porttitor, orci nec nonummy molestie, enim est eleifend mi, non fermentum diam nisl sit amet erat.",
	show_copy_button: true,
	container: true
}}>
	{#snippet template(args)}
		<Markdown {...wrapProps({ latex_delimiters: [], height: args.height, ...args })} />
	{/snippet}
</Story>

<Story name="Markdown Several Coding languages" args={{
	value: `
#### Python
\`\`\`python
def hello_world():
    print("Hello, World!")
    for i in range(5):
        print(f"Count: {i}")
    return "欢迎使用Markdown编辑器"
\`\`\`

#### SQL
\`\`\`sql
SELECT u.name, u.email, p.title
FROM users u
LEFT JOIN projects p ON u.id = p.user_id
WHERE u.active = true
    AND u.created_date >= '2024-01-01'
ORDER BY u.name ASC, p.created_date DESC;
\`\`\`

#### Rust
\`\`\`rust
use std::collections::HashMap;

#[derive(Debug)]
struct Person {
    name: String,
    age: u32,
}

impl Person {
    fn new(name: &str, age: u32) -> Self {
        Person {
            name: name.to_string(),
            age,
        }
    }

    fn greet(&self) -> String {
        format!("Hello, I'm {} and I'm {} years old", self.name, self.age)
    }
}

fn main() {
    let mut people = HashMap::new();

    let alice = Person::new("Alice", 30);
    let bob = Person::new("Bob", 25);

    people.insert("alice", alice);
    people.insert("bob", bob);

    for (key, person) in &people {
        println!("{}: {}", key, person.greet());
    }
}
\`\`\`
`,
	show_copy_button: true,
	container: true
}}>
	{#snippet template(args)}
		<Markdown {...wrapProps({ latex_delimiters: [], height: args.height, ...args })} />
	{/snippet}
</Story>
