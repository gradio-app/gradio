import type {
	Element,
	MarkdownExtension,
	BlockContext,
	Line
} from "@lezer/markdown";
import { parseMixed } from "@lezer/common";
import { yaml } from "@codemirror/legacy-modes/mode/yaml";
import { foldInside, foldNodeProp, StreamLanguage } from "@codemirror/language";
import { styleTags, tags } from "@lezer/highlight";

const frontMatterFence = /^---\s*$/m;

export const frontmatter: MarkdownExtension = {
	defineNodes: [{ name: "Frontmatter", block: true }, "FrontmatterMark"],
	props: [
		styleTags({
			Frontmatter: [tags.documentMeta, tags.monospace],
			FrontmatterMark: tags.processingInstruction
		}),
		foldNodeProp.add({
			Frontmatter: foldInside,
			FrontmatterMark: () => null
		})
	],
	wrap: parseMixed((node) => {
		const { parser } = StreamLanguage.define(yaml);
		if (node.type.name === "Frontmatter") {
			return {
				parser,
				overlay: [{ from: node.from + 4, to: node.to - 4 }]
			};
		}
		return null;
	}),
	parseBlock: [
		{
			name: "Frontmatter",
			before: "HorizontalRule",
			parse: (cx: BlockContext, line: Line): boolean => {
				let end: number | undefined = undefined;
				const children = new Array<Element>();
				if (cx.lineStart === 0 && frontMatterFence.test(line.text)) {
					children.push(cx.elt("FrontmatterMark", 0, 4));
					while (cx.nextLine()) {
						if (frontMatterFence.test(line.text)) {
							end = cx.lineStart + 4;
							break;
						}
					}
					if (end !== undefined) {
						children.push(cx.elt("FrontmatterMark", end - 4, end));
						cx.addElement(cx.elt("Frontmatter", 0, end, children));
					}
					return true;
				}
				return false;
			}
		}
	]
};
