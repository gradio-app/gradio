(function () {
	const t = document.createElement("link").relList;
	if (t && t.supports && t.supports("modulepreload")) return;
	for (const o of document.querySelectorAll('link[rel="modulepreload"]')) n(o);
	new MutationObserver((o) => {
		for (const i of o)
			if (i.type === "childList")
				for (const a of i.addedNodes)
					a.tagName === "LINK" && a.rel === "modulepreload" && n(a);
	}).observe(document, { childList: !0, subtree: !0 });
	function r(o) {
		const i = {};
		return (
			o.integrity && (i.integrity = o.integrity),
			o.referrerPolicy && (i.referrerPolicy = o.referrerPolicy),
			o.crossOrigin === "use-credentials"
				? (i.credentials = "include")
				: o.crossOrigin === "anonymous"
				? (i.credentials = "omit")
				: (i.credentials = "same-origin"),
			i
		);
	}
	function n(o) {
		if (o.ep) return;
		o.ep = !0;
		const i = r(o);
		fetch(o.href, i);
	}
})();
var Ie = {},
	ze = {},
	Le = {},
	sr = {
		get exports() {
			return Le;
		},
		set exports(e) {
			Le = e;
		}
	},
	T = String,
	Rt = function () {
		return {
			isColorSupported: !1,
			reset: T,
			bold: T,
			dim: T,
			italic: T,
			underline: T,
			inverse: T,
			hidden: T,
			strikethrough: T,
			black: T,
			red: T,
			green: T,
			yellow: T,
			blue: T,
			magenta: T,
			cyan: T,
			white: T,
			gray: T,
			bgBlack: T,
			bgRed: T,
			bgGreen: T,
			bgYellow: T,
			bgBlue: T,
			bgMagenta: T,
			bgCyan: T,
			bgWhite: T
		};
	};
sr.exports = Rt();
Le.createColors = Rt;
Object.defineProperty(ze, "__esModule", { value: !0 });
ze.dim = cr;
ze.default = void 0;
var ee = lr(Le);
function lr(e) {
	return e && e.__esModule ? e : { default: e };
}
let ft = new Set();
function Ze(e, t, r) {
	(typeof process < "u" && {}.JEST_WORKER_ID) ||
		(r && ft.has(r)) ||
		(r && ft.add(r),
		console.warn(""),
		t.forEach((n) => console.warn(e, "-", n)));
}
function cr(e) {
	return ee.default.dim(e);
}
var fr = {
	info(e, t) {
		Ze(
			ee.default.bold(ee.default.cyan("info")),
			...(Array.isArray(e) ? [e] : [t, e])
		);
	},
	warn(e, t) {
		Ze(
			ee.default.bold(ee.default.yellow("warn")),
			...(Array.isArray(e) ? [e] : [t, e])
		);
	},
	risk(e, t) {
		Ze(
			ee.default.bold(ee.default.magenta("risk")),
			...(Array.isArray(e) ? [e] : [t, e])
		);
	}
};
ze.default = fr;
Object.defineProperty(Ie, "__esModule", { value: !0 });
Ie.default = void 0;
var dr = ur(ze);
function ur(e) {
	return e && e.__esModule ? e : { default: e };
}
function ye({ version: e, from: t, to: r }) {
	dr.default.warn(`${t}-color-renamed`, [
		`As of Tailwind CSS ${e}, \`${t}\` has been renamed to \`${r}\`.`,
		"Update your configuration file to silence this warning."
	]);
}
var pr = {
	inherit: "inherit",
	current: "currentColor",
	transparent: "transparent",
	black: "#000",
	white: "#fff",
	slate: {
		50: "#f8fafc",
		100: "#f1f5f9",
		200: "#e2e8f0",
		300: "#cbd5e1",
		400: "#94a3b8",
		500: "#64748b",
		600: "#475569",
		700: "#334155",
		800: "#1e293b",
		900: "#0f172a"
	},
	gray: {
		50: "#f9fafb",
		100: "#f3f4f6",
		200: "#e5e7eb",
		300: "#d1d5db",
		400: "#9ca3af",
		500: "#6b7280",
		600: "#4b5563",
		700: "#374151",
		800: "#1f2937",
		900: "#111827"
	},
	zinc: {
		50: "#fafafa",
		100: "#f4f4f5",
		200: "#e4e4e7",
		300: "#d4d4d8",
		400: "#a1a1aa",
		500: "#71717a",
		600: "#52525b",
		700: "#3f3f46",
		800: "#27272a",
		900: "#18181b"
	},
	neutral: {
		50: "#fafafa",
		100: "#f5f5f5",
		200: "#e5e5e5",
		300: "#d4d4d4",
		400: "#a3a3a3",
		500: "#737373",
		600: "#525252",
		700: "#404040",
		800: "#262626",
		900: "#171717"
	},
	stone: {
		50: "#fafaf9",
		100: "#f5f5f4",
		200: "#e7e5e4",
		300: "#d6d3d1",
		400: "#a8a29e",
		500: "#78716c",
		600: "#57534e",
		700: "#44403c",
		800: "#292524",
		900: "#1c1917"
	},
	red: {
		50: "#fef2f2",
		100: "#fee2e2",
		200: "#fecaca",
		300: "#fca5a5",
		400: "#f87171",
		500: "#ef4444",
		600: "#dc2626",
		700: "#b91c1c",
		800: "#991b1b",
		900: "#7f1d1d"
	},
	orange: {
		50: "#fff7ed",
		100: "#ffedd5",
		200: "#fed7aa",
		300: "#fdba74",
		400: "#fb923c",
		500: "#f97316",
		600: "#ea580c",
		700: "#c2410c",
		800: "#9a3412",
		900: "#7c2d12"
	},
	amber: {
		50: "#fffbeb",
		100: "#fef3c7",
		200: "#fde68a",
		300: "#fcd34d",
		400: "#fbbf24",
		500: "#f59e0b",
		600: "#d97706",
		700: "#b45309",
		800: "#92400e",
		900: "#78350f"
	},
	yellow: {
		50: "#fefce8",
		100: "#fef9c3",
		200: "#fef08a",
		300: "#fde047",
		400: "#facc15",
		500: "#eab308",
		600: "#ca8a04",
		700: "#a16207",
		800: "#854d0e",
		900: "#713f12"
	},
	lime: {
		50: "#f7fee7",
		100: "#ecfccb",
		200: "#d9f99d",
		300: "#bef264",
		400: "#a3e635",
		500: "#84cc16",
		600: "#65a30d",
		700: "#4d7c0f",
		800: "#3f6212",
		900: "#365314"
	},
	green: {
		50: "#f0fdf4",
		100: "#dcfce7",
		200: "#bbf7d0",
		300: "#86efac",
		400: "#4ade80",
		500: "#22c55e",
		600: "#16a34a",
		700: "#15803d",
		800: "#166534",
		900: "#14532d"
	},
	emerald: {
		50: "#ecfdf5",
		100: "#d1fae5",
		200: "#a7f3d0",
		300: "#6ee7b7",
		400: "#34d399",
		500: "#10b981",
		600: "#059669",
		700: "#047857",
		800: "#065f46",
		900: "#064e3b"
	},
	teal: {
		50: "#f0fdfa",
		100: "#ccfbf1",
		200: "#99f6e4",
		300: "#5eead4",
		400: "#2dd4bf",
		500: "#14b8a6",
		600: "#0d9488",
		700: "#0f766e",
		800: "#115e59",
		900: "#134e4a"
	},
	cyan: {
		50: "#ecfeff",
		100: "#cffafe",
		200: "#a5f3fc",
		300: "#67e8f9",
		400: "#22d3ee",
		500: "#06b6d4",
		600: "#0891b2",
		700: "#0e7490",
		800: "#155e75",
		900: "#164e63"
	},
	sky: {
		50: "#f0f9ff",
		100: "#e0f2fe",
		200: "#bae6fd",
		300: "#7dd3fc",
		400: "#38bdf8",
		500: "#0ea5e9",
		600: "#0284c7",
		700: "#0369a1",
		800: "#075985",
		900: "#0c4a6e"
	},
	blue: {
		50: "#eff6ff",
		100: "#dbeafe",
		200: "#bfdbfe",
		300: "#93c5fd",
		400: "#60a5fa",
		500: "#3b82f6",
		600: "#2563eb",
		700: "#1d4ed8",
		800: "#1e40af",
		900: "#1e3a8a"
	},
	indigo: {
		50: "#eef2ff",
		100: "#e0e7ff",
		200: "#c7d2fe",
		300: "#a5b4fc",
		400: "#818cf8",
		500: "#6366f1",
		600: "#4f46e5",
		700: "#4338ca",
		800: "#3730a3",
		900: "#312e81"
	},
	violet: {
		50: "#f5f3ff",
		100: "#ede9fe",
		200: "#ddd6fe",
		300: "#c4b5fd",
		400: "#a78bfa",
		500: "#8b5cf6",
		600: "#7c3aed",
		700: "#6d28d9",
		800: "#5b21b6",
		900: "#4c1d95"
	},
	purple: {
		50: "#faf5ff",
		100: "#f3e8ff",
		200: "#e9d5ff",
		300: "#d8b4fe",
		400: "#c084fc",
		500: "#a855f7",
		600: "#9333ea",
		700: "#7e22ce",
		800: "#6b21a8",
		900: "#581c87"
	},
	fuchsia: {
		50: "#fdf4ff",
		100: "#fae8ff",
		200: "#f5d0fe",
		300: "#f0abfc",
		400: "#e879f9",
		500: "#d946ef",
		600: "#c026d3",
		700: "#a21caf",
		800: "#86198f",
		900: "#701a75"
	},
	pink: {
		50: "#fdf2f8",
		100: "#fce7f3",
		200: "#fbcfe8",
		300: "#f9a8d4",
		400: "#f472b6",
		500: "#ec4899",
		600: "#db2777",
		700: "#be185d",
		800: "#9d174d",
		900: "#831843"
	},
	rose: {
		50: "#fff1f2",
		100: "#ffe4e6",
		200: "#fecdd3",
		300: "#fda4af",
		400: "#fb7185",
		500: "#f43f5e",
		600: "#e11d48",
		700: "#be123c",
		800: "#9f1239",
		900: "#881337"
	},
	get lightBlue() {
		return ye({ version: "v2.2", from: "lightBlue", to: "sky" }), this.sky;
	},
	get warmGray() {
		return ye({ version: "v3.0", from: "warmGray", to: "stone" }), this.stone;
	},
	get trueGray() {
		return (
			ye({ version: "v3.0", from: "trueGray", to: "neutral" }), this.neutral
		);
	},
	get coolGray() {
		return ye({ version: "v3.0", from: "coolGray", to: "gray" }), this.gray;
	},
	get blueGray() {
		return ye({ version: "v3.0", from: "blueGray", to: "slate" }), this.slate;
	}
};
Ie.default = pr;
let Je = Ie;
var dt = (Je.__esModule ? Je : { default: Je }).default;
const Rn = [
		"red",
		"green",
		"blue",
		"yellow",
		"purple",
		"teal",
		"orange",
		"cyan",
		"lime",
		"pink"
	],
	gr = [
		{ color: "red", primary: 600, secondary: 100 },
		{ color: "green", primary: 600, secondary: 100 },
		{ color: "blue", primary: 600, secondary: 100 },
		{ color: "yellow", primary: 500, secondary: 100 },
		{ color: "purple", primary: 600, secondary: 100 },
		{ color: "teal", primary: 600, secondary: 100 },
		{ color: "orange", primary: 600, secondary: 100 },
		{ color: "cyan", primary: 600, secondary: 100 },
		{ color: "lime", primary: 500, secondary: 100 },
		{ color: "pink", primary: 600, secondary: 100 }
	],
	Pn = gr.reduce(
		(e, { color: t, primary: r, secondary: n }) => ({
			...e,
			[t]: { primary: dt[t][r], secondary: dt[t][n] }
		}),
		{}
	),
	mr = "modulepreload",
	_r = function (e, t) {
		return new URL(e, t).href;
	},
	ut = {},
	pt = function (t, r, n) {
		if (!r || r.length === 0) return t();
		const o = document.getElementsByTagName("link");
		return Promise.all(
			r.map((i) => {
				if (((i = _r(i, n)), i in ut)) return;
				ut[i] = !0;
				const a = i.endsWith(".css"),
					s = a ? '[rel="stylesheet"]' : "";
				if (!!n)
					for (let c = o.length - 1; c >= 0; c--) {
						const d = o[c];
						if (d.href === i && (!a || d.rel === "stylesheet")) return;
					}
				else if (document.querySelector(`link[href="${i}"]${s}`)) return;
				const l = document.createElement("link");
				if (
					((l.rel = a ? "stylesheet" : mr),
					a || ((l.as = "script"), (l.crossOrigin = "")),
					(l.href = i),
					document.head.appendChild(l),
					a)
				)
					return new Promise((c, d) => {
						l.addEventListener("load", c),
							l.addEventListener("error", () =>
								d(new Error(`Unable to preload CSS for ${i}`))
							);
					});
			})
		).then(() => t());
	};
function R() {}
const at = (e) => e;
function Pt(e, t) {
	for (const r in t) e[r] = t[r];
	return e;
}
function Ft(e) {
	return e();
}
function gt() {
	return Object.create(null);
}
function X(e) {
	e.forEach(Ft);
}
function ue(e) {
	return typeof e == "function";
}
function Ae(e, t) {
	return e != e
		? t == t
		: e !== t || (e && typeof e == "object") || typeof e == "function";
}
let Ce;
function br(e, t) {
	return Ce || (Ce = document.createElement("a")), (Ce.href = t), e === Ce.href;
}
function hr(e) {
	return Object.keys(e).length === 0;
}
function Ut(e, ...t) {
	if (e == null) return R;
	const r = e.subscribe(...t);
	return r.unsubscribe ? () => r.unsubscribe() : r;
}
function Ne(e, t, r) {
	e.$$.on_destroy.push(Ut(t, r));
}
function Bt(e, t, r, n) {
	if (e) {
		const o = It(e, t, r, n);
		return e[0](o);
	}
}
function It(e, t, r, n) {
	return e[1] && n ? Pt(r.ctx.slice(), e[1](n(t))) : r.ctx;
}
function Wt(e, t, r, n) {
	if (e[2] && n) {
		const o = e[2](n(r));
		if (t.dirty === void 0) return o;
		if (typeof o == "object") {
			const i = [],
				a = Math.max(t.dirty.length, o.length);
			for (let s = 0; s < a; s += 1) i[s] = t.dirty[s] | o[s];
			return i;
		}
		return t.dirty | o;
	}
	return t.dirty;
}
function Gt(e, t, r, n, o, i) {
	if (o) {
		const a = It(t, r, n, i);
		e.p(a, o);
	}
}
function Vt(e) {
	if (e.ctx.length > 32) {
		const t = [],
			r = e.ctx.length / 32;
		for (let n = 0; n < r; n++) t[n] = -1;
		return t;
	}
	return -1;
}
function Fn(e) {
	return e ?? "";
}
function Un(e, t, r) {
	return e.set(r), t;
}
function Bn(e) {
	return e && ue(e.destroy) ? e.destroy : R;
}
function mt(e) {
	const t = typeof e == "string" && e.match(/^\s*(-?[\d.]+)([^\s]*)\s*$/);
	return t ? [parseFloat(t[1]), t[2] || "px"] : [e, "px"];
}
const Dt = typeof window < "u";
let Te = Dt ? () => window.performance.now() : () => Date.now(),
	st = Dt ? (e) => requestAnimationFrame(e) : R;
const ce = new Set();
function Ht(e) {
	ce.forEach((t) => {
		t.c(e) || (ce.delete(t), t.f());
	}),
		ce.size !== 0 && st(Ht);
}
function lt(e) {
	let t;
	return (
		ce.size === 0 && st(Ht),
		{
			promise: new Promise((r) => {
				ce.add((t = { c: e, f: r }));
			}),
			abort() {
				ce.delete(t);
			}
		}
	);
}
function A(e, t) {
	e.appendChild(t);
}
function Zt(e) {
	if (!e) return document;
	const t = e.getRootNode ? e.getRootNode() : e.ownerDocument;
	return t && t.host ? t : e.ownerDocument;
}
function yr(e) {
	const t = S("style");
	return wr(Zt(e), t), t.sheet;
}
function wr(e, t) {
	return A(e.head || e, t), t.sheet;
}
function v(e, t, r) {
	e.insertBefore(t, r || null);
}
function w(e) {
	e.parentNode && e.parentNode.removeChild(e);
}
function Jt(e, t) {
	for (let r = 0; r < e.length; r += 1) e[r] && e[r].d(t);
}
function S(e) {
	return document.createElement(e);
}
function H(e) {
	return document.createElementNS("http://www.w3.org/2000/svg", e);
}
function j(e) {
	return document.createTextNode(e);
}
function U() {
	return j(" ");
}
function K() {
	return j("");
}
function Oe(e, t, r, n) {
	return e.addEventListener(t, r, n), () => e.removeEventListener(t, r, n);
}
function In(e) {
	return function (t) {
		return t.preventDefault(), e.call(this, t);
	};
}
function vr(e) {
	return function (t) {
		return t.stopPropagation(), e.call(this, t);
	};
}
function b(e, t, r) {
	r == null
		? e.removeAttribute(t)
		: e.getAttribute(t) !== r && e.setAttribute(t, r);
}
function kr(e, t) {
	const r = Object.getOwnPropertyDescriptors(e.__proto__);
	for (const n in t)
		t[n] == null
			? e.removeAttribute(n)
			: n === "style"
			? (e.style.cssText = t[n])
			: n === "__value"
			? (e.value = e[n] = t[n])
			: r[n] && r[n].set
			? (e[n] = t[n])
			: b(e, n, t[n]);
}
function xr(e, t) {
	Object.keys(t).forEach((r) => {
		zr(e, r, t[r]);
	});
}
function zr(e, t, r) {
	t in e ? (e[t] = typeof e[t] == "boolean" && r === "" ? !0 : r) : b(e, t, r);
}
function Wn(e) {
	return /-/.test(e) ? xr : kr;
}
function Gn(e) {
	let t;
	return {
		p(...r) {
			(t = r), t.forEach((n) => e.push(n));
		},
		r() {
			t.forEach((r) => e.splice(e.indexOf(r), 1));
		}
	};
}
function Vn(e) {
	return e === "" ? null : +e;
}
function Ar(e) {
	return Array.from(e.childNodes);
}
function W(e, t) {
	(t = "" + t), e.wholeText !== t && (e.data = t);
}
function Dn(e, t) {
	e.value = t ?? "";
}
function B(e, t, r, n) {
	r === null
		? e.style.removeProperty(t)
		: e.style.setProperty(t, r, n ? "important" : "");
}
let Se;
function Er() {
	if (Se === void 0) {
		Se = !1;
		try {
			typeof window < "u" && window.parent && window.parent.document;
		} catch {
			Se = !0;
		}
	}
	return Se;
}
function Hn(e, t) {
	getComputedStyle(e).position === "static" && (e.style.position = "relative");
	const n = S("iframe");
	n.setAttribute(
		"style",
		"display: block; position: absolute; top: 0; left: 0; width: 100%; height: 100%; overflow: hidden; border: 0; opacity: 0; pointer-events: none; z-index: -1;"
	),
		n.setAttribute("aria-hidden", "true"),
		(n.tabIndex = -1);
	const o = Er();
	let i;
	return (
		o
			? ((n.src =
					"data:text/html,<script>onresize=function(){parent.postMessage(0,'*')}</script>"),
			  (i = Oe(window, "message", (a) => {
					a.source === n.contentWindow && t();
			  })))
			: ((n.src = "about:blank"),
			  (n.onload = () => {
					(i = Oe(n.contentWindow, "resize", t)), t();
			  })),
		A(e, n),
		() => {
			(o || (i && n.contentWindow)) && i(), w(n);
		}
	);
}
function F(e, t, r) {
	e.classList[r ? "add" : "remove"](t);
}
function Qt(e, t, { bubbles: r = !1, cancelable: n = !1 } = {}) {
	const o = document.createEvent("CustomEvent");
	return o.initCustomEvent(e, r, n, t), o;
}
class Zn {
	constructor(t = !1) {
		(this.is_svg = !1), (this.is_svg = t), (this.e = this.n = null);
	}
	c(t) {
		this.h(t);
	}
	m(t, r, n = null) {
		this.e ||
			(this.is_svg
				? (this.e = H(r.nodeName))
				: (this.e = S(r.nodeType === 11 ? "TEMPLATE" : r.nodeName)),
			(this.t = r.tagName !== "TEMPLATE" ? r : r.content),
			this.c(t)),
			this.i(n);
	}
	h(t) {
		(this.e.innerHTML = t),
			(this.n = Array.from(
				this.e.nodeName === "TEMPLATE"
					? this.e.content.childNodes
					: this.e.childNodes
			));
	}
	i(t) {
		for (let r = 0; r < this.n.length; r += 1) v(this.t, this.n[r], t);
	}
	p(t) {
		this.d(), this.h(t), this.i(this.a);
	}
	d() {
		this.n.forEach(w);
	}
}
function Jn(e, t) {
	return new e(t);
}
const Re = new Map();
let Pe = 0;
function Mr(e) {
	let t = 5381,
		r = e.length;
	for (; r--; ) t = ((t << 5) - t) ^ e.charCodeAt(r);
	return t >>> 0;
}
function Cr(e, t) {
	const r = { stylesheet: yr(t), rules: {} };
	return Re.set(e, r), r;
}
function Ye(e, t, r, n, o, i, a, s = 0) {
	const f = 16.666 / n;
	let l = `{
`;
	for (let h = 0; h <= 1; h += f) {
		const k = t + (r - t) * i(h);
		l +=
			h * 100 +
			`%{${a(k, 1 - k)}}
`;
	}
	const c =
			l +
			`100% {${a(r, 1 - r)}}
}`,
		d = `__svelte_${Mr(c)}_${s}`,
		g = Zt(e),
		{ stylesheet: p, rules: u } = Re.get(g) || Cr(g, e);
	u[d] ||
		((u[d] = !0), p.insertRule(`@keyframes ${d} ${c}`, p.cssRules.length));
	const _ = e.style.animation || "";
	return (
		(e.style.animation = `${
			_ ? `${_}, ` : ""
		}${d} ${n}ms linear ${o}ms 1 both`),
		(Pe += 1),
		d
	);
}
function $e(e, t) {
	const r = (e.style.animation || "").split(", "),
		n = r.filter(
			t ? (i) => i.indexOf(t) < 0 : (i) => i.indexOf("__svelte") === -1
		),
		o = r.length - n.length;
	o && ((e.style.animation = n.join(", ")), (Pe -= o), Pe || Sr());
}
function Sr() {
	st(() => {
		Pe ||
			(Re.forEach((e) => {
				const { ownerNode: t } = e.stylesheet;
				t && w(t);
			}),
			Re.clear());
	});
}
let xe;
function ve(e) {
	xe = e;
}
function re() {
	if (!xe) throw new Error("Function called outside component initialization");
	return xe;
}
function Qn(e) {
	re().$$.before_update.push(e);
}
function et(e) {
	re().$$.on_mount.push(e);
}
function Xn(e) {
	re().$$.after_update.push(e);
}
function jr(e) {
	re().$$.on_destroy.push(e);
}
function Kn() {
	const e = re();
	return (t, r, { cancelable: n = !1 } = {}) => {
		const o = e.$$.callbacks[t];
		if (o) {
			const i = Qt(t, r, { cancelable: n });
			return (
				o.slice().forEach((a) => {
					a.call(e, i);
				}),
				!i.defaultPrevented
			);
		}
		return !0;
	};
}
function Yn(e, t) {
	return re().$$.context.set(e, t), t;
}
function $n(e) {
	return re().$$.context.get(e);
}
function qr(e, t) {
	const r = e.$$.callbacks[t.type];
	r && r.slice().forEach((n) => n.call(this, t));
}
const se = [],
	te = [];
let fe = [];
const tt = [],
	Xt = Promise.resolve();
let rt = !1;
function Kt() {
	rt || ((rt = !0), Xt.then($t));
}
function Lr() {
	return Kt(), Xt;
}
function de(e) {
	fe.push(e);
}
function Yt(e) {
	tt.push(e);
}
const Qe = new Set();
let ie = 0;
function $t() {
	if (ie !== 0) return;
	const e = xe;
	do {
		try {
			for (; ie < se.length; ) {
				const t = se[ie];
				ie++, ve(t), Nr(t.$$);
			}
		} catch (t) {
			throw ((se.length = 0), (ie = 0), t);
		}
		for (ve(null), se.length = 0, ie = 0; te.length; ) te.pop()();
		for (let t = 0; t < fe.length; t += 1) {
			const r = fe[t];
			Qe.has(r) || (Qe.add(r), r());
		}
		fe.length = 0;
	} while (se.length);
	for (; tt.length; ) tt.pop()();
	(rt = !1), Qe.clear(), ve(e);
}
function Nr(e) {
	if (e.fragment !== null) {
		e.update(), X(e.before_update);
		const t = e.dirty;
		(e.dirty = [-1]),
			e.fragment && e.fragment.p(e.ctx, t),
			e.after_update.forEach(de);
	}
}
function Tr(e) {
	const t = [],
		r = [];
	fe.forEach((n) => (e.indexOf(n) === -1 ? t.push(n) : r.push(n))),
		r.forEach((n) => n()),
		(fe = t);
}
let we;
function er() {
	return (
		we ||
			((we = Promise.resolve()),
			we.then(() => {
				we = null;
			})),
		we
	);
}
function ke(e, t, r) {
	e.dispatchEvent(Qt(`${t ? "intro" : "outro"}${r}`));
}
const qe = new Set();
let Q;
function Fe() {
	Q = { r: 0, c: [], p: Q };
}
function Ue() {
	Q.r || X(Q.c), (Q = Q.p);
}
function O(e, t) {
	e && e.i && (qe.delete(e), e.i(t));
}
function I(e, t, r, n) {
	if (e && e.o) {
		if (qe.has(e)) return;
		qe.add(e),
			Q.c.push(() => {
				qe.delete(e), n && (r && e.d(1), n());
			}),
			e.o(t);
	} else n && n();
}
const tr = { duration: 0 };
function Or(e, t, r) {
	const n = { direction: "in" };
	let o = t(e, r, n),
		i = !1,
		a,
		s,
		f = 0;
	function l() {
		a && $e(e, a);
	}
	function c() {
		const {
			delay: g = 0,
			duration: p = 300,
			easing: u = at,
			tick: _ = R,
			css: h
		} = o || tr;
		h && (a = Ye(e, 0, 1, p, g, u, h, f++)), _(0, 1);
		const k = Te() + g,
			x = k + p;
		s && s.abort(),
			(i = !0),
			de(() => ke(e, !0, "start")),
			(s = lt((m) => {
				if (i) {
					if (m >= x) return _(1, 0), ke(e, !0, "end"), l(), (i = !1);
					if (m >= k) {
						const E = u((m - k) / p);
						_(E, 1 - E);
					}
				}
				return i;
			}));
	}
	let d = !1;
	return {
		start() {
			d || ((d = !0), $e(e), ue(o) ? ((o = o(n)), er().then(c)) : c());
		},
		invalidate() {
			d = !1;
		},
		end() {
			i && (l(), (i = !1));
		}
	};
}
function eo(e, t, r, n) {
	const o = { direction: "both" };
	let i = t(e, r, o),
		a = n ? 0 : 1,
		s = null,
		f = null,
		l = null;
	function c() {
		l && $e(e, l);
	}
	function d(p, u) {
		const _ = p.b - a;
		return (
			(u *= Math.abs(_)),
			{
				a,
				b: p.b,
				d: _,
				duration: u,
				start: p.start,
				end: p.start + u,
				group: p.group
			}
		);
	}
	function g(p) {
		const {
				delay: u = 0,
				duration: _ = 300,
				easing: h = at,
				tick: k = R,
				css: x
			} = i || tr,
			m = { start: Te() + u, b: p };
		p || ((m.group = Q), (Q.r += 1)),
			s || f
				? (f = m)
				: (x && (c(), (l = Ye(e, a, p, _, u, h, x))),
				  p && k(0, 1),
				  (s = d(m, _)),
				  de(() => ke(e, p, "start")),
				  lt((E) => {
						if (
							(f &&
								E > f.start &&
								((s = d(f, _)),
								(f = null),
								ke(e, s.b, "start"),
								x && (c(), (l = Ye(e, a, s.b, s.duration, 0, h, i.css)))),
							s)
						) {
							if (E >= s.end)
								k((a = s.b), 1 - a),
									ke(e, s.b, "end"),
									f || (s.b ? c() : --s.group.r || X(s.group.c)),
									(s = null);
							else if (E >= s.start) {
								const M = E - s.start;
								(a = s.a + s.d * h(M / s.duration)), k(a, 1 - a);
							}
						}
						return !!(s || f);
				  }));
	}
	return {
		run(p) {
			ue(i)
				? er().then(() => {
						(i = i(o)), g(p);
				  })
				: g(p);
		},
		end() {
			c(), (s = f = null);
		}
	};
}
const to =
	typeof window < "u" ? window : typeof globalThis < "u" ? globalThis : global;
function ro(e, t) {
	e.d(1), t.delete(e.key);
}
function no(e, t) {
	I(e, 1, 1, () => {
		t.delete(e.key);
	});
}
function oo(e, t, r, n, o, i, a, s, f, l, c, d) {
	let g = e.length,
		p = i.length,
		u = g;
	const _ = {};
	for (; u--; ) _[e[u].key] = u;
	const h = [],
		k = new Map(),
		x = new Map(),
		m = [];
	for (u = p; u--; ) {
		const C = d(o, i, u),
			q = r(C);
		let L = a.get(q);
		L ? n && m.push(() => L.p(C, t)) : ((L = l(q, C)), L.c()),
			k.set(q, (h[u] = L)),
			q in _ && x.set(q, Math.abs(u - _[q]));
	}
	const E = new Set(),
		M = new Set();
	function N(C) {
		O(C, 1), C.m(s, c), a.set(C.key, C), (c = C.first), p--;
	}
	for (; g && p; ) {
		const C = h[p - 1],
			q = e[g - 1],
			L = C.key,
			P = q.key;
		C === q
			? ((c = C.first), g--, p--)
			: k.has(P)
			? !a.has(L) || E.has(L)
				? N(C)
				: M.has(P)
				? g--
				: x.get(L) > x.get(P)
				? (M.add(L), N(C))
				: (E.add(P), g--)
			: (f(q, a), g--);
	}
	for (; g--; ) {
		const C = e[g];
		k.has(C.key) || f(C, a);
	}
	for (; p; ) N(h[p - 1]);
	return X(m), h;
}
function Rr(e, t) {
	const r = {},
		n = {},
		o = { $$scope: 1 };
	let i = e.length;
	for (; i--; ) {
		const a = e[i],
			s = t[i];
		if (s) {
			for (const f in a) f in s || (n[f] = 1);
			for (const f in s) o[f] || ((r[f] = s[f]), (o[f] = 1));
			e[i] = s;
		} else for (const f in a) o[f] = 1;
	}
	for (const a in n) a in r || (r[a] = void 0);
	return r;
}
function Pr(e) {
	return typeof e == "object" && e !== null ? e : {};
}
function rr(e, t, r) {
	const n = e.$$.props[t];
	n !== void 0 && ((e.$$.bound[n] = r), r(e.$$.ctx[n]));
}
function Ee(e) {
	e && e.c();
}
function pe(e, t, r, n) {
	const { fragment: o, after_update: i } = e.$$;
	o && o.m(t, r),
		n ||
			de(() => {
				const a = e.$$.on_mount.map(Ft).filter(ue);
				e.$$.on_destroy ? e.$$.on_destroy.push(...a) : X(a),
					(e.$$.on_mount = []);
			}),
		i.forEach(de);
}
function ge(e, t) {
	const r = e.$$;
	r.fragment !== null &&
		(Tr(r.after_update),
		X(r.on_destroy),
		r.fragment && r.fragment.d(t),
		(r.on_destroy = r.fragment = null),
		(r.ctx = []));
}
function Fr(e, t) {
	e.$$.dirty[0] === -1 && (se.push(e), Kt(), e.$$.dirty.fill(0)),
		(e.$$.dirty[(t / 31) | 0] |= 1 << t % 31);
}
function We(e, t, r, n, o, i, a, s = [-1]) {
	const f = xe;
	ve(e);
	const l = (e.$$ = {
		fragment: null,
		ctx: [],
		props: i,
		update: R,
		not_equal: o,
		bound: gt(),
		on_mount: [],
		on_destroy: [],
		on_disconnect: [],
		before_update: [],
		after_update: [],
		context: new Map(t.context || (f ? f.$$.context : [])),
		callbacks: gt(),
		dirty: s,
		skip_bound: !1,
		root: t.target || f.$$.root
	});
	a && a(l.root);
	let c = !1;
	if (
		((l.ctx = r
			? r(e, t.props || {}, (d, g, ...p) => {
					const u = p.length ? p[0] : g;
					return (
						l.ctx &&
							o(l.ctx[d], (l.ctx[d] = u)) &&
							(!l.skip_bound && l.bound[d] && l.bound[d](u), c && Fr(e, d)),
						g
					);
			  })
			: []),
		l.update(),
		(c = !0),
		X(l.before_update),
		(l.fragment = n ? n(l.ctx) : !1),
		t.target)
	) {
		if (t.hydrate) {
			const d = Ar(t.target);
			l.fragment && l.fragment.l(d), d.forEach(w);
		} else l.fragment && l.fragment.c();
		t.intro && O(e.$$.fragment),
			pe(e, t.target, t.anchor, t.customElement),
			$t();
	}
	ve(f);
}
class Ge {
	$destroy() {
		ge(this, 1), (this.$destroy = R);
	}
	$on(t, r) {
		if (!ue(r)) return R;
		const n = this.$$.callbacks[t] || (this.$$.callbacks[t] = []);
		return (
			n.push(r),
			() => {
				const o = n.indexOf(r);
				o !== -1 && n.splice(o, 1);
			}
		);
	}
	$set(t) {
		this.$$set &&
			!hr(t) &&
			((this.$$.skip_bound = !0), this.$$set(t), (this.$$.skip_bound = !1));
	}
}
var Xe =
	(globalThis && globalThis.__awaiter) ||
	function (e, t, r, n) {
		function o(i) {
			return i instanceof r
				? i
				: new r(function (a) {
						a(i);
				  });
		}
		return new (r || (r = Promise))(function (i, a) {
			function s(c) {
				try {
					l(n.next(c));
				} catch (d) {
					a(d);
				}
			}
			function f(c) {
				try {
					l(n.throw(c));
				} catch (d) {
					a(d);
				}
			}
			function l(c) {
				c.done ? i(c.value) : o(c.value).then(s, f);
			}
			l((n = n.apply(e, t || [])).next());
		});
	};
class Ur {
	constructor(t) {
		console.debug("WorkerProxy.constructor(): Create a new worker."),
			(this.worker = new Worker(
				new URL(
					"" + new URL("assets/webworker-b9cd9569.js", import.meta.url).href,
					self.location
				)
			)),
			this.postMessageAsync({
				type: "init",
				data: {
					gradioWheelUrl: t.gradioWheelUrl,
					gradioClientWheelUrl: t.gradioClientWheelUrl,
					requirements: t.requirements
				}
			}).then(() => {
				console.debug("WorkerProxy.constructor(): Initialization is done.");
			});
	}
	runPythonAsync(t) {
		return Xe(this, void 0, void 0, function* () {
			return this.postMessageAsync({ type: "run-python", data: { code: t } });
		});
	}
	postMessageAsync(t) {
		return Xe(this, void 0, void 0, function* () {
			return new Promise((r, n) => {
				const o = new MessageChannel();
				(o.port1.onmessage = (i) => {
					o.port1.close();
					const a = i.data;
					if (a.type === "reply:error") {
						n(a.error);
						return;
					}
					r(a.data);
				}),
					this.worker.postMessage(t, [o.port2]);
			});
		});
	}
	httpRequest(t) {
		return Xe(this, void 0, void 0, function* () {
			const n = (yield this.postMessageAsync({
				type: "http-request",
				data: { request: t }
			})).response;
			if (Math.floor(n.status / 100) !== 2) {
				let o, i;
				try {
					o = new TextDecoder().decode(n.body);
				} catch {
					o = "(failed to decode body)";
				}
				try {
					i = JSON.parse(o);
				} catch {
					i = "(failed to parse body as JSON)";
				}
				console.error("Wasm HTTP error", {
					request: t,
					response: n,
					bodyText: o,
					bodyJson: i
				});
			}
			return n;
		});
	}
}
var ct =
	(globalThis && globalThis.__awaiter) ||
	function (e, t, r, n) {
		function o(i) {
			return i instanceof r
				? i
				: new r(function (a) {
						a(i);
				  });
		}
		return new (r || (r = Promise))(function (i, a) {
			function s(c) {
				try {
					l(n.next(c));
				} catch (d) {
					a(d);
				}
			}
			function f(c) {
				try {
					l(n.throw(c));
				} catch (d) {
					a(d);
				}
			}
			function l(c) {
				c.done ? i(c.value) : o(c.value).then(s, f);
			}
			l((n = n.apply(e, t || [])).next());
		});
	};
const Br = "Connection errored out.";
function Ir(e, t, r) {
	return ct(this, void 0, void 0, function* () {
		try {
			const n = yield e.httpRequest({
					method: "POST",
					headers: { "Content-Type": "application/json" },
					path: t,
					query_string: "",
					body: new TextEncoder().encode(JSON.stringify(r))
				}),
				o =
					typeof n.body == "string" ? n.body : new TextDecoder().decode(n.body);
			return [JSON.parse(o), n.status];
		} catch {
			return [{ error: Br }, 500];
		}
	});
}
function Wr(e, t) {
	return ct(this, void 0, void 0, function* () {
		const r = { predict: u, on: l, off: c, cancel: d },
			n = {},
			o = Math.random().toString(36).substring(2),
			i = new Map();
		let a,
			s = {};
		function f(_) {
			return (a = _), Object.assign({ config: a }, r);
		}
		function l(_, h) {
			const k = n;
			let x = k[_] || [];
			return (
				(k[_] = x),
				x?.push(h),
				Object.assign(Object.assign({}, r), { config: a })
			);
		}
		function c(_, h) {
			const k = n;
			let x = k[_] || [];
			return (
				(x = x?.filter((m) => m !== h)),
				(k[_] = x),
				Object.assign(Object.assign({}, r), { config: a })
			);
		}
		function d(_, h) {
			var k;
			const x = typeof h == "number" ? h : s[_];
			g({
				type: "status",
				endpoint: _,
				fn_index: x,
				status: "complete",
				queue: !1
			}),
				(k = i.get(x)) === null || k === void 0 || k.close();
		}
		function g(_) {
			let k = n[_.type] || [];
			k?.forEach((x) => x(_));
		}
		function p(_, h) {
			return new Promise((k, x) => {
				const m = _.replace(/^\//, "");
				let E = typeof h.fn_index == "number" ? h.fn_index : s[m];
				g({
					type: "status",
					endpoint: _,
					status: "pending",
					queue: !1,
					fn_index: E
				}),
					Ir(
						e,
						`/run${_.startsWith("/") ? _ : `/${_}`}`,
						Object.assign(Object.assign({}, h), { session_hash: o })
					)
						.then(([M, N]) => {
							N == 200
								? (g({
										type: "status",
										endpoint: _,
										fn_index: E,
										status: "complete",
										eta: M.average_duration,
										queue: !1
								  }),
								  g({ type: "data", endpoint: _, fn_index: E, data: M.data }))
								: g({
										type: "status",
										status: "error",
										endpoint: _,
										fn_index: E,
										message: M.error,
										queue: !1
								  });
						})
						.catch((M) => {
							throw (
								(g({
									type: "status",
									status: "error",
									message: M.message,
									endpoint: _,
									fn_index: E,
									queue: !1
								}),
								new Error(M.message))
							);
						});
			});
		}
		function u(_, h) {
			return p(_, h);
		}
		return (a = yield Gr(e, "")), f(a);
	});
}
function Gr(e, t) {
	var r;
	return ct(this, void 0, void 0, function* () {
		const n = yield e.httpRequest({
			method: "GET",
			path: `${t}/config`,
			query_string: "",
			body: new Uint8Array([]),
			headers: {}
		});
		if (
			(console.debug(
				"config response",
				Object.assign(Object.assign({}, n), {
					body:
						typeof n.body == "string"
							? n.body
							: new TextDecoder().decode(n.body)
				})
			),
			n.status === 200)
		) {
			const o =
					typeof n.body == "string" ? n.body : new TextDecoder().decode(n.body),
				i = JSON.parse(o);
			return (
				(i.path = (r = i.path) !== null && r !== void 0 ? r : ""),
				(i.root = t),
				i
			);
		} else throw new Error("Could not get config.");
	});
}
var Vr =
	(globalThis && globalThis.__awaiter) ||
	function (e, t, r, n) {
		function o(i) {
			return i instanceof r
				? i
				: new r(function (a) {
						a(i);
				  });
		}
		return new (r || (r = Promise))(function (i, a) {
			function s(c) {
				try {
					l(n.next(c));
				} catch (d) {
					a(d);
				}
			}
			function f(c) {
				try {
					l(n.throw(c));
				} catch (d) {
					a(d);
				}
			}
			function l(c) {
				c.done ? i(c.value) : o(c.value).then(s, f);
			}
			l((n = n.apply(e, t || [])).next());
		});
	};
function Dr(e, t, r) {
	return Vr(this, void 0, void 0, function* () {
		const n = yield e.httpRequest({
				method: "GET",
				path: t,
				query_string: "",
				headers: {},
				body: new Uint8Array([])
			}),
			o = new TextDecoder().decode(n.body);
		if (document.querySelector(`style[data-wasm-path='${t}']`)) return;
		const a = document.createElement("style");
		a.setAttribute("data-wasm-path", t), (a.textContent = o), r.appendChild(a);
	});
}
const Hr = "__ENTRY_CSS__";
let nt;
nt = "__FONTS_CSS__";
function Be(e, t) {
	if (document.querySelector(`link[href='${e}']`)) return Promise.resolve();
	const n = document.createElement("link");
	return (
		(n.rel = "stylesheet"),
		(n.href = e),
		t.appendChild(n),
		new Promise((o, i) => {
			n.addEventListener("load", () => o()),
				n.addEventListener("error", () =>
					i(new Error(`Unable to preload CSS for ${e}`))
				);
		})
	);
}
function Zr() {
	class e extends HTMLElement {
		constructor() {
			super();
		}
		async connectedCallback() {
			typeof nt != "string" && nt.forEach((_) => Be(_, document.head)),
				await Be(Hr, document.head);
			const r = new CustomEvent("domchange", {
				bubbles: !0,
				cancelable: !1,
				composed: !0
			});
			var n = new MutationObserver((_) => {
				this.dispatchEvent(r);
			});
			n.observe(this, { childList: !0 });
			const o = this.getAttribute("host"),
				i = this.getAttribute("space"),
				a = this.getAttribute("src"),
				s = this.getAttribute("control_page_title"),
				f = this.getAttribute("initial_height") ?? "300px",
				l = this.getAttribute("embed") ?? "true",
				c = this.getAttribute("container") ?? "true",
				d = this.getAttribute("info") ?? !0,
				g = this.getAttribute("autoscroll"),
				p = this.getAttribute("eager"),
				u = this.getAttribute("theme_mode");
			new nr({
				target: this,
				props: {
					space: i && i.trim(),
					src: a && a.trim(),
					host: o && o.trim(),
					info: d !== "false",
					container: c !== "false",
					is_embed: l !== "false",
					initial_height: f ?? void 0,
					eager: p === "true",
					version: "3-29-0",
					theme_mode: u,
					autoscroll: g === "true",
					control_page_title: s === "true",
					app_mode: window.__gradio_mode__ === "app"
				}
			});
		}
	}
	customElements.get("gradio-app") || customElements.define("gradio-app", e);
}
Zr();
const ae = [];
function Jr(e, t) {
	return { subscribe: Me(e, t).subscribe };
}
function Me(e, t = R) {
	let r;
	const n = new Set();
	function o(s) {
		if (Ae(e, s) && ((e = s), r)) {
			const f = !ae.length;
			for (const l of n) l[1](), ae.push(l, e);
			if (f) {
				for (let l = 0; l < ae.length; l += 2) ae[l][0](ae[l + 1]);
				ae.length = 0;
			}
		}
	}
	function i(s) {
		o(s(e));
	}
	function a(s, f = R) {
		const l = [s, f];
		return (
			n.add(l),
			n.size === 1 && (r = t(o) || R),
			s(e),
			() => {
				n.delete(l), n.size === 0 && r && (r(), (r = null));
			}
		);
	}
	return { set: o, update: i, subscribe: a };
}
function io(e, t, r) {
	const n = !Array.isArray(e),
		o = n ? [e] : e,
		i = t.length < 2;
	return Jr(r, (a) => {
		let s = !1;
		const f = [];
		let l = 0,
			c = R;
		const d = () => {
				if (l) return;
				c();
				const p = t(n ? f[0] : f, a);
				i ? a(p) : (c = ue(p) ? p : R);
			},
			g = o.map((p, u) =>
				Ut(
					p,
					(_) => {
						(f[u] = _), (l &= ~(1 << u)), s && d();
					},
					() => {
						l |= 1 << u;
					}
				)
			);
		return (
			(s = !0),
			d(),
			function () {
				X(g), c(), (s = !1);
			}
		);
	});
}
const Qr =
		"" + new URL("assets/gradio-3.29.0-py3-none-any.whl", import.meta.url).href,
	Xr =
		"" +
		new URL("assets/gradio_client-0.2.3-py3-none-any.whl", import.meta.url)
			.href,
	Kr = "" + new URL("assets/spaces-a79177ad.svg", import.meta.url).href;
function _t(e) {
	let t, r, n, o, i, a, s, f, l, c, d, g, p, u, _;
	return {
		c() {
			(t = S("div")),
				(r = S("span")),
				(n = S("a")),
				(o = j(e[4])),
				(a = U()),
				(s = S("span")),
				(s.innerHTML = `built with
				<a class="gradio svelte-1mya07g" href="https://gradio.app">Gradio</a>.`),
				(f = U()),
				(l = S("span")),
				(c = j(`Hosted on
				`)),
				(d = S("a")),
				(g = S("span")),
				(p = S("img")),
				(_ = j(" Spaces")),
				b(n, "href", (i = "https://huggingface.co/spaces/" + e[4])),
				b(n, "class", "title svelte-1mya07g"),
				b(r, "class", "svelte-1mya07g"),
				b(s, "class", "svelte-1mya07g"),
				br(p.src, (u = Kr)) || b(p, "src", u),
				b(p, "class", "svelte-1mya07g"),
				b(g, "class", "space-logo svelte-1mya07g"),
				b(d, "class", "hf svelte-1mya07g"),
				b(d, "href", "https://huggingface.co/spaces"),
				b(l, "class", "svelte-1mya07g"),
				b(t, "class", "info svelte-1mya07g");
		},
		m(h, k) {
			v(h, t, k),
				A(t, r),
				A(r, n),
				A(n, o),
				A(t, a),
				A(t, s),
				A(t, f),
				A(t, l),
				A(l, c),
				A(l, d),
				A(d, g),
				A(g, p),
				A(d, _);
		},
		p(h, k) {
			k & 16 && W(o, h[4]),
				k & 16 &&
					i !== (i = "https://huggingface.co/spaces/" + h[4]) &&
					b(n, "href", i);
		},
		d(h) {
			h && w(t);
		}
	};
}
function Yr(e) {
	let t, r, n, o, i;
	const a = e[9].default,
		s = Bt(a, e, e[8], null);
	let f = e[5] && e[4] && e[6] && _t(e);
	return {
		c() {
			(t = S("div")),
				(r = S("div")),
				s && s.c(),
				(n = U()),
				f && f.c(),
				b(r, "class", "main svelte-1mya07g"),
				b(
					t,
					"class",
					(o = "gradio-container gradio-container-" + e[1] + " svelte-1mya07g")
				),
				F(t, "app", !e[5] && !e[3]),
				F(t, "embed-container", e[5]),
				F(t, "with-info", e[6]),
				B(t, "min-height", e[7] ? "initial" : e[2]),
				B(t, "flex-grow", e[5] ? "auto" : "1");
		},
		m(l, c) {
			v(l, t, c),
				A(t, r),
				s && s.m(r, null),
				A(t, n),
				f && f.m(t, null),
				e[10](t),
				(i = !0);
		},
		p(l, [c]) {
			s &&
				s.p &&
				(!i || c & 256) &&
				Gt(s, a, l, l[8], i ? Wt(a, l[8], c, null) : Vt(l[8]), null),
				l[5] && l[4] && l[6]
					? f
						? f.p(l, c)
						: ((f = _t(l)), f.c(), f.m(t, null))
					: f && (f.d(1), (f = null)),
				(!i ||
					(c & 2 &&
						o !==
							(o =
								"gradio-container gradio-container-" +
								l[1] +
								" svelte-1mya07g"))) &&
					b(t, "class", o),
				(!i || c & 42) && F(t, "app", !l[5] && !l[3]),
				(!i || c & 34) && F(t, "embed-container", l[5]),
				(!i || c & 66) && F(t, "with-info", l[6]),
				c & 132 && B(t, "min-height", l[7] ? "initial" : l[2]),
				c & 32 && B(t, "flex-grow", l[5] ? "auto" : "1");
		},
		i(l) {
			i || (O(s, l), (i = !0));
		},
		o(l) {
			I(s, l), (i = !1);
		},
		d(l) {
			l && w(t), s && s.d(l), f && f.d(), e[10](null);
		}
	};
}
function $r(e, t, r) {
	let { $$slots: n = {}, $$scope: o } = t,
		{ wrapper: i } = t,
		{ version: a } = t,
		{ initial_height: s } = t,
		{ is_embed: f } = t,
		{ space: l } = t,
		{ display: c } = t,
		{ info: d } = t,
		{ loaded: g } = t;
	function p(u) {
		te[u ? "unshift" : "push"](() => {
			(i = u), r(0, i);
		});
	}
	return (
		(e.$$set = (u) => {
			"wrapper" in u && r(0, (i = u.wrapper)),
				"version" in u && r(1, (a = u.version)),
				"initial_height" in u && r(2, (s = u.initial_height)),
				"is_embed" in u && r(3, (f = u.is_embed)),
				"space" in u && r(4, (l = u.space)),
				"display" in u && r(5, (c = u.display)),
				"info" in u && r(6, (d = u.info)),
				"loaded" in u && r(7, (g = u.loaded)),
				"$$scope" in u && r(8, (o = u.$$scope));
		}),
		[i, a, s, f, l, c, d, g, o, n, p]
	);
}
class en extends Ge {
	constructor(t) {
		super(),
			We(this, t, $r, Yr, Ae, {
				wrapper: 0,
				version: 1,
				initial_height: 2,
				is_embed: 3,
				space: 4,
				display: 5,
				info: 6,
				loaded: 7
			});
	}
}
const le = (e) => {
	let t = ["", "k", "M", "G", "T", "P", "E", "Z"],
		r = 0;
	for (; e > 1e3 && r < t.length - 1; ) (e /= 1e3), r++;
	let n = t[r];
	return (Number.isInteger(e) ? e : e.toFixed(1)) + n;
};
function tn(e) {
	const t = e - 1;
	return t * t * t + 1;
}
function rn(e, { delay: t = 0, duration: r = 400, easing: n = at } = {}) {
	const o = +getComputedStyle(e).opacity;
	return { delay: t, duration: r, easing: n, css: (i) => `opacity: ${i * o}` };
}
function ao(
	e,
	{
		delay: t = 0,
		duration: r = 400,
		easing: n = tn,
		x: o = 0,
		y: i = 0,
		opacity: a = 0
	} = {}
) {
	const s = getComputedStyle(e),
		f = +s.opacity,
		l = s.transform === "none" ? "" : s.transform,
		c = f * (1 - a),
		[d, g] = mt(o),
		[p, u] = mt(i);
	return {
		delay: t,
		duration: r,
		easing: n,
		css: (_, h) => `
			transform: ${l} translate(${(1 - _) * d}${g}, ${(1 - _) * p}${u});
			opacity: ${f - c * h}`
	};
}
function so() {
	const e = Me({}),
		t = [],
		r = [],
		n = new Map(),
		o = new Map(),
		i = new Map(),
		a = [];
	function s({
		fn_index: l,
		status: c,
		queue: d = !0,
		size: g,
		position: p = null,
		eta: u = null,
		message: _ = null,
		progress: h
	}) {
		const k = r[l],
			x = t[l],
			m = a[l],
			E = k.map((M) => {
				let N;
				const C = n.get(M) || 0;
				if (m === "pending" && c !== "pending") {
					let q = C - 1;
					n.set(M, q < 0 ? 0 : q), (N = q > 0 ? "pending" : c);
				} else
					m === "pending" && c === "pending"
						? (N = "pending")
						: m !== "pending" && c === "pending"
						? ((N = "pending"), n.set(M, C + 1))
						: (N = c);
				return {
					id: M,
					queue_position: p,
					queue_size: g,
					eta: u,
					status: N,
					message: _,
					progress: h
				};
			});
		x.map((M) => {
			const N = o.get(M) || 0;
			if (m === "pending" && c !== "pending") {
				let C = N - 1;
				o.set(M, C < 0 ? 0 : C), i.set(M, c);
			} else
				m !== "pending" && c === "pending"
					? (o.set(M, N + 1), i.set(M, c))
					: i.delete(M);
		}),
			e.update(
				(M) => (
					E.forEach(
						({
							id: N,
							queue_position: C,
							queue_size: q,
							eta: L,
							status: P,
							message: ne,
							progress: G
						}) => {
							M[N] = {
								queue: d,
								queue_size: q,
								queue_position: C,
								eta: L,
								message: ne,
								progress: G,
								status: P,
								fn_index: l
							};
						}
					),
					M
				)
			),
			(a[l] = c);
	}
	function f(l, c, d) {
		(t[l] = c), (r[l] = d);
	}
	return {
		update: s,
		register: f,
		subscribe: e.subscribe,
		get_status_for_fn(l) {
			return a[l];
		},
		get_inputs_to_update() {
			return i;
		}
	};
}
const nn = Me({ autoscroll: !1 });
function bt(e) {
	return Object.prototype.toString.call(e) === "[object Date]";
}
function ot(e, t, r, n) {
	if (typeof r == "number" || bt(r)) {
		const o = n - r,
			i = (r - t) / (e.dt || 1 / 60),
			a = e.opts.stiffness * o,
			s = e.opts.damping * i,
			f = (a - s) * e.inv_mass,
			l = (i + f) * e.dt;
		return Math.abs(l) < e.opts.precision && Math.abs(o) < e.opts.precision
			? n
			: ((e.settled = !1), bt(r) ? new Date(r.getTime() + l) : r + l);
	} else {
		if (Array.isArray(r)) return r.map((o, i) => ot(e, t[i], r[i], n[i]));
		if (typeof r == "object") {
			const o = {};
			for (const i in r) o[i] = ot(e, t[i], r[i], n[i]);
			return o;
		} else throw new Error(`Cannot spring ${typeof r} values`);
	}
}
function ht(e, t = {}) {
	const r = Me(e),
		{ stiffness: n = 0.15, damping: o = 0.8, precision: i = 0.01 } = t;
	let a,
		s,
		f,
		l = e,
		c = e,
		d = 1,
		g = 0,
		p = !1;
	function u(h, k = {}) {
		c = h;
		const x = (f = {});
		return e == null || k.hard || (_.stiffness >= 1 && _.damping >= 1)
			? ((p = !0), (a = Te()), (l = h), r.set((e = c)), Promise.resolve())
			: (k.soft && ((g = 1 / ((k.soft === !0 ? 0.5 : +k.soft) * 60)), (d = 0)),
			  s ||
					((a = Te()),
					(p = !1),
					(s = lt((m) => {
						if (p) return (p = !1), (s = null), !1;
						d = Math.min(d + g, 1);
						const E = {
								inv_mass: d,
								opts: _,
								settled: !0,
								dt: ((m - a) * 60) / 1e3
							},
							M = ot(E, l, e, c);
						return (
							(a = m),
							(l = e),
							r.set((e = M)),
							E.settled && (s = null),
							!E.settled
						);
					}))),
			  new Promise((m) => {
					s.promise.then(() => {
						x === f && m();
					});
			  }));
	}
	const _ = {
		set: u,
		update: (h, k) => u(h(c, e), k),
		subscribe: r.subscribe,
		stiffness: n,
		damping: o,
		precision: i
	};
	return _;
}
function on(e) {
	let t, r, n, o, i, a, s, f, l, c, d, g;
	return {
		c() {
			(t = S("div")),
				(r = H("svg")),
				(n = H("g")),
				(o = H("path")),
				(i = H("path")),
				(a = H("path")),
				(s = H("path")),
				(f = H("g")),
				(l = H("path")),
				(c = H("path")),
				(d = H("path")),
				(g = H("path")),
				b(
					o,
					"d",
					"M255.926 0.754768L509.702 139.936V221.027L255.926 81.8465V0.754768Z"
				),
				b(o, "fill", "#FF7C00"),
				b(o, "fill-opacity", "0.4"),
				b(o, "class", "svelte-zyxd38"),
				b(
					i,
					"d",
					"M509.69 139.936L254.981 279.641V361.255L509.69 221.55V139.936Z"
				),
				b(i, "fill", "#FF7C00"),
				b(i, "class", "svelte-zyxd38"),
				b(
					a,
					"d",
					"M0.250138 139.937L254.981 279.641V361.255L0.250138 221.55V139.937Z"
				),
				b(a, "fill", "#FF7C00"),
				b(a, "fill-opacity", "0.4"),
				b(a, "class", "svelte-zyxd38"),
				b(
					s,
					"d",
					"M255.923 0.232622L0.236328 139.936V221.55L255.923 81.8469V0.232622Z"
				),
				b(s, "fill", "#FF7C00"),
				b(s, "class", "svelte-zyxd38"),
				B(n, "transform", "translate(" + e[1][0] + "px, " + e[1][1] + "px)"),
				b(
					l,
					"d",
					"M255.926 141.5L509.702 280.681V361.773L255.926 222.592V141.5Z"
				),
				b(l, "fill", "#FF7C00"),
				b(l, "fill-opacity", "0.4"),
				b(l, "class", "svelte-zyxd38"),
				b(
					c,
					"d",
					"M509.69 280.679L254.981 420.384V501.998L509.69 362.293V280.679Z"
				),
				b(c, "fill", "#FF7C00"),
				b(c, "class", "svelte-zyxd38"),
				b(
					d,
					"d",
					"M0.250138 280.681L254.981 420.386V502L0.250138 362.295V280.681Z"
				),
				b(d, "fill", "#FF7C00"),
				b(d, "fill-opacity", "0.4"),
				b(d, "class", "svelte-zyxd38"),
				b(
					g,
					"d",
					"M255.923 140.977L0.236328 280.68V362.294L255.923 222.591V140.977Z"
				),
				b(g, "fill", "#FF7C00"),
				b(g, "class", "svelte-zyxd38"),
				B(f, "transform", "translate(" + e[2][0] + "px, " + e[2][1] + "px)"),
				b(r, "viewBox", "-1200 -1200 3000 3000"),
				b(r, "fill", "none"),
				b(r, "xmlns", "http://www.w3.org/2000/svg"),
				b(r, "class", "svelte-zyxd38"),
				b(t, "class", "svelte-zyxd38"),
				F(t, "margin", e[0]);
		},
		m(p, u) {
			v(p, t, u),
				A(t, r),
				A(r, n),
				A(n, o),
				A(n, i),
				A(n, a),
				A(n, s),
				A(r, f),
				A(f, l),
				A(f, c),
				A(f, d),
				A(f, g);
		},
		p(p, [u]) {
			u & 2 &&
				B(n, "transform", "translate(" + p[1][0] + "px, " + p[1][1] + "px)"),
				u & 4 &&
					B(f, "transform", "translate(" + p[2][0] + "px, " + p[2][1] + "px)"),
				u & 1 && F(t, "margin", p[0]);
		},
		i: R,
		o: R,
		d(p) {
			p && w(t);
		}
	};
}
function an(e, t, r) {
	let n,
		o,
		{ margin: i = !0 } = t;
	const a = ht([0, 0]);
	Ne(e, a, (g) => r(1, (n = g)));
	const s = ht([0, 0]);
	Ne(e, s, (g) => r(2, (o = g)));
	let f;
	function l() {
		return new Promise(async (g) => {
			await Promise.all([a.set([125, 140]), s.set([-125, -140])]),
				await Promise.all([a.set([-125, 140]), s.set([125, -140])]),
				await Promise.all([a.set([-125, 0]), s.set([125, -0])]),
				await Promise.all([a.set([125, 0]), s.set([-125, 0])]),
				g();
		});
	}
	async function c() {
		await l(), f || c();
	}
	async function d() {
		await Promise.all([a.set([125, 0]), s.set([-125, 0])]), c();
	}
	return (
		et(() => (d(), () => (f = !0))),
		(e.$$set = (g) => {
			"margin" in g && r(0, (i = g.margin));
		}),
		[i, n, o, a, s]
	);
}
class sn extends Ge {
	constructor(t) {
		super(), We(this, t, an, on, Ae, { margin: 0 });
	}
}
const ln = (e) => ({}),
	yt = (e) => ({});
function wt(e, t, r) {
	const n = e.slice();
	return (n[37] = t[r]), (n[39] = r), n;
}
function vt(e, t, r) {
	const n = e.slice();
	return (n[37] = t[r]), n;
}
function cn(e) {
	let t, r, n, o, i;
	const a = e[29].error,
		s = Bt(a, e, e[28], yt);
	let f = e[16] && kt(e);
	return {
		c() {
			(t = S("span")),
				(t.textContent = "Error"),
				(r = U()),
				s && s.c(),
				(n = U()),
				f && f.c(),
				(o = K()),
				b(t, "class", "error svelte-j1gjts");
		},
		m(l, c) {
			v(l, t, c),
				v(l, r, c),
				s && s.m(l, c),
				v(l, n, c),
				f && f.m(l, c),
				v(l, o, c),
				(i = !0);
		},
		p(l, c) {
			s &&
				s.p &&
				(!i || c[0] & 268435456) &&
				Gt(s, a, l, l[28], i ? Wt(a, l[28], c, ln) : Vt(l[28]), yt),
				l[16]
					? f
						? (f.p(l, c), c[0] & 65536 && O(f, 1))
						: ((f = kt(l)), f.c(), O(f, 1), f.m(o.parentNode, o))
					: f && (f.d(1), (f = null));
		},
		i(l) {
			i || (O(s, l), O(f), (i = !0));
		},
		o(l) {
			I(s, l), (i = !1);
		},
		d(l) {
			l && w(t), l && w(r), s && s.d(l), l && w(n), f && f.d(l), l && w(o);
		}
	};
}
function fn(e) {
	let t,
		r,
		n,
		o,
		i,
		a,
		s,
		f,
		l,
		c = e[8] === "default" && e[18] && xt(e);
	function d(m, E) {
		if (m[7]) return pn;
		if (m[1] !== null && m[2] !== void 0 && m[1] >= 0) return un;
		if (m[1] === 0) return dn;
	}
	let g = d(e),
		p = g && g(e),
		u = e[4] && Et(e);
	const _ = [bn, _n],
		h = [];
	function k(m, E) {
		return m[14] != null ? 0 : 1;
	}
	(i = k(e)), (a = h[i] = _[i](e));
	let x = !e[4] && Nt(e);
	return {
		c() {
			c && c.c(),
				(t = U()),
				(r = S("div")),
				p && p.c(),
				(n = U()),
				u && u.c(),
				(o = U()),
				a.c(),
				(s = U()),
				x && x.c(),
				(f = K()),
				b(r, "class", "svelte-j1gjts"),
				F(r, "meta-text-center", e[8] === "center"),
				F(r, "meta-text", e[8] === "default");
		},
		m(m, E) {
			c && c.m(m, E),
				v(m, t, E),
				v(m, r, E),
				p && p.m(r, null),
				A(r, n),
				u && u.m(r, null),
				v(m, o, E),
				h[i].m(m, E),
				v(m, s, E),
				x && x.m(m, E),
				v(m, f, E),
				(l = !0);
		},
		p(m, E) {
			m[8] === "default" && m[18]
				? c
					? c.p(m, E)
					: ((c = xt(m)), c.c(), c.m(t.parentNode, t))
				: c && (c.d(1), (c = null)),
				g === (g = d(m)) && p
					? p.p(m, E)
					: (p && p.d(1), (p = g && g(m)), p && (p.c(), p.m(r, n))),
				m[4]
					? u
						? u.p(m, E)
						: ((u = Et(m)), u.c(), u.m(r, null))
					: u && (u.d(1), (u = null)),
				(!l || E[0] & 256) && F(r, "meta-text-center", m[8] === "center"),
				(!l || E[0] & 256) && F(r, "meta-text", m[8] === "default");
			let M = i;
			(i = k(m)),
				i === M
					? h[i].p(m, E)
					: (Fe(),
					  I(h[M], 1, 1, () => {
							h[M] = null;
					  }),
					  Ue(),
					  (a = h[i]),
					  a ? a.p(m, E) : ((a = h[i] = _[i](m)), a.c()),
					  O(a, 1),
					  a.m(s.parentNode, s)),
				m[4]
					? x && (x.d(1), (x = null))
					: x
					? x.p(m, E)
					: ((x = Nt(m)), x.c(), x.m(f.parentNode, f));
		},
		i(m) {
			l || (O(a), (l = !0));
		},
		o(m) {
			I(a), (l = !1);
		},
		d(m) {
			c && c.d(m),
				m && w(t),
				m && w(r),
				p && p.d(),
				u && u.d(),
				m && w(o),
				h[i].d(m),
				m && w(s),
				x && x.d(m),
				m && w(f);
		}
	};
}
function kt(e) {
	let t,
		r,
		n,
		o,
		i,
		a,
		s,
		f,
		l = (e[6] || "") + "",
		c,
		d,
		g,
		p;
	return {
		c() {
			(t = S("div")),
				(r = S("div")),
				(n = S("button")),
				(n.innerHTML =
					'<svg width="100%" height="100%" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>'),
				(o = U()),
				(i = S("div")),
				(a = S("div")),
				(a.textContent = "Something went wrong"),
				(s = U()),
				(f = S("div")),
				(c = j(l)),
				b(n, "class", "toast-close svelte-j1gjts"),
				b(a, "class", "toast-title svelte-j1gjts"),
				b(f, "class", "toast-text svelte-j1gjts"),
				b(i, "class", "toast-details svelte-j1gjts"),
				b(r, "class", "toast-body svelte-j1gjts"),
				b(t, "class", "toast svelte-j1gjts");
		},
		m(u, _) {
			v(u, t, _),
				A(t, r),
				A(r, n),
				A(r, o),
				A(r, i),
				A(i, a),
				A(i, s),
				A(i, f),
				A(f, c),
				g ||
					((p = [Oe(n, "click", e[21]), Oe(r, "click", vr(e[30]))]), (g = !0));
		},
		p(u, _) {
			_[0] & 64 && l !== (l = (u[6] || "") + "") && W(c, l);
		},
		i(u) {
			d ||
				de(() => {
					(d = Or(r, rn, { duration: 100 })), d.start();
				});
		},
		o: R,
		d(u) {
			u && w(t), (g = !1), X(p);
		}
	};
}
function xt(e) {
	let t,
		r = `translateX(${(e[17] || 0) * 100 - 100}%)`;
	return {
		c() {
			(t = S("div")),
				b(t, "class", "eta-bar svelte-j1gjts"),
				B(t, "transform", r);
		},
		m(n, o) {
			v(n, t, o);
		},
		p(n, o) {
			o[0] & 131072 &&
				r !== (r = `translateX(${(n[17] || 0) * 100 - 100}%)`) &&
				B(t, "transform", r);
		},
		d(n) {
			n && w(t);
		}
	};
}
function dn(e) {
	let t;
	return {
		c() {
			t = j("processing |");
		},
		m(r, n) {
			v(r, t, n);
		},
		p: R,
		d(r) {
			r && w(t);
		}
	};
}
function un(e) {
	let t,
		r = e[1] + 1 + "",
		n,
		o,
		i,
		a;
	return {
		c() {
			(t = j("queue: ")),
				(n = j(r)),
				(o = j("/")),
				(i = j(e[2])),
				(a = j(" |"));
		},
		m(s, f) {
			v(s, t, f), v(s, n, f), v(s, o, f), v(s, i, f), v(s, a, f);
		},
		p(s, f) {
			f[0] & 2 && r !== (r = s[1] + 1 + "") && W(n, r), f[0] & 4 && W(i, s[2]);
		},
		d(s) {
			s && w(t), s && w(n), s && w(o), s && w(i), s && w(a);
		}
	};
}
function pn(e) {
	let t,
		r = e[7],
		n = [];
	for (let o = 0; o < r.length; o += 1) n[o] = At(vt(e, r, o));
	return {
		c() {
			for (let o = 0; o < n.length; o += 1) n[o].c();
			t = K();
		},
		m(o, i) {
			for (let a = 0; a < n.length; a += 1) n[a] && n[a].m(o, i);
			v(o, t, i);
		},
		p(o, i) {
			if (i[0] & 128) {
				r = o[7];
				let a;
				for (a = 0; a < r.length; a += 1) {
					const s = vt(o, r, a);
					n[a]
						? n[a].p(s, i)
						: ((n[a] = At(s)), n[a].c(), n[a].m(t.parentNode, t));
				}
				for (; a < n.length; a += 1) n[a].d(1);
				n.length = r.length;
			}
		},
		d(o) {
			Jt(n, o), o && w(t);
		}
	};
}
function zt(e) {
	let t,
		r = e[37].unit + "",
		n,
		o,
		i = " ",
		a;
	function s(c, d) {
		return c[37].length != null ? mn : gn;
	}
	let f = s(e),
		l = f(e);
	return {
		c() {
			l.c(), (t = U()), (n = j(r)), (o = j(" | ")), (a = j(i));
		},
		m(c, d) {
			l.m(c, d), v(c, t, d), v(c, n, d), v(c, o, d), v(c, a, d);
		},
		p(c, d) {
			f === (f = s(c)) && l
				? l.p(c, d)
				: (l.d(1), (l = f(c)), l && (l.c(), l.m(t.parentNode, t))),
				d[0] & 128 && r !== (r = c[37].unit + "") && W(n, r);
		},
		d(c) {
			l.d(c), c && w(t), c && w(n), c && w(o), c && w(a);
		}
	};
}
function gn(e) {
	let t = le(e[37].index || 0) + "",
		r;
	return {
		c() {
			r = j(t);
		},
		m(n, o) {
			v(n, r, o);
		},
		p(n, o) {
			o[0] & 128 && t !== (t = le(n[37].index || 0) + "") && W(r, t);
		},
		d(n) {
			n && w(r);
		}
	};
}
function mn(e) {
	let t = le(e[37].index || 0) + "",
		r,
		n,
		o = le(e[37].length) + "",
		i;
	return {
		c() {
			(r = j(t)), (n = j("/")), (i = j(o));
		},
		m(a, s) {
			v(a, r, s), v(a, n, s), v(a, i, s);
		},
		p(a, s) {
			s[0] & 128 && t !== (t = le(a[37].index || 0) + "") && W(r, t),
				s[0] & 128 && o !== (o = le(a[37].length) + "") && W(i, o);
		},
		d(a) {
			a && w(r), a && w(n), a && w(i);
		}
	};
}
function At(e) {
	let t,
		r = e[37].index != null && zt(e);
	return {
		c() {
			r && r.c(), (t = K());
		},
		m(n, o) {
			r && r.m(n, o), v(n, t, o);
		},
		p(n, o) {
			n[37].index != null
				? r
					? r.p(n, o)
					: ((r = zt(n)), r.c(), r.m(t.parentNode, t))
				: r && (r.d(1), (r = null));
		},
		d(n) {
			r && r.d(n), n && w(t);
		}
	};
}
function Et(e) {
	let t,
		r = e[0] ? `/${e[19]}` : "",
		n,
		o;
	return {
		c() {
			(t = j(e[20])), (n = j(r)), (o = j("s"));
		},
		m(i, a) {
			v(i, t, a), v(i, n, a), v(i, o, a);
		},
		p(i, a) {
			a[0] & 1048576 && W(t, i[20]),
				a[0] & 524289 && r !== (r = i[0] ? `/${i[19]}` : "") && W(n, r);
		},
		d(i) {
			i && w(t), i && w(n), i && w(o);
		}
	};
}
function _n(e) {
	let t, r;
	return (
		(t = new sn({ props: { margin: e[8] === "default" } })),
		{
			c() {
				Ee(t.$$.fragment);
			},
			m(n, o) {
				pe(t, n, o), (r = !0);
			},
			p(n, o) {
				const i = {};
				o[0] & 256 && (i.margin = n[8] === "default"), t.$set(i);
			},
			i(n) {
				r || (O(t.$$.fragment, n), (r = !0));
			},
			o(n) {
				I(t.$$.fragment, n), (r = !1);
			},
			d(n) {
				ge(t, n);
			}
		}
	);
}
function bn(e) {
	let t,
		r,
		n,
		o,
		i,
		a = `${e[14] * 100}%`,
		s = e[7] != null && Mt(e);
	return {
		c() {
			(t = S("div")),
				(r = S("div")),
				s && s.c(),
				(n = U()),
				(o = S("div")),
				(i = S("div")),
				b(r, "class", "progress-level-inner svelte-j1gjts"),
				b(i, "class", "progress-bar svelte-j1gjts"),
				B(i, "width", a),
				b(o, "class", "progress-bar-wrap svelte-j1gjts"),
				b(t, "class", "progress-level svelte-j1gjts");
		},
		m(f, l) {
			v(f, t, l),
				A(t, r),
				s && s.m(r, null),
				A(t, n),
				A(t, o),
				A(o, i),
				e[31](i);
		},
		p(f, l) {
			f[7] != null
				? s
					? s.p(f, l)
					: ((s = Mt(f)), s.c(), s.m(r, null))
				: s && (s.d(1), (s = null)),
				l[0] & 16384 && a !== (a = `${f[14] * 100}%`) && B(i, "width", a);
		},
		i: R,
		o: R,
		d(f) {
			f && w(t), s && s.d(), e[31](null);
		}
	};
}
function Mt(e) {
	let t,
		r = e[7],
		n = [];
	for (let o = 0; o < r.length; o += 1) n[o] = Lt(wt(e, r, o));
	return {
		c() {
			for (let o = 0; o < n.length; o += 1) n[o].c();
			t = K();
		},
		m(o, i) {
			for (let a = 0; a < n.length; a += 1) n[a] && n[a].m(o, i);
			v(o, t, i);
		},
		p(o, i) {
			if (i[0] & 8320) {
				r = o[7];
				let a;
				for (a = 0; a < r.length; a += 1) {
					const s = wt(o, r, a);
					n[a]
						? n[a].p(s, i)
						: ((n[a] = Lt(s)), n[a].c(), n[a].m(t.parentNode, t));
				}
				for (; a < n.length; a += 1) n[a].d(1);
				n.length = r.length;
			}
		},
		d(o) {
			Jt(n, o), o && w(t);
		}
	};
}
function Ct(e) {
	let t,
		r,
		n,
		o,
		i = e[39] !== 0 && hn(),
		a = e[37].desc != null && St(e),
		s = e[37].desc != null && e[13] && e[13][e[39]] != null && jt(),
		f = e[13] != null && qt(e);
	return {
		c() {
			i && i.c(),
				(t = U()),
				a && a.c(),
				(r = U()),
				s && s.c(),
				(n = U()),
				f && f.c(),
				(o = K());
		},
		m(l, c) {
			i && i.m(l, c),
				v(l, t, c),
				a && a.m(l, c),
				v(l, r, c),
				s && s.m(l, c),
				v(l, n, c),
				f && f.m(l, c),
				v(l, o, c);
		},
		p(l, c) {
			l[37].desc != null
				? a
					? a.p(l, c)
					: ((a = St(l)), a.c(), a.m(r.parentNode, r))
				: a && (a.d(1), (a = null)),
				l[37].desc != null && l[13] && l[13][l[39]] != null
					? s || ((s = jt()), s.c(), s.m(n.parentNode, n))
					: s && (s.d(1), (s = null)),
				l[13] != null
					? f
						? f.p(l, c)
						: ((f = qt(l)), f.c(), f.m(o.parentNode, o))
					: f && (f.d(1), (f = null));
		},
		d(l) {
			i && i.d(l),
				l && w(t),
				a && a.d(l),
				l && w(r),
				s && s.d(l),
				l && w(n),
				f && f.d(l),
				l && w(o);
		}
	};
}
function hn(e) {
	let t;
	return {
		c() {
			t = j(" /");
		},
		m(r, n) {
			v(r, t, n);
		},
		d(r) {
			r && w(t);
		}
	};
}
function St(e) {
	let t = e[37].desc + "",
		r;
	return {
		c() {
			r = j(t);
		},
		m(n, o) {
			v(n, r, o);
		},
		p(n, o) {
			o[0] & 128 && t !== (t = n[37].desc + "") && W(r, t);
		},
		d(n) {
			n && w(r);
		}
	};
}
function jt(e) {
	let t;
	return {
		c() {
			t = j("-");
		},
		m(r, n) {
			v(r, t, n);
		},
		d(r) {
			r && w(t);
		}
	};
}
function qt(e) {
	let t = (100 * (e[13][e[39]] || 0)).toFixed(1) + "",
		r,
		n;
	return {
		c() {
			(r = j(t)), (n = j("%"));
		},
		m(o, i) {
			v(o, r, i), v(o, n, i);
		},
		p(o, i) {
			i[0] & 8192 &&
				t !== (t = (100 * (o[13][o[39]] || 0)).toFixed(1) + "") &&
				W(r, t);
		},
		d(o) {
			o && w(r), o && w(n);
		}
	};
}
function Lt(e) {
	let t,
		r = (e[37].desc != null || (e[13] && e[13][e[39]] != null)) && Ct(e);
	return {
		c() {
			r && r.c(), (t = K());
		},
		m(n, o) {
			r && r.m(n, o), v(n, t, o);
		},
		p(n, o) {
			n[37].desc != null || (n[13] && n[13][n[39]] != null)
				? r
					? r.p(n, o)
					: ((r = Ct(n)), r.c(), r.m(t.parentNode, t))
				: r && (r.d(1), (r = null));
		},
		d(n) {
			r && r.d(n), n && w(t);
		}
	};
}
function Nt(e) {
	let t, r;
	return {
		c() {
			(t = S("p")), (r = j(e[9])), b(t, "class", "loading svelte-j1gjts");
		},
		m(n, o) {
			v(n, t, o), A(t, r);
		},
		p(n, o) {
			o[0] & 512 && W(r, n[9]);
		},
		d(n) {
			n && w(t);
		}
	};
}
function yn(e) {
	let t, r, n, o, i;
	const a = [fn, cn],
		s = [];
	function f(l, c) {
		return l[3] === "pending" ? 0 : l[3] === "error" ? 1 : -1;
	}
	return (
		~(r = f(e)) && (n = s[r] = a[r](e)),
		{
			c() {
				(t = S("div")),
					n && n.c(),
					b(t, "class", (o = "wrap " + e[8] + " svelte-j1gjts")),
					F(t, "hide", !e[3] || e[3] === "complete" || !e[5]),
					F(
						t,
						"translucent",
						(e[8] === "center" && (e[3] === "pending" || e[3] === "error")) ||
							e[11]
					),
					F(t, "generating", e[3] === "generating"),
					B(t, "position", e[10] ? "absolute" : "static"),
					B(t, "padding", e[10] ? "0" : "var(--size-8) 0");
			},
			m(l, c) {
				v(l, t, c), ~r && s[r].m(t, null), e[32](t), (i = !0);
			},
			p(l, c) {
				let d = r;
				(r = f(l)),
					r === d
						? ~r && s[r].p(l, c)
						: (n &&
								(Fe(),
								I(s[d], 1, 1, () => {
									s[d] = null;
								}),
								Ue()),
						  ~r
								? ((n = s[r]),
								  n ? n.p(l, c) : ((n = s[r] = a[r](l)), n.c()),
								  O(n, 1),
								  n.m(t, null))
								: (n = null)),
					(!i ||
						(c[0] & 256 && o !== (o = "wrap " + l[8] + " svelte-j1gjts"))) &&
						b(t, "class", o),
					(!i || c[0] & 296) &&
						F(t, "hide", !l[3] || l[3] === "complete" || !l[5]),
					(!i || c[0] & 2312) &&
						F(
							t,
							"translucent",
							(l[8] === "center" && (l[3] === "pending" || l[3] === "error")) ||
								l[11]
						),
					(!i || c[0] & 264) && F(t, "generating", l[3] === "generating"),
					c[0] & 1024 && B(t, "position", l[10] ? "absolute" : "static"),
					c[0] & 1024 && B(t, "padding", l[10] ? "0" : "var(--size-8) 0");
			},
			i(l) {
				i || (O(n), (i = !0));
			},
			o(l) {
				I(n), (i = !1);
			},
			d(l) {
				l && w(t), ~r && s[r].d(), e[32](null);
			}
		}
	);
}
let je = [],
	Ke = !1;
async function wn(e, t = !0) {
	if (
		!(
			window.__gradio_mode__ === "website" ||
			(window.__gradio_mode__ !== "app" && t !== !0)
		)
	) {
		if ((je.push(e), !Ke)) Ke = !0;
		else return;
		await Lr(),
			requestAnimationFrame(() => {
				let r = [0, 0];
				for (let n = 0; n < je.length; n++) {
					const i = je[n].getBoundingClientRect();
					(n === 0 || i.top + window.scrollY <= r[0]) &&
						((r[0] = i.top + window.scrollY), (r[1] = n));
				}
				window.scrollTo({ top: r[0] - 20, behavior: "smooth" }),
					(Ke = !1),
					(je = []);
			});
	}
}
function vn(e, t, r) {
	let n, o;
	Ne(e, nn, (z) => r(27, (o = z)));
	let { $$slots: i = {}, $$scope: a } = t,
		{ eta: s = null } = t,
		{ queue: f = !1 } = t,
		{ queue_position: l } = t,
		{ queue_size: c } = t,
		{ status: d } = t,
		{ scroll_to_output: g = !1 } = t,
		{ timer: p = !0 } = t,
		{ visible: u = !0 } = t,
		{ message: _ = null } = t,
		{ progress: h = null } = t,
		{ variant: k = "default" } = t,
		{ loading_text: x = "Loading..." } = t,
		{ absolute: m = !0 } = t,
		{ translucent: E = !1 } = t,
		M,
		N = !1,
		C = 0,
		q = 0,
		L = null,
		P = !1,
		ne = 0,
		G = null,
		Y,
		Z = null,
		me = !0;
	const $ = () => {
		r(24, (C = performance.now())), r(25, (q = 0)), (N = !0), oe();
	};
	function oe() {
		requestAnimationFrame(() => {
			r(25, (q = (performance.now() - C) / 1e3)), N && oe();
		});
	}
	const _e = () => {
		r(25, (q = 0)), N && (N = !1);
	};
	jr(() => {
		N && _e();
	});
	let be = null;
	const he = () => {
		r(16, (P = !1));
	};
	function Ve(z) {
		qr.call(this, e, z);
	}
	function De(z) {
		te[z ? "unshift" : "push"](() => {
			(Z = z), r(15, Z), r(7, h), r(13, G), r(14, Y);
		});
	}
	function He(z) {
		te[z ? "unshift" : "push"](() => {
			(M = z), r(12, M);
		});
	}
	return (
		(e.$$set = (z) => {
			"eta" in z && r(0, (s = z.eta)),
				"queue" in z && r(22, (f = z.queue)),
				"queue_position" in z && r(1, (l = z.queue_position)),
				"queue_size" in z && r(2, (c = z.queue_size)),
				"status" in z && r(3, (d = z.status)),
				"scroll_to_output" in z && r(23, (g = z.scroll_to_output)),
				"timer" in z && r(4, (p = z.timer)),
				"visible" in z && r(5, (u = z.visible)),
				"message" in z && r(6, (_ = z.message)),
				"progress" in z && r(7, (h = z.progress)),
				"variant" in z && r(8, (k = z.variant)),
				"loading_text" in z && r(9, (x = z.loading_text)),
				"absolute" in z && r(10, (m = z.absolute)),
				"translucent" in z && r(11, (E = z.translucent)),
				"$$scope" in z && r(28, (a = z.$$scope));
		}),
		(e.$$.update = () => {
			e.$$.dirty[0] & 88080385 &&
				(s === null
					? r(0, (s = L))
					: f && r(0, (s = (performance.now() - C) / 1e3 + s)),
				s != null && (r(19, (be = s.toFixed(1))), r(26, (L = s)))),
				e.$$.dirty[0] & 33554433 &&
					r(17, (ne = s === null || s <= 0 || !q ? null : Math.min(q / s, 1))),
				e.$$.dirty[0] & 128 && h != null && r(18, (me = !1)),
				e.$$.dirty[0] & 57472 &&
					(h != null
						? r(
								13,
								(G = h.map((z) =>
									z.index != null && z.length != null
										? z.index / z.length
										: z.progress != null
										? z.progress
										: void 0
								))
						  )
						: r(13, (G = null)),
					G
						? (r(14, (Y = G[G.length - 1])),
						  Z &&
								(Y === 0
									? r(15, (Z.style.transition = "0"), Z)
									: r(15, (Z.style.transition = "150ms"), Z)))
						: r(14, (Y = void 0))),
				e.$$.dirty[0] & 8 && (d === "pending" ? $() : _e()),
				e.$$.dirty[0] & 142610440 &&
					M &&
					g &&
					(d === "pending" || d === "complete") &&
					wn(M, o.autoscroll),
				e.$$.dirty[0] & 72 && (he(), d === "error" && _ && r(16, (P = !0))),
				e.$$.dirty[0] & 33554432 && r(20, (n = q.toFixed(1)));
		}),
		[
			s,
			l,
			c,
			d,
			p,
			u,
			_,
			h,
			k,
			x,
			m,
			E,
			M,
			G,
			Y,
			Z,
			P,
			ne,
			me,
			be,
			n,
			he,
			f,
			g,
			C,
			q,
			L,
			o,
			a,
			i,
			Ve,
			De,
			He
		]
	);
}
class kn extends Ge {
	constructor(t) {
		super(),
			We(
				this,
				t,
				vn,
				yn,
				Ae,
				{
					eta: 0,
					queue: 22,
					queue_position: 1,
					queue_size: 2,
					status: 3,
					scroll_to_output: 23,
					timer: 4,
					visible: 5,
					message: 6,
					progress: 7,
					variant: 8,
					loading_text: 9,
					absolute: 10,
					translucent: 11
				},
				null,
				[-1, -1]
			);
	}
}
function Tt(e) {
	let t, r;
	return (
		(t = new kn({
			props: {
				absolute: !e[4],
				status: e[12],
				timer: !1,
				queue_position: null,
				queue_size: null,
				translucent: !0,
				loading_text: Ln,
				$$slots: { error: [An] },
				$$scope: { ctx: e }
			}
		})),
		{
			c() {
				Ee(t.$$.fragment);
			},
			m(n, o) {
				pe(t, n, o), (r = !0);
			},
			p(n, o) {
				const i = {};
				o[0] & 16 && (i.absolute = !n[4]),
					o[0] & 4096 && (i.status = n[12]),
					(o[0] & 2304) | (o[1] & 1024) && (i.$$scope = { dirty: o, ctx: n }),
					t.$set(i);
			},
			i(n) {
				r || (O(t.$$.fragment, n), (r = !0));
			},
			o(n) {
				I(t.$$.fragment, n), (r = !1);
			},
			d(n) {
				ge(t, n);
			}
		}
	);
}
function xn(e) {
	let t;
	return {
		c() {
			(t = S("p")),
				(t.textContent =
					"Please contact the author of the page to let them know."),
				b(t, "class", "svelte-y6l4b");
		},
		m(r, n) {
			v(r, t, n);
		},
		p: R,
		d(r) {
			r && w(t);
		}
	};
}
function zn(e) {
	let t, r, n, o, i, a;
	return {
		c() {
			(t = S("p")),
				(r = j("Please ")),
				(n = S("a")),
				(o = j("contact the author of the space")),
				(a = j(" to let them know.")),
				b(
					n,
					"href",
					(i =
						"https://huggingface.co/spaces/" +
						e[8] +
						"/discussions/new?title=" +
						e[19].title(e[11]?.detail) +
						"&description=" +
						e[19].description(e[11]?.detail, location.origin))
				),
				b(n, "class", "svelte-y6l4b"),
				b(t, "class", "svelte-y6l4b");
		},
		m(s, f) {
			v(s, t, f), A(t, r), A(t, n), A(n, o), A(t, a);
		},
		p(s, f) {
			f[0] & 2304 &&
				i !==
					(i =
						"https://huggingface.co/spaces/" +
						s[8] +
						"/discussions/new?title=" +
						s[19].title(s[11]?.detail) +
						"&description=" +
						s[19].description(s[11]?.detail, location.origin)) &&
				b(n, "href", i);
		},
		d(s) {
			s && w(t);
		}
	};
}
function An(e) {
	let t,
		r,
		n,
		o = (e[11]?.message || "") + "",
		i,
		a;
	function s(c, d) {
		return c[11].status === "space_error" && c[11].discussions_enabled
			? zn
			: xn;
	}
	let f = s(e),
		l = f(e);
	return {
		c() {
			(t = S("div")),
				(r = S("p")),
				(n = S("strong")),
				(i = j(o)),
				(a = U()),
				l.c(),
				b(r, "class", "svelte-y6l4b"),
				b(t, "class", "error svelte-y6l4b"),
				b(t, "slot", "error");
		},
		m(c, d) {
			v(c, t, d), A(t, r), A(r, n), A(n, i), A(t, a), l.m(t, null);
		},
		p(c, d) {
			d[0] & 2048 && o !== (o = (c[11]?.message || "") + "") && W(i, o),
				f === (f = s(c)) && l
					? l.p(c, d)
					: (l.d(1), (l = f(c)), l && (l.c(), l.m(t, null)));
		},
		d(c) {
			c && w(t), l.d();
		}
	};
}
function En(e) {
	let t, r, n;
	const o = [
		{ app: e[15] },
		e[10],
		{ theme_mode: e[14] },
		{ control_page_title: e[5] },
		{ target: e[13] },
		{ autoscroll: e[0] },
		{ show_footer: !e[4] },
		{ app_mode: e[3] }
	];
	function i(s) {
		e[26](s);
	}
	let a = {};
	for (let s = 0; s < o.length; s += 1) a = Pt(a, o[s]);
	return (
		e[9] !== void 0 && (a.ready = e[9]),
		(t = new e[17]({ props: a })),
		te.push(() => rr(t, "ready", i)),
		{
			c() {
				Ee(t.$$.fragment);
			},
			m(s, f) {
				pe(t, s, f), (n = !0);
			},
			p(s, f) {
				const l =
					f[0] & 58425
						? Rr(o, [
								f[0] & 32768 && { app: s[15] },
								f[0] & 1024 && Pr(s[10]),
								f[0] & 16384 && { theme_mode: s[14] },
								f[0] & 32 && { control_page_title: s[5] },
								f[0] & 8192 && { target: s[13] },
								f[0] & 1 && { autoscroll: s[0] },
								f[0] & 16 && { show_footer: !s[4] },
								f[0] & 8 && { app_mode: s[3] }
						  ])
						: {};
				!r && f[0] & 512 && ((r = !0), (l.ready = s[9]), Yt(() => (r = !1))),
					t.$set(l);
			},
			i(s) {
				n || (O(t.$$.fragment, s), (n = !0));
			},
			o(s) {
				I(t.$$.fragment, s), (n = !1);
			},
			d(s) {
				ge(t, s);
			}
		}
	);
}
function Mn(e) {
	let t, r;
	return (
		(t = new e[18]({
			props: {
				auth_message: e[10].auth_message,
				root: e[10].root,
				is_space: e[10].is_space,
				app_mode: e[3]
			}
		})),
		{
			c() {
				Ee(t.$$.fragment);
			},
			m(n, o) {
				pe(t, n, o), (r = !0);
			},
			p(n, o) {
				const i = {};
				o[0] & 1024 && (i.auth_message = n[10].auth_message),
					o[0] & 1024 && (i.root = n[10].root),
					o[0] & 1024 && (i.is_space = n[10].is_space),
					o[0] & 8 && (i.app_mode = n[3]),
					t.$set(i);
			},
			i(n) {
				r || (O(t.$$.fragment, n), (r = !0));
			},
			o(n) {
				I(t.$$.fragment, n), (r = !1);
			},
			d(n) {
				ge(t, n);
			}
		}
	);
}
function Cn(e) {
	let t,
		r,
		n,
		o,
		i,
		a =
			(e[12] === "pending" || e[12] === "error") &&
			!(e[10] && e[10]?.auth_required) &&
			Tt(e);
	const s = [Mn, En],
		f = [];
	function l(c, d) {
		return c[10]?.auth_required && c[18] ? 0 : c[10] && c[17] && c[16] ? 1 : -1;
	}
	return (
		~(r = l(e)) && (n = f[r] = s[r](e)),
		{
			c() {
				a && a.c(), (t = U()), n && n.c(), (o = K());
			},
			m(c, d) {
				a && a.m(c, d), v(c, t, d), ~r && f[r].m(c, d), v(c, o, d), (i = !0);
			},
			p(c, d) {
				(c[12] === "pending" || c[12] === "error") &&
				!(c[10] && c[10]?.auth_required)
					? a
						? (a.p(c, d), d[0] & 5120 && O(a, 1))
						: ((a = Tt(c)), a.c(), O(a, 1), a.m(t.parentNode, t))
					: a &&
					  (Fe(),
					  I(a, 1, 1, () => {
							a = null;
					  }),
					  Ue());
				let g = r;
				(r = l(c)),
					r === g
						? ~r && f[r].p(c, d)
						: (n &&
								(Fe(),
								I(f[g], 1, 1, () => {
									f[g] = null;
								}),
								Ue()),
						  ~r
								? ((n = f[r]),
								  n ? n.p(c, d) : ((n = f[r] = s[r](c)), n.c()),
								  O(n, 1),
								  n.m(o.parentNode, o))
								: (n = null));
			},
			i(c) {
				i || (O(a), O(n), (i = !0));
			},
			o(c) {
				I(a), I(n), (i = !1);
			},
			d(c) {
				a && a.d(c), c && w(t), ~r && f[r].d(c), c && w(o);
			}
		}
	);
}
function Sn(e) {
	let t, r, n;
	function o(a) {
		e[27](a);
	}
	let i = {
		display: e[6] && e[4],
		is_embed: e[4],
		info: !!e[8] && e[7],
		version: e[1],
		initial_height: e[2],
		space: e[8],
		loaded: e[12] === "complete",
		$$slots: { default: [Cn] },
		$$scope: { ctx: e }
	};
	return (
		e[13] !== void 0 && (i.wrapper = e[13]),
		(t = new en({ props: i })),
		te.push(() => rr(t, "wrapper", o)),
		{
			c() {
				Ee(t.$$.fragment);
			},
			m(a, s) {
				pe(t, a, s), (n = !0);
			},
			p(a, s) {
				const f = {};
				s[0] & 80 && (f.display = a[6] && a[4]),
					s[0] & 16 && (f.is_embed = a[4]),
					s[0] & 384 && (f.info = !!a[8] && a[7]),
					s[0] & 2 && (f.version = a[1]),
					s[0] & 4 && (f.initial_height = a[2]),
					s[0] & 256 && (f.space = a[8]),
					s[0] & 4096 && (f.loaded = a[12] === "complete"),
					(s[0] & 524089) | (s[1] & 1024) && (f.$$scope = { dirty: s, ctx: a }),
					!r &&
						s[0] & 8192 &&
						((r = !0), (f.wrapper = a[13]), Yt(() => (r = !1))),
					t.$set(f);
			},
			i(a) {
				n || (O(t.$$.fragment, a), (n = !0));
			},
			o(a) {
				I(t.$$.fragment, a), (n = !1);
			},
			d(a) {
				ge(t, a);
			}
		}
	);
}
let jn = -1;
function qn() {
	const e = Me({}),
		t = new Map(),
		r = new IntersectionObserver((o) => {
			o.forEach((i) => {
				if (i.isIntersecting) {
					let a = t.get(i.target);
					a !== void 0 && e.update((s) => ({ ...s, [a]: !0 }));
				}
			});
		});
	function n(o, i) {
		t.set(i, o), r.observe(i);
	}
	return { register: n, subscribe: e.subscribe };
}
const Ot = qn();
let Ln = "Loading...";
function Nn(e, t, r) {
	let n;
	Ne(e, Ot, (y) => r(25, (n = y)));
	const o = Qr,
		i = Xr;
	let { autoscroll: a } = t,
		{ version: s } = t,
		{ initial_height: f } = t,
		{ app_mode: l } = t,
		{ is_embed: c } = t,
		{ theme_mode: d = "system" } = t,
		{ control_page_title: g } = t,
		{ container: p } = t,
		{ info: u } = t,
		{ eager: _ } = t,
		{ wasm_py_code: h = null } = t,
		{ space: k } = t,
		{ host: x } = t,
		{ src: m } = t,
		E = jn++,
		M = "pending",
		N = null,
		C,
		q = !1,
		L,
		P;
	async function ne(y, V, J) {
		if (V) {
			let D = document.createElement("style");
			(D.innerHTML = V), y.appendChild(D);
		}
		{
			if (J == null) throw new Error("Worker proxy is required for wasm mode");
			await Dr(J, "/theme.css", document.head);
		}
		L.stylesheets &&
			(await Promise.all(
				L.stylesheets.map((D) => {
					let ar = D.startsWith("http:") || D.startsWith("https:");
					return Be(ar ? D : L.root + "/" + D, document.head);
				})
			));
	}
	async function G(y) {
		const V = await (await fetch(y + "/app_id")).text();
		N === null ? (N = V) : N != V && location.reload(),
			setTimeout(() => G(y), 250);
	}
	function Y(y) {
		let J = new URL(window.location.toString()).searchParams.get("__theme");
		return (
			r(14, (P = d || J || "system")),
			P === "dark" || P === "light" ? me(y, P) : r(14, (P = Z(y))),
			P
		);
	}
	function Z(y) {
		const V = J();
		window
			?.matchMedia("(prefers-color-scheme: dark)")
			?.addEventListener("change", J);
		function J() {
			let D = window?.matchMedia?.("(prefers-color-scheme: dark)").matches
				? "dark"
				: "light";
			return me(y, D), D;
		}
		return V;
	}
	function me(y, V) {
		const J = c ? y.parentElement : document.body,
			D = c ? y : y.parentElement;
		(D.style.background = "var(--body-background-fill)"),
			V === "dark" ? J.classList.add("dark") : J.classList.remove("dark");
	}
	let $ = {
			message: "",
			load_status: "pending",
			status: "sleeping",
			detail: "SLEEPING"
		},
		oe,
		_e = !1;
	et(async () => {
		window.__gradio_mode__ !== "website" && r(14, (P = Y(C)));
		let y = null;
		(y = new Ur({
			gradioWheelUrl: o,
			gradioClientWheelUrl: i,
			requirements: []
		})),
			await y.runPythonAsync(h ?? ""),
			r(15, (oe = await Wr(y))),
			r(10, (L = oe.config)),
			r(
				11,
				($ = {
					message: "",
					load_status: "complete",
					status: "running",
					detail: "RUNNING"
				})
			),
			await ne(C, L.css, y),
			r(16, (_e = !0)),
			(window.__is_colab__ = L.is_colab),
			L.dev_mode && G(L.root);
	});
	let be, he;
	async function Ve() {
		r(
			17,
			(be = (
				await pt(
					() => import("./assets/Blocks-b77f2878.js").then((y) => y.B),
					[
						"./assets/Blocks-b77f2878.js",
						"./assets/Button-5b68d65a.js",
						"./assets/Button-4cd12e76.css",
						"./assets/Blocks-005a10ea.css"
					],
					import.meta.url
				)
			).default)
		);
	}
	async function De() {
		r(
			18,
			(he = (
				await pt(
					() => import("./assets/Login-c195b823.js"),
					[
						"./assets/Login-c195b823.js",
						"./assets/Form-60c98f5d.js",
						"./assets/Form-189d7bad.css",
						"./assets/Textbox-41d74eda.js",
						"./assets/Button-5b68d65a.js",
						"./assets/Button-4cd12e76.css",
						"./assets/BlockTitle-1b9e69db.js",
						"./assets/Info-06b02eda.js",
						"./assets/Copy-d120a3d6.js",
						"./assets/ColorPicker-25010187.css",
						"./assets/DropdownArrow-5fa4dd09.css",
						"./assets/Column-4ca2f558.js",
						"./assets/Column-2853eb31.css",
						"./assets/Login-9c3cc0eb.css"
					],
					import.meta.url
				)
			).default)
		);
	}
	function He() {
		L.auth_required ? De() : Ve();
	}
	const z = {
		readable_error: {
			NO_APP_FILE: "no app file",
			CONFIG_ERROR: "a config error",
			BUILD_ERROR: "a build error",
			RUNTIME_ERROR: "a runtime error"
		},
		title(y) {
			return encodeURIComponent(
				`Space isn't working because there is ${
					this.readable_error[y] || "an error"
				}`
			);
		},
		description(y, V) {
			return encodeURIComponent(`Hello,

Firstly, thanks for creating this space!

I noticed that the space isn't working correctly because there is ${
				this.readable_error[y] || "an error"
			}.

It would be great if you could take a look at this because this space is being embedded on ${V}.

Thanks!`);
		}
	};
	et(async () => {
		Ot.register(E, C);
	});
	function or(y) {
		(q = y), r(9, q);
	}
	function ir(y) {
		(C = y), r(13, C);
	}
	return (
		(e.$$set = (y) => {
			"autoscroll" in y && r(0, (a = y.autoscroll)),
				"version" in y && r(1, (s = y.version)),
				"initial_height" in y && r(2, (f = y.initial_height)),
				"app_mode" in y && r(3, (l = y.app_mode)),
				"is_embed" in y && r(4, (c = y.is_embed)),
				"theme_mode" in y && r(20, (d = y.theme_mode)),
				"control_page_title" in y && r(5, (g = y.control_page_title)),
				"container" in y && r(6, (p = y.container)),
				"info" in y && r(7, (u = y.info)),
				"eager" in y && r(21, (_ = y.eager)),
				"wasm_py_code" in y && r(22, (h = y.wasm_py_code)),
				"space" in y && r(8, (k = y.space)),
				"host" in y && r(23, (x = y.host)),
				"src" in y && r(24, (m = y.src));
		}),
		(e.$$.update = () => {
			e.$$.dirty[0] & 2560 &&
				r(
					12,
					(M =
						!q && $.load_status !== "error"
							? "pending"
							: !q && $.load_status === "error"
							? "error"
							: $.load_status)
				),
				e.$$.dirty[0] & 35652608 && L && (_ || n[E]) && He();
		}),
		[
			a,
			s,
			f,
			l,
			c,
			g,
			p,
			u,
			k,
			q,
			L,
			$,
			M,
			C,
			P,
			oe,
			_e,
			be,
			he,
			z,
			d,
			_,
			h,
			x,
			m,
			n,
			or,
			ir
		]
	);
}
class Tn extends Ge {
	constructor(t) {
		super(),
			We(
				this,
				t,
				Nn,
				Sn,
				Ae,
				{
					autoscroll: 0,
					version: 1,
					initial_height: 2,
					app_mode: 3,
					is_embed: 4,
					theme_mode: 20,
					control_page_title: 5,
					container: 6,
					info: 7,
					eager: 21,
					wasm_py_code: 22,
					space: 8,
					host: 23,
					src: 24
				},
				null,
				[-1, -1]
			);
	}
}
const nr = Tn;
let it;
it = "__FONTS_CSS__";
async function On(e) {
	typeof it != "string" && it.forEach((r) => Be(r, document.head)),
		new MutationObserver(() => {
			document.body.style.padding = "0";
		}).observe(e.target, { childList: !0 }),
		new nr({
			target: e.target,
			props: {
				space: null,
				src: null,
				host: null,
				info: e.info,
				container: e.container,
				is_embed: e.isEmbed,
				initial_height: e.initialHeight ?? "300px",
				eager: e.eager,
				version: "3-29-0",
				theme_mode: e.themeMode,
				autoscroll: e.autoScroll,
				control_page_title: e.controlPageTitle,
				app_mode: e.appMode,
				wasm_py_code: e.pyCode
			}
		});
}
globalThis.createGradioApp = On;
export {
	kn as $,
	no as A,
	H as B,
	b as C,
	B as D,
	A as E,
	R as F,
	S as G,
	U as H,
	j as I,
	Oe as J,
	W as K,
	br as L,
	F as M,
	Jt as N,
	sn as O,
	so as P,
	Ne as Q,
	nn as R,
	Ge as S,
	Lr as T,
	$n as U,
	Bt as V,
	Wn as W,
	Gt as X,
	Vt as Y,
	Wt as Z,
	pt as _,
	rr as a,
	X as a0,
	ue as a1,
	In as a2,
	ht as a3,
	Ut as a4,
	jr as a5,
	Bn as a6,
	Qn as a7,
	Xn as a8,
	Zn as a9,
	de as aa,
	eo as ab,
	rn as ac,
	Dn as ad,
	$t as ae,
	Fn as af,
	ao as ag,
	Hn as ah,
	Pn as ai,
	vr as aj,
	Vn as ak,
	Or as al,
	ro as am,
	Gn as an,
	Rn as ao,
	Un as ap,
	to as aq,
	st as ar,
	te as b,
	Jn as c,
	io as d,
	Ee as e,
	K as f,
	v as g,
	Rr as h,
	We as i,
	Pr as j,
	Yt as k,
	Fe as l,
	pe as m,
	ge as n,
	Ue as o,
	O as p,
	w as q,
	Kn as r,
	Ae as s,
	I as t,
	et as u,
	Yn as v,
	Me as w,
	Pt as x,
	qr as y,
	oo as z
};
//# sourceMappingURL=lite.js.map
