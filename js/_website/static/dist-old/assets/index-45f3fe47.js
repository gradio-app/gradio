import {
	S as J,
	i as V,
	s as P,
	G as R,
	H as T,
	f as ce,
	C as b,
	g as M,
	p as B,
	l as x,
	t as z,
	o as $,
	q as S,
	r as _e,
	D as U,
	J as L,
	a2 as de,
	aa as ke,
	ab as ne,
	N as he,
	I as ee,
	M as A,
	E as O,
	K as le,
	b as G,
	ag as te,
	B as W,
	F,
	a as me,
	e as N,
	m as j,
	ad as se,
	k as ge,
	n as H,
	a0 as pe,
	x as Oe,
	$ as Ae,
	h as Be,
	j as De,
	y as Z
} from "../lite.js";
/* empty css                                                  */ import { B as ze } from "./Button-5b68d65a.js";
import { B as Ce } from "./BlockTitle-1b9e69db.js";
/* empty css                                                    */ import "./Info-06b02eda.js";
function ie(n, e, l) {
	const s = n.slice();
	return (s[18] = e[l]), s;
}
function oe(n) {
	let e,
		l,
		s,
		a,
		c,
		t = n[0],
		u = [];
	for (let i = 0; i < t.length; i += 1) u[i] = fe(ie(n, t, i));
	return {
		c() {
			e = R("ul");
			for (let i = 0; i < u.length; i += 1) u[i].c();
			b(e, "class", "options svelte-1udn3b5"),
				b(e, "aria-expanded", n[1]),
				U(e, "top", n[6]),
				U(e, "bottom", n[7]),
				U(e, "max-height", `calc(${n[8]}px - var(--window-padding))`);
		},
		m(i, r) {
			M(i, e, r);
			for (let o = 0; o < u.length; o += 1) u[o] && u[o].m(e, null);
			n[17](e), (s = !0), a || ((c = L(e, "mousedown", de(n[16]))), (a = !0));
		},
		p(i, r) {
			if (r & 517) {
				t = i[0];
				let o;
				for (o = 0; o < t.length; o += 1) {
					const h = ie(i, t, o);
					u[o] ? u[o].p(h, r) : ((u[o] = fe(h)), u[o].c(), u[o].m(e, null));
				}
				for (; o < u.length; o += 1) u[o].d(1);
				u.length = t.length;
			}
			(!s || r & 2) && b(e, "aria-expanded", i[1]),
				r & 64 && U(e, "top", i[6]),
				r & 128 && U(e, "bottom", i[7]),
				r & 256 &&
					U(e, "max-height", `calc(${i[8]}px - var(--window-padding))`);
		},
		i(i) {
			s ||
				(ke(() => {
					s && (l || (l = ne(e, te, { duration: 200, y: 5 }, !0)), l.run(1));
				}),
				(s = !0));
		},
		o(i) {
			l || (l = ne(e, te, { duration: 200, y: 5 }, !1)), l.run(0), (s = !1);
		},
		d(i) {
			i && S(e), he(u, i), n[17](null), i && l && l.end(), (a = !1), c();
		}
	};
}
function fe(n) {
	let e,
		l,
		s,
		a = n[18] + "",
		c,
		t,
		u,
		i;
	return {
		c() {
			(e = R("li")),
				(l = R("span")),
				(l.textContent = "✓"),
				(s = T()),
				(c = ee(a)),
				(t = T()),
				b(l, "class", "inner-item svelte-1udn3b5"),
				A(l, "hide", !n[9].includes(n[18])),
				b(e, "class", "item svelte-1udn3b5"),
				b(e, "role", "button"),
				b(e, "data-value", (u = n[18])),
				b(e, "aria-label", (i = n[18])),
				A(e, "selected", n[9].includes(n[18])),
				A(e, "active", n[2] === n[18]),
				A(e, "bg-gray-100", n[2] === n[18]),
				A(e, "dark:bg-gray-600", n[2] === n[18]);
		},
		m(r, o) {
			M(r, e, o), O(e, l), O(e, s), O(e, c), O(e, t);
		},
		p(r, o) {
			o & 513 && A(l, "hide", !r[9].includes(r[18])),
				o & 1 && a !== (a = r[18] + "") && le(c, a),
				o & 1 && u !== (u = r[18]) && b(e, "data-value", u),
				o & 1 && i !== (i = r[18]) && b(e, "aria-label", i),
				o & 513 && A(e, "selected", r[9].includes(r[18])),
				o & 5 && A(e, "active", r[2] === r[18]),
				o & 5 && A(e, "bg-gray-100", r[2] === r[18]),
				o & 5 && A(e, "dark:bg-gray-600", r[2] === r[18]);
		},
		d(r) {
			r && S(e);
		}
	};
}
function Ee(n) {
	let e,
		l,
		s,
		a,
		c = n[1] && !n[3] && oe(n);
	return {
		c() {
			(e = R("div")),
				(l = T()),
				c && c.c(),
				(s = ce()),
				b(e, "class", "reference");
		},
		m(t, u) {
			M(t, e, u), n[15](e), M(t, l, u), c && c.m(t, u), M(t, s, u), (a = !0);
		},
		p(t, [u]) {
			t[1] && !t[3]
				? c
					? (c.p(t, u), u & 10 && B(c, 1))
					: ((c = oe(t)), c.c(), B(c, 1), c.m(s.parentNode, s))
				: c &&
				  (x(),
				  z(c, 1, 1, () => {
						c = null;
				  }),
				  $());
		},
		i(t) {
			a || (B(c), (a = !0));
		},
		o(t) {
			z(c), (a = !1);
		},
		d(t) {
			t && S(e), n[15](null), t && S(l), c && c.d(t), t && S(s);
		}
	};
}
function ye(n, e, l) {
	let s,
		{ value: a = void 0 } = e,
		{ filtered: c } = e,
		{ showOptions: t = !1 } = e,
		{ activeOption: u } = e,
		{ disabled: i = !1 } = e,
		r,
		o,
		h,
		v,
		g,
		d,
		w,
		k;
	const C = _e();
	function D(f) {
		G[f ? "unshift" : "push"](() => {
			(v = f), l(4, v);
		});
	}
	const E = (f) => C("change", f);
	function q(f) {
		G[f ? "unshift" : "push"](() => {
			(g = f), l(5, g);
		});
	}
	return (
		(n.$$set = (f) => {
			"value" in f && l(11, (a = f.value)),
				"filtered" in f && l(0, (c = f.filtered)),
				"showOptions" in f && l(1, (t = f.showOptions)),
				"activeOption" in f && l(2, (u = f.activeOption)),
				"disabled" in f && l(3, (i = f.disabled));
		}),
		(n.$$.update = () => {
			if (n.$$.dirty & 30770) {
				if (t && v) {
					if (g && typeof a == "string") {
						let f = document.querySelector(`li[data-value="${a}"]`);
						f && g.scrollTo(0, f.offsetTop);
					}
					l(12, (r = v.getBoundingClientRect().top)),
						l(13, (o = window.innerHeight - v.getBoundingClientRect().bottom)),
						l(14, (h = v.parentElement?.getBoundingClientRect().height || 0));
				}
				o > r
					? (l(6, (d = `${h}px`)), l(8, (k = o)), l(7, (w = null)))
					: (l(7, (w = `${h}px`)), l(8, (k = r - h)), l(6, (d = null)));
			}
			n.$$.dirty & 2048 && l(9, (s = Array.isArray(a) ? a : [a]));
		}),
		[c, t, u, i, v, g, d, w, k, s, C, a, r, o, h, D, E, q]
	);
}
class Re extends J {
	constructor(e) {
		super(),
			V(this, e, ye, Ee, P, {
				value: 11,
				filtered: 0,
				showOptions: 1,
				activeOption: 2,
				disabled: 3
			});
	}
}
function Me(n) {
	let e, l;
	return {
		c() {
			(e = W("svg")),
				(l = W("path")),
				b(l, "d", "M5 8l4 4 4-4z"),
				b(e, "class", "dropdown-arrow svelte-p5edak"),
				b(e, "xmlns", "http://www.w3.org/2000/svg"),
				b(e, "width", "18"),
				b(e, "height", "18"),
				b(e, "viewBox", "0 0 18 18");
		},
		m(s, a) {
			M(s, e, a), O(e, l);
		},
		p: F,
		i: F,
		o: F,
		d(s) {
			s && S(e);
		}
	};
}
class Se extends J {
	constructor(e) {
		super(), V(this, e, null, Me, P, {});
	}
}
function Te(n) {
	let e, l;
	return {
		c() {
			(e = W("svg")),
				(l = W("path")),
				b(
					l,
					"d",
					"M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
				),
				b(e, "xmlns", "http://www.w3.org/2000/svg"),
				b(e, "width", "16"),
				b(e, "height", "16"),
				b(e, "viewBox", "0 0 24 24");
		},
		m(s, a) {
			M(s, e, a), O(e, l);
		},
		p: F,
		i: F,
		o: F,
		d(s) {
			s && S(e);
		}
	};
}
class be extends J {
	constructor(e) {
		super(), V(this, e, null, Te, P, {});
	}
}
function ae(n, e, l) {
	const s = n.slice();
	return (s[27] = e[l]), s;
}
function qe(n) {
	let e;
	return {
		c() {
			e = ee(n[1]);
		},
		m(l, s) {
			M(l, e, s);
		},
		p(l, s) {
			s & 2 && le(e, l[1]);
		},
		d(l) {
			l && S(e);
		}
	};
}
function ue(n) {
	let e,
		l,
		s = n[0],
		a = [];
	for (let t = 0; t < s.length; t += 1) a[t] = re(ae(n, s, t));
	const c = (t) =>
		z(a[t], 1, 1, () => {
			a[t] = null;
		});
	return {
		c() {
			for (let t = 0; t < a.length; t += 1) a[t].c();
			e = ce();
		},
		m(t, u) {
			for (let i = 0; i < a.length; i += 1) a[i] && a[i].m(t, u);
			M(t, e, u), (l = !0);
		},
		p(t, u) {
			if (u & 8209) {
				s = t[0];
				let i;
				for (i = 0; i < s.length; i += 1) {
					const r = ae(t, s, i);
					a[i]
						? (a[i].p(r, u), B(a[i], 1))
						: ((a[i] = re(r)), a[i].c(), B(a[i], 1), a[i].m(e.parentNode, e));
				}
				for (x(), i = s.length; i < a.length; i += 1) c(i);
				$();
			}
		},
		i(t) {
			if (!l) {
				for (let u = 0; u < s.length; u += 1) B(a[u]);
				l = !0;
			}
		},
		o(t) {
			a = a.filter(Boolean);
			for (let u = 0; u < a.length; u += 1) z(a[u]);
			l = !1;
		},
		d(t) {
			he(a, t), t && S(e);
		}
	};
}
function re(n) {
	let e,
		l,
		s = n[27] + "",
		a,
		c,
		t,
		u,
		i,
		r,
		o,
		h,
		v;
	u = new be({});
	function g() {
		return n[19](n[27]);
	}
	return {
		c() {
			(e = R("div")),
				(l = R("span")),
				(a = ee(s)),
				(c = T()),
				(t = R("div")),
				N(u.$$.fragment),
				(r = T()),
				b(l, "class", "svelte-1g4zxts"),
				b(t, "class", "token-remove svelte-1g4zxts"),
				b(t, "title", (i = "Remove " + n[27])),
				A(t, "hidden", n[4]),
				b(e, "class", "token svelte-1g4zxts");
		},
		m(d, w) {
			M(d, e, w),
				O(e, l),
				O(l, a),
				O(e, c),
				O(e, t),
				j(u, t, null),
				O(e, r),
				(o = !0),
				h || ((v = L(e, "click", de(g))), (h = !0));
		},
		p(d, w) {
			(n = d),
				(!o || w & 1) && s !== (s = n[27] + "") && le(a, s),
				(!o || (w & 1 && i !== (i = "Remove " + n[27]))) && b(t, "title", i),
				(!o || w & 16) && A(t, "hidden", n[4]);
		},
		i(d) {
			o || (B(u.$$.fragment, d), (o = !0));
		},
		o(d) {
			z(u.$$.fragment, d), (o = !1);
		},
		d(d) {
			d && S(e), H(u), (h = !1), v();
		}
	};
}
function Ie(n) {
	let e,
		l,
		s,
		a,
		c,
		t = n[3] && Array.isArray(n[0]),
		u,
		i,
		r,
		o,
		h,
		v,
		g,
		d,
		w,
		k,
		C,
		D,
		E,
		q;
	l = new Ce({
		props: {
			show_label: n[5],
			info: n[2],
			$$slots: { default: [qe] },
			$$scope: { ctx: n }
		}
	});
	let f = t && ue(n);
	(v = new be({})), (d = new Se({}));
	function X(m) {
		n[25](m);
	}
	let Q = {
		showOptions: n[10],
		filtered: n[9],
		activeOption: n[8],
		disabled: n[4]
	};
	return (
		n[0] !== void 0 && (Q.value = n[0]),
		(k = new Re({ props: Q })),
		G.push(() => me(k, "value", X)),
		k.$on("change", n[15]),
		{
			c() {
				(e = R("label")),
					N(l.$$.fragment),
					(s = T()),
					(a = R("div")),
					(c = R("div")),
					f && f.c(),
					(u = T()),
					(i = R("div")),
					(r = R("input")),
					(o = T()),
					(h = R("div")),
					N(v.$$.fragment),
					(g = T()),
					N(d.$$.fragment),
					(w = T()),
					N(k.$$.fragment),
					b(r, "class", "border-none svelte-1g4zxts"),
					(r.disabled = n[4]),
					b(r, "autocomplete", "off"),
					A(r, "subdued", n[0] !== n[7] && !n[6]),
					b(h, "class", "token-remove remove-all svelte-1g4zxts"),
					b(h, "title", "Clear"),
					A(h, "hide", !n[3] || !n[0]?.length || n[4]),
					b(i, "class", "secondary-wrap svelte-1g4zxts"),
					b(c, "class", "wrap-inner svelte-1g4zxts"),
					A(c, "showOptions", n[10]),
					b(a, "class", "wrap svelte-1g4zxts");
			},
			m(m, p) {
				M(m, e, p),
					j(l, e, null),
					O(e, s),
					O(e, a),
					O(a, c),
					f && f.m(c, null),
					O(c, u),
					O(c, i),
					O(i, r),
					se(r, n[7]),
					n[21](r),
					O(i, o),
					O(i, h),
					j(v, h, null),
					O(i, g),
					j(d, i, null),
					O(a, w),
					j(k, a, null),
					(D = !0),
					E ||
						((q = [
							L(r, "input", n[20]),
							L(r, "focus", n[22]),
							L(r, "keydown", n[16]),
							L(r, "keyup", n[23]),
							L(r, "blur", n[24]),
							L(h, "click", n[14])
						]),
						(E = !0));
			},
			p(m, [p]) {
				const K = {};
				p & 32 && (K.show_label = m[5]),
					p & 4 && (K.info = m[2]),
					p & 1073741826 && (K.$$scope = { dirty: p, ctx: m }),
					l.$set(K),
					p & 9 && (t = m[3] && Array.isArray(m[0])),
					t
						? f
							? (f.p(m, p), p & 9 && B(f, 1))
							: ((f = ue(m)), f.c(), B(f, 1), f.m(c, u))
						: f &&
						  (x(),
						  z(f, 1, 1, () => {
								f = null;
						  }),
						  $()),
					(!D || p & 16) && (r.disabled = m[4]),
					p & 128 && r.value !== m[7] && se(r, m[7]),
					(!D || p & 193) && A(r, "subdued", m[0] !== m[7] && !m[6]),
					(!D || p & 25) && A(h, "hide", !m[3] || !m[0]?.length || m[4]),
					(!D || p & 1024) && A(c, "showOptions", m[10]);
				const I = {};
				p & 1024 && (I.showOptions = m[10]),
					p & 512 && (I.filtered = m[9]),
					p & 256 && (I.activeOption = m[8]),
					p & 16 && (I.disabled = m[4]),
					!C && p & 1 && ((C = !0), (I.value = m[0]), ge(() => (C = !1))),
					k.$set(I);
			},
			i(m) {
				D ||
					(B(l.$$.fragment, m),
					B(f),
					B(v.$$.fragment, m),
					B(d.$$.fragment, m),
					B(k.$$.fragment, m),
					(D = !0));
			},
			o(m) {
				z(l.$$.fragment, m),
					z(f),
					z(v.$$.fragment, m),
					z(d.$$.fragment, m),
					z(k.$$.fragment, m),
					(D = !1);
			},
			d(m) {
				m && S(e),
					H(l),
					f && f.d(),
					n[21](null),
					H(v),
					H(d),
					H(k),
					(E = !1),
					pe(q);
			}
		}
	);
}
function Le(n, e, l) {
	let s,
		{ label: a } = e,
		{ info: c = void 0 } = e,
		{ value: t } = e,
		{ multiselect: u = !1 } = e,
		{ max_choices: i } = e,
		{ choices: r } = e,
		{ disabled: o = !1 } = e,
		{ show_label: h } = e,
		{ allow_custom_value: v = !1 } = e;
	const g = _e();
	let d,
		w,
		k = !1,
		C;
	function D(_) {
		l(0, t),
			(!i || t.length < i) &&
				(t.push(_),
				g("select", { index: r.indexOf(_), value: _, selected: !0 }),
				g("change", t)),
			l(0, t);
	}
	function E(_) {
		l(0, t),
			l(0, (t = t.filter((y) => y !== _))),
			g("select", { index: r.indexOf(_), value: _, selected: !1 }),
			g("change", t);
	}
	function q(_) {
		l(0, (t = [])), l(7, (d = "")), _.preventDefault(), g("change", t);
	}
	function f(_) {
		const y = _.detail.target.dataset.value;
		if ((v && l(7, (d = y)), y !== void 0))
			if (u) t?.includes(y) ? E(y) : D(y), l(7, (d = ""));
			else {
				l(0, (t = y)),
					l(7, (d = y)),
					l(10, (k = !1)),
					g("select", { index: r.indexOf(y), value: y, selected: !0 }),
					g("change", t);
				return;
			}
	}
	function X(_) {
		if (_.key === "Enter" && w != null)
			u
				? u && Array.isArray(t) && (t.includes(w) ? E(w) : D(w), l(7, (d = "")))
				: (t !== w &&
						(l(0, (t = w)),
						g("select", { index: r.indexOf(t), value: t, selected: !0 }),
						g("change", t)),
				  l(7, (d = w)),
				  l(10, (k = !1)));
		else if ((l(10, (k = !0)), _.key === "ArrowUp" || _.key === "ArrowDown")) {
			w === null && l(8, (w = s[0]));
			const y = _.key === "ArrowUp" ? -1 : 1,
				Y = s.indexOf(w) + y;
			l(8, (w = Y < 0 ? s[s.length - 1] : Y === s.length ? s[0] : s[Y])),
				_.preventDefault();
		} else
			_.key === "Escape"
				? l(10, (k = !1))
				: _.key === "Backspace"
				? u &&
				  (!d || d === "") &&
				  Array.isArray(t) &&
				  t.length > 0 &&
				  (E(t[t.length - 1]), l(7, (d = "")))
				: l(10, (k = !0));
	}
	const Q = (_) => E(_);
	function m() {
		(d = this.value), l(7, d), l(0, t);
	}
	function p(_) {
		G[_ ? "unshift" : "push"](() => {
			(C = _), l(11, C);
		});
	}
	const K = () => {
			l(10, (k = !k)), k ? l(7, (d = "")) : C.blur();
		},
		I = () => {
			v && (l(0, (t = d)), g("change", t));
		},
		we = () => {
			if (u) l(7, (d = ""));
			else if (!v) {
				let _ = t;
				t !== d &&
					(typeof t == "string" && d == ""
						? l(7, (d = t))
						: (l(0, (t = void 0)), l(7, (d = "")))),
					_ !== t && g("change", t);
			}
			l(10, (k = !1));
		};
	function ve(_) {
		(t = _), l(0, t);
	}
	return (
		(n.$$set = (_) => {
			"label" in _ && l(1, (a = _.label)),
				"info" in _ && l(2, (c = _.info)),
				"value" in _ && l(0, (t = _.value)),
				"multiselect" in _ && l(3, (u = _.multiselect)),
				"max_choices" in _ && l(17, (i = _.max_choices)),
				"choices" in _ && l(18, (r = _.choices)),
				"disabled" in _ && l(4, (o = _.disabled)),
				"show_label" in _ && l(5, (h = _.show_label)),
				"allow_custom_value" in _ && l(6, (v = _.allow_custom_value));
		}),
		(n.$$.update = () => {
			n.$$.dirty & 1 && typeof t == "string" && l(7, (d = t)),
				n.$$.dirty & 262272 &&
					l(
						9,
						(s = r.filter((_) =>
							d ? _.toLowerCase().includes(d.toLowerCase()) : _
						))
					),
				n.$$.dirty & 768 &&
					(!w || !s.includes(w)) &&
					l(8, (w = s.length ? s[0] : null));
		}),
		[
			t,
			a,
			c,
			u,
			o,
			h,
			v,
			d,
			w,
			s,
			k,
			C,
			g,
			E,
			q,
			f,
			X,
			i,
			r,
			Q,
			m,
			p,
			K,
			I,
			we,
			ve
		]
	);
}
class Ne extends J {
	constructor(e) {
		super(),
			V(this, e, Le, Ie, P, {
				label: 1,
				info: 2,
				value: 0,
				multiselect: 3,
				max_choices: 17,
				choices: 18,
				disabled: 4,
				show_label: 5,
				allow_custom_value: 6
			});
	}
}
function je(n) {
	let e, l, s, a, c;
	const t = [n[11]];
	let u = {};
	for (let o = 0; o < t.length; o += 1) u = Oe(u, t[o]);
	e = new Ae({ props: u });
	function i(o) {
		n[14](o);
	}
	let r = {
		choices: n[8],
		multiselect: n[6],
		max_choices: n[7],
		label: n[1],
		info: n[2],
		show_label: n[9],
		allow_custom_value: n[12],
		disabled: n[13] === "static"
	};
	return (
		n[0] !== void 0 && (r.value = n[0]),
		(s = new Ne({ props: r })),
		G.push(() => me(s, "value", i)),
		s.$on("change", n[15]),
		s.$on("select", n[16]),
		s.$on("blur", n[17]),
		{
			c() {
				N(e.$$.fragment), (l = T()), N(s.$$.fragment);
			},
			m(o, h) {
				j(e, o, h), M(o, l, h), j(s, o, h), (c = !0);
			},
			p(o, h) {
				const v = h & 2048 ? Be(t, [De(o[11])]) : {};
				e.$set(v);
				const g = {};
				h & 256 && (g.choices = o[8]),
					h & 64 && (g.multiselect = o[6]),
					h & 128 && (g.max_choices = o[7]),
					h & 2 && (g.label = o[1]),
					h & 4 && (g.info = o[2]),
					h & 512 && (g.show_label = o[9]),
					h & 4096 && (g.allow_custom_value = o[12]),
					h & 8192 && (g.disabled = o[13] === "static"),
					!a && h & 1 && ((a = !0), (g.value = o[0]), ge(() => (a = !1))),
					s.$set(g);
			},
			i(o) {
				c || (B(e.$$.fragment, o), B(s.$$.fragment, o), (c = !0));
			},
			o(o) {
				z(e.$$.fragment, o), z(s.$$.fragment, o), (c = !1);
			},
			d(o) {
				H(e, o), o && S(l), H(s, o);
			}
		}
	);
}
function He(n) {
	let e, l;
	return (
		(e = new ze({
			props: {
				visible: n[5],
				elem_id: n[3],
				elem_classes: n[4],
				disable: typeof n[10].container == "boolean" && !n[10].container,
				$$slots: { default: [je] },
				$$scope: { ctx: n }
			}
		})),
		{
			c() {
				N(e.$$.fragment);
			},
			m(s, a) {
				j(e, s, a), (l = !0);
			},
			p(s, [a]) {
				const c = {};
				a & 32 && (c.visible = s[5]),
					a & 8 && (c.elem_id = s[3]),
					a & 16 && (c.elem_classes = s[4]),
					a & 1024 &&
						(c.disable =
							typeof s[10].container == "boolean" && !s[10].container),
					a & 277447 && (c.$$scope = { dirty: a, ctx: s }),
					e.$set(c);
			},
			i(s) {
				l || (B(e.$$.fragment, s), (l = !0));
			},
			o(s) {
				z(e.$$.fragment, s), (l = !1);
			},
			d(s) {
				H(e, s);
			}
		}
	);
}
function Ke(n, e, l) {
	let { label: s = "Dropdown" } = e,
		{ info: a = void 0 } = e,
		{ elem_id: c = "" } = e,
		{ elem_classes: t = [] } = e,
		{ visible: u = !0 } = e,
		{ value: i } = e,
		{ multiselect: r = !1 } = e,
		{ max_choices: o } = e,
		{ choices: h } = e,
		{ show_label: v } = e,
		{ style: g = {} } = e,
		{ loading_status: d } = e,
		{ allow_custom_value: w = !1 } = e,
		{ mode: k } = e;
	r && !i ? (i = []) : i || (i = "");
	function C(f) {
		(i = f), l(0, i);
	}
	function D(f) {
		Z.call(this, n, f);
	}
	function E(f) {
		Z.call(this, n, f);
	}
	function q(f) {
		Z.call(this, n, f);
	}
	return (
		(n.$$set = (f) => {
			"label" in f && l(1, (s = f.label)),
				"info" in f && l(2, (a = f.info)),
				"elem_id" in f && l(3, (c = f.elem_id)),
				"elem_classes" in f && l(4, (t = f.elem_classes)),
				"visible" in f && l(5, (u = f.visible)),
				"value" in f && l(0, (i = f.value)),
				"multiselect" in f && l(6, (r = f.multiselect)),
				"max_choices" in f && l(7, (o = f.max_choices)),
				"choices" in f && l(8, (h = f.choices)),
				"show_label" in f && l(9, (v = f.show_label)),
				"style" in f && l(10, (g = f.style)),
				"loading_status" in f && l(11, (d = f.loading_status)),
				"allow_custom_value" in f && l(12, (w = f.allow_custom_value)),
				"mode" in f && l(13, (k = f.mode));
		}),
		[i, s, a, c, t, u, r, o, h, v, g, d, w, k, C, D, E, q]
	);
}
class Ue extends J {
	constructor(e) {
		super(),
			V(this, e, Ke, He, P, {
				label: 1,
				info: 2,
				elem_id: 3,
				elem_classes: 4,
				visible: 5,
				value: 0,
				multiselect: 6,
				max_choices: 7,
				choices: 8,
				show_label: 9,
				style: 10,
				loading_status: 11,
				allow_custom_value: 12,
				mode: 13
			});
	}
}
const We = Ue,
	Xe = ["static", "dynamic"],
	Ye = (n) => ({
		type: { payload: "string" },
		description: { payload: "selected choice" },
		example_data: n.choices.length ? n.choices[0] : ""
	});
export { We as Component, Ye as document, Xe as modes };
//# sourceMappingURL=index-45f3fe47.js.map
