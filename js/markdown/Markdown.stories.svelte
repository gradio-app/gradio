<script>
	import { Meta, Template, Story } from "@storybook/addon-svelte-csf";
	import Markdown from "./shared/Markdown.svelte";
</script>

<Meta
	title="Components/Markdown"
	component={Markdown}
	argTypes={{
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
	}}
/>

<Template let:args>
	<Markdown
		value="Here's some **bold** text. And some *italics* and some `code`"
		latex_delimiters={[]}
		theme_mode="light"
		{...args}
		height={args.height}
	/>
</Template>

<Story name="Simple inline Markdown" />

<Story
	name="Multiline Markdown"
	args={{
		value: `
This should
all be in one line.

---

This should be

in two separate lines.`
	}}
/>

<Story
	name="Markdown with Mermaid"
	args={{
		value: `
\`\`\`mermaid
graph TD
A --> B
\`\`\`
`
	}}
/>

<Story
	name="Markdown with Wide Content (Horizontal Scrolling)"
	args={{
		value: `| ids                 | ids                 | ids                 |
| ---------------------------------- | ---------------------------------- | ---------------------------------- |
| abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz   | abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz   | abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz   |
| abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz   | abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz   | abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz   |
| abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz   | abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz   | abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz   |
`
	}}
/>

<Story name="Right aligned Markdown" args={{ rtl: true }} />

<Story
	name="Markdown with LaTeX"
	args={{
		value: "What is the solution of $y=x^2$?",
		latex_delimiters: [{ left: "$", right: "$", display: false }]
	}}
/>

<Story
	name="Markdown with header links"
	args={{
		value: "# Visit [Gradio](https://gradio.app) for more information",
		header_links: true
	}}
/>

<Story
	name="Markdown with Long Content (Vertical Scrolling)"
	args={{
		value: `# Heading\n${"This is some text.\n".repeat(100)}`,
		height: "200px"
	}}
/>

<Story
	name="Markdown with Copy Button and Container"
	args={{
		value:
			"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies sed, dolor. Cras elementum ultrices diam. Maecenas ligula massa, varius a, semper congue, euismod non, mi. Proin porttitor, orci nec nonummy molestie, enim est eleifend mi, non fermentum diam nisl sit amet erat.",
		show_copy_button: true,
		container: true
	}}
/>
<Story
	name="Markdown Several Coding languages"
	args={{
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
	}}
/>
