import {
	S as K,
	i as R,
	s as z,
	G as k,
	e as q,
	H,
	C as o,
	g as v,
	E as C,
	m as E,
	ad as j,
	J as w,
	ak as I,
	p as M,
	t as T,
	q as S,
	n as D,
	a0 as F,
	r as L,
	I as N,
	K as O,
	x as P,
	$ as Q,
	b as U,
	a as V,
	h as W,
	j as X,
	k as Y,
	y as J
} from "../lite.js";
/* empty css                                                  */ import { B as Z } from "./Button-5b68d65a.js";
/* empty css                                                    */ import { B as y } from "./BlockTitle-1b9e69db.js";
import "./Info-06b02eda.js";
function p(e) {
	let l;
	return {
		c() {
			l = N(e[5]);
		},
		m(a, n) {
			v(a, l, n);
		},
		p(a, n) {
			n & 32 && O(l, a[5]);
		},
		d(a) {
			a && S(l);
		}
	};
}
function x(e) {
	let l, a, n, _, b, u, g, f, d, i, r;
	return (
		(_ = new y({
			props: {
				show_label: e[7],
				info: e[6],
				$$slots: { default: [p] },
				$$scope: { ctx: e }
			}
		})),
		{
			c() {
				(l = k("div")),
					(a = k("div")),
					(n = k("label")),
					q(_.$$.fragment),
					(b = H()),
					(u = k("input")),
					(g = H()),
					(f = k("input")),
					o(n, "for", e[8]),
					o(u, "data-testid", "number-input"),
					o(u, "type", "number"),
					o(u, "min", e[1]),
					o(u, "max", e[2]),
					o(u, "step", e[3]),
					(u.disabled = e[4]),
					o(u, "class", "svelte-1cl284s"),
					o(a, "class", "head svelte-1cl284s"),
					o(l, "class", "wrap svelte-1cl284s"),
					o(f, "type", "range"),
					o(f, "id", e[8]),
					o(f, "name", "cowbell"),
					o(f, "min", e[1]),
					o(f, "max", e[2]),
					o(f, "step", e[3]),
					(f.disabled = e[4]),
					o(f, "class", "svelte-1cl284s");
			},
			m(s, t) {
				v(s, l, t),
					C(l, a),
					C(a, n),
					E(_, n, null),
					C(a, b),
					C(a, u),
					j(u, e[0]),
					v(s, g, t),
					v(s, f, t),
					j(f, e[0]),
					(d = !0),
					i ||
						((r = [
							w(u, "input", e[11]),
							w(u, "blur", e[10]),
							w(u, "pointerup", e[9]),
							w(f, "change", e[12]),
							w(f, "input", e[12]),
							w(f, "pointerup", e[9])
						]),
						(i = !0));
			},
			p(s, [t]) {
				const h = {};
				t & 128 && (h.show_label = s[7]),
					t & 64 && (h.info = s[6]),
					t & 16416 && (h.$$scope = { dirty: t, ctx: s }),
					_.$set(h),
					(!d || t & 2) && o(u, "min", s[1]),
					(!d || t & 4) && o(u, "max", s[2]),
					(!d || t & 8) && o(u, "step", s[3]),
					(!d || t & 16) && (u.disabled = s[4]),
					t & 1 && I(u.value) !== s[0] && j(u, s[0]),
					(!d || t & 2) && o(f, "min", s[1]),
					(!d || t & 4) && o(f, "max", s[2]),
					(!d || t & 8) && o(f, "step", s[3]),
					(!d || t & 16) && (f.disabled = s[4]),
					t & 1 && j(f, s[0]);
			},
			i(s) {
				d || (M(_.$$.fragment, s), (d = !0));
			},
			o(s) {
				T(_.$$.fragment, s), (d = !1);
			},
			d(s) {
				s && S(l), D(_), s && S(g), s && S(f), (i = !1), F(r);
			}
		}
	);
}
let $ = 0;
function ee(e, l, a) {
	let { value: n = 0 } = l,
		{ minimum: _ = 0 } = l,
		{ maximum: b = 100 } = l,
		{ step: u = 1 } = l,
		{ disabled: g = !1 } = l,
		{ label: f } = l,
		{ info: d = void 0 } = l,
		{ show_label: i } = l;
	const r = `range_id_${$++}`,
		s = L();
	function t(c) {
		s("release", n);
	}
	const h = () => {
		s("release", n), a(0, (n = Math.min(Math.max(n, _), b)));
	};
	function B() {
		(n = I(this.value)), a(0, n);
	}
	function G() {
		(n = I(this.value)), a(0, n);
	}
	return (
		(e.$$set = (c) => {
			"value" in c && a(0, (n = c.value)),
				"minimum" in c && a(1, (_ = c.minimum)),
				"maximum" in c && a(2, (b = c.maximum)),
				"step" in c && a(3, (u = c.step)),
				"disabled" in c && a(4, (g = c.disabled)),
				"label" in c && a(5, (f = c.label)),
				"info" in c && a(6, (d = c.info)),
				"show_label" in c && a(7, (i = c.show_label));
		}),
		(e.$$.update = () => {
			e.$$.dirty & 1 && s("change", n);
		}),
		[n, _, b, u, g, f, d, i, r, t, h, B, G]
	);
}
class le extends K {
	constructor(l) {
		super(),
			R(this, l, ee, x, z, {
				value: 0,
				minimum: 1,
				maximum: 2,
				step: 3,
				disabled: 4,
				label: 5,
				info: 6,
				show_label: 7
			});
	}
}
function ne(e) {
	let l, a, n, _, b;
	const u = [e[12]];
	let g = {};
	for (let i = 0; i < u.length; i += 1) g = P(g, u[i]);
	l = new Q({ props: g });
	function f(i) {
		e[13](i);
	}
	let d = {
		label: e[4],
		info: e[5],
		show_label: e[11],
		minimum: e[7],
		maximum: e[8],
		step: e[9],
		disabled: e[10] === "static"
	};
	return (
		e[0] !== void 0 && (d.value = e[0]),
		(n = new le({ props: d })),
		U.push(() => V(n, "value", f)),
		n.$on("change", e[14]),
		n.$on("release", e[15]),
		{
			c() {
				q(l.$$.fragment), (a = H()), q(n.$$.fragment);
			},
			m(i, r) {
				E(l, i, r), v(i, a, r), E(n, i, r), (b = !0);
			},
			p(i, r) {
				const s = r & 4096 ? W(u, [X(i[12])]) : {};
				l.$set(s);
				const t = {};
				r & 16 && (t.label = i[4]),
					r & 32 && (t.info = i[5]),
					r & 2048 && (t.show_label = i[11]),
					r & 128 && (t.minimum = i[7]),
					r & 256 && (t.maximum = i[8]),
					r & 512 && (t.step = i[9]),
					r & 1024 && (t.disabled = i[10] === "static"),
					!_ && r & 1 && ((_ = !0), (t.value = i[0]), Y(() => (_ = !1))),
					n.$set(t);
			},
			i(i) {
				b || (M(l.$$.fragment, i), M(n.$$.fragment, i), (b = !0));
			},
			o(i) {
				T(l.$$.fragment, i), T(n.$$.fragment, i), (b = !1);
			},
			d(i) {
				D(l, i), i && S(a), D(n, i);
			}
		}
	);
}
function ae(e) {
	let l, a;
	return (
		(l = new Z({
			props: {
				visible: e[3],
				elem_id: e[1],
				elem_classes: e[2],
				disable: typeof e[6].container == "boolean" && !e[6].container,
				$$slots: { default: [ne] },
				$$scope: { ctx: e }
			}
		})),
		{
			c() {
				q(l.$$.fragment);
			},
			m(n, _) {
				E(l, n, _), (a = !0);
			},
			p(n, [_]) {
				const b = {};
				_ & 8 && (b.visible = n[3]),
					_ & 2 && (b.elem_id = n[1]),
					_ & 4 && (b.elem_classes = n[2]),
					_ & 64 &&
						(b.disable = typeof n[6].container == "boolean" && !n[6].container),
					_ & 73649 && (b.$$scope = { dirty: _, ctx: n }),
					l.$set(b);
			},
			i(n) {
				a || (M(l.$$.fragment, n), (a = !0));
			},
			o(n) {
				T(l.$$.fragment, n), (a = !1);
			},
			d(n) {
				D(l, n);
			}
		}
	);
}
function ie(e, l, a) {
	let { elem_id: n = "" } = l,
		{ elem_classes: _ = [] } = l,
		{ visible: b = !0 } = l,
		{ value: u = 0 } = l,
		{ label: g = "Slider" } = l,
		{ info: f = void 0 } = l,
		{ style: d = {} } = l,
		{ minimum: i } = l,
		{ maximum: r } = l,
		{ step: s } = l,
		{ mode: t } = l,
		{ show_label: h } = l,
		{ loading_status: B } = l;
	function G(m) {
		(u = m), a(0, u);
	}
	function c(m) {
		J.call(this, e, m);
	}
	function A(m) {
		J.call(this, e, m);
	}
	return (
		(e.$$set = (m) => {
			"elem_id" in m && a(1, (n = m.elem_id)),
				"elem_classes" in m && a(2, (_ = m.elem_classes)),
				"visible" in m && a(3, (b = m.visible)),
				"value" in m && a(0, (u = m.value)),
				"label" in m && a(4, (g = m.label)),
				"info" in m && a(5, (f = m.info)),
				"style" in m && a(6, (d = m.style)),
				"minimum" in m && a(7, (i = m.minimum)),
				"maximum" in m && a(8, (r = m.maximum)),
				"step" in m && a(9, (s = m.step)),
				"mode" in m && a(10, (t = m.mode)),
				"show_label" in m && a(11, (h = m.show_label)),
				"loading_status" in m && a(12, (B = m.loading_status));
		}),
		[u, n, _, b, g, f, d, i, r, s, t, h, B, G, c, A]
	);
}
class se extends K {
	constructor(l) {
		super(),
			R(this, l, ie, ae, z, {
				elem_id: 1,
				elem_classes: 2,
				visible: 3,
				value: 0,
				label: 4,
				info: 5,
				style: 6,
				minimum: 7,
				maximum: 8,
				step: 9,
				mode: 10,
				show_label: 11,
				loading_status: 12
			});
	}
}
const be = se,
	de = ["static", "dynamic"],
	re = (e) => ({
		type: { payload: "number" },
		description: { payload: "selected value" },
		example_data: e.value ?? e.minimum
	});
export { be as Component, re as document, de as modes };
//# sourceMappingURL=index-d5a657eb.js.map
