import { s as m, f as s, a as i, p, t as a, S as l } from "./index-6d84c79e.js";
import { yaml as f } from "./yaml-95012b83.js";
import "../lite.js";
import "./Blocks-b77f2878.js";
import "./Button-5b68d65a.js";
import "./BlockLabel-e392131b.js";
import "./Empty-b331fdfe.js";
/* empty css                                                    */ import "./Copy-d120a3d6.js";
import "./Download-604a4bc6.js";
const n = /^---\s*$/m,
	b = {
		defineNodes: [{ name: "Frontmatter", block: !0 }, "FrontmatterMark"],
		props: [
			m({
				Frontmatter: [a.documentMeta, a.monospace],
				FrontmatterMark: a.processingInstruction
			}),
			s.add({ Frontmatter: i, FrontmatterMark: () => null })
		],
		wrap: p((t) => {
			const { parser: e } = l.define(f);
			return t.type.name === "Frontmatter"
				? { parser: e, overlay: [{ from: t.from + 4, to: t.to - 4 }] }
				: null;
		}),
		parseBlock: [
			{
				name: "Frontmatter",
				before: "HorizontalRule",
				parse: (t, e) => {
					let r;
					const o = new Array();
					if (t.lineStart === 0 && n.test(e.text)) {
						for (o.push(t.elt("FrontmatterMark", 0, 4)); t.nextLine(); )
							if (n.test(e.text)) {
								r = t.lineStart + 4;
								break;
							}
						return (
							r !== void 0 &&
								(o.push(t.elt("FrontmatterMark", r - 4, r)),
								t.addElement(t.elt("Frontmatter", 0, r, o))),
							!0
						);
					} else return !1;
				}
			}
		]
	};
export { b as frontmatter };
//# sourceMappingURL=frontmatter-66ca1c2f.js.map
