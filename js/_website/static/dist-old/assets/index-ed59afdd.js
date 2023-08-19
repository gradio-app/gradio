import {
	S as G,
	i as H,
	s as J,
	G as S,
	H as T,
	I as K,
	C as b,
	M as q,
	g as v,
	E as k,
	J as B,
	K as M,
	F as E,
	q as C,
	a0 as N,
	r as y,
	e as j,
	m as w,
	p as m,
	t as h,
	n as p,
	x as z,
	$ as A,
	b as L,
	a as O,
	h as P,
	j as Q,
	l as R,
	o as U,
	k as V,
	y as D
} from "../lite.js";
/* empty css                                                  */ import { B as W } from "./Button-5b68d65a.js";
import { I as X } from "./Info-06b02eda.js";
/* empty css                                                    */ function Y(
	l
) {
	let e, t, a, s, o, f, d;
	return {
		c() {
			(e = S("label")),
				(t = S("input")),
				(a = T()),
				(s = S("span")),
				(o = K(l[2])),
				(t.disabled = l[1]),
				b(t, "type", "checkbox"),
				b(t, "name", "test"),
				b(t, "data-testid", "checkbox"),
				b(t, "class", "svelte-1ojmf70"),
				b(s, "class", "ml-2 svelte-1ojmf70"),
				b(e, "class", "svelte-1ojmf70"),
				q(e, "disabled", l[1]);
		},
		m(u, i) {
			v(u, e, i),
				k(e, t),
				(t.checked = l[0]),
				k(e, a),
				k(e, s),
				k(s, o),
				f || ((d = [B(t, "change", l[4]), B(t, "input", l[5])]), (f = !0));
		},
		p(u, [i]) {
			i & 2 && (t.disabled = u[1]),
				i & 1 && (t.checked = u[0]),
				i & 4 && M(o, u[2]),
				i & 2 && q(e, "disabled", u[1]);
		},
		i: E,
		o: E,
		d(u) {
			u && C(e), (f = !1), N(d);
		}
	};
}
function Z(l, e, t) {
	let { value: a } = e,
		{ disabled: s = !1 } = e,
		{ label: o } = e;
	const f = y();
	function d(_) {
		f("change", _);
	}
	function u() {
		(a = this.checked), t(0, a);
	}
	const i = (_) => {
		t(0, (a = _.currentTarget.checked)),
			f("select", { index: 0, value: o, selected: _.currentTarget.checked });
	};
	return (
		(l.$$set = (_) => {
			"value" in _ && t(0, (a = _.value)),
				"disabled" in _ && t(1, (s = _.disabled)),
				"label" in _ && t(2, (o = _.label));
		}),
		(l.$$.update = () => {
			l.$$.dirty & 1 && d(a);
		}),
		[a, s, o, f, u, i]
	);
}
class x extends G {
	constructor(e) {
		super(), H(this, e, Z, Y, J, { value: 0, disabled: 1, label: 2 });
	}
}
function F(l) {
	let e, t;
	return (
		(e = new X({ props: { $$slots: { default: [$] }, $$scope: { ctx: l } } })),
		{
			c() {
				j(e.$$.fragment);
			},
			m(a, s) {
				w(e, a, s), (t = !0);
			},
			p(a, s) {
				const o = {};
				s & 4128 && (o.$$scope = { dirty: s, ctx: a }), e.$set(o);
			},
			i(a) {
				t || (m(e.$$.fragment, a), (t = !0));
			},
			o(a) {
				h(e.$$.fragment, a), (t = !1);
			},
			d(a) {
				p(e, a);
			}
		}
	);
}
function $(l) {
	let e;
	return {
		c() {
			e = K(l[5]);
		},
		m(t, a) {
			v(t, e, a);
		},
		p(t, a) {
			a & 32 && M(e, t[5]);
		},
		d(t) {
			t && C(e);
		}
	};
}
function ee(l) {
	let e, t, a, s, o, f;
	const d = [l[8]];
	let u = {};
	for (let n = 0; n < d.length; n += 1) u = z(u, d[n]);
	e = new A({ props: u });
	let i = l[5] && F(l);
	function _(n) {
		l[9](n);
	}
	let g = { label: l[4], disabled: l[6] === "static" };
	return (
		l[0] !== void 0 && (g.value = l[0]),
		(s = new x({ props: g })),
		L.push(() => O(s, "value", _)),
		s.$on("change", l[10]),
		s.$on("select", l[11]),
		{
			c() {
				j(e.$$.fragment), (t = T()), i && i.c(), (a = T()), j(s.$$.fragment);
			},
			m(n, r) {
				w(e, n, r),
					v(n, t, r),
					i && i.m(n, r),
					v(n, a, r),
					w(s, n, r),
					(f = !0);
			},
			p(n, r) {
				const I = r & 256 ? P(d, [Q(n[8])]) : {};
				e.$set(I),
					n[5]
						? i
							? (i.p(n, r), r & 32 && m(i, 1))
							: ((i = F(n)), i.c(), m(i, 1), i.m(a.parentNode, a))
						: i &&
						  (R(),
						  h(i, 1, 1, () => {
								i = null;
						  }),
						  U());
				const c = {};
				r & 16 && (c.label = n[4]),
					r & 64 && (c.disabled = n[6] === "static"),
					!o && r & 1 && ((o = !0), (c.value = n[0]), V(() => (o = !1))),
					s.$set(c);
			},
			i(n) {
				f || (m(e.$$.fragment, n), m(i), m(s.$$.fragment, n), (f = !0));
			},
			o(n) {
				h(e.$$.fragment, n), h(i), h(s.$$.fragment, n), (f = !1);
			},
			d(n) {
				p(e, n), n && C(t), i && i.d(n), n && C(a), p(s, n);
			}
		}
	);
}
function te(l) {
	let e, t;
	return (
		(e = new W({
			props: {
				visible: l[3],
				elem_id: l[1],
				elem_classes: l[2],
				disable: typeof l[7].container == "boolean" && !l[7].container,
				$$slots: { default: [ee] },
				$$scope: { ctx: l }
			}
		})),
		{
			c() {
				j(e.$$.fragment);
			},
			m(a, s) {
				w(e, a, s), (t = !0);
			},
			p(a, [s]) {
				const o = {};
				s & 8 && (o.visible = a[3]),
					s & 2 && (o.elem_id = a[1]),
					s & 4 && (o.elem_classes = a[2]),
					s & 128 &&
						(o.disable = typeof a[7].container == "boolean" && !a[7].container),
					s & 4465 && (o.$$scope = { dirty: s, ctx: a }),
					e.$set(o);
			},
			i(a) {
				t || (m(e.$$.fragment, a), (t = !0));
			},
			o(a) {
				h(e.$$.fragment, a), (t = !1);
			},
			d(a) {
				p(e, a);
			}
		}
	);
}
function ae(l, e, t) {
	let { elem_id: a = "" } = e,
		{ elem_classes: s = [] } = e,
		{ visible: o = !0 } = e,
		{ value: f = !1 } = e,
		{ label: d = "Checkbox" } = e,
		{ info: u = void 0 } = e,
		{ mode: i } = e,
		{ style: _ = {} } = e,
		{ loading_status: g } = e;
	function n(c) {
		(f = c), t(0, f);
	}
	function r(c) {
		D.call(this, l, c);
	}
	function I(c) {
		D.call(this, l, c);
	}
	return (
		(l.$$set = (c) => {
			"elem_id" in c && t(1, (a = c.elem_id)),
				"elem_classes" in c && t(2, (s = c.elem_classes)),
				"visible" in c && t(3, (o = c.visible)),
				"value" in c && t(0, (f = c.value)),
				"label" in c && t(4, (d = c.label)),
				"info" in c && t(5, (u = c.info)),
				"mode" in c && t(6, (i = c.mode)),
				"style" in c && t(7, (_ = c.style)),
				"loading_status" in c && t(8, (g = c.loading_status));
		}),
		[f, a, s, o, d, u, i, _, g, n, r, I]
	);
}
class le extends G {
	constructor(e) {
		super(),
			H(this, e, ae, te, J, {
				elem_id: 1,
				elem_classes: 2,
				visible: 3,
				value: 0,
				label: 4,
				info: 5,
				mode: 6,
				style: 7,
				loading_status: 8
			});
	}
}
const fe = le,
	ue = ["static", "dynamic"],
	_e = (l) => ({
		type: { payload: "boolean" },
		description: { payload: "checked status" },
		example_data: l.value
	});
export { fe as Component, _e as document, ue as modes };
//# sourceMappingURL=index-ed59afdd.js.map
