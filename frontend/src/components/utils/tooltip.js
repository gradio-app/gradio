import Tooltip from "./Tooltip.svelte";

export function tooltip(element, { color, text }) {
  let div;
  let tooltipComponent;
  function mouseOver(event) {
    tooltipComponent = new Tooltip({
      props: {
        text,
        x: event.pageX,
        y: event.pageY,
        color,
      },
      target: document.body,
    });
  }
  function mouseMove(event) {
    tooltipComponent.$set({
      x: event.pageX,
      y: event.pageY,
    });
  }
  function mouseLeave() {
    tooltipComponent.$destroy();
  }

  element.addEventListener("mouseover", mouseOver);
  element.addEventListener("mouseleave", mouseLeave);
  element.addEventListener("mousemove", mouseMove);

  return {
    destroy() {
      element.removeEventListener("mouseover", mouseOver);
      element.removeEventListener("mouseleave", mouseLeave);
      element.removeEventListener("mousemove", mouseMove);
    },
  };
}
