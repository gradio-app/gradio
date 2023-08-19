import {
	S as Z,
	i as x,
	s as $,
	G as H,
	e as z,
	H as U,
	C as b,
	g as y,
	m as D,
	E as re,
	l as J,
	t as p,
	o as Y,
	p as m,
	q as w,
	n as K,
	r as _e,
	I as ce,
	K as be,
	T as V,
	b as j,
	ad as B,
	a6 as de,
	J as h,
	a1 as he,
	a0 as A,
	f as ee,
	F as I,
	aa as me,
	al as ge,
	ac as ke,
	ae as k,
	a as pe,
	k as ye,
	y as G,
	x as we,
	$ as ve,
	h as Te,
	j as Ee
} from "../lite.js";
/* empty css                                                  */ import { B as Ce } from "./Button-5b68d65a.js";
/* empty css                                                    */ import { B as Be } from "./BlockTitle-1b9e69db.js";
import { C as He, a as Ne } from "./Copy-d120a3d6.js";
function Se(i) {
	let e;
	return {
		c() {
			e = ce(i[3]);
		},
		m(t, a) {
			y(t, e, a);
		},
		p(t, a) {
			a & 8 && be(e, t[3]);
		},
		d(t) {
			t && w(e);
		}
	};
}
function ze(i) {
	let e,
		t,
		a,
		s,
		l,
		o,
		c = i[6] && i[9].show_copy_button && W(i);
	return {
		c() {
			c && c.c(),
				(e = U()),
				(t = H("textarea")),
				b(t, "data-testid", "textbox"),
				b(t, "class", "scroll-hide svelte-1pie7s6"),
				b(t, "placeholder", i[2]),
				b(t, "rows", i[1]),
				(t.disabled = i[5]);
		},
		m(n, r) {
			c && c.m(n, r),
				y(n, e, r),
				y(n, t, r),
				B(t, i[0]),
				i[24](t),
				(s = !0),
				l ||
					((o = [
						de((a = i[16].call(null, t, i[0]))),
						h(t, "input", i[23]),
						h(t, "keypress", i[15]),
						h(t, "blur", i[12]),
						h(t, "select", i[14])
					]),
					(l = !0));
		},
		p(n, r) {
			n[6] && n[9].show_copy_button
				? c
					? (c.p(n, r), r & 576 && m(c, 1))
					: ((c = W(n)), c.c(), m(c, 1), c.m(e.parentNode, e))
				: c &&
				  (J(),
				  p(c, 1, 1, () => {
						c = null;
				  }),
				  Y()),
				(!s || r & 4) && b(t, "placeholder", n[2]),
				(!s || r & 2) && b(t, "rows", n[1]),
				(!s || r & 32) && (t.disabled = n[5]),
				a && he(a.update) && r & 1 && a.update.call(null, n[0]),
				r & 1 && B(t, n[0]);
		},
		i(n) {
			s || (m(c), (s = !0));
		},
		o(n) {
			p(c), (s = !1);
		},
		d(n) {
			c && c.d(n), n && w(e), n && w(t), i[24](null), (l = !1), A(o);
		}
	};
}
function De(i) {
	let e;
	function t(l, o) {
		if (l[8] === "text") return Fe;
		if (l[8] === "password") return Le;
		if (l[8] === "email") return qe;
	}
	let a = t(i),
		s = a && a(i);
	return {
		c() {
			s && s.c(), (e = ee());
		},
		m(l, o) {
			s && s.m(l, o), y(l, e, o);
		},
		p(l, o) {
			a === (a = t(l)) && s
				? s.p(l, o)
				: (s && s.d(1), (s = a && a(l)), s && (s.c(), s.m(e.parentNode, e)));
		},
		i: I,
		o: I,
		d(l) {
			s && s.d(l), l && w(e);
		}
	};
}
function W(i) {
	let e, t, a, s;
	const l = [je, Ke],
		o = [];
	function c(n, r) {
		return n[11] ? 0 : 1;
	}
	return (
		(e = c(i)),
		(t = o[e] = l[e](i)),
		{
			c() {
				t.c(), (a = ee());
			},
			m(n, r) {
				o[e].m(n, r), y(n, a, r), (s = !0);
			},
			p(n, r) {
				let f = e;
				(e = c(n)),
					e === f
						? o[e].p(n, r)
						: (J(),
						  p(o[f], 1, 1, () => {
								o[f] = null;
						  }),
						  Y(),
						  (t = o[e]),
						  t ? t.p(n, r) : ((t = o[e] = l[e](n)), t.c()),
						  m(t, 1),
						  t.m(a.parentNode, a));
			},
			i(n) {
				s || (m(t), (s = !0));
			},
			o(n) {
				p(t), (s = !1);
			},
			d(n) {
				o[e].d(n), n && w(a);
			}
		}
	);
}
function Ke(i) {
	let e, t, a, s, l;
	return (
		(t = new He({})),
		{
			c() {
				(e = H("button")),
					z(t.$$.fragment),
					b(e, "class", "copy-text svelte-1pie7s6");
			},
			m(o, c) {
				y(o, e, c),
					D(t, e, null),
					(a = !0),
					s || ((l = h(e, "click", i[13])), (s = !0));
			},
			p: I,
			i(o) {
				a || (m(t.$$.fragment, o), (a = !0));
			},
			o(o) {
				p(t.$$.fragment, o), (a = !1);
			},
			d(o) {
				o && w(e), K(t), (s = !1), l();
			}
		}
	);
}
function je(i) {
	let e, t, a, s;
	return (
		(t = new Ne({})),
		{
			c() {
				(e = H("button")), z(t.$$.fragment), b(e, "class", "svelte-1pie7s6");
			},
			m(l, o) {
				y(l, e, o), D(t, e, null), (s = !0);
			},
			p: I,
			i(l) {
				s ||
					(m(t.$$.fragment, l),
					a ||
						me(() => {
							(a = ge(e, ke, { duration: 300 })), a.start();
						}),
					(s = !0));
			},
			o(l) {
				p(t.$$.fragment, l), (s = !1);
			},
			d(l) {
				l && w(e), K(t);
			}
		}
	);
}
function qe(i) {
	let e, t, a;
	return {
		c() {
			(e = H("input")),
				b(e, "data-testid", "textbox"),
				b(e, "type", "email"),
				b(e, "class", "scroll-hide svelte-1pie7s6"),
				b(e, "placeholder", i[2]),
				(e.disabled = i[5]),
				b(e, "autocomplete", "email");
		},
		m(s, l) {
			y(s, e, l),
				B(e, i[0]),
				i[22](e),
				t ||
					((a = [
						h(e, "input", i[21]),
						h(e, "keypress", i[15]),
						h(e, "blur", i[12]),
						h(e, "select", i[14])
					]),
					(t = !0));
		},
		p(s, l) {
			l & 4 && b(e, "placeholder", s[2]),
				l & 32 && (e.disabled = s[5]),
				l & 1 && e.value !== s[0] && B(e, s[0]);
		},
		d(s) {
			s && w(e), i[22](null), (t = !1), A(a);
		}
	};
}
function Le(i) {
	let e, t, a;
	return {
		c() {
			(e = H("input")),
				b(e, "data-testid", "password"),
				b(e, "type", "password"),
				b(e, "class", "scroll-hide svelte-1pie7s6"),
				b(e, "placeholder", i[2]),
				(e.disabled = i[5]),
				b(e, "autocomplete", "");
		},
		m(s, l) {
			y(s, e, l),
				B(e, i[0]),
				i[20](e),
				t ||
					((a = [
						h(e, "input", i[19]),
						h(e, "keypress", i[15]),
						h(e, "blur", i[12]),
						h(e, "select", i[14])
					]),
					(t = !0));
		},
		p(s, l) {
			l & 4 && b(e, "placeholder", s[2]),
				l & 32 && (e.disabled = s[5]),
				l & 1 && e.value !== s[0] && B(e, s[0]);
		},
		d(s) {
			s && w(e), i[20](null), (t = !1), A(a);
		}
	};
}
function Fe(i) {
	let e, t, a;
	return {
		c() {
			(e = H("input")),
				b(e, "data-testid", "textbox"),
				b(e, "type", "text"),
				b(e, "class", "scroll-hide svelte-1pie7s6"),
				b(e, "placeholder", i[2]),
				(e.disabled = i[5]);
		},
		m(s, l) {
			y(s, e, l),
				B(e, i[0]),
				i[18](e),
				t ||
					((a = [
						h(e, "input", i[17]),
						h(e, "keypress", i[15]),
						h(e, "blur", i[12]),
						h(e, "select", i[14])
					]),
					(t = !0));
		},
		p(s, l) {
			l & 4 && b(e, "placeholder", s[2]),
				l & 32 && (e.disabled = s[5]),
				l & 1 && e.value !== s[0] && B(e, s[0]);
		},
		d(s) {
			s && w(e), i[18](null), (t = !1), A(a);
		}
	};
}
function Ge(i) {
	let e, t, a, s, l, o;
	t = new Be({
		props: {
			show_label: i[6],
			info: i[4],
			$$slots: { default: [Se] },
			$$scope: { ctx: i }
		}
	});
	const c = [De, ze],
		n = [];
	function r(f, g) {
		return f[1] === 1 && f[7] === 1 ? 0 : 1;
	}
	return (
		(s = r(i)),
		(l = n[s] = c[s](i)),
		{
			c() {
				(e = H("label")),
					z(t.$$.fragment),
					(a = U()),
					l.c(),
					b(e, "class", "svelte-1pie7s6");
			},
			m(f, g) {
				y(f, e, g), D(t, e, null), re(e, a), n[s].m(e, null), (o = !0);
			},
			p(f, [g]) {
				const v = {};
				g & 64 && (v.show_label = f[6]),
					g & 16 && (v.info = f[4]),
					g & 1073741832 && (v.$$scope = { dirty: g, ctx: f }),
					t.$set(v);
				let d = s;
				(s = r(f)),
					s === d
						? n[s].p(f, g)
						: (J(),
						  p(n[d], 1, 1, () => {
								n[d] = null;
						  }),
						  Y(),
						  (l = n[s]),
						  l ? l.p(f, g) : ((l = n[s] = c[s](f)), l.c()),
						  m(l, 1),
						  l.m(e, null));
			},
			i(f) {
				o || (m(t.$$.fragment, f), m(l), (o = !0));
			},
			o(f) {
				p(t.$$.fragment, f), p(l), (o = !1);
			},
			d(f) {
				f && w(e), K(t), n[s].d();
			}
		}
	);
}
function Ie(i, e, t) {
	let { value: a = "" } = e,
		{ lines: s = 1 } = e,
		{ placeholder: l = "Type here..." } = e,
		{ label: o } = e,
		{ info: c = void 0 } = e,
		{ disabled: n = !1 } = e,
		{ show_label: r = !0 } = e,
		{ max_lines: f } = e,
		{ type: g = "text" } = e,
		{ style: v = {} } = e,
		d,
		N = !1,
		S;
	const E = _e();
	function M(u) {
		E("change", u);
	}
	function O() {
		E("blur");
	}
	async function P() {
		"clipboard" in navigator && (await navigator.clipboard.writeText(a), Q());
	}
	function Q() {
		t(11, (N = !0)),
			S && clearTimeout(S),
			(S = setTimeout(() => {
				t(11, (N = !1));
			}, 1e3));
	}
	function R(u) {
		const T = u.target,
			L = T.value,
			C = [T.selectionStart, T.selectionEnd];
		E("select", { value: L.substring(...C), index: C });
	}
	async function _(u) {
		await V(),
			((u.key === "Enter" && u.shiftKey && s > 1) ||
				(u.key === "Enter" && !u.shiftKey && s === 1 && f >= 1)) &&
				(u.preventDefault(), E("submit"));
	}
	async function q(u) {
		if ((await V(), s === f)) return;
		let T = f === !1 ? !1 : f === void 0 ? 21 * 11 : 21 * (f + 1),
			L = 21 * (s + 1);
		const C = u.target;
		C.style.height = "1px";
		let F;
		T && C.scrollHeight > T
			? (F = T)
			: C.scrollHeight < L
			? (F = L)
			: (F = C.scrollHeight),
			(C.style.height = `${F}px`);
	}
	function te(u, T) {
		if (
			s !== f &&
			((u.style.overflowY = "scroll"),
			u.addEventListener("input", q),
			!!T.trim())
		)
			return (
				q({ target: u }), { destroy: () => u.removeEventListener("input", q) }
			);
	}
	function le() {
		(a = this.value), t(0, a);
	}
	function ie(u) {
		j[u ? "unshift" : "push"](() => {
			(d = u), t(10, d);
		});
	}
	function se() {
		(a = this.value), t(0, a);
	}
	function ne(u) {
		j[u ? "unshift" : "push"](() => {
			(d = u), t(10, d);
		});
	}
	function ae() {
		(a = this.value), t(0, a);
	}
	function ue(u) {
		j[u ? "unshift" : "push"](() => {
			(d = u), t(10, d);
		});
	}
	function fe() {
		(a = this.value), t(0, a);
	}
	function oe(u) {
		j[u ? "unshift" : "push"](() => {
			(d = u), t(10, d);
		});
	}
	return (
		(i.$$set = (u) => {
			"value" in u && t(0, (a = u.value)),
				"lines" in u && t(1, (s = u.lines)),
				"placeholder" in u && t(2, (l = u.placeholder)),
				"label" in u && t(3, (o = u.label)),
				"info" in u && t(4, (c = u.info)),
				"disabled" in u && t(5, (n = u.disabled)),
				"show_label" in u && t(6, (r = u.show_label)),
				"max_lines" in u && t(7, (f = u.max_lines)),
				"type" in u && t(8, (g = u.type)),
				"style" in u && t(9, (v = u.style));
		}),
		(i.$$.update = () => {
			i.$$.dirty & 1155 && d && s !== f && q({ target: d }),
				i.$$.dirty & 1 && M(a);
		}),
		[
			a,
			s,
			l,
			o,
			c,
			n,
			r,
			f,
			g,
			v,
			d,
			N,
			O,
			P,
			R,
			_,
			te,
			le,
			ie,
			se,
			ne,
			ae,
			ue,
			fe,
			oe
		]
	);
}
let Je = class extends Z {
	constructor(e) {
		super(),
			x(this, e, Ie, Ge, $, {
				value: 0,
				lines: 1,
				placeholder: 2,
				label: 3,
				info: 4,
				disabled: 5,
				show_label: 6,
				max_lines: 7,
				type: 8,
				style: 9
			});
	}
};
function X(i) {
	let e, t;
	const a = [i[12]];
	let s = {};
	for (let l = 0; l < a.length; l += 1) s = we(s, a[l]);
	return (
		(e = new ve({ props: s })),
		{
			c() {
				z(e.$$.fragment);
			},
			m(l, o) {
				D(e, l, o), (t = !0);
			},
			p(l, o) {
				const c = o & 4096 ? Te(a, [Ee(l[12])]) : {};
				e.$set(c);
			},
			i(l) {
				t || (m(e.$$.fragment, l), (t = !0));
			},
			o(l) {
				p(e.$$.fragment, l), (t = !1);
			},
			d(l) {
				K(e, l);
			}
		}
	);
}
function Ye(i) {
	let e,
		t,
		a,
		s,
		l = i[12] && X(i);
	function o(n) {
		i[14](n);
	}
	let c = {
		label: i[1],
		info: i[2],
		show_label: i[8],
		lines: i[6],
		type: i[10],
		max_lines: !i[9] && i[13] === "static" ? i[6] + 1 : i[9],
		placeholder: i[7],
		style: i[11],
		disabled: i[13] === "static"
	};
	return (
		i[0] !== void 0 && (c.value = i[0]),
		(t = new Je({ props: c })),
		j.push(() => pe(t, "value", o)),
		t.$on("change", i[15]),
		t.$on("submit", i[16]),
		t.$on("blur", i[17]),
		t.$on("select", i[18]),
		{
			c() {
				l && l.c(), (e = U()), z(t.$$.fragment);
			},
			m(n, r) {
				l && l.m(n, r), y(n, e, r), D(t, n, r), (s = !0);
			},
			p(n, r) {
				n[12]
					? l
						? (l.p(n, r), r & 4096 && m(l, 1))
						: ((l = X(n)), l.c(), m(l, 1), l.m(e.parentNode, e))
					: l &&
					  (J(),
					  p(l, 1, 1, () => {
							l = null;
					  }),
					  Y());
				const f = {};
				r & 2 && (f.label = n[1]),
					r & 4 && (f.info = n[2]),
					r & 256 && (f.show_label = n[8]),
					r & 64 && (f.lines = n[6]),
					r & 1024 && (f.type = n[10]),
					r & 8768 &&
						(f.max_lines = !n[9] && n[13] === "static" ? n[6] + 1 : n[9]),
					r & 128 && (f.placeholder = n[7]),
					r & 2048 && (f.style = n[11]),
					r & 8192 && (f.disabled = n[13] === "static"),
					!a && r & 1 && ((a = !0), (f.value = n[0]), ye(() => (a = !1))),
					t.$set(f);
			},
			i(n) {
				s || (m(l), m(t.$$.fragment, n), (s = !0));
			},
			o(n) {
				p(l), p(t.$$.fragment, n), (s = !1);
			},
			d(n) {
				l && l.d(n), n && w(e), K(t, n);
			}
		}
	);
}
function Ae(i) {
	let e, t;
	return (
		(e = new Ce({
			props: {
				visible: i[5],
				elem_id: i[3],
				elem_classes: i[4],
				disable: typeof i[11].container == "boolean" && !i[11].container,
				$$slots: { default: [Ye] },
				$$scope: { ctx: i }
			}
		})),
		{
			c() {
				z(e.$$.fragment);
			},
			m(a, s) {
				D(e, a, s), (t = !0);
			},
			p(a, [s]) {
				const l = {};
				s & 32 && (l.visible = a[5]),
					s & 8 && (l.elem_id = a[3]),
					s & 16 && (l.elem_classes = a[4]),
					s & 2048 &&
						(l.disable =
							typeof a[11].container == "boolean" && !a[11].container),
					s & 540615 && (l.$$scope = { dirty: s, ctx: a }),
					e.$set(l);
			},
			i(a) {
				t || (m(e.$$.fragment, a), (t = !0));
			},
			o(a) {
				p(e.$$.fragment, a), (t = !1);
			},
			d(a) {
				K(e, a);
			}
		}
	);
}
function Me(i, e, t) {
	let { label: a = "Textbox" } = e,
		{ info: s = void 0 } = e,
		{ elem_id: l = "" } = e,
		{ elem_classes: o = [] } = e,
		{ visible: c = !0 } = e,
		{ value: n = "" } = e,
		{ lines: r } = e,
		{ placeholder: f = "" } = e,
		{ show_label: g } = e,
		{ max_lines: v } = e,
		{ type: d = "text" } = e,
		{ style: N = {} } = e,
		{ loading_status: S = void 0 } = e,
		{ mode: E } = e;
	function M(_) {
		(n = _), t(0, n);
	}
	function O(_) {
		G.call(this, i, _);
	}
	function P(_) {
		G.call(this, i, _);
	}
	function Q(_) {
		G.call(this, i, _);
	}
	function R(_) {
		G.call(this, i, _);
	}
	return (
		(i.$$set = (_) => {
			"label" in _ && t(1, (a = _.label)),
				"info" in _ && t(2, (s = _.info)),
				"elem_id" in _ && t(3, (l = _.elem_id)),
				"elem_classes" in _ && t(4, (o = _.elem_classes)),
				"visible" in _ && t(5, (c = _.visible)),
				"value" in _ && t(0, (n = _.value)),
				"lines" in _ && t(6, (r = _.lines)),
				"placeholder" in _ && t(7, (f = _.placeholder)),
				"show_label" in _ && t(8, (g = _.show_label)),
				"max_lines" in _ && t(9, (v = _.max_lines)),
				"type" in _ && t(10, (d = _.type)),
				"style" in _ && t(11, (N = _.style)),
				"loading_status" in _ && t(12, (S = _.loading_status)),
				"mode" in _ && t(13, (E = _.mode));
		}),
		[n, a, s, l, o, c, r, f, g, v, d, N, S, E, M, O, P, Q, R]
	);
}
class Xe extends Z {
	constructor(e) {
		super(),
			x(this, e, Me, Ae, $, {
				label: 1,
				info: 2,
				elem_id: 3,
				elem_classes: 4,
				visible: 5,
				value: 0,
				lines: 6,
				placeholder: 7,
				show_label: 8,
				max_lines: 9,
				type: 10,
				style: 11,
				loading_status: 12,
				mode: 13
			});
	}
	get label() {
		return this.$$.ctx[1];
	}
	set label(e) {
		this.$$set({ label: e }), k();
	}
	get info() {
		return this.$$.ctx[2];
	}
	set info(e) {
		this.$$set({ info: e }), k();
	}
	get elem_id() {
		return this.$$.ctx[3];
	}
	set elem_id(e) {
		this.$$set({ elem_id: e }), k();
	}
	get elem_classes() {
		return this.$$.ctx[4];
	}
	set elem_classes(e) {
		this.$$set({ elem_classes: e }), k();
	}
	get visible() {
		return this.$$.ctx[5];
	}
	set visible(e) {
		this.$$set({ visible: e }), k();
	}
	get value() {
		return this.$$.ctx[0];
	}
	set value(e) {
		this.$$set({ value: e }), k();
	}
	get lines() {
		return this.$$.ctx[6];
	}
	set lines(e) {
		this.$$set({ lines: e }), k();
	}
	get placeholder() {
		return this.$$.ctx[7];
	}
	set placeholder(e) {
		this.$$set({ placeholder: e }), k();
	}
	get show_label() {
		return this.$$.ctx[8];
	}
	set show_label(e) {
		this.$$set({ show_label: e }), k();
	}
	get max_lines() {
		return this.$$.ctx[9];
	}
	set max_lines(e) {
		this.$$set({ max_lines: e }), k();
	}
	get type() {
		return this.$$.ctx[10];
	}
	set type(e) {
		this.$$set({ type: e }), k();
	}
	get style() {
		return this.$$.ctx[11];
	}
	set style(e) {
		this.$$set({ style: e }), k();
	}
	get loading_status() {
		return this.$$.ctx[12];
	}
	set loading_status(e) {
		this.$$set({ loading_status: e }), k();
	}
	get mode() {
		return this.$$.ctx[13];
	}
	set mode(e) {
		this.$$set({ mode: e }), k();
	}
}
export { Xe as T };
//# sourceMappingURL=Textbox-41d74eda.js.map
