import katex from "katex";
import "./katex.min.css";

export function render(elements: Array<HTMLElement>) {
	elements.forEach((element) => {
		katex.render(element.innerText, element);
	});
}
