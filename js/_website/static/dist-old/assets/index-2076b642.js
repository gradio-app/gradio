import {
	S as de,
	i as he,
	s as ge,
	H as J,
	G as q,
	C as m,
	M as E,
	g as T,
	J as K,
	F as te,
	q as B,
	a0 as me,
	y as oe,
	b as P,
	I as $,
	K as be,
	f as rt,
	a9 as it,
	a as le,
	e as V,
	E as L,
	m as Z,
	k as ne,
	p as C,
	l as W,
	t as R,
	o as X,
	n as Q,
	r as Oe,
	B as x,
	T as I,
	z as ce,
	A as _e,
	x as ut,
	$ as ft,
	af as je,
	h as ot,
	j as ct
} from "../lite.js";
import { U as _t } from "./Upload-09ed31cf.js";
import { a as Ne } from "./Button-5b68d65a.js";
/* empty css                                                    */ import "./ModifyUpload.svelte_svelte_type_style_lang-ba6baa96.js";
import { d as dt } from "./dsv-576afacd.js";
var De = Object.prototype.hasOwnProperty;
function ae(s, e) {
	var t, n;
	if (s === e) return !0;
	if (s && e && (t = s.constructor) === e.constructor) {
		if (t === Date) return s.getTime() === e.getTime();
		if (t === RegExp) return s.toString() === e.toString();
		if (t === Array) {
			if ((n = s.length) === e.length) for (; n-- && ae(s[n], e[n]); );
			return n === -1;
		}
		if (!t || typeof s == "object") {
			n = 0;
			for (t in s)
				if (
					(De.call(s, t) && ++n && !De.call(e, t)) ||
					!(t in e) ||
					!ae(s[t], e[t])
				)
					return !1;
			return Object.keys(e).length === n;
		}
	}
	return s !== s && e !== e;
}
function Ee(s) {
	let e, t, n;
	return {
		c() {
			(e = q("input")),
				m(e, "tabindex", "-1"),
				(e.value = s[0]),
				m(e, "class", "svelte-q8uklq"),
				E(e, "header", s[3]);
		},
		m(l, r) {
			T(l, e, r),
				s[7](e),
				t || ((n = [K(e, "keydown", s[6]), K(e, "blur", s[8])]), (t = !0));
		},
		p(l, r) {
			r & 1 && e.value !== l[0] && (e.value = l[0]),
				r & 8 && E(e, "header", l[3]);
		},
		d(l) {
			l && B(e), s[7](null), (t = !1), me(n);
		}
	};
}
function ht(s) {
	let e;
	return {
		c() {
			e = $(s[0]);
		},
		m(t, n) {
			T(t, e, n);
		},
		p(t, n) {
			n & 1 && be(e, t[0]);
		},
		d(t) {
			t && B(e);
		}
	};
}
function gt(s) {
	let e, t;
	return {
		c() {
			(e = new it(!1)), (t = rt()), (e.a = t);
		},
		m(n, l) {
			e.m(s[0], n, l), T(n, t, l);
		},
		p(n, l) {
			l & 1 && e.p(n[0]);
		},
		d(n) {
			n && B(t), n && e.d();
		}
	};
}
function mt(s) {
	let e,
		t,
		n,
		l,
		r = s[2] && Ee(s);
	function f(i, u) {
		return i[4] === "markdown" || i[4] === "html" ? gt : ht;
	}
	let o = f(s),
		p = o(s);
	return {
		c() {
			r && r.c(),
				(e = J()),
				(t = q("span")),
				p.c(),
				m(t, "tabindex", "-1"),
				m(t, "role", "button"),
				m(t, "class", "svelte-q8uklq"),
				E(t, "edit", s[2]);
		},
		m(i, u) {
			r && r.m(i, u),
				T(i, e, u),
				T(i, t, u),
				p.m(t, null),
				n || ((l = K(t, "dblclick", s[5])), (n = !0));
		},
		p(i, [u]) {
			i[2]
				? r
					? r.p(i, u)
					: ((r = Ee(i)), r.c(), r.m(e.parentNode, e))
				: r && (r.d(1), (r = null)),
				o === (o = f(i)) && p
					? p.p(i, u)
					: (p.d(1), (p = o(i)), p && (p.c(), p.m(t, null))),
				u & 4 && E(t, "edit", i[2]);
		},
		i: te,
		o: te,
		d(i) {
			r && r.d(i), i && B(e), i && B(t), p.d(), (n = !1), l();
		}
	};
}
function bt(s, e, t) {
	let { edit: n } = e,
		{ value: l = "" } = e,
		{ el: r } = e,
		{ header: f = !1 } = e,
		{ datatype: o = "str" } = e;
	function p(h) {
		oe.call(this, s, h);
	}
	function i(h) {
		oe.call(this, s, h);
	}
	function u(h) {
		P[h ? "unshift" : "push"](() => {
			(r = h), t(1, r);
		});
	}
	const g = ({ currentTarget: h }) => {
		t(0, (l = h.value)), h.setAttribute("tabindex", "-1");
	};
	return (
		(s.$$set = (h) => {
			"edit" in h && t(2, (n = h.edit)),
				"value" in h && t(0, (l = h.value)),
				"el" in h && t(1, (r = h.el)),
				"header" in h && t(3, (f = h.header)),
				"datatype" in h && t(4, (o = h.datatype));
		}),
		[l, r, n, f, o, p, i, u, g]
	);
}
class Ue extends de {
	constructor(e) {
		super(),
			he(this, e, bt, mt, ge, {
				edit: 2,
				value: 0,
				el: 1,
				header: 3,
				datatype: 4
			});
	}
}
function Le(s, e, t) {
	const n = s.slice();
	return (n[53] = e[t]), (n[55] = t), n;
}
function Me(s, e, t) {
	const n = s.slice();
	return (n[56] = e[t].value), (n[57] = e[t].id), (n[58] = e), (n[59] = t), n;
}
function qe(s, e, t) {
	const n = s.slice();
	return (n[56] = e[t].value), (n[57] = e[t].id), (n[60] = e), (n[55] = t), n;
}
function Te(s) {
	let e, t;
	return {
		c() {
			(e = q("p")), (t = $(s[1])), m(e, "class", "svelte-8hrj8a");
		},
		m(n, l) {
			T(n, e, l), L(e, t);
		},
		p(n, l) {
			l[0] & 2 && be(t, n[1]);
		},
		d(n) {
			n && B(e);
		}
	};
}
function Be(s) {
	let e, t;
	return {
		c() {
			(e = q("caption")), (t = $(s[1])), m(e, "class", "sr-only");
		},
		m(n, l) {
			T(n, e, l), L(e, t);
		},
		p(n, l) {
			l[0] & 2 && be(t, n[1]);
		},
		d(n) {
			n && B(e);
		}
	};
}
function Ce(s, e) {
	let t,
		n,
		l,
		r,
		f,
		o,
		p,
		i,
		u,
		g,
		h,
		d = e[57],
		v,
		_,
		F;
	function y(z) {
		e[30](z, e[57]);
	}
	function b() {
		return e[31](e[57]);
	}
	let w = { value: e[56], edit: e[13] === e[57], header: !0 };
	e[10][e[57]].input !== void 0 && (w.el = e[10][e[57]].input),
		(l = new Ue({ props: w })),
		P.push(() => le(l, "el", y)),
		l.$on("keydown", e[21]),
		l.$on("dblclick", b);
	function M() {
		return e[32](e[55]);
	}
	const A = () => e[33](t, d),
		S = () => e[33](null, d);
	return {
		key: s,
		first: null,
		c() {
			(t = q("th")),
				(n = q("div")),
				V(l.$$.fragment),
				(f = J()),
				(o = q("div")),
				(p = x("svg")),
				(i = x("path")),
				(g = J()),
				m(i, "d", "M4.49999 0L8.3971 6.75H0.602875L4.49999 0Z"),
				m(p, "width", "1em"),
				m(p, "height", "1em"),
				m(p, "viewBox", "0 0 9 7"),
				m(p, "fill", "none"),
				m(p, "xmlns", "http://www.w3.org/2000/svg"),
				m(p, "class", "svelte-8hrj8a"),
				m(o, "class", (u = "sort-button " + e[11] + " svelte-8hrj8a")),
				E(o, "sorted", e[12] === e[55]),
				E(o, "des", e[12] === e[55] && e[11] === "des"),
				m(n, "class", "cell-wrap svelte-8hrj8a"),
				m(t, "aria-sort", (h = e[15](e[56], e[12], e[11]))),
				m(t, "class", "svelte-8hrj8a"),
				E(t, "editing", e[13] === e[57]),
				(this.first = t);
		},
		m(z, H) {
			T(z, t, H),
				L(t, n),
				Z(l, n, null),
				L(n, f),
				L(n, o),
				L(o, p),
				L(p, i),
				L(t, g),
				A(),
				(v = !0),
				_ || ((F = K(o, "click", M)), (_ = !0));
		},
		p(z, H) {
			e = z;
			const U = {};
			H[0] & 256 && (U.value = e[56]),
				H[0] & 8448 && (U.edit = e[13] === e[57]),
				!r &&
					H[0] & 1280 &&
					((r = !0), (U.el = e[10][e[57]].input), ne(() => (r = !1))),
				l.$set(U),
				(!v ||
					(H[0] & 2048 &&
						u !== (u = "sort-button " + e[11] + " svelte-8hrj8a"))) &&
					m(o, "class", u),
				(!v || H[0] & 6400) && E(o, "sorted", e[12] === e[55]),
				(!v || H[0] & 6400) && E(o, "des", e[12] === e[55] && e[11] === "des"),
				(!v || (H[0] & 6400 && h !== (h = e[15](e[56], e[12], e[11])))) &&
					m(t, "aria-sort", h),
				d !== e[57] && (S(), (d = e[57]), A()),
				(!v || H[0] & 8448) && E(t, "editing", e[13] === e[57]);
		},
		i(z) {
			v || (C(l.$$.fragment, z), (v = !0));
		},
		o(z) {
			R(l.$$.fragment, z), (v = !1);
		},
		d(z) {
			z && B(t), Q(l), S(), (_ = !1), F();
		}
	};
}
function Fe(s, e) {
	let t,
		n,
		l,
		r,
		f,
		o = e[57],
		p,
		i,
		u;
	function g(M) {
		e[34](M, e[56], e[58], e[59]);
	}
	function h(M) {
		e[35](M, e[57]);
	}
	let d = {
		edit: e[7] === e[57],
		datatype: Array.isArray(e[0]) ? e[0][e[59]] : e[0]
	};
	e[56] !== void 0 && (d.value = e[56]),
		e[10][e[57]].input !== void 0 && (d.el = e[10][e[57]].input),
		(l = new Ue({ props: d })),
		P.push(() => le(l, "value", g)),
		P.push(() => le(l, "el", h));
	const v = () => e[36](t, o),
		_ = () => e[36](null, o);
	function F() {
		return e[37](e[57]);
	}
	function y() {
		return e[38](e[57]);
	}
	function b() {
		return e[39](e[57]);
	}
	function w(...M) {
		return e[40](e[55], e[59], e[57], ...M);
	}
	return {
		key: s,
		first: null,
		c() {
			(t = q("td")),
				(n = q("div")),
				V(l.$$.fragment),
				m(n, "class", "cell-wrap svelte-8hrj8a"),
				E(n, "border-transparent", e[6] !== e[57]),
				m(t, "tabindex", "0"),
				m(t, "class", "svelte-8hrj8a"),
				(this.first = t);
		},
		m(M, A) {
			T(M, t, A),
				L(t, n),
				Z(l, n, null),
				v(),
				(p = !0),
				i ||
					((u = [
						K(t, "touchstart", F, { passive: !0 }),
						K(t, "click", y),
						K(t, "dblclick", b),
						K(t, "keydown", w)
					]),
					(i = !0));
		},
		p(M, A) {
			e = M;
			const S = {};
			A[0] & 640 && (S.edit = e[7] === e[57]),
				A[0] & 513 && (S.datatype = Array.isArray(e[0]) ? e[0][e[59]] : e[0]),
				!r && A[0] & 512 && ((r = !0), (S.value = e[56]), ne(() => (r = !1))),
				!f &&
					A[0] & 1536 &&
					((f = !0), (S.el = e[10][e[57]].input), ne(() => (f = !1))),
				l.$set(S),
				(!p || A[0] & 576) && E(n, "border-transparent", e[6] !== e[57]),
				o !== e[57] && (_(), (o = e[57]), v());
		},
		i(M) {
			p || (C(l.$$.fragment, M), (p = !0));
		},
		o(M) {
			R(l.$$.fragment, M), (p = !1);
		},
		d(M) {
			M && B(t), Q(l), _(), (i = !1), me(u);
		}
	};
}
function Re(s, e) {
	let t,
		n = [],
		l = new Map(),
		r,
		f,
		o = e[53];
	const p = (i) => i[57];
	for (let i = 0; i < o.length; i += 1) {
		let u = Me(e, o, i),
			g = p(u);
		l.set(g, (n[i] = Fe(g, u)));
	}
	return {
		key: s,
		first: null,
		c() {
			t = q("tr");
			for (let i = 0; i < n.length; i += 1) n[i].c();
			(r = J()), m(t, "class", "svelte-8hrj8a"), (this.first = t);
		},
		m(i, u) {
			T(i, t, u);
			for (let g = 0; g < n.length; g += 1) n[g] && n[g].m(t, null);
			L(t, r), (f = !0);
		},
		p(i, u) {
			(e = i),
				u[0] & 460481 &&
					((o = e[53]),
					W(),
					(n = ce(n, u, p, 1, e, o, l, t, _e, Fe, r, Me)),
					X());
		},
		i(i) {
			if (!f) {
				for (let u = 0; u < o.length; u += 1) C(n[u]);
				f = !0;
			}
		},
		o(i) {
			for (let u = 0; u < n.length; u += 1) R(n[u]);
			f = !1;
		},
		d(i) {
			i && B(t);
			for (let u = 0; u < n.length; u += 1) n[u].d();
		}
	};
}
function pt(s) {
	let e,
		t,
		n,
		l,
		r = [],
		f = new Map(),
		o,
		p,
		i = [],
		u = new Map(),
		g,
		h = s[1] && s[1].length !== 0 && Be(s),
		d = s[8];
	const v = (y) => y[57];
	for (let y = 0; y < d.length; y += 1) {
		let b = qe(s, d, y),
			w = v(b);
		f.set(w, (r[y] = Ce(w, b)));
	}
	let _ = s[9];
	const F = (y) => y[53];
	for (let y = 0; y < _.length; y += 1) {
		let b = Le(s, _, y),
			w = F(b);
		u.set(w, (i[y] = Re(w, b)));
	}
	return {
		c() {
			(e = q("table")), h && h.c(), (t = J()), (n = q("thead")), (l = q("tr"));
			for (let y = 0; y < r.length; y += 1) r[y].c();
			(o = J()), (p = q("tbody"));
			for (let y = 0; y < i.length; y += 1) i[y].c();
			m(l, "class", "svelte-8hrj8a"),
				m(n, "class", "svelte-8hrj8a"),
				m(p, "class", "svelte-8hrj8a"),
				m(e, "class", "svelte-8hrj8a"),
				E(e, "dragging", s[14]);
		},
		m(y, b) {
			T(y, e, b), h && h.m(e, null), L(e, t), L(e, n), L(n, l);
			for (let w = 0; w < r.length; w += 1) r[w] && r[w].m(l, null);
			L(e, o), L(e, p);
			for (let w = 0; w < i.length; w += 1) i[w] && i[w].m(p, null);
			g = !0;
		},
		p(y, b) {
			y[1] && y[1].length !== 0
				? h
					? h.p(y, b)
					: ((h = Be(y)), h.c(), h.m(e, t))
				: h && (h.d(1), (h = null)),
				b[0] & 3718400 &&
					((d = y[8]),
					W(),
					(r = ce(r, b, v, 1, y, d, f, l, _e, Ce, null, qe)),
					X()),
				b[0] & 460481 &&
					((_ = y[9]),
					W(),
					(i = ce(i, b, F, 1, y, _, u, p, _e, Re, null, Le)),
					X()),
				(!g || b[0] & 16384) && E(e, "dragging", y[14]);
		},
		i(y) {
			if (!g) {
				for (let b = 0; b < d.length; b += 1) C(r[b]);
				for (let b = 0; b < _.length; b += 1) C(i[b]);
				g = !0;
			}
		},
		o(y) {
			for (let b = 0; b < r.length; b += 1) R(r[b]);
			for (let b = 0; b < i.length; b += 1) R(i[b]);
			g = !1;
		},
		d(y) {
			y && B(e), h && h.d();
			for (let b = 0; b < r.length; b += 1) r[b].d();
			for (let b = 0; b < i.length; b += 1) i[b].d();
		}
	};
}
function Se(s) {
	let e,
		t,
		n,
		l = s[3][1] === "dynamic" && ze(s),
		r = s[2][1] === "dynamic" && He(s);
	return {
		c() {
			(e = q("div")),
				l && l.c(),
				(t = J()),
				r && r.c(),
				m(e, "class", "controls-wrap svelte-8hrj8a");
		},
		m(f, o) {
			T(f, e, o), l && l.m(e, null), L(e, t), r && r.m(e, null), (n = !0);
		},
		p(f, o) {
			f[3][1] === "dynamic"
				? l
					? (l.p(f, o), o[0] & 8 && C(l, 1))
					: ((l = ze(f)), l.c(), C(l, 1), l.m(e, t))
				: l &&
				  (W(),
				  R(l, 1, 1, () => {
						l = null;
				  }),
				  X()),
				f[2][1] === "dynamic"
					? r
						? (r.p(f, o), o[0] & 4 && C(r, 1))
						: ((r = He(f)), r.c(), C(r, 1), r.m(e, null))
					: r &&
					  (W(),
					  R(r, 1, 1, () => {
							r = null;
					  }),
					  X());
		},
		i(f) {
			n || (C(l), C(r), (n = !0));
		},
		o(f) {
			R(l), R(r), (n = !1);
		},
		d(f) {
			f && B(e), l && l.d(), r && r.d();
		}
	};
}
function ze(s) {
	let e, t, n;
	return (
		(t = new Ne({
			props: {
				variant: "secondary",
				size: "sm",
				$$slots: { default: [wt] },
				$$scope: { ctx: s }
			}
		})),
		t.$on("click", s[43]),
		{
			c() {
				(e = q("span")),
					V(t.$$.fragment),
					m(e, "class", "button-wrap svelte-8hrj8a");
			},
			m(l, r) {
				T(l, e, r), Z(t, e, null), (n = !0);
			},
			p(l, r) {
				const f = {};
				r[1] & 1073741824 && (f.$$scope = { dirty: r, ctx: l }), t.$set(f);
			},
			i(l) {
				n || (C(t.$$.fragment, l), (n = !0));
			},
			o(l) {
				R(t.$$.fragment, l), (n = !1);
			},
			d(l) {
				l && B(e), Q(t);
			}
		}
	);
}
function wt(s) {
	let e, t, n;
	return {
		c() {
			(e = x("svg")),
				(t = x("path")),
				(n = $(`
						New row`)),
				m(t, "fill", "currentColor"),
				m(
					t,
					"d",
					"M24.59 16.59L17 24.17V4h-2v20.17l-7.59-7.58L6 18l10 10l10-10l-1.41-1.41z"
				),
				m(e, "xmlns", "http://www.w3.org/2000/svg"),
				m(e, "xmlns:xlink", "http://www.w3.org/1999/xlink"),
				m(e, "aria-hidden", "true"),
				m(e, "role", "img"),
				m(e, "width", "1em"),
				m(e, "height", "1em"),
				m(e, "preserveAspectRatio", "xMidYMid meet"),
				m(e, "viewBox", "0 0 32 32"),
				m(e, "class", "svelte-8hrj8a");
		},
		m(l, r) {
			T(l, e, r), L(e, t), T(l, n, r);
		},
		p: te,
		d(l) {
			l && B(e), l && B(n);
		}
	};
}
function He(s) {
	let e, t, n;
	return (
		(t = new Ne({
			props: {
				variant: "secondary",
				size: "sm",
				$$slots: { default: [kt] },
				$$scope: { ctx: s }
			}
		})),
		t.$on("click", s[23]),
		{
			c() {
				(e = q("span")),
					V(t.$$.fragment),
					m(e, "class", "button-wrap svelte-8hrj8a");
			},
			m(l, r) {
				T(l, e, r), Z(t, e, null), (n = !0);
			},
			p(l, r) {
				const f = {};
				r[1] & 1073741824 && (f.$$scope = { dirty: r, ctx: l }), t.$set(f);
			},
			i(l) {
				n || (C(t.$$.fragment, l), (n = !0));
			},
			o(l) {
				R(t.$$.fragment, l), (n = !1);
			},
			d(l) {
				l && B(e), Q(t);
			}
		}
	);
}
function kt(s) {
	let e, t, n;
	return {
		c() {
			(e = x("svg")),
				(t = x("path")),
				(n = $(`
						New column`)),
				m(t, "fill", "currentColor"),
				m(
					t,
					"d",
					"m18 6l-1.43 1.393L24.15 15H4v2h20.15l-7.58 7.573L18 26l10-10L18 6z"
				),
				m(e, "xmlns", "http://www.w3.org/2000/svg"),
				m(e, "xmlns:xlink", "http://www.w3.org/1999/xlink"),
				m(e, "aria-hidden", "true"),
				m(e, "role", "img"),
				m(e, "width", "1em"),
				m(e, "height", "1em"),
				m(e, "preserveAspectRatio", "xMidYMid meet"),
				m(e, "viewBox", "0 0 32 32"),
				m(e, "class", "svelte-8hrj8a");
		},
		m(l, r) {
			T(l, e, r), L(e, t), T(l, n, r);
		},
		p: te,
		d(l) {
			l && B(e), l && B(n);
		}
	};
}
function yt(s) {
	let e,
		t,
		n,
		l,
		r,
		f,
		o,
		p,
		i,
		u = s[1] && s[1].length !== 0 && Te(s);
	function g(v) {
		s[41](v);
	}
	let h = {
		flex: !1,
		center: !1,
		boundedheight: !1,
		disable_click: !0,
		$$slots: { default: [pt] },
		$$scope: { ctx: s }
	};
	s[14] !== void 0 && (h.dragging = s[14]),
		(l = new _t({ props: h })),
		P.push(() => le(l, "dragging", g)),
		l.$on("load", s[42]);
	let d = s[4] && Se(s);
	return {
		c() {
			(e = q("div")),
				u && u.c(),
				(t = J()),
				(n = q("div")),
				V(l.$$.fragment),
				(f = J()),
				d && d.c(),
				m(n, "class", "table-wrap scroll-hide svelte-8hrj8a"),
				E(n, "dragging", s[14]),
				E(n, "no-wrap", !s[5]),
				m(e, "class", "svelte-8hrj8a"),
				E(e, "label", s[1] && s[1].length !== 0);
		},
		m(v, _) {
			T(v, e, _),
				u && u.m(e, null),
				L(e, t),
				L(e, n),
				Z(l, n, null),
				L(e, f),
				d && d.m(e, null),
				(o = !0),
				p ||
					((i = [K(window, "click", s[24]), K(window, "touchstart", s[24])]),
					(p = !0));
		},
		p(v, _) {
			v[1] && v[1].length !== 0
				? u
					? u.p(v, _)
					: ((u = Te(v)), u.c(), u.m(e, t))
				: u && (u.d(1), (u = null));
			const F = {};
			(_[0] & 32707) | (_[1] & 1073741824) &&
				(F.$$scope = { dirty: _, ctx: v }),
				!r &&
					_[0] & 16384 &&
					((r = !0), (F.dragging = v[14]), ne(() => (r = !1))),
				l.$set(F),
				(!o || _[0] & 16384) && E(n, "dragging", v[14]),
				(!o || _[0] & 32) && E(n, "no-wrap", !v[5]),
				v[4]
					? d
						? (d.p(v, _), _[0] & 16 && C(d, 1))
						: ((d = Se(v)), d.c(), C(d, 1), d.m(e, null))
					: d &&
					  (W(),
					  R(d, 1, 1, () => {
							d = null;
					  }),
					  X()),
				(!o || _[0] & 2) && E(e, "label", v[1] && v[1].length !== 0);
		},
		i(v) {
			o || (C(l.$$.fragment, v), C(d), (o = !0));
		},
		o(v) {
			R(l.$$.fragment, v), R(d), (o = !1);
		},
		d(v) {
			v && B(e), u && u.d(), Q(l), d && d.d(), (p = !1), me(i);
		}
	};
}
function vt(s, e) {
	return e.filter(t);
	function t(n) {
		var l = -1;
		return s
			.split(
				`
`
			)
			.every(r);
		function r(f) {
			if (!f) return !0;
			var o = f.split(n).length;
			return l < 0 && (l = o), l === o && o > 1;
		}
	}
}
function At(s) {
	const e = atob(s.split(",")[1]),
		t = s.split(",")[0].split(":")[1].split(";")[0],
		n = new ArrayBuffer(e.length),
		l = new Uint8Array(n);
	for (let r = 0; r < e.length; r++) l[r] = e.charCodeAt(r);
	return new Blob([n], { type: t });
}
function jt(s, e, t) {
	let { datatype: n } = e,
		{ label: l = null } = e,
		{ headers: r = [] } = e,
		{ values: f = [[]] } = e,
		{ col_count: o } = e,
		{ row_count: p } = e,
		{ editable: i = !0 } = e,
		{ wrap: u = !1 } = e,
		g = !1;
	const h = Oe();
	let d = !1;
	const v = (a, c) => A[a][c].value;
	let _ = {};
	function F(a) {
		let c = a || [];
		if (o[1] === "fixed" && c.length < o[0]) {
			const k = Array(o[0] - c.length)
				.fill("")
				.map((j, D) => `${D + c.length}`);
			c = c.concat(k);
		}
		return !c || c.length === 0
			? Array(o[0])
					.fill(0)
					.map((k, j) => {
						const D = `h-${j}`;
						return (
							t(10, (_[D] = { cell: null, input: null }), _),
							{ id: D, value: JSON.stringify(j + 1) }
						);
					})
			: c.map((k, j) => {
					const D = `h-${j}`;
					return (
						t(10, (_[D] = { cell: null, input: null }), _),
						{ id: D, value: k ?? "" }
					);
			  });
	}
	function y(a) {
		const c = a.length > 0 ? a.length : p[0];
		return Array(p[1] === "fixed" || c < p[0] ? p[0] : c)
			.fill(0)
			.map((k, j) =>
				Array(o[1] === "fixed" ? o[0] : a[0].length)
					.fill(0)
					.map((D, N) => {
						const Y = `${j}-${N}`;
						return (
							t(10, (_[Y] = { input: null, cell: null }), _),
							{ value: a?.[j]?.[N] ?? "", id: Y }
						);
					})
			);
	}
	let b = F(r),
		w;
	async function M() {
		typeof d == "string"
			? (await I(), _[d]?.input?.focus())
			: typeof g == "string" && (await I(), _[g]?.input?.focus());
	}
	let A = [[]],
		S;
	function z(a, c, k) {
		if (!c) return "none";
		if (r[c] === a) {
			if (k === "asc") return "ascending";
			if (k === "des") return "descending";
		}
	}
	function H(a) {
		return A.reduce(
			(c, k, j) => {
				const D = k.reduce((N, Y, ue) => (a === Y.id ? ue : N), -1);
				return D === -1 ? c : [j, D];
			},
			[-1, -1]
		);
	}
	async function U(a, c) {
		if (!i || d === a) return;
		if (c) {
			const [j, D] = H(a);
			t(9, (A[j][D].value = ""), A);
		}
		t(7, (d = a)), await I();
		const { input: k } = _[a];
		k?.focus();
	}
	async function pe(a, c, k, j) {
		let D;
		switch (a.key) {
			case "ArrowRight":
				if (d) break;
				a.preventDefault(), (D = A[c][k + 1]), t(6, (g = D ? D.id : g));
				break;
			case "ArrowLeft":
				if (d) break;
				a.preventDefault(), (D = A[c][k - 1]), t(6, (g = D ? D.id : g));
				break;
			case "ArrowDown":
				if (d) break;
				a.preventDefault(), (D = A[c + 1]), t(6, (g = D ? D[k].id : g));
				break;
			case "ArrowUp":
				if (d) break;
				a.preventDefault(), (D = A[c - 1]), t(6, (g = D ? D[k].id : g));
				break;
			case "Escape":
				if (!i) break;
				a.preventDefault(), t(6, (g = d)), t(7, (d = !1));
				break;
			case "Enter":
				if (!i) break;
				if ((a.preventDefault(), a.shiftKey)) {
					re(c), await I();
					const [st] = H(j);
					t(6, (g = A[st + 1][k].id));
				} else d === j ? t(7, (d = !1)) : U(j);
				break;
			case "Backspace":
				if (!i) break;
				d || (a.preventDefault(), t(9, (A[c][k].value = ""), A));
				break;
			case "Delete":
				if (!i) break;
				d || (a.preventDefault(), t(9, (A[c][k].value = ""), A));
				break;
			case "Tab":
				let N = a.shiftKey ? -1 : 1,
					Y = A[c][k + N],
					ue = A?.[c + N]?.[N > 0 ? 0 : b.length - 1],
					fe = Y || ue;
				fe && (a.preventDefault(), t(6, (g = fe ? fe.id : g))), t(7, (d = !1));
				break;
			default:
				(!d || (d && d !== j)) && a.key.length === 1 && U(j, !0);
				break;
		}
	}
	async function we(a) {
		d !== a && g !== a && (t(7, (d = !1)), t(6, (g = a)));
	}
	async function ke(a, c) {
		if (
			(c === "edit" && typeof a == "string" && (await I(), _[a].input?.focus()),
			c === "edit" && typeof a == "boolean" && typeof g == "string")
		) {
			let k = _[g]?.cell;
			await I(), k?.focus();
		}
		if (c === "select" && typeof a == "string") {
			const { cell: k } = _[a];
			await I(), k?.focus();
		}
	}
	let G, ee;
	function Ie(a, c) {
		c === "asc"
			? t(9, (A = A.sort((k, j) => (k[a].value < j[a].value ? -1 : 1))))
			: c === "des" &&
			  t(9, (A = A.sort((k, j) => (k[a].value > j[a].value ? -1 : 1))));
	}
	function ye(a) {
		typeof ee != "number" || ee !== a
			? (t(11, (G = "asc")), t(12, (ee = a)))
			: G === "asc"
			? t(11, (G = "des"))
			: G === "des" && t(11, (G = "asc")),
			Ie(a, G);
	}
	let O;
	function ve() {
		if (typeof g == "string") {
			const a = _[g].input?.value;
			if (b.find((c) => c.id === g)) {
				let c = b.find((k) => k.id === g);
				a && (c.value = a);
			} else a && b.push({ id: g, value: a });
		}
	}
	async function se(a, c) {
		!i ||
			o[1] !== "dynamic" ||
			d === a ||
			(t(13, (O = a)),
			await I(),
			_[a].input?.focus(),
			c && _[a].input?.select());
	}
	function Ke(a) {
		if (i)
			switch (a.key) {
				case "Escape":
				case "Enter":
				case "Tab":
					a.preventDefault(), t(6, (g = O)), t(13, (O = !1)), ve();
					break;
			}
	}
	function re(a) {
		p[1] === "dynamic" &&
			(A.splice(
				a ? a + 1 : A.length,
				0,
				Array(A[0].length)
					.fill(0)
					.map((c, k) => {
						const j = `${A.length}-${k}`;
						return (
							t(10, (_[j] = { cell: null, input: null }), _),
							{ id: j, value: "" }
						);
					})
			),
			t(9, A),
			t(27, f),
			t(29, S),
			t(26, r));
	}
	async function Je() {
		if (o[1] !== "dynamic") return;
		for (let c = 0; c < A.length; c++) {
			const k = `${c}-${A[c].length}`;
			t(10, (_[k] = { cell: null, input: null }), _),
				A[c].push({ id: k, value: "" });
		}
		const a = `h-${b.length}`;
		t(10, (_[a] = { cell: null, input: null }), _),
			b.push({ id: a, value: `Header ${b.length + 1}` }),
			t(9, A),
			t(27, f),
			t(29, S),
			t(26, r),
			t(8, b),
			t(26, r),
			t(28, w),
			t(27, f),
			await I(),
			se(a, !0);
	}
	function Ye(a) {
		typeof d == "string" &&
			_[d] &&
			_[d].cell !== a.target &&
			!_[d].cell?.contains(a?.target) &&
			t(7, (d = !1)),
			typeof O == "string" &&
				_[O] &&
				_[O].cell !== a.target &&
				!_[O].cell?.contains(a.target) &&
				(t(6, (g = O)), t(13, (O = !1)), ve(), t(13, (O = !1)));
	}
	function Ae(a) {
		const c = new FileReader();
		function k(j) {
			if (!j?.target?.result || typeof j.target.result != "string") return;
			const [D] = vt(j.target.result, [",", "	"]),
				[N, ...Y] = dt(D).parseRows(j.target.result);
			t(8, (b = F(o[1] === "fixed" ? N.slice(0, o[0]) : N))),
				t(27, (f = Y)),
				c.removeEventListener("loadend", k);
		}
		c.addEventListener("loadend", k), c.readAsText(a);
	}
	let ie = !1;
	function Ge(a, c) {
		s.$$.not_equal(_[c].input, a) && ((_[c].input = a), t(10, _));
	}
	const Pe = (a) => se(a),
		Ve = (a) => ye(a);
	function Ze(a, c) {
		P[a ? "unshift" : "push"](() => {
			(_[c].cell = a), t(10, _);
		});
	}
	function Qe(a, c, k, j) {
		(k[j].value = a), t(9, A), t(27, f), t(29, S), t(26, r);
	}
	function We(a, c) {
		s.$$.not_equal(_[c].input, a) && ((_[c].input = a), t(10, _));
	}
	function Xe(a, c) {
		P[a ? "unshift" : "push"](() => {
			(_[c].cell = a), t(10, _);
		});
	}
	const xe = (a) => U(a),
		$e = (a) => we(a),
		et = (a) => U(a),
		tt = (a, c, k, j) => pe(j, a, c, k);
	function lt(a) {
		(ie = a), t(14, ie);
	}
	const nt = (a) => Ae(At(a.detail.data)),
		at = () => re();
	return (
		(s.$$set = (a) => {
			"datatype" in a && t(0, (n = a.datatype)),
				"label" in a && t(1, (l = a.label)),
				"headers" in a && t(26, (r = a.headers)),
				"values" in a && t(27, (f = a.values)),
				"col_count" in a && t(2, (o = a.col_count)),
				"row_count" in a && t(3, (p = a.row_count)),
				"editable" in a && t(4, (i = a.editable)),
				"wrap" in a && t(5, (u = a.wrap));
		}),
		(s.$$.update = () => {
			if (
				(s.$$.dirty[0] & 201326592 &&
					(f && !Array.isArray(f)
						? (t(26, (r = f.headers)),
						  t(
								27,
								(f = f.data.length === 0 ? [Array(r.length).fill("")] : f.data)
						  ),
						  t(6, (g = !1)))
						: f === null &&
						  (t(27, (f = [Array(r.length).fill("")])), t(6, (g = !1)))),
				s.$$.dirty[0] & 64 && g !== !1)
			) {
				const a = g.split("-"),
					c = parseInt(a[0]),
					k = parseInt(a[1]);
				h("select", { index: [c, k], value: v(c, k) });
			}
			s.$$.dirty[0] & 335544320 &&
				(ae(r, w) || (t(8, (b = F(r))), t(28, (w = r)), M())),
				s.$$.dirty[0] & 671088640 &&
					(ae(f, S) || (t(9, (A = y(f))), t(29, (S = f)), M())),
				s.$$.dirty[0] & 768 &&
					b &&
					h("change", {
						data: A.map((a) => a.map(({ value: c }) => c)),
						headers: b.map((a) => a.value)
					}),
				s.$$.dirty[0] & 128 && ke(d, "edit"),
				s.$$.dirty[0] & 64 && ke(g, "select");
		}),
		[
			n,
			l,
			o,
			p,
			i,
			u,
			g,
			d,
			b,
			A,
			_,
			G,
			ee,
			O,
			ie,
			z,
			U,
			pe,
			we,
			ye,
			se,
			Ke,
			re,
			Je,
			Ye,
			Ae,
			r,
			f,
			w,
			S,
			Ge,
			Pe,
			Ve,
			Ze,
			Qe,
			We,
			Xe,
			xe,
			$e,
			et,
			tt,
			lt,
			nt,
			at
		]
	);
}
class Dt extends de {
	constructor(e) {
		super(),
			he(
				this,
				e,
				jt,
				yt,
				ge,
				{
					datatype: 0,
					label: 1,
					headers: 26,
					values: 27,
					col_count: 2,
					row_count: 3,
					editable: 4,
					wrap: 5
				},
				null,
				[-1, -1]
			);
	}
}
function Et(s) {
	let e, t, n, l, r, f;
	const o = [s[11]];
	let p = {};
	for (let i = 0; i < o.length; i += 1) p = ut(p, o[i]);
	return (
		(t = new ft({ props: p })),
		(l = new Dt({
			props: {
				label: s[8],
				row_count: s[7],
				col_count: s[6],
				values: s[0],
				headers: s[1],
				editable: s[5] === "dynamic",
				wrap: s[9],
				datatype: s[10]
			}
		})),
		l.$on("change", s[13]),
		l.$on("select", s[14]),
		{
			c() {
				(e = q("div")),
					V(t.$$.fragment),
					(n = J()),
					V(l.$$.fragment),
					m(e, "id", s[2]),
					m(e, "class", (r = je(s[3].join(" ")) + " svelte-1nw9bhs")),
					E(e, "hide", !s[4]);
			},
			m(i, u) {
				T(i, e, u), Z(t, e, null), L(e, n), Z(l, e, null), (f = !0);
			},
			p(i, [u]) {
				const g = u & 2048 ? ot(o, [ct(i[11])]) : {};
				t.$set(g);
				const h = {};
				u & 256 && (h.label = i[8]),
					u & 128 && (h.row_count = i[7]),
					u & 64 && (h.col_count = i[6]),
					u & 1 && (h.values = i[0]),
					u & 2 && (h.headers = i[1]),
					u & 32 && (h.editable = i[5] === "dynamic"),
					u & 512 && (h.wrap = i[9]),
					u & 1024 && (h.datatype = i[10]),
					l.$set(h),
					(!f || u & 4) && m(e, "id", i[2]),
					(!f ||
						(u & 8 && r !== (r = je(i[3].join(" ")) + " svelte-1nw9bhs"))) &&
						m(e, "class", r),
					(!f || u & 24) && E(e, "hide", !i[4]);
			},
			i(i) {
				f || (C(t.$$.fragment, i), C(l.$$.fragment, i), (f = !0));
			},
			o(i) {
				R(t.$$.fragment, i), R(l.$$.fragment, i), (f = !1);
			},
			d(i) {
				i && B(e), Q(t), Q(l);
			}
		}
	);
}
function Lt(s, e, t) {
	let { headers: n = [] } = e,
		{ elem_id: l = "" } = e,
		{ elem_classes: r = [] } = e,
		{ visible: f = !0 } = e,
		{ value: o = { data: [["", "", ""]], headers: ["1", "2", "3"] } } = e,
		{ mode: p } = e,
		{ col_count: i } = e,
		{ row_count: u } = e,
		{ label: g = null } = e,
		{ wrap: h } = e,
		{ datatype: d } = e;
	const v = Oe();
	let { loading_status: _ } = e;
	async function F(w) {
		t(0, (o = w)), await I(), v("change", w);
	}
	const y = ({ detail: w }) => F(w);
	function b(w) {
		oe.call(this, s, w);
	}
	return (
		(s.$$set = (w) => {
			"headers" in w && t(1, (n = w.headers)),
				"elem_id" in w && t(2, (l = w.elem_id)),
				"elem_classes" in w && t(3, (r = w.elem_classes)),
				"visible" in w && t(4, (f = w.visible)),
				"value" in w && t(0, (o = w.value)),
				"mode" in w && t(5, (p = w.mode)),
				"col_count" in w && t(6, (i = w.col_count)),
				"row_count" in w && t(7, (u = w.row_count)),
				"label" in w && t(8, (g = w.label)),
				"wrap" in w && t(9, (h = w.wrap)),
				"datatype" in w && t(10, (d = w.datatype)),
				"loading_status" in w && t(11, (_ = w.loading_status));
		}),
		[o, n, l, r, f, p, i, u, g, h, d, _, F, y, b]
	);
}
class Mt extends de {
	constructor(e) {
		super(),
			he(this, e, Lt, Et, ge, {
				headers: 1,
				elem_id: 2,
				elem_classes: 3,
				visible: 4,
				value: 0,
				mode: 5,
				col_count: 6,
				row_count: 7,
				label: 8,
				wrap: 9,
				datatype: 10,
				loading_status: 11
			});
	}
}
const St = Mt,
	zt = ["static", "dynamic"],
	Ht = (s) => ({
		type: {
			payload: "{ data: Array<Array<string | number>>; headers: Array<string> }"
		},
		description: {
			payload: "an object with an array of data and an array of headers"
		},
		example_data: s.value
	});
export { St as Component, Ht as document, zt as modes };
//# sourceMappingURL=index-2076b642.js.map
