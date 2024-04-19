const {
  SvelteComponent: u,
  append: d,
  attr: _,
  detach: g,
  element: o,
  init: r,
  insert: v,
  noop: c,
  safe_not_equal: y,
  set_data: m,
  text: b,
  toggle_class: i
} = window.__gradio__svelte__internal;
function w(a) {
  let e, n;
  return {
    c() {
      e = o("div"), n = b(
        /*value*/
        a[0]
      ), _(e, "class", "svelte-1gecy8w"), i(
        e,
        "table",
        /*type*/
        a[1] === "table"
      ), i(
        e,
        "gallery",
        /*type*/
        a[1] === "gallery"
      ), i(
        e,
        "selected",
        /*selected*/
        a[2]
      );
    },
    m(t, l) {
      v(t, e, l), d(e, n);
    },
    p(t, [l]) {
      l & /*value*/
      1 && m(
        n,
        /*value*/
        t[0]
      ), l & /*type*/
      2 && i(
        e,
        "table",
        /*type*/
        t[1] === "table"
      ), l & /*type*/
      2 && i(
        e,
        "gallery",
        /*type*/
        t[1] === "gallery"
      ), l & /*selected*/
      4 && i(
        e,
        "selected",
        /*selected*/
        t[2]
      );
    },
    i: c,
    o: c,
    d(t) {
      t && g(e);
    }
  };
}
function h(a, e, n) {
  let { value: t } = e, { type: l } = e, { selected: f = !1 } = e;
  return a.$$set = (s) => {
    "value" in s && n(0, t = s.value), "type" in s && n(1, l = s.type), "selected" in s && n(2, f = s.selected);
  }, [t, l, f];
}
class q extends u {
  constructor(e) {
    super(), r(this, e, h, w, y, { value: 0, type: 1, selected: 2 });
  }
}
export {
  q as default
};
