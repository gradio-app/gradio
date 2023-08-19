import {
	S as I,
	i as J,
	s as K,
	e as q,
	H as G,
	G as j,
	C as g,
	m as y,
	g as w,
	p as B,
	t as S,
	n as T,
	q as v,
	N as z,
	r as F,
	I as M,
	K as N,
	M as C,
	E as k,
	J as O,
	a0 as L,
	x as P,
	$ as Q,
	b as R,
	a as U,
	h as V,
	j as W,
	k as X,
	y as A
} from "../lite.js";
/* empty css                                                  */ import {
	g as Y,
	B as Z
} from "./Button-5b68d65a.js";
import { B as p } from "./BlockTitle-1b9e69db.js";
/* empty css                                                    */ import "./Info-06b02eda.js";
function D(l, e, s) {
	const t = l.slice();
	return (t[12] = e[s]), t;
}
function x(l) {
	let e;
	return {
		c() {
			e = M(l[3]);
		},
		m(s, t) {
			w(s, e, t);
		},
		p(s, t) {
			t & 8 && N(e, s[3]);
		},
		d(s) {
			s && v(e);
		}
	};
}
function H(l) {
	let e,
		s,
		t,
		c,
		o,
		i = l[12] + "",
		a,
		h,
		b,
		n;
	function _() {
		return l[10](l[12]);
	}
	function r(...d) {
		return l[11](l[12], ...d);
	}
	return {
		c() {
			(e = j("label")),
				(s = j("input")),
				(c = G()),
				(o = j("span")),
				(a = M(i)),
				(h = G()),
				(s.disabled = l[2]),
				(s.checked = t = l[0].includes(l[12])),
				g(s, "type", "checkbox"),
				g(s, "name", "test"),
				g(s, "class", "svelte-1qxcj04"),
				g(o, "class", "ml-2 svelte-1qxcj04"),
				g(e, "style", l[6]),
				g(e, "class", "svelte-1qxcj04"),
				C(e, "disabled", l[2]),
				C(e, "selected", l[0].includes(l[12]));
		},
		m(d, m) {
			w(d, e, m),
				k(e, s),
				k(e, c),
				k(e, o),
				k(o, a),
				k(e, h),
				b || ((n = [O(s, "change", _), O(s, "input", r)]), (b = !0));
		},
		p(d, m) {
			(l = d),
				m & 4 && (s.disabled = l[2]),
				m & 3 && t !== (t = l[0].includes(l[12])) && (s.checked = t),
				m & 2 && i !== (i = l[12] + "") && N(a, i),
				m & 64 && g(e, "style", l[6]),
				m & 4 && C(e, "disabled", l[2]),
				m & 3 && C(e, "selected", l[0].includes(l[12]));
		},
		d(d) {
			d && v(e), (b = !1), L(n);
		}
	};
}
function $(l) {
	let e, s, t, c;
	e = new p({
		props: {
			show_label: l[5],
			info: l[4],
			$$slots: { default: [x] },
			$$scope: { ctx: l }
		}
	});
	let o = l[1],
		i = [];
	for (let a = 0; a < o.length; a += 1) i[a] = H(D(l, o, a));
	return {
		c() {
			q(e.$$.fragment), (s = G()), (t = j("div"));
			for (let a = 0; a < i.length; a += 1) i[a].c();
			g(t, "class", "wrap svelte-1qxcj04"),
				g(t, "data-testid", "checkbox-group");
		},
		m(a, h) {
			y(e, a, h), w(a, s, h), w(a, t, h);
			for (let b = 0; b < i.length; b += 1) i[b] && i[b].m(t, null);
			c = !0;
		},
		p(a, [h]) {
			const b = {};
			if (
				(h & 32 && (b.show_label = a[5]),
				h & 16 && (b.info = a[4]),
				h & 32776 && (b.$$scope = { dirty: h, ctx: a }),
				e.$set(b),
				h & 455)
			) {
				o = a[1];
				let n;
				for (n = 0; n < o.length; n += 1) {
					const _ = D(a, o, n);
					i[n] ? i[n].p(_, h) : ((i[n] = H(_)), i[n].c(), i[n].m(t, null));
				}
				for (; n < i.length; n += 1) i[n].d(1);
				i.length = o.length;
			}
		},
		i(a) {
			c || (B(e.$$.fragment, a), (c = !0));
		},
		o(a) {
			S(e.$$.fragment, a), (c = !1);
		},
		d(a) {
			T(e, a), a && v(s), a && v(t), z(i, a);
		}
	};
}
function ee(l, e, s) {
	let t,
		{ value: c = [] } = e,
		{ style: o = {} } = e,
		{ choices: i } = e,
		{ disabled: a = !1 } = e,
		{ label: h } = e,
		{ info: b = void 0 } = e,
		{ show_label: n } = e;
	const _ = F(),
		r = (u) => {
			c.includes(u) ? c.splice(c.indexOf(u), 1) : c.push(u),
				_("change", c),
				s(0, c);
		},
		d = (u) => r(u),
		m = (u, E) =>
			_("select", {
				index: i.indexOf(u),
				value: u,
				selected: E.currentTarget.checked
			});
	return (
		(l.$$set = (u) => {
			"value" in u && s(0, (c = u.value)),
				"style" in u && s(9, (o = u.style)),
				"choices" in u && s(1, (i = u.choices)),
				"disabled" in u && s(2, (a = u.disabled)),
				"label" in u && s(3, (h = u.label)),
				"info" in u && s(4, (b = u.info)),
				"show_label" in u && s(5, (n = u.show_label));
		}),
		(l.$$.update = () => {
			l.$$.dirty & 512 &&
				s(6, ({ item_container: t } = Y(o, ["item_container"])), t);
		}),
		[c, i, a, h, b, n, t, _, r, o, d, m]
	);
}
class le extends I {
	constructor(e) {
		super(),
			J(this, e, ee, $, K, {
				value: 0,
				style: 9,
				choices: 1,
				disabled: 2,
				label: 3,
				info: 4,
				show_label: 5
			});
	}
}
function se(l) {
	let e, s, t, c, o;
	const i = [l[10]];
	let a = {};
	for (let n = 0; n < i.length; n += 1) a = P(a, i[n]);
	e = new Q({ props: a });
	function h(n) {
		l[11](n);
	}
	let b = {
		choices: l[4],
		label: l[7],
		info: l[8],
		style: l[5],
		show_label: l[9],
		disabled: l[6] === "static"
	};
	return (
		l[0] !== void 0 && (b.value = l[0]),
		(t = new le({ props: b })),
		R.push(() => U(t, "value", h)),
		t.$on("select", l[12]),
		t.$on("change", l[13]),
		{
			c() {
				q(e.$$.fragment), (s = G()), q(t.$$.fragment);
			},
			m(n, _) {
				y(e, n, _), w(n, s, _), y(t, n, _), (o = !0);
			},
			p(n, _) {
				const r = _ & 1024 ? V(i, [W(n[10])]) : {};
				e.$set(r);
				const d = {};
				_ & 16 && (d.choices = n[4]),
					_ & 128 && (d.label = n[7]),
					_ & 256 && (d.info = n[8]),
					_ & 32 && (d.style = n[5]),
					_ & 512 && (d.show_label = n[9]),
					_ & 64 && (d.disabled = n[6] === "static"),
					!c && _ & 1 && ((c = !0), (d.value = n[0]), X(() => (c = !1))),
					t.$set(d);
			},
			i(n) {
				o || (B(e.$$.fragment, n), B(t.$$.fragment, n), (o = !0));
			},
			o(n) {
				S(e.$$.fragment, n), S(t.$$.fragment, n), (o = !1);
			},
			d(n) {
				T(e, n), n && v(s), T(t, n);
			}
		}
	);
}
function te(l) {
	let e, s;
	return (
		(e = new Z({
			props: {
				visible: l[3],
				elem_id: l[1],
				elem_classes: l[2],
				type: "fieldset",
				disable: typeof l[5].container == "boolean" && !l[5].container,
				$$slots: { default: [se] },
				$$scope: { ctx: l }
			}
		})),
		{
			c() {
				q(e.$$.fragment);
			},
			m(t, c) {
				y(e, t, c), (s = !0);
			},
			p(t, [c]) {
				const o = {};
				c & 8 && (o.visible = t[3]),
					c & 2 && (o.elem_id = t[1]),
					c & 4 && (o.elem_classes = t[2]),
					c & 32 &&
						(o.disable = typeof t[5].container == "boolean" && !t[5].container),
					c & 18417 && (o.$$scope = { dirty: c, ctx: t }),
					e.$set(o);
			},
			i(t) {
				s || (B(e.$$.fragment, t), (s = !0));
			},
			o(t) {
				S(e.$$.fragment, t), (s = !1);
			},
			d(t) {
				T(e, t);
			}
		}
	);
}
function ne(l, e, s) {
	let { elem_id: t = "" } = e,
		{ elem_classes: c = [] } = e,
		{ visible: o = !0 } = e,
		{ value: i = [] } = e,
		{ choices: a } = e,
		{ style: h = {} } = e,
		{ mode: b } = e,
		{ label: n = "Checkbox Group" } = e,
		{ info: _ = void 0 } = e,
		{ show_label: r } = e,
		{ loading_status: d } = e;
	function m(f) {
		(i = f), s(0, i);
	}
	function u(f) {
		A.call(this, l, f);
	}
	function E(f) {
		A.call(this, l, f);
	}
	return (
		(l.$$set = (f) => {
			"elem_id" in f && s(1, (t = f.elem_id)),
				"elem_classes" in f && s(2, (c = f.elem_classes)),
				"visible" in f && s(3, (o = f.visible)),
				"value" in f && s(0, (i = f.value)),
				"choices" in f && s(4, (a = f.choices)),
				"style" in f && s(5, (h = f.style)),
				"mode" in f && s(6, (b = f.mode)),
				"label" in f && s(7, (n = f.label)),
				"info" in f && s(8, (_ = f.info)),
				"show_label" in f && s(9, (r = f.show_label)),
				"loading_status" in f && s(10, (d = f.loading_status));
		}),
		[i, t, c, o, a, h, b, n, _, r, d, m, u, E]
	);
}
class ae extends I {
	constructor(e) {
		super(),
			J(this, e, ne, te, K, {
				elem_id: 1,
				elem_classes: 2,
				visible: 3,
				value: 0,
				choices: 4,
				style: 5,
				mode: 6,
				label: 7,
				info: 8,
				show_label: 9,
				loading_status: 10
			});
	}
}
const be = ae,
	he = ["static", "dynamic"],
	de = (l) => ({
		type: { payload: "Array<string>" },
		description: { payload: "list of selected choices" },
		example_data: l.choices.length ? [l.choices[0]] : []
	});
export { be as Component, de as document, he as modes };
//# sourceMappingURL=index-b291cd31.js.map
