import {
	S as j,
	i as q,
	s as D,
	G as E,
	e as d,
	H as z,
	C as v,
	g as y,
	m as h,
	E as S,
	ad as T,
	J as N,
	ak as G,
	p as g,
	t as k,
	q as C,
	n as w,
	a0 as K,
	r as A,
	I as F,
	K as L,
	T as M,
	x as O,
	$ as P,
	b as Q,
	a as R,
	h as U,
	j as V,
	k as W,
	y as B
} from "../lite.js";
/* empty css                                                  */ import { B as X } from "./Button-5b68d65a.js";
/* empty css                                                    */ import { B as Y } from "./BlockTitle-1b9e69db.js";
import "./Info-06b02eda.js";
function Z(l) {
	let e;
	return {
		c() {
			e = F(l[2]);
		},
		m(a, n) {
			y(a, e, n);
		},
		p(a, n) {
			n & 4 && L(e, a[2]);
		},
		d(a) {
			a && C(e);
		}
	};
}
function p(l) {
	let e, a, n, s, f, m, r;
	return (
		(a = new Y({
			props: {
				show_label: l[4],
				info: l[3],
				$$slots: { default: [Z] },
				$$scope: { ctx: l }
			}
		})),
		{
			c() {
				(e = E("label")),
					d(a.$$.fragment),
					(n = z()),
					(s = E("input")),
					v(s, "type", "number"),
					(s.disabled = l[1]),
					v(s, "class", "svelte-og1zwl"),
					v(e, "class", "block");
			},
			m(o, b) {
				y(o, e, b),
					h(a, e, null),
					S(e, n),
					S(e, s),
					T(s, l[0]),
					(f = !0),
					m ||
						((r = [
							N(s, "input", l[7]),
							N(s, "keypress", l[5]),
							N(s, "blur", l[6])
						]),
						(m = !0));
			},
			p(o, [b]) {
				const t = {};
				b & 16 && (t.show_label = o[4]),
					b & 8 && (t.info = o[3]),
					b & 1028 && (t.$$scope = { dirty: b, ctx: o }),
					a.$set(t),
					(!f || b & 2) && (s.disabled = o[1]),
					b & 1 && G(s.value) !== o[0] && T(s, o[0]);
			},
			i(o) {
				f || (g(a.$$.fragment, o), (f = !0));
			},
			o(o) {
				k(a.$$.fragment, o), (f = !1);
			},
			d(o) {
				o && C(e), w(a), (m = !1), K(r);
			}
		}
	);
}
function x(l, e, a) {
	let { value: n = 0 } = e,
		{ disabled: s = !1 } = e,
		{ label: f } = e,
		{ info: m = void 0 } = e,
		{ show_label: r = !0 } = e;
	const o = A();
	function b(u) {
		!isNaN(u) && u !== null && o("change", u);
	}
	async function t(u) {
		await M(), u.key === "Enter" && (u.preventDefault(), o("submit"));
	}
	function _(u) {
		o("blur");
	}
	function c() {
		(n = G(this.value)), a(0, n);
	}
	return (
		(l.$$set = (u) => {
			"value" in u && a(0, (n = u.value)),
				"disabled" in u && a(1, (s = u.disabled)),
				"label" in u && a(2, (f = u.label)),
				"info" in u && a(3, (m = u.info)),
				"show_label" in u && a(4, (r = u.show_label));
		}),
		(l.$$.update = () => {
			l.$$.dirty & 1 && b(n);
		}),
		[n, s, f, m, r, t, _, c]
	);
}
class $ extends j {
	constructor(e) {
		super(),
			q(this, e, x, p, D, {
				value: 0,
				disabled: 1,
				label: 2,
				info: 3,
				show_label: 4
			});
	}
}
function ee(l) {
	let e, a, n, s, f;
	const m = [l[8]];
	let r = {};
	for (let t = 0; t < m.length; t += 1) r = O(r, m[t]);
	e = new P({ props: r });
	function o(t) {
		l[10](t);
	}
	let b = {
		label: l[1],
		info: l[2],
		show_label: l[7],
		disabled: l[9] === "static"
	};
	return (
		l[0] !== void 0 && (b.value = l[0]),
		(n = new $({ props: b })),
		Q.push(() => R(n, "value", o)),
		n.$on("change", l[11]),
		n.$on("submit", l[12]),
		n.$on("blur", l[13]),
		{
			c() {
				d(e.$$.fragment), (a = z()), d(n.$$.fragment);
			},
			m(t, _) {
				h(e, t, _), y(t, a, _), h(n, t, _), (f = !0);
			},
			p(t, _) {
				const c = _ & 256 ? U(m, [V(t[8])]) : {};
				e.$set(c);
				const u = {};
				_ & 2 && (u.label = t[1]),
					_ & 4 && (u.info = t[2]),
					_ & 128 && (u.show_label = t[7]),
					_ & 512 && (u.disabled = t[9] === "static"),
					!s && _ & 1 && ((s = !0), (u.value = t[0]), W(() => (s = !1))),
					n.$set(u);
			},
			i(t) {
				f || (g(e.$$.fragment, t), g(n.$$.fragment, t), (f = !0));
			},
			o(t) {
				k(e.$$.fragment, t), k(n.$$.fragment, t), (f = !1);
			},
			d(t) {
				w(e, t), t && C(a), w(n, t);
			}
		}
	);
}
function le(l) {
	let e, a;
	return (
		(e = new X({
			props: {
				visible: l[5],
				elem_id: l[3],
				elem_classes: l[4],
				disable: typeof l[6].container == "boolean" && !l[6].container,
				$$slots: { default: [ee] },
				$$scope: { ctx: l }
			}
		})),
		{
			c() {
				d(e.$$.fragment);
			},
			m(n, s) {
				h(e, n, s), (a = !0);
			},
			p(n, [s]) {
				const f = {};
				s & 32 && (f.visible = n[5]),
					s & 8 && (f.elem_id = n[3]),
					s & 16 && (f.elem_classes = n[4]),
					s & 64 &&
						(f.disable = typeof n[6].container == "boolean" && !n[6].container),
					s & 17287 && (f.$$scope = { dirty: s, ctx: n }),
					e.$set(f);
			},
			i(n) {
				a || (g(e.$$.fragment, n), (a = !0));
			},
			o(n) {
				k(e.$$.fragment, n), (a = !1);
			},
			d(n) {
				w(e, n);
			}
		}
	);
}
function ne(l, e, a) {
	let { label: n = "Number" } = e,
		{ info: s = void 0 } = e,
		{ elem_id: f = "" } = e,
		{ elem_classes: m = [] } = e,
		{ visible: r = !0 } = e,
		{ style: o = {} } = e,
		{ value: b = 0 } = e,
		{ show_label: t } = e,
		{ loading_status: _ } = e,
		{ mode: c } = e;
	function u(i) {
		(b = i), a(0, b);
	}
	function H(i) {
		B.call(this, l, i);
	}
	function I(i) {
		B.call(this, l, i);
	}
	function J(i) {
		B.call(this, l, i);
	}
	return (
		(l.$$set = (i) => {
			"label" in i && a(1, (n = i.label)),
				"info" in i && a(2, (s = i.info)),
				"elem_id" in i && a(3, (f = i.elem_id)),
				"elem_classes" in i && a(4, (m = i.elem_classes)),
				"visible" in i && a(5, (r = i.visible)),
				"style" in i && a(6, (o = i.style)),
				"value" in i && a(0, (b = i.value)),
				"show_label" in i && a(7, (t = i.show_label)),
				"loading_status" in i && a(8, (_ = i.loading_status)),
				"mode" in i && a(9, (c = i.mode));
		}),
		[b, n, s, f, m, r, o, t, _, c, u, H, I, J]
	);
}
class ae extends j {
	constructor(e) {
		super(),
			q(this, e, ne, le, D, {
				label: 1,
				info: 2,
				elem_id: 3,
				elem_classes: 4,
				visible: 5,
				style: 6,
				value: 0,
				show_label: 7,
				loading_status: 8,
				mode: 9
			});
	}
}
const be = ae,
	_e = ["static", "dynamic"],
	me = (l) => ({
		type: { payload: "number" },
		description: { payload: "numeric value" },
		example_data: l.value ?? 1
	});
export { be as Component, me as document, _e as modes };
//# sourceMappingURL=index-260f157e.js.map
