import {
	d as ve,
	w as ot,
	_ as R,
	S as se,
	i as ue,
	s as ce,
	c as pt,
	b as je,
	a as mt,
	e as X,
	f as le,
	m as q,
	g as I,
	h as vo,
	j as Eo,
	k as yo,
	l as ne,
	t as B,
	n as Z,
	o as re,
	p as P,
	q as S,
	r as lt,
	u as cn,
	v as So,
	x as To,
	y as De,
	z as Io,
	A as wo,
	B as ke,
	C as v,
	D as fe,
	E as b,
	F as ae,
	G as A,
	H as G,
	I as O,
	J as Pe,
	K as ee,
	L as Ce,
	M as Fe,
	N as Ie,
	O as Ao,
	P as Po,
	Q as Co,
	R as Bo,
	T as Ho
} from "../lite.js";
import { B as at, a as Oo } from "./Button-5b68d65a.js";
var xo = function (t) {
	return ko(t) && !Lo(t);
};
function ko(e) {
	return !!e && typeof e == "object";
}
function Lo(e) {
	var t = Object.prototype.toString.call(e);
	return t === "[object RegExp]" || t === "[object Date]" || Mo(e);
}
var No = typeof Symbol == "function" && Symbol.for,
	Ro = No ? Symbol.for("react.element") : 60103;
function Mo(e) {
	return e.$$typeof === Ro;
}
function jo(e) {
	return Array.isArray(e) ? [] : {};
}
function we(e, t) {
	return t.clone !== !1 && t.isMergeableObject(e) ? me(jo(e), e, t) : e;
}
function Do(e, t, n) {
	return e.concat(t).map(function (r) {
		return we(r, n);
	});
}
function Fo(e, t) {
	if (!t.customMerge) return me;
	var n = t.customMerge(e);
	return typeof n == "function" ? n : me;
}
function Go(e) {
	return Object.getOwnPropertySymbols
		? Object.getOwnPropertySymbols(e).filter(function (t) {
				return e.propertyIsEnumerable(t);
		  })
		: [];
}
function dt(e) {
	return Object.keys(e).concat(Go(e));
}
function fn(e, t) {
	try {
		return t in e;
	} catch {
		return !1;
	}
}
function Uo(e, t) {
	return (
		fn(e, t) &&
		!(
			Object.hasOwnProperty.call(e, t) && Object.propertyIsEnumerable.call(e, t)
		)
	);
}
function Vo(e, t, n) {
	var r = {};
	return (
		n.isMergeableObject(e) &&
			dt(e).forEach(function (i) {
				r[i] = we(e[i], n);
			}),
		dt(t).forEach(function (i) {
			Uo(e, i) ||
				(fn(e, i) && n.isMergeableObject(t[i])
					? (r[i] = Fo(i, n)(e[i], t[i], n))
					: (r[i] = we(t[i], n)));
		}),
		r
	);
}
function me(e, t, n) {
	(n = n || {}),
		(n.arrayMerge = n.arrayMerge || Do),
		(n.isMergeableObject = n.isMergeableObject || xo),
		(n.cloneUnlessOtherwiseSpecified = we);
	var r = Array.isArray(t),
		i = Array.isArray(e),
		o = r === i;
	return o ? (r ? n.arrayMerge(e, t, n) : Vo(e, t, n)) : we(t, n);
}
me.all = function (t, n) {
	if (!Array.isArray(t)) throw new Error("first argument should be an array");
	return t.reduce(function (r, i) {
		return me(r, i, n);
	}, {});
};
var zo = me,
	Xo = zo,
	Qe = function (e, t) {
		return (
			(Qe =
				Object.setPrototypeOf ||
				({ __proto__: [] } instanceof Array &&
					function (n, r) {
						n.__proto__ = r;
					}) ||
				function (n, r) {
					for (var i in r)
						Object.prototype.hasOwnProperty.call(r, i) && (n[i] = r[i]);
				}),
			Qe(e, t)
		);
	};
function Ue(e, t) {
	if (typeof t != "function" && t !== null)
		throw new TypeError(
			"Class extends value " + String(t) + " is not a constructor or null"
		);
	Qe(e, t);
	function n() {
		this.constructor = e;
	}
	e.prototype =
		t === null ? Object.create(t) : ((n.prototype = t.prototype), new n());
}
var U = function () {
	return (
		(U =
			Object.assign ||
			function (t) {
				for (var n, r = 1, i = arguments.length; r < i; r++) {
					n = arguments[r];
					for (var o in n)
						Object.prototype.hasOwnProperty.call(n, o) && (t[o] = n[o]);
				}
				return t;
			}),
		U.apply(this, arguments)
	);
};
function Xe(e, t, n) {
	if (n || arguments.length === 2)
		for (var r = 0, i = t.length, o; r < i; r++)
			(o || !(r in t)) &&
				(o || (o = Array.prototype.slice.call(t, 0, r)), (o[r] = t[r]));
	return e.concat(o || Array.prototype.slice.call(t));
}
var j;
(function (e) {
	(e[(e.EXPECT_ARGUMENT_CLOSING_BRACE = 1)] = "EXPECT_ARGUMENT_CLOSING_BRACE"),
		(e[(e.EMPTY_ARGUMENT = 2)] = "EMPTY_ARGUMENT"),
		(e[(e.MALFORMED_ARGUMENT = 3)] = "MALFORMED_ARGUMENT"),
		(e[(e.EXPECT_ARGUMENT_TYPE = 4)] = "EXPECT_ARGUMENT_TYPE"),
		(e[(e.INVALID_ARGUMENT_TYPE = 5)] = "INVALID_ARGUMENT_TYPE"),
		(e[(e.EXPECT_ARGUMENT_STYLE = 6)] = "EXPECT_ARGUMENT_STYLE"),
		(e[(e.INVALID_NUMBER_SKELETON = 7)] = "INVALID_NUMBER_SKELETON"),
		(e[(e.INVALID_DATE_TIME_SKELETON = 8)] = "INVALID_DATE_TIME_SKELETON"),
		(e[(e.EXPECT_NUMBER_SKELETON = 9)] = "EXPECT_NUMBER_SKELETON"),
		(e[(e.EXPECT_DATE_TIME_SKELETON = 10)] = "EXPECT_DATE_TIME_SKELETON"),
		(e[(e.UNCLOSED_QUOTE_IN_ARGUMENT_STYLE = 11)] =
			"UNCLOSED_QUOTE_IN_ARGUMENT_STYLE"),
		(e[(e.EXPECT_SELECT_ARGUMENT_OPTIONS = 12)] =
			"EXPECT_SELECT_ARGUMENT_OPTIONS"),
		(e[(e.EXPECT_PLURAL_ARGUMENT_OFFSET_VALUE = 13)] =
			"EXPECT_PLURAL_ARGUMENT_OFFSET_VALUE"),
		(e[(e.INVALID_PLURAL_ARGUMENT_OFFSET_VALUE = 14)] =
			"INVALID_PLURAL_ARGUMENT_OFFSET_VALUE"),
		(e[(e.EXPECT_SELECT_ARGUMENT_SELECTOR = 15)] =
			"EXPECT_SELECT_ARGUMENT_SELECTOR"),
		(e[(e.EXPECT_PLURAL_ARGUMENT_SELECTOR = 16)] =
			"EXPECT_PLURAL_ARGUMENT_SELECTOR"),
		(e[(e.EXPECT_SELECT_ARGUMENT_SELECTOR_FRAGMENT = 17)] =
			"EXPECT_SELECT_ARGUMENT_SELECTOR_FRAGMENT"),
		(e[(e.EXPECT_PLURAL_ARGUMENT_SELECTOR_FRAGMENT = 18)] =
			"EXPECT_PLURAL_ARGUMENT_SELECTOR_FRAGMENT"),
		(e[(e.INVALID_PLURAL_ARGUMENT_SELECTOR = 19)] =
			"INVALID_PLURAL_ARGUMENT_SELECTOR"),
		(e[(e.DUPLICATE_PLURAL_ARGUMENT_SELECTOR = 20)] =
			"DUPLICATE_PLURAL_ARGUMENT_SELECTOR"),
		(e[(e.DUPLICATE_SELECT_ARGUMENT_SELECTOR = 21)] =
			"DUPLICATE_SELECT_ARGUMENT_SELECTOR"),
		(e[(e.MISSING_OTHER_CLAUSE = 22)] = "MISSING_OTHER_CLAUSE"),
		(e[(e.INVALID_TAG = 23)] = "INVALID_TAG"),
		(e[(e.INVALID_TAG_NAME = 25)] = "INVALID_TAG_NAME"),
		(e[(e.UNMATCHED_CLOSING_TAG = 26)] = "UNMATCHED_CLOSING_TAG"),
		(e[(e.UNCLOSED_TAG = 27)] = "UNCLOSED_TAG");
})(j || (j = {}));
var z;
(function (e) {
	(e[(e.literal = 0)] = "literal"),
		(e[(e.argument = 1)] = "argument"),
		(e[(e.number = 2)] = "number"),
		(e[(e.date = 3)] = "date"),
		(e[(e.time = 4)] = "time"),
		(e[(e.select = 5)] = "select"),
		(e[(e.plural = 6)] = "plural"),
		(e[(e.pound = 7)] = "pound"),
		(e[(e.tag = 8)] = "tag");
})(z || (z = {}));
var de;
(function (e) {
	(e[(e.number = 0)] = "number"), (e[(e.dateTime = 1)] = "dateTime");
})(de || (de = {}));
function gt(e) {
	return e.type === z.literal;
}
function qo(e) {
	return e.type === z.argument;
}
function _n(e) {
	return e.type === z.number;
}
function hn(e) {
	return e.type === z.date;
}
function pn(e) {
	return e.type === z.time;
}
function mn(e) {
	return e.type === z.select;
}
function dn(e) {
	return e.type === z.plural;
}
function Zo(e) {
	return e.type === z.pound;
}
function gn(e) {
	return e.type === z.tag;
}
function bn(e) {
	return !!(e && typeof e == "object" && e.type === de.number);
}
function $e(e) {
	return !!(e && typeof e == "object" && e.type === de.dateTime);
}
var vn = /[ \xA0\u1680\u2000-\u200A\u202F\u205F\u3000]/,
	Wo =
		/(?:[Eec]{1,6}|G{1,5}|[Qq]{1,5}|(?:[yYur]+|U{1,5})|[ML]{1,5}|d{1,2}|D{1,3}|F{1}|[abB]{1,5}|[hkHK]{1,2}|w{1,2}|W{1}|m{1,2}|s{1,2}|[zZOvVxX]{1,4})(?=([^']*'[^']*')*[^']*$)/g;
function Yo(e) {
	var t = {};
	return (
		e.replace(Wo, function (n) {
			var r = n.length;
			switch (n[0]) {
				case "G":
					t.era = r === 4 ? "long" : r === 5 ? "narrow" : "short";
					break;
				case "y":
					t.year = r === 2 ? "2-digit" : "numeric";
					break;
				case "Y":
				case "u":
				case "U":
				case "r":
					throw new RangeError(
						"`Y/u/U/r` (year) patterns are not supported, use `y` instead"
					);
				case "q":
				case "Q":
					throw new RangeError("`q/Q` (quarter) patterns are not supported");
				case "M":
				case "L":
					t.month = ["numeric", "2-digit", "short", "long", "narrow"][r - 1];
					break;
				case "w":
				case "W":
					throw new RangeError("`w/W` (week) patterns are not supported");
				case "d":
					t.day = ["numeric", "2-digit"][r - 1];
					break;
				case "D":
				case "F":
				case "g":
					throw new RangeError(
						"`D/F/g` (day) patterns are not supported, use `d` instead"
					);
				case "E":
					t.weekday = r === 4 ? "short" : r === 5 ? "narrow" : "short";
					break;
				case "e":
					if (r < 4)
						throw new RangeError(
							"`e..eee` (weekday) patterns are not supported"
						);
					t.weekday = ["short", "long", "narrow", "short"][r - 4];
					break;
				case "c":
					if (r < 4)
						throw new RangeError(
							"`c..ccc` (weekday) patterns are not supported"
						);
					t.weekday = ["short", "long", "narrow", "short"][r - 4];
					break;
				case "a":
					t.hour12 = !0;
					break;
				case "b":
				case "B":
					throw new RangeError(
						"`b/B` (period) patterns are not supported, use `a` instead"
					);
				case "h":
					(t.hourCycle = "h12"), (t.hour = ["numeric", "2-digit"][r - 1]);
					break;
				case "H":
					(t.hourCycle = "h23"), (t.hour = ["numeric", "2-digit"][r - 1]);
					break;
				case "K":
					(t.hourCycle = "h11"), (t.hour = ["numeric", "2-digit"][r - 1]);
					break;
				case "k":
					(t.hourCycle = "h24"), (t.hour = ["numeric", "2-digit"][r - 1]);
					break;
				case "j":
				case "J":
				case "C":
					throw new RangeError(
						"`j/J/C` (hour) patterns are not supported, use `h/H/K/k` instead"
					);
				case "m":
					t.minute = ["numeric", "2-digit"][r - 1];
					break;
				case "s":
					t.second = ["numeric", "2-digit"][r - 1];
					break;
				case "S":
				case "A":
					throw new RangeError(
						"`S/A` (second) patterns are not supported, use `s` instead"
					);
				case "z":
					t.timeZoneName = r < 4 ? "short" : "long";
					break;
				case "Z":
				case "O":
				case "v":
				case "V":
				case "X":
				case "x":
					throw new RangeError(
						"`Z/O/v/V/X/x` (timeZone) patterns are not supported, use `z` instead"
					);
			}
			return "";
		}),
		t
	);
}
var Jo = /[\t-\r \x85\u200E\u200F\u2028\u2029]/i;
function Qo(e) {
	if (e.length === 0) throw new Error("Number skeleton cannot be empty");
	for (
		var t = e.split(Jo).filter(function (_) {
				return _.length > 0;
			}),
			n = [],
			r = 0,
			i = t;
		r < i.length;
		r++
	) {
		var o = i[r],
			a = o.split("/");
		if (a.length === 0) throw new Error("Invalid number skeleton");
		for (var l = a[0], c = a.slice(1), s = 0, u = c; s < u.length; s++) {
			var f = u[s];
			if (f.length === 0) throw new Error("Invalid number skeleton");
		}
		n.push({ stem: l, options: c });
	}
	return n;
}
function $o(e) {
	return e.replace(/^(.*?)-/, "");
}
var bt = /^\.(?:(0+)(\*)?|(#+)|(0+)(#+))$/g,
	En = /^(@+)?(\+|#+)?[rs]?$/g,
	Ko = /(\*)(0+)|(#+)(0+)|(0+)/g,
	yn = /^(0+)$/;
function vt(e) {
	var t = {};
	return (
		e[e.length - 1] === "r"
			? (t.roundingPriority = "morePrecision")
			: e[e.length - 1] === "s" && (t.roundingPriority = "lessPrecision"),
		e.replace(En, function (n, r, i) {
			return (
				typeof i != "string"
					? ((t.minimumSignificantDigits = r.length),
					  (t.maximumSignificantDigits = r.length))
					: i === "+"
					? (t.minimumSignificantDigits = r.length)
					: r[0] === "#"
					? (t.maximumSignificantDigits = r.length)
					: ((t.minimumSignificantDigits = r.length),
					  (t.maximumSignificantDigits =
							r.length + (typeof i == "string" ? i.length : 0))),
				""
			);
		}),
		t
	);
}
function Sn(e) {
	switch (e) {
		case "sign-auto":
			return { signDisplay: "auto" };
		case "sign-accounting":
		case "()":
			return { currencySign: "accounting" };
		case "sign-always":
		case "+!":
			return { signDisplay: "always" };
		case "sign-accounting-always":
		case "()!":
			return { signDisplay: "always", currencySign: "accounting" };
		case "sign-except-zero":
		case "+?":
			return { signDisplay: "exceptZero" };
		case "sign-accounting-except-zero":
		case "()?":
			return { signDisplay: "exceptZero", currencySign: "accounting" };
		case "sign-never":
		case "+_":
			return { signDisplay: "never" };
	}
}
function el(e) {
	var t;
	if (
		(e[0] === "E" && e[1] === "E"
			? ((t = { notation: "engineering" }), (e = e.slice(2)))
			: e[0] === "E" && ((t = { notation: "scientific" }), (e = e.slice(1))),
		t)
	) {
		var n = e.slice(0, 2);
		if (
			(n === "+!"
				? ((t.signDisplay = "always"), (e = e.slice(2)))
				: n === "+?" && ((t.signDisplay = "exceptZero"), (e = e.slice(2))),
			!yn.test(e))
		)
			throw new Error("Malformed concise eng/scientific notation");
		t.minimumIntegerDigits = e.length;
	}
	return t;
}
function Et(e) {
	var t = {},
		n = Sn(e);
	return n || t;
}
function tl(e) {
	for (var t = {}, n = 0, r = e; n < r.length; n++) {
		var i = r[n];
		switch (i.stem) {
			case "percent":
			case "%":
				t.style = "percent";
				continue;
			case "%x100":
				(t.style = "percent"), (t.scale = 100);
				continue;
			case "currency":
				(t.style = "currency"), (t.currency = i.options[0]);
				continue;
			case "group-off":
			case ",_":
				t.useGrouping = !1;
				continue;
			case "precision-integer":
			case ".":
				t.maximumFractionDigits = 0;
				continue;
			case "measure-unit":
			case "unit":
				(t.style = "unit"), (t.unit = $o(i.options[0]));
				continue;
			case "compact-short":
			case "K":
				(t.notation = "compact"), (t.compactDisplay = "short");
				continue;
			case "compact-long":
			case "KK":
				(t.notation = "compact"), (t.compactDisplay = "long");
				continue;
			case "scientific":
				t = U(
					U(U({}, t), { notation: "scientific" }),
					i.options.reduce(function (c, s) {
						return U(U({}, c), Et(s));
					}, {})
				);
				continue;
			case "engineering":
				t = U(
					U(U({}, t), { notation: "engineering" }),
					i.options.reduce(function (c, s) {
						return U(U({}, c), Et(s));
					}, {})
				);
				continue;
			case "notation-simple":
				t.notation = "standard";
				continue;
			case "unit-width-narrow":
				(t.currencyDisplay = "narrowSymbol"), (t.unitDisplay = "narrow");
				continue;
			case "unit-width-short":
				(t.currencyDisplay = "code"), (t.unitDisplay = "short");
				continue;
			case "unit-width-full-name":
				(t.currencyDisplay = "name"), (t.unitDisplay = "long");
				continue;
			case "unit-width-iso-code":
				t.currencyDisplay = "symbol";
				continue;
			case "scale":
				t.scale = parseFloat(i.options[0]);
				continue;
			case "integer-width":
				if (i.options.length > 1)
					throw new RangeError(
						"integer-width stems only accept a single optional option"
					);
				i.options[0].replace(Ko, function (c, s, u, f, _, m) {
					if (s) t.minimumIntegerDigits = u.length;
					else {
						if (f && _)
							throw new Error(
								"We currently do not support maximum integer digits"
							);
						if (m)
							throw new Error(
								"We currently do not support exact integer digits"
							);
					}
					return "";
				});
				continue;
		}
		if (yn.test(i.stem)) {
			t.minimumIntegerDigits = i.stem.length;
			continue;
		}
		if (bt.test(i.stem)) {
			if (i.options.length > 1)
				throw new RangeError(
					"Fraction-precision stems only accept a single optional option"
				);
			i.stem.replace(bt, function (c, s, u, f, _, m) {
				return (
					u === "*"
						? (t.minimumFractionDigits = s.length)
						: f && f[0] === "#"
						? (t.maximumFractionDigits = f.length)
						: _ && m
						? ((t.minimumFractionDigits = _.length),
						  (t.maximumFractionDigits = _.length + m.length))
						: ((t.minimumFractionDigits = s.length),
						  (t.maximumFractionDigits = s.length)),
					""
				);
			});
			var o = i.options[0];
			o === "w"
				? (t = U(U({}, t), { trailingZeroDisplay: "stripIfInteger" }))
				: o && (t = U(U({}, t), vt(o)));
			continue;
		}
		if (En.test(i.stem)) {
			t = U(U({}, t), vt(i.stem));
			continue;
		}
		var a = Sn(i.stem);
		a && (t = U(U({}, t), a));
		var l = el(i.stem);
		l && (t = U(U({}, t), l));
	}
	return t;
}
var Le = {
	AX: ["H"],
	BQ: ["H"],
	CP: ["H"],
	CZ: ["H"],
	DK: ["H"],
	FI: ["H"],
	ID: ["H"],
	IS: ["H"],
	ML: ["H"],
	NE: ["H"],
	RU: ["H"],
	SE: ["H"],
	SJ: ["H"],
	SK: ["H"],
	AS: ["h", "H"],
	BT: ["h", "H"],
	DJ: ["h", "H"],
	ER: ["h", "H"],
	GH: ["h", "H"],
	IN: ["h", "H"],
	LS: ["h", "H"],
	PG: ["h", "H"],
	PW: ["h", "H"],
	SO: ["h", "H"],
	TO: ["h", "H"],
	VU: ["h", "H"],
	WS: ["h", "H"],
	"001": ["H", "h"],
	AL: ["h", "H", "hB"],
	TD: ["h", "H", "hB"],
	"ca-ES": ["H", "h", "hB"],
	CF: ["H", "h", "hB"],
	CM: ["H", "h", "hB"],
	"fr-CA": ["H", "h", "hB"],
	"gl-ES": ["H", "h", "hB"],
	"it-CH": ["H", "h", "hB"],
	"it-IT": ["H", "h", "hB"],
	LU: ["H", "h", "hB"],
	NP: ["H", "h", "hB"],
	PF: ["H", "h", "hB"],
	SC: ["H", "h", "hB"],
	SM: ["H", "h", "hB"],
	SN: ["H", "h", "hB"],
	TF: ["H", "h", "hB"],
	VA: ["H", "h", "hB"],
	CY: ["h", "H", "hb", "hB"],
	GR: ["h", "H", "hb", "hB"],
	CO: ["h", "H", "hB", "hb"],
	DO: ["h", "H", "hB", "hb"],
	KP: ["h", "H", "hB", "hb"],
	KR: ["h", "H", "hB", "hb"],
	NA: ["h", "H", "hB", "hb"],
	PA: ["h", "H", "hB", "hb"],
	PR: ["h", "H", "hB", "hb"],
	VE: ["h", "H", "hB", "hb"],
	AC: ["H", "h", "hb", "hB"],
	AI: ["H", "h", "hb", "hB"],
	BW: ["H", "h", "hb", "hB"],
	BZ: ["H", "h", "hb", "hB"],
	CC: ["H", "h", "hb", "hB"],
	CK: ["H", "h", "hb", "hB"],
	CX: ["H", "h", "hb", "hB"],
	DG: ["H", "h", "hb", "hB"],
	FK: ["H", "h", "hb", "hB"],
	GB: ["H", "h", "hb", "hB"],
	GG: ["H", "h", "hb", "hB"],
	GI: ["H", "h", "hb", "hB"],
	IE: ["H", "h", "hb", "hB"],
	IM: ["H", "h", "hb", "hB"],
	IO: ["H", "h", "hb", "hB"],
	JE: ["H", "h", "hb", "hB"],
	LT: ["H", "h", "hb", "hB"],
	MK: ["H", "h", "hb", "hB"],
	MN: ["H", "h", "hb", "hB"],
	MS: ["H", "h", "hb", "hB"],
	NF: ["H", "h", "hb", "hB"],
	NG: ["H", "h", "hb", "hB"],
	NR: ["H", "h", "hb", "hB"],
	NU: ["H", "h", "hb", "hB"],
	PN: ["H", "h", "hb", "hB"],
	SH: ["H", "h", "hb", "hB"],
	SX: ["H", "h", "hb", "hB"],
	TA: ["H", "h", "hb", "hB"],
	ZA: ["H", "h", "hb", "hB"],
	"af-ZA": ["H", "h", "hB", "hb"],
	AR: ["H", "h", "hB", "hb"],
	CL: ["H", "h", "hB", "hb"],
	CR: ["H", "h", "hB", "hb"],
	CU: ["H", "h", "hB", "hb"],
	EA: ["H", "h", "hB", "hb"],
	"es-BO": ["H", "h", "hB", "hb"],
	"es-BR": ["H", "h", "hB", "hb"],
	"es-EC": ["H", "h", "hB", "hb"],
	"es-ES": ["H", "h", "hB", "hb"],
	"es-GQ": ["H", "h", "hB", "hb"],
	"es-PE": ["H", "h", "hB", "hb"],
	GT: ["H", "h", "hB", "hb"],
	HN: ["H", "h", "hB", "hb"],
	IC: ["H", "h", "hB", "hb"],
	KG: ["H", "h", "hB", "hb"],
	KM: ["H", "h", "hB", "hb"],
	LK: ["H", "h", "hB", "hb"],
	MA: ["H", "h", "hB", "hb"],
	MX: ["H", "h", "hB", "hb"],
	NI: ["H", "h", "hB", "hb"],
	PY: ["H", "h", "hB", "hb"],
	SV: ["H", "h", "hB", "hb"],
	UY: ["H", "h", "hB", "hb"],
	JP: ["H", "h", "K"],
	AD: ["H", "hB"],
	AM: ["H", "hB"],
	AO: ["H", "hB"],
	AT: ["H", "hB"],
	AW: ["H", "hB"],
	BE: ["H", "hB"],
	BF: ["H", "hB"],
	BJ: ["H", "hB"],
	BL: ["H", "hB"],
	BR: ["H", "hB"],
	CG: ["H", "hB"],
	CI: ["H", "hB"],
	CV: ["H", "hB"],
	DE: ["H", "hB"],
	EE: ["H", "hB"],
	FR: ["H", "hB"],
	GA: ["H", "hB"],
	GF: ["H", "hB"],
	GN: ["H", "hB"],
	GP: ["H", "hB"],
	GW: ["H", "hB"],
	HR: ["H", "hB"],
	IL: ["H", "hB"],
	IT: ["H", "hB"],
	KZ: ["H", "hB"],
	MC: ["H", "hB"],
	MD: ["H", "hB"],
	MF: ["H", "hB"],
	MQ: ["H", "hB"],
	MZ: ["H", "hB"],
	NC: ["H", "hB"],
	NL: ["H", "hB"],
	PM: ["H", "hB"],
	PT: ["H", "hB"],
	RE: ["H", "hB"],
	RO: ["H", "hB"],
	SI: ["H", "hB"],
	SR: ["H", "hB"],
	ST: ["H", "hB"],
	TG: ["H", "hB"],
	TR: ["H", "hB"],
	WF: ["H", "hB"],
	YT: ["H", "hB"],
	BD: ["h", "hB", "H"],
	PK: ["h", "hB", "H"],
	AZ: ["H", "hB", "h"],
	BA: ["H", "hB", "h"],
	BG: ["H", "hB", "h"],
	CH: ["H", "hB", "h"],
	GE: ["H", "hB", "h"],
	LI: ["H", "hB", "h"],
	ME: ["H", "hB", "h"],
	RS: ["H", "hB", "h"],
	UA: ["H", "hB", "h"],
	UZ: ["H", "hB", "h"],
	XK: ["H", "hB", "h"],
	AG: ["h", "hb", "H", "hB"],
	AU: ["h", "hb", "H", "hB"],
	BB: ["h", "hb", "H", "hB"],
	BM: ["h", "hb", "H", "hB"],
	BS: ["h", "hb", "H", "hB"],
	CA: ["h", "hb", "H", "hB"],
	DM: ["h", "hb", "H", "hB"],
	"en-001": ["h", "hb", "H", "hB"],
	FJ: ["h", "hb", "H", "hB"],
	FM: ["h", "hb", "H", "hB"],
	GD: ["h", "hb", "H", "hB"],
	GM: ["h", "hb", "H", "hB"],
	GU: ["h", "hb", "H", "hB"],
	GY: ["h", "hb", "H", "hB"],
	JM: ["h", "hb", "H", "hB"],
	KI: ["h", "hb", "H", "hB"],
	KN: ["h", "hb", "H", "hB"],
	KY: ["h", "hb", "H", "hB"],
	LC: ["h", "hb", "H", "hB"],
	LR: ["h", "hb", "H", "hB"],
	MH: ["h", "hb", "H", "hB"],
	MP: ["h", "hb", "H", "hB"],
	MW: ["h", "hb", "H", "hB"],
	NZ: ["h", "hb", "H", "hB"],
	SB: ["h", "hb", "H", "hB"],
	SG: ["h", "hb", "H", "hB"],
	SL: ["h", "hb", "H", "hB"],
	SS: ["h", "hb", "H", "hB"],
	SZ: ["h", "hb", "H", "hB"],
	TC: ["h", "hb", "H", "hB"],
	TT: ["h", "hb", "H", "hB"],
	UM: ["h", "hb", "H", "hB"],
	US: ["h", "hb", "H", "hB"],
	VC: ["h", "hb", "H", "hB"],
	VG: ["h", "hb", "H", "hB"],
	VI: ["h", "hb", "H", "hB"],
	ZM: ["h", "hb", "H", "hB"],
	BO: ["H", "hB", "h", "hb"],
	EC: ["H", "hB", "h", "hb"],
	ES: ["H", "hB", "h", "hb"],
	GQ: ["H", "hB", "h", "hb"],
	PE: ["H", "hB", "h", "hb"],
	AE: ["h", "hB", "hb", "H"],
	"ar-001": ["h", "hB", "hb", "H"],
	BH: ["h", "hB", "hb", "H"],
	DZ: ["h", "hB", "hb", "H"],
	EG: ["h", "hB", "hb", "H"],
	EH: ["h", "hB", "hb", "H"],
	HK: ["h", "hB", "hb", "H"],
	IQ: ["h", "hB", "hb", "H"],
	JO: ["h", "hB", "hb", "H"],
	KW: ["h", "hB", "hb", "H"],
	LB: ["h", "hB", "hb", "H"],
	LY: ["h", "hB", "hb", "H"],
	MO: ["h", "hB", "hb", "H"],
	MR: ["h", "hB", "hb", "H"],
	OM: ["h", "hB", "hb", "H"],
	PH: ["h", "hB", "hb", "H"],
	PS: ["h", "hB", "hb", "H"],
	QA: ["h", "hB", "hb", "H"],
	SA: ["h", "hB", "hb", "H"],
	SD: ["h", "hB", "hb", "H"],
	SY: ["h", "hB", "hb", "H"],
	TN: ["h", "hB", "hb", "H"],
	YE: ["h", "hB", "hb", "H"],
	AF: ["H", "hb", "hB", "h"],
	LA: ["H", "hb", "hB", "h"],
	CN: ["H", "hB", "hb", "h"],
	LV: ["H", "hB", "hb", "h"],
	TL: ["H", "hB", "hb", "h"],
	"zu-ZA": ["H", "hB", "hb", "h"],
	CD: ["hB", "H"],
	IR: ["hB", "H"],
	"hi-IN": ["hB", "h", "H"],
	"kn-IN": ["hB", "h", "H"],
	"ml-IN": ["hB", "h", "H"],
	"te-IN": ["hB", "h", "H"],
	KH: ["hB", "h", "H", "hb"],
	"ta-IN": ["hB", "h", "hb", "H"],
	BN: ["hb", "hB", "h", "H"],
	MY: ["hb", "hB", "h", "H"],
	ET: ["hB", "hb", "h", "H"],
	"gu-IN": ["hB", "hb", "h", "H"],
	"mr-IN": ["hB", "hb", "h", "H"],
	"pa-IN": ["hB", "hb", "h", "H"],
	TW: ["hB", "hb", "h", "H"],
	KE: ["hB", "hb", "H", "h"],
	MM: ["hB", "hb", "H", "h"],
	TZ: ["hB", "hb", "H", "h"],
	UG: ["hB", "hb", "H", "h"]
};
function nl(e, t) {
	for (var n = "", r = 0; r < e.length; r++) {
		var i = e.charAt(r);
		if (i === "j") {
			for (var o = 0; r + 1 < e.length && e.charAt(r + 1) === i; ) o++, r++;
			var a = 1 + (o & 1),
				l = o < 2 ? 1 : 3 + (o >> 1),
				c = "a",
				s = rl(t);
			for ((s == "H" || s == "k") && (l = 0); l-- > 0; ) n += c;
			for (; a-- > 0; ) n = s + n;
		} else i === "J" ? (n += "H") : (n += i);
	}
	return n;
}
function rl(e) {
	var t = e.hourCycle;
	if (
		(t === void 0 &&
			e.hourCycles &&
			e.hourCycles.length &&
			(t = e.hourCycles[0]),
		t)
	)
		switch (t) {
			case "h24":
				return "k";
			case "h23":
				return "H";
			case "h12":
				return "h";
			case "h11":
				return "K";
			default:
				throw new Error("Invalid hourCycle");
		}
	var n = e.language,
		r;
	n !== "root" && (r = e.maximize().region);
	var i = Le[r || ""] || Le[n || ""] || Le["".concat(n, "-001")] || Le["001"];
	return i[0];
}
var qe,
	il = new RegExp("^".concat(vn.source, "*")),
	ol = new RegExp("".concat(vn.source, "*$"));
function F(e, t) {
	return { start: e, end: t };
}
var ll = !!String.prototype.startsWith,
	al = !!String.fromCodePoint,
	sl = !!Object.fromEntries,
	ul = !!String.prototype.codePointAt,
	cl = !!String.prototype.trimStart,
	fl = !!String.prototype.trimEnd,
	_l = !!Number.isSafeInteger,
	hl = _l
		? Number.isSafeInteger
		: function (e) {
				return (
					typeof e == "number" &&
					isFinite(e) &&
					Math.floor(e) === e &&
					Math.abs(e) <= 9007199254740991
				);
		  },
	Ke = !0;
try {
	var pl = In("([^\\p{White_Space}\\p{Pattern_Syntax}]*)", "yu");
	Ke = ((qe = pl.exec("a")) === null || qe === void 0 ? void 0 : qe[0]) === "a";
} catch {
	Ke = !1;
}
var yt = ll
		? function (t, n, r) {
				return t.startsWith(n, r);
		  }
		: function (t, n, r) {
				return t.slice(r, r + n.length) === n;
		  },
	et = al
		? String.fromCodePoint
		: function () {
				for (var t = [], n = 0; n < arguments.length; n++) t[n] = arguments[n];
				for (var r = "", i = t.length, o = 0, a; i > o; ) {
					if (((a = t[o++]), a > 1114111))
						throw RangeError(a + " is not a valid code point");
					r +=
						a < 65536
							? String.fromCharCode(a)
							: String.fromCharCode(
									((a -= 65536) >> 10) + 55296,
									(a % 1024) + 56320
							  );
				}
				return r;
		  },
	St = sl
		? Object.fromEntries
		: function (t) {
				for (var n = {}, r = 0, i = t; r < i.length; r++) {
					var o = i[r],
						a = o[0],
						l = o[1];
					n[a] = l;
				}
				return n;
		  },
	Tn = ul
		? function (t, n) {
				return t.codePointAt(n);
		  }
		: function (t, n) {
				var r = t.length;
				if (!(n < 0 || n >= r)) {
					var i = t.charCodeAt(n),
						o;
					return i < 55296 ||
						i > 56319 ||
						n + 1 === r ||
						(o = t.charCodeAt(n + 1)) < 56320 ||
						o > 57343
						? i
						: ((i - 55296) << 10) + (o - 56320) + 65536;
				}
		  },
	ml = cl
		? function (t) {
				return t.trimStart();
		  }
		: function (t) {
				return t.replace(il, "");
		  },
	dl = fl
		? function (t) {
				return t.trimEnd();
		  }
		: function (t) {
				return t.replace(ol, "");
		  };
function In(e, t) {
	return new RegExp(e, t);
}
var tt;
if (Ke) {
	var Tt = In("([^\\p{White_Space}\\p{Pattern_Syntax}]*)", "yu");
	tt = function (t, n) {
		var r;
		Tt.lastIndex = n;
		var i = Tt.exec(t);
		return (r = i[1]) !== null && r !== void 0 ? r : "";
	};
} else
	tt = function (t, n) {
		for (var r = []; ; ) {
			var i = Tn(t, n);
			if (i === void 0 || wn(i) || El(i)) break;
			r.push(i), (n += i >= 65536 ? 2 : 1);
		}
		return et.apply(void 0, r);
	};
var gl = (function () {
	function e(t, n) {
		n === void 0 && (n = {}),
			(this.message = t),
			(this.position = { offset: 0, line: 1, column: 1 }),
			(this.ignoreTag = !!n.ignoreTag),
			(this.locale = n.locale),
			(this.requiresOtherClause = !!n.requiresOtherClause),
			(this.shouldParseSkeletons = !!n.shouldParseSkeletons);
	}
	return (
		(e.prototype.parse = function () {
			if (this.offset() !== 0) throw Error("parser can only be used once");
			return this.parseMessage(0, "", !1);
		}),
		(e.prototype.parseMessage = function (t, n, r) {
			for (var i = []; !this.isEOF(); ) {
				var o = this.char();
				if (o === 123) {
					var a = this.parseArgument(t, r);
					if (a.err) return a;
					i.push(a.val);
				} else {
					if (o === 125 && t > 0) break;
					if (o === 35 && (n === "plural" || n === "selectordinal")) {
						var l = this.clonePosition();
						this.bump(),
							i.push({ type: z.pound, location: F(l, this.clonePosition()) });
					} else if (o === 60 && !this.ignoreTag && this.peek() === 47) {
						if (r) break;
						return this.error(
							j.UNMATCHED_CLOSING_TAG,
							F(this.clonePosition(), this.clonePosition())
						);
					} else if (o === 60 && !this.ignoreTag && nt(this.peek() || 0)) {
						var a = this.parseTag(t, n);
						if (a.err) return a;
						i.push(a.val);
					} else {
						var a = this.parseLiteral(t, n);
						if (a.err) return a;
						i.push(a.val);
					}
				}
			}
			return { val: i, err: null };
		}),
		(e.prototype.parseTag = function (t, n) {
			var r = this.clonePosition();
			this.bump();
			var i = this.parseTagName();
			if ((this.bumpSpace(), this.bumpIf("/>")))
				return {
					val: {
						type: z.literal,
						value: "<".concat(i, "/>"),
						location: F(r, this.clonePosition())
					},
					err: null
				};
			if (this.bumpIf(">")) {
				var o = this.parseMessage(t + 1, n, !0);
				if (o.err) return o;
				var a = o.val,
					l = this.clonePosition();
				if (this.bumpIf("</")) {
					if (this.isEOF() || !nt(this.char()))
						return this.error(j.INVALID_TAG, F(l, this.clonePosition()));
					var c = this.clonePosition(),
						s = this.parseTagName();
					return i !== s
						? this.error(j.UNMATCHED_CLOSING_TAG, F(c, this.clonePosition()))
						: (this.bumpSpace(),
						  this.bumpIf(">")
								? {
										val: {
											type: z.tag,
											value: i,
											children: a,
											location: F(r, this.clonePosition())
										},
										err: null
								  }
								: this.error(j.INVALID_TAG, F(l, this.clonePosition())));
				} else return this.error(j.UNCLOSED_TAG, F(r, this.clonePosition()));
			} else return this.error(j.INVALID_TAG, F(r, this.clonePosition()));
		}),
		(e.prototype.parseTagName = function () {
			var t = this.offset();
			for (this.bump(); !this.isEOF() && vl(this.char()); ) this.bump();
			return this.message.slice(t, this.offset());
		}),
		(e.prototype.parseLiteral = function (t, n) {
			for (var r = this.clonePosition(), i = ""; ; ) {
				var o = this.tryParseQuote(n);
				if (o) {
					i += o;
					continue;
				}
				var a = this.tryParseUnquoted(t, n);
				if (a) {
					i += a;
					continue;
				}
				var l = this.tryParseLeftAngleBracket();
				if (l) {
					i += l;
					continue;
				}
				break;
			}
			var c = F(r, this.clonePosition());
			return { val: { type: z.literal, value: i, location: c }, err: null };
		}),
		(e.prototype.tryParseLeftAngleBracket = function () {
			return !this.isEOF() &&
				this.char() === 60 &&
				(this.ignoreTag || !bl(this.peek() || 0))
				? (this.bump(), "<")
				: null;
		}),
		(e.prototype.tryParseQuote = function (t) {
			if (this.isEOF() || this.char() !== 39) return null;
			switch (this.peek()) {
				case 39:
					return this.bump(), this.bump(), "'";
				case 123:
				case 60:
				case 62:
				case 125:
					break;
				case 35:
					if (t === "plural" || t === "selectordinal") break;
					return null;
				default:
					return null;
			}
			this.bump();
			var n = [this.char()];
			for (this.bump(); !this.isEOF(); ) {
				var r = this.char();
				if (r === 39)
					if (this.peek() === 39) n.push(39), this.bump();
					else {
						this.bump();
						break;
					}
				else n.push(r);
				this.bump();
			}
			return et.apply(void 0, n);
		}),
		(e.prototype.tryParseUnquoted = function (t, n) {
			if (this.isEOF()) return null;
			var r = this.char();
			return r === 60 ||
				r === 123 ||
				(r === 35 && (n === "plural" || n === "selectordinal")) ||
				(r === 125 && t > 0)
				? null
				: (this.bump(), et(r));
		}),
		(e.prototype.parseArgument = function (t, n) {
			var r = this.clonePosition();
			if ((this.bump(), this.bumpSpace(), this.isEOF()))
				return this.error(
					j.EXPECT_ARGUMENT_CLOSING_BRACE,
					F(r, this.clonePosition())
				);
			if (this.char() === 125)
				return (
					this.bump(), this.error(j.EMPTY_ARGUMENT, F(r, this.clonePosition()))
				);
			var i = this.parseIdentifierIfPossible().value;
			if (!i)
				return this.error(j.MALFORMED_ARGUMENT, F(r, this.clonePosition()));
			if ((this.bumpSpace(), this.isEOF()))
				return this.error(
					j.EXPECT_ARGUMENT_CLOSING_BRACE,
					F(r, this.clonePosition())
				);
			switch (this.char()) {
				case 125:
					return (
						this.bump(),
						{
							val: {
								type: z.argument,
								value: i,
								location: F(r, this.clonePosition())
							},
							err: null
						}
					);
				case 44:
					return (
						this.bump(),
						this.bumpSpace(),
						this.isEOF()
							? this.error(
									j.EXPECT_ARGUMENT_CLOSING_BRACE,
									F(r, this.clonePosition())
							  )
							: this.parseArgumentOptions(t, n, i, r)
					);
				default:
					return this.error(j.MALFORMED_ARGUMENT, F(r, this.clonePosition()));
			}
		}),
		(e.prototype.parseIdentifierIfPossible = function () {
			var t = this.clonePosition(),
				n = this.offset(),
				r = tt(this.message, n),
				i = n + r.length;
			this.bumpTo(i);
			var o = this.clonePosition(),
				a = F(t, o);
			return { value: r, location: a };
		}),
		(e.prototype.parseArgumentOptions = function (t, n, r, i) {
			var o,
				a = this.clonePosition(),
				l = this.parseIdentifierIfPossible().value,
				c = this.clonePosition();
			switch (l) {
				case "":
					return this.error(j.EXPECT_ARGUMENT_TYPE, F(a, c));
				case "number":
				case "date":
				case "time": {
					this.bumpSpace();
					var s = null;
					if (this.bumpIf(",")) {
						this.bumpSpace();
						var u = this.clonePosition(),
							f = this.parseSimpleArgStyleIfPossible();
						if (f.err) return f;
						var _ = dl(f.val);
						if (_.length === 0)
							return this.error(
								j.EXPECT_ARGUMENT_STYLE,
								F(this.clonePosition(), this.clonePosition())
							);
						var m = F(u, this.clonePosition());
						s = { style: _, styleLocation: m };
					}
					var g = this.tryParseArgumentClose(i);
					if (g.err) return g;
					var p = F(i, this.clonePosition());
					if (s && yt(s?.style, "::", 0)) {
						var y = ml(s.style.slice(2));
						if (l === "number") {
							var f = this.parseNumberSkeletonFromString(y, s.styleLocation);
							return f.err
								? f
								: {
										val: {
											type: z.number,
											value: r,
											location: p,
											style: f.val
										},
										err: null
								  };
						} else {
							if (y.length === 0)
								return this.error(j.EXPECT_DATE_TIME_SKELETON, p);
							var T = y;
							this.locale && (T = nl(y, this.locale));
							var _ = {
									type: de.dateTime,
									pattern: T,
									location: s.styleLocation,
									parsedOptions: this.shouldParseSkeletons ? Yo(T) : {}
								},
								C = l === "date" ? z.date : z.time;
							return {
								val: { type: C, value: r, location: p, style: _ },
								err: null
							};
						}
					}
					return {
						val: {
							type: l === "number" ? z.number : l === "date" ? z.date : z.time,
							value: r,
							location: p,
							style: (o = s?.style) !== null && o !== void 0 ? o : null
						},
						err: null
					};
				}
				case "plural":
				case "selectordinal":
				case "select": {
					var E = this.clonePosition();
					if ((this.bumpSpace(), !this.bumpIf(",")))
						return this.error(j.EXPECT_SELECT_ARGUMENT_OPTIONS, F(E, U({}, E)));
					this.bumpSpace();
					var h = this.parseIdentifierIfPossible(),
						M = 0;
					if (l !== "select" && h.value === "offset") {
						if (!this.bumpIf(":"))
							return this.error(
								j.EXPECT_PLURAL_ARGUMENT_OFFSET_VALUE,
								F(this.clonePosition(), this.clonePosition())
							);
						this.bumpSpace();
						var f = this.tryParseDecimalInteger(
							j.EXPECT_PLURAL_ARGUMENT_OFFSET_VALUE,
							j.INVALID_PLURAL_ARGUMENT_OFFSET_VALUE
						);
						if (f.err) return f;
						this.bumpSpace(),
							(h = this.parseIdentifierIfPossible()),
							(M = f.val);
					}
					var N = this.tryParsePluralOrSelectOptions(t, l, n, h);
					if (N.err) return N;
					var g = this.tryParseArgumentClose(i);
					if (g.err) return g;
					var W = F(i, this.clonePosition());
					return l === "select"
						? {
								val: {
									type: z.select,
									value: r,
									options: St(N.val),
									location: W
								},
								err: null
						  }
						: {
								val: {
									type: z.plural,
									value: r,
									options: St(N.val),
									offset: M,
									pluralType: l === "plural" ? "cardinal" : "ordinal",
									location: W
								},
								err: null
						  };
				}
				default:
					return this.error(j.INVALID_ARGUMENT_TYPE, F(a, c));
			}
		}),
		(e.prototype.tryParseArgumentClose = function (t) {
			return this.isEOF() || this.char() !== 125
				? this.error(
						j.EXPECT_ARGUMENT_CLOSING_BRACE,
						F(t, this.clonePosition())
				  )
				: (this.bump(), { val: !0, err: null });
		}),
		(e.prototype.parseSimpleArgStyleIfPossible = function () {
			for (var t = 0, n = this.clonePosition(); !this.isEOF(); ) {
				var r = this.char();
				switch (r) {
					case 39: {
						this.bump();
						var i = this.clonePosition();
						if (!this.bumpUntil("'"))
							return this.error(
								j.UNCLOSED_QUOTE_IN_ARGUMENT_STYLE,
								F(i, this.clonePosition())
							);
						this.bump();
						break;
					}
					case 123: {
						(t += 1), this.bump();
						break;
					}
					case 125: {
						if (t > 0) t -= 1;
						else
							return {
								val: this.message.slice(n.offset, this.offset()),
								err: null
							};
						break;
					}
					default:
						this.bump();
						break;
				}
			}
			return { val: this.message.slice(n.offset, this.offset()), err: null };
		}),
		(e.prototype.parseNumberSkeletonFromString = function (t, n) {
			var r = [];
			try {
				r = Qo(t);
			} catch {
				return this.error(j.INVALID_NUMBER_SKELETON, n);
			}
			return {
				val: {
					type: de.number,
					tokens: r,
					location: n,
					parsedOptions: this.shouldParseSkeletons ? tl(r) : {}
				},
				err: null
			};
		}),
		(e.prototype.tryParsePluralOrSelectOptions = function (t, n, r, i) {
			for (
				var o, a = !1, l = [], c = new Set(), s = i.value, u = i.location;
				;

			) {
				if (s.length === 0) {
					var f = this.clonePosition();
					if (n !== "select" && this.bumpIf("=")) {
						var _ = this.tryParseDecimalInteger(
							j.EXPECT_PLURAL_ARGUMENT_SELECTOR,
							j.INVALID_PLURAL_ARGUMENT_SELECTOR
						);
						if (_.err) return _;
						(u = F(f, this.clonePosition())),
							(s = this.message.slice(f.offset, this.offset()));
					} else break;
				}
				if (c.has(s))
					return this.error(
						n === "select"
							? j.DUPLICATE_SELECT_ARGUMENT_SELECTOR
							: j.DUPLICATE_PLURAL_ARGUMENT_SELECTOR,
						u
					);
				s === "other" && (a = !0), this.bumpSpace();
				var m = this.clonePosition();
				if (!this.bumpIf("{"))
					return this.error(
						n === "select"
							? j.EXPECT_SELECT_ARGUMENT_SELECTOR_FRAGMENT
							: j.EXPECT_PLURAL_ARGUMENT_SELECTOR_FRAGMENT,
						F(this.clonePosition(), this.clonePosition())
					);
				var g = this.parseMessage(t + 1, n, r);
				if (g.err) return g;
				var p = this.tryParseArgumentClose(m);
				if (p.err) return p;
				l.push([s, { value: g.val, location: F(m, this.clonePosition()) }]),
					c.add(s),
					this.bumpSpace(),
					(o = this.parseIdentifierIfPossible()),
					(s = o.value),
					(u = o.location);
			}
			return l.length === 0
				? this.error(
						n === "select"
							? j.EXPECT_SELECT_ARGUMENT_SELECTOR
							: j.EXPECT_PLURAL_ARGUMENT_SELECTOR,
						F(this.clonePosition(), this.clonePosition())
				  )
				: this.requiresOtherClause && !a
				? this.error(
						j.MISSING_OTHER_CLAUSE,
						F(this.clonePosition(), this.clonePosition())
				  )
				: { val: l, err: null };
		}),
		(e.prototype.tryParseDecimalInteger = function (t, n) {
			var r = 1,
				i = this.clonePosition();
			this.bumpIf("+") || (this.bumpIf("-") && (r = -1));
			for (var o = !1, a = 0; !this.isEOF(); ) {
				var l = this.char();
				if (l >= 48 && l <= 57) (o = !0), (a = a * 10 + (l - 48)), this.bump();
				else break;
			}
			var c = F(i, this.clonePosition());
			return o
				? ((a *= r), hl(a) ? { val: a, err: null } : this.error(n, c))
				: this.error(t, c);
		}),
		(e.prototype.offset = function () {
			return this.position.offset;
		}),
		(e.prototype.isEOF = function () {
			return this.offset() === this.message.length;
		}),
		(e.prototype.clonePosition = function () {
			return {
				offset: this.position.offset,
				line: this.position.line,
				column: this.position.column
			};
		}),
		(e.prototype.char = function () {
			var t = this.position.offset;
			if (t >= this.message.length) throw Error("out of bound");
			var n = Tn(this.message, t);
			if (n === void 0)
				throw Error(
					"Offset ".concat(t, " is at invalid UTF-16 code unit boundary")
				);
			return n;
		}),
		(e.prototype.error = function (t, n) {
			return {
				val: null,
				err: { kind: t, message: this.message, location: n }
			};
		}),
		(e.prototype.bump = function () {
			if (!this.isEOF()) {
				var t = this.char();
				t === 10
					? ((this.position.line += 1),
					  (this.position.column = 1),
					  (this.position.offset += 1))
					: ((this.position.column += 1),
					  (this.position.offset += t < 65536 ? 1 : 2));
			}
		}),
		(e.prototype.bumpIf = function (t) {
			if (yt(this.message, t, this.offset())) {
				for (var n = 0; n < t.length; n++) this.bump();
				return !0;
			}
			return !1;
		}),
		(e.prototype.bumpUntil = function (t) {
			var n = this.offset(),
				r = this.message.indexOf(t, n);
			return r >= 0
				? (this.bumpTo(r), !0)
				: (this.bumpTo(this.message.length), !1);
		}),
		(e.prototype.bumpTo = function (t) {
			if (this.offset() > t)
				throw Error(
					"targetOffset "
						.concat(t, " must be greater than or equal to the current offset ")
						.concat(this.offset())
				);
			for (t = Math.min(t, this.message.length); ; ) {
				var n = this.offset();
				if (n === t) break;
				if (n > t)
					throw Error(
						"targetOffset ".concat(
							t,
							" is at invalid UTF-16 code unit boundary"
						)
					);
				if ((this.bump(), this.isEOF())) break;
			}
		}),
		(e.prototype.bumpSpace = function () {
			for (; !this.isEOF() && wn(this.char()); ) this.bump();
		}),
		(e.prototype.peek = function () {
			if (this.isEOF()) return null;
			var t = this.char(),
				n = this.offset(),
				r = this.message.charCodeAt(n + (t >= 65536 ? 2 : 1));
			return r ?? null;
		}),
		e
	);
})();
function nt(e) {
	return (e >= 97 && e <= 122) || (e >= 65 && e <= 90);
}
function bl(e) {
	return nt(e) || e === 47;
}
function vl(e) {
	return (
		e === 45 ||
		e === 46 ||
		(e >= 48 && e <= 57) ||
		e === 95 ||
		(e >= 97 && e <= 122) ||
		(e >= 65 && e <= 90) ||
		e == 183 ||
		(e >= 192 && e <= 214) ||
		(e >= 216 && e <= 246) ||
		(e >= 248 && e <= 893) ||
		(e >= 895 && e <= 8191) ||
		(e >= 8204 && e <= 8205) ||
		(e >= 8255 && e <= 8256) ||
		(e >= 8304 && e <= 8591) ||
		(e >= 11264 && e <= 12271) ||
		(e >= 12289 && e <= 55295) ||
		(e >= 63744 && e <= 64975) ||
		(e >= 65008 && e <= 65533) ||
		(e >= 65536 && e <= 983039)
	);
}
function wn(e) {
	return (
		(e >= 9 && e <= 13) ||
		e === 32 ||
		e === 133 ||
		(e >= 8206 && e <= 8207) ||
		e === 8232 ||
		e === 8233
	);
}
function El(e) {
	return (
		(e >= 33 && e <= 35) ||
		e === 36 ||
		(e >= 37 && e <= 39) ||
		e === 40 ||
		e === 41 ||
		e === 42 ||
		e === 43 ||
		e === 44 ||
		e === 45 ||
		(e >= 46 && e <= 47) ||
		(e >= 58 && e <= 59) ||
		(e >= 60 && e <= 62) ||
		(e >= 63 && e <= 64) ||
		e === 91 ||
		e === 92 ||
		e === 93 ||
		e === 94 ||
		e === 96 ||
		e === 123 ||
		e === 124 ||
		e === 125 ||
		e === 126 ||
		e === 161 ||
		(e >= 162 && e <= 165) ||
		e === 166 ||
		e === 167 ||
		e === 169 ||
		e === 171 ||
		e === 172 ||
		e === 174 ||
		e === 176 ||
		e === 177 ||
		e === 182 ||
		e === 187 ||
		e === 191 ||
		e === 215 ||
		e === 247 ||
		(e >= 8208 && e <= 8213) ||
		(e >= 8214 && e <= 8215) ||
		e === 8216 ||
		e === 8217 ||
		e === 8218 ||
		(e >= 8219 && e <= 8220) ||
		e === 8221 ||
		e === 8222 ||
		e === 8223 ||
		(e >= 8224 && e <= 8231) ||
		(e >= 8240 && e <= 8248) ||
		e === 8249 ||
		e === 8250 ||
		(e >= 8251 && e <= 8254) ||
		(e >= 8257 && e <= 8259) ||
		e === 8260 ||
		e === 8261 ||
		e === 8262 ||
		(e >= 8263 && e <= 8273) ||
		e === 8274 ||
		e === 8275 ||
		(e >= 8277 && e <= 8286) ||
		(e >= 8592 && e <= 8596) ||
		(e >= 8597 && e <= 8601) ||
		(e >= 8602 && e <= 8603) ||
		(e >= 8604 && e <= 8607) ||
		e === 8608 ||
		(e >= 8609 && e <= 8610) ||
		e === 8611 ||
		(e >= 8612 && e <= 8613) ||
		e === 8614 ||
		(e >= 8615 && e <= 8621) ||
		e === 8622 ||
		(e >= 8623 && e <= 8653) ||
		(e >= 8654 && e <= 8655) ||
		(e >= 8656 && e <= 8657) ||
		e === 8658 ||
		e === 8659 ||
		e === 8660 ||
		(e >= 8661 && e <= 8691) ||
		(e >= 8692 && e <= 8959) ||
		(e >= 8960 && e <= 8967) ||
		e === 8968 ||
		e === 8969 ||
		e === 8970 ||
		e === 8971 ||
		(e >= 8972 && e <= 8991) ||
		(e >= 8992 && e <= 8993) ||
		(e >= 8994 && e <= 9e3) ||
		e === 9001 ||
		e === 9002 ||
		(e >= 9003 && e <= 9083) ||
		e === 9084 ||
		(e >= 9085 && e <= 9114) ||
		(e >= 9115 && e <= 9139) ||
		(e >= 9140 && e <= 9179) ||
		(e >= 9180 && e <= 9185) ||
		(e >= 9186 && e <= 9254) ||
		(e >= 9255 && e <= 9279) ||
		(e >= 9280 && e <= 9290) ||
		(e >= 9291 && e <= 9311) ||
		(e >= 9472 && e <= 9654) ||
		e === 9655 ||
		(e >= 9656 && e <= 9664) ||
		e === 9665 ||
		(e >= 9666 && e <= 9719) ||
		(e >= 9720 && e <= 9727) ||
		(e >= 9728 && e <= 9838) ||
		e === 9839 ||
		(e >= 9840 && e <= 10087) ||
		e === 10088 ||
		e === 10089 ||
		e === 10090 ||
		e === 10091 ||
		e === 10092 ||
		e === 10093 ||
		e === 10094 ||
		e === 10095 ||
		e === 10096 ||
		e === 10097 ||
		e === 10098 ||
		e === 10099 ||
		e === 10100 ||
		e === 10101 ||
		(e >= 10132 && e <= 10175) ||
		(e >= 10176 && e <= 10180) ||
		e === 10181 ||
		e === 10182 ||
		(e >= 10183 && e <= 10213) ||
		e === 10214 ||
		e === 10215 ||
		e === 10216 ||
		e === 10217 ||
		e === 10218 ||
		e === 10219 ||
		e === 10220 ||
		e === 10221 ||
		e === 10222 ||
		e === 10223 ||
		(e >= 10224 && e <= 10239) ||
		(e >= 10240 && e <= 10495) ||
		(e >= 10496 && e <= 10626) ||
		e === 10627 ||
		e === 10628 ||
		e === 10629 ||
		e === 10630 ||
		e === 10631 ||
		e === 10632 ||
		e === 10633 ||
		e === 10634 ||
		e === 10635 ||
		e === 10636 ||
		e === 10637 ||
		e === 10638 ||
		e === 10639 ||
		e === 10640 ||
		e === 10641 ||
		e === 10642 ||
		e === 10643 ||
		e === 10644 ||
		e === 10645 ||
		e === 10646 ||
		e === 10647 ||
		e === 10648 ||
		(e >= 10649 && e <= 10711) ||
		e === 10712 ||
		e === 10713 ||
		e === 10714 ||
		e === 10715 ||
		(e >= 10716 && e <= 10747) ||
		e === 10748 ||
		e === 10749 ||
		(e >= 10750 && e <= 11007) ||
		(e >= 11008 && e <= 11055) ||
		(e >= 11056 && e <= 11076) ||
		(e >= 11077 && e <= 11078) ||
		(e >= 11079 && e <= 11084) ||
		(e >= 11085 && e <= 11123) ||
		(e >= 11124 && e <= 11125) ||
		(e >= 11126 && e <= 11157) ||
		e === 11158 ||
		(e >= 11159 && e <= 11263) ||
		(e >= 11776 && e <= 11777) ||
		e === 11778 ||
		e === 11779 ||
		e === 11780 ||
		e === 11781 ||
		(e >= 11782 && e <= 11784) ||
		e === 11785 ||
		e === 11786 ||
		e === 11787 ||
		e === 11788 ||
		e === 11789 ||
		(e >= 11790 && e <= 11798) ||
		e === 11799 ||
		(e >= 11800 && e <= 11801) ||
		e === 11802 ||
		e === 11803 ||
		e === 11804 ||
		e === 11805 ||
		(e >= 11806 && e <= 11807) ||
		e === 11808 ||
		e === 11809 ||
		e === 11810 ||
		e === 11811 ||
		e === 11812 ||
		e === 11813 ||
		e === 11814 ||
		e === 11815 ||
		e === 11816 ||
		e === 11817 ||
		(e >= 11818 && e <= 11822) ||
		e === 11823 ||
		(e >= 11824 && e <= 11833) ||
		(e >= 11834 && e <= 11835) ||
		(e >= 11836 && e <= 11839) ||
		e === 11840 ||
		e === 11841 ||
		e === 11842 ||
		(e >= 11843 && e <= 11855) ||
		(e >= 11856 && e <= 11857) ||
		e === 11858 ||
		(e >= 11859 && e <= 11903) ||
		(e >= 12289 && e <= 12291) ||
		e === 12296 ||
		e === 12297 ||
		e === 12298 ||
		e === 12299 ||
		e === 12300 ||
		e === 12301 ||
		e === 12302 ||
		e === 12303 ||
		e === 12304 ||
		e === 12305 ||
		(e >= 12306 && e <= 12307) ||
		e === 12308 ||
		e === 12309 ||
		e === 12310 ||
		e === 12311 ||
		e === 12312 ||
		e === 12313 ||
		e === 12314 ||
		e === 12315 ||
		e === 12316 ||
		e === 12317 ||
		(e >= 12318 && e <= 12319) ||
		e === 12320 ||
		e === 12336 ||
		e === 64830 ||
		e === 64831 ||
		(e >= 65093 && e <= 65094)
	);
}
function rt(e) {
	e.forEach(function (t) {
		if ((delete t.location, mn(t) || dn(t)))
			for (var n in t.options)
				delete t.options[n].location, rt(t.options[n].value);
		else
			(_n(t) && bn(t.style)) || ((hn(t) || pn(t)) && $e(t.style))
				? delete t.style.location
				: gn(t) && rt(t.children);
	});
}
function yl(e, t) {
	t === void 0 && (t = {}),
		(t = U({ shouldParseSkeletons: !0, requiresOtherClause: !0 }, t));
	var n = new gl(e, t).parse();
	if (n.err) {
		var r = SyntaxError(j[n.err.kind]);
		throw (
			((r.location = n.err.location), (r.originalMessage = n.err.message), r)
		);
	}
	return t?.captureLocation || rt(n.val), n.val;
}
function Ze(e, t) {
	var n = t && t.cache ? t.cache : Pl,
		r = t && t.serializer ? t.serializer : Al,
		i = t && t.strategy ? t.strategy : Tl;
	return i(e, { cache: n, serializer: r });
}
function Sl(e) {
	return e == null || typeof e == "number" || typeof e == "boolean";
}
function An(e, t, n, r) {
	var i = Sl(r) ? r : n(r),
		o = t.get(i);
	return typeof o > "u" && ((o = e.call(this, r)), t.set(i, o)), o;
}
function Pn(e, t, n) {
	var r = Array.prototype.slice.call(arguments, 3),
		i = n(r),
		o = t.get(i);
	return typeof o > "u" && ((o = e.apply(this, r)), t.set(i, o)), o;
}
function st(e, t, n, r, i) {
	return n.bind(t, e, r, i);
}
function Tl(e, t) {
	var n = e.length === 1 ? An : Pn;
	return st(e, this, n, t.cache.create(), t.serializer);
}
function Il(e, t) {
	return st(e, this, Pn, t.cache.create(), t.serializer);
}
function wl(e, t) {
	return st(e, this, An, t.cache.create(), t.serializer);
}
var Al = function () {
	return JSON.stringify(arguments);
};
function ut() {
	this.cache = Object.create(null);
}
ut.prototype.get = function (e) {
	return this.cache[e];
};
ut.prototype.set = function (e, t) {
	this.cache[e] = t;
};
var Pl = {
		create: function () {
			return new ut();
		}
	},
	We = { variadic: Il, monadic: wl },
	ge;
(function (e) {
	(e.MISSING_VALUE = "MISSING_VALUE"),
		(e.INVALID_VALUE = "INVALID_VALUE"),
		(e.MISSING_INTL_API = "MISSING_INTL_API");
})(ge || (ge = {}));
var Ve = (function (e) {
		Ue(t, e);
		function t(n, r, i) {
			var o = e.call(this, n) || this;
			return (o.code = r), (o.originalMessage = i), o;
		}
		return (
			(t.prototype.toString = function () {
				return "[formatjs Error: ".concat(this.code, "] ").concat(this.message);
			}),
			t
		);
	})(Error),
	It = (function (e) {
		Ue(t, e);
		function t(n, r, i, o) {
			return (
				e.call(
					this,
					'Invalid values for "'
						.concat(n, '": "')
						.concat(r, '". Options are "')
						.concat(Object.keys(i).join('", "'), '"'),
					ge.INVALID_VALUE,
					o
				) || this
			);
		}
		return t;
	})(Ve),
	Cl = (function (e) {
		Ue(t, e);
		function t(n, r, i) {
			return (
				e.call(
					this,
					'Value for "'.concat(n, '" must be of type ').concat(r),
					ge.INVALID_VALUE,
					i
				) || this
			);
		}
		return t;
	})(Ve),
	Bl = (function (e) {
		Ue(t, e);
		function t(n, r) {
			return (
				e.call(
					this,
					'The intl string context variable "'
						.concat(n, '" was not provided to the string "')
						.concat(r, '"'),
					ge.MISSING_VALUE,
					r
				) || this
			);
		}
		return t;
	})(Ve),
	te;
(function (e) {
	(e[(e.literal = 0)] = "literal"), (e[(e.object = 1)] = "object");
})(te || (te = {}));
function Hl(e) {
	return e.length < 2
		? e
		: e.reduce(function (t, n) {
				var r = t[t.length - 1];
				return (
					!r || r.type !== te.literal || n.type !== te.literal
						? t.push(n)
						: (r.value += n.value),
					t
				);
		  }, []);
}
function Ol(e) {
	return typeof e == "function";
}
function Ne(e, t, n, r, i, o, a) {
	if (e.length === 1 && gt(e[0]))
		return [{ type: te.literal, value: e[0].value }];
	for (var l = [], c = 0, s = e; c < s.length; c++) {
		var u = s[c];
		if (gt(u)) {
			l.push({ type: te.literal, value: u.value });
			continue;
		}
		if (Zo(u)) {
			typeof o == "number" &&
				l.push({ type: te.literal, value: n.getNumberFormat(t).format(o) });
			continue;
		}
		var f = u.value;
		if (!(i && f in i)) throw new Bl(f, a);
		var _ = i[f];
		if (qo(u)) {
			(!_ || typeof _ == "string" || typeof _ == "number") &&
				(_ = typeof _ == "string" || typeof _ == "number" ? String(_) : ""),
				l.push({
					type: typeof _ == "string" ? te.literal : te.object,
					value: _
				});
			continue;
		}
		if (hn(u)) {
			var m =
				typeof u.style == "string"
					? r.date[u.style]
					: $e(u.style)
					? u.style.parsedOptions
					: void 0;
			l.push({ type: te.literal, value: n.getDateTimeFormat(t, m).format(_) });
			continue;
		}
		if (pn(u)) {
			var m =
				typeof u.style == "string"
					? r.time[u.style]
					: $e(u.style)
					? u.style.parsedOptions
					: r.time.medium;
			l.push({ type: te.literal, value: n.getDateTimeFormat(t, m).format(_) });
			continue;
		}
		if (_n(u)) {
			var m =
				typeof u.style == "string"
					? r.number[u.style]
					: bn(u.style)
					? u.style.parsedOptions
					: void 0;
			m && m.scale && (_ = _ * (m.scale || 1)),
				l.push({ type: te.literal, value: n.getNumberFormat(t, m).format(_) });
			continue;
		}
		if (gn(u)) {
			var g = u.children,
				p = u.value,
				y = i[p];
			if (!Ol(y)) throw new Cl(p, "function", a);
			var T = Ne(g, t, n, r, i, o),
				C = y(
					T.map(function (M) {
						return M.value;
					})
				);
			Array.isArray(C) || (C = [C]),
				l.push.apply(
					l,
					C.map(function (M) {
						return {
							type: typeof M == "string" ? te.literal : te.object,
							value: M
						};
					})
				);
		}
		if (mn(u)) {
			var E = u.options[_] || u.options.other;
			if (!E) throw new It(u.value, _, Object.keys(u.options), a);
			l.push.apply(l, Ne(E.value, t, n, r, i));
			continue;
		}
		if (dn(u)) {
			var E = u.options["=".concat(_)];
			if (!E) {
				if (!Intl.PluralRules)
					throw new Ve(
						`Intl.PluralRules is not available in this environment.
Try polyfilling it using "@formatjs/intl-pluralrules"
`,
						ge.MISSING_INTL_API,
						a
					);
				var h = n
					.getPluralRules(t, { type: u.pluralType })
					.select(_ - (u.offset || 0));
				E = u.options[h] || u.options.other;
			}
			if (!E) throw new It(u.value, _, Object.keys(u.options), a);
			l.push.apply(l, Ne(E.value, t, n, r, i, _ - (u.offset || 0)));
			continue;
		}
	}
	return Hl(l);
}
function xl(e, t) {
	return t
		? U(
				U(U({}, e || {}), t || {}),
				Object.keys(e).reduce(function (n, r) {
					return (n[r] = U(U({}, e[r]), t[r] || {})), n;
				}, {})
		  )
		: e;
}
function kl(e, t) {
	return t
		? Object.keys(e).reduce(
				function (n, r) {
					return (n[r] = xl(e[r], t[r])), n;
				},
				U({}, e)
		  )
		: e;
}
function Ye(e) {
	return {
		create: function () {
			return {
				get: function (t) {
					return e[t];
				},
				set: function (t, n) {
					e[t] = n;
				}
			};
		}
	};
}
function Ll(e) {
	return (
		e === void 0 && (e = { number: {}, dateTime: {}, pluralRules: {} }),
		{
			getNumberFormat: Ze(
				function () {
					for (var t, n = [], r = 0; r < arguments.length; r++)
						n[r] = arguments[r];
					return new ((t = Intl.NumberFormat).bind.apply(
						t,
						Xe([void 0], n, !1)
					))();
				},
				{ cache: Ye(e.number), strategy: We.variadic }
			),
			getDateTimeFormat: Ze(
				function () {
					for (var t, n = [], r = 0; r < arguments.length; r++)
						n[r] = arguments[r];
					return new ((t = Intl.DateTimeFormat).bind.apply(
						t,
						Xe([void 0], n, !1)
					))();
				},
				{ cache: Ye(e.dateTime), strategy: We.variadic }
			),
			getPluralRules: Ze(
				function () {
					for (var t, n = [], r = 0; r < arguments.length; r++)
						n[r] = arguments[r];
					return new ((t = Intl.PluralRules).bind.apply(
						t,
						Xe([void 0], n, !1)
					))();
				},
				{ cache: Ye(e.pluralRules), strategy: We.variadic }
			)
		}
	);
}
var Nl = (function () {
	function e(t, n, r, i) {
		var o = this;
		if (
			(n === void 0 && (n = e.defaultLocale),
			(this.formatterCache = { number: {}, dateTime: {}, pluralRules: {} }),
			(this.format = function (a) {
				var l = o.formatToParts(a);
				if (l.length === 1) return l[0].value;
				var c = l.reduce(function (s, u) {
					return (
						!s.length ||
						u.type !== te.literal ||
						typeof s[s.length - 1] != "string"
							? s.push(u.value)
							: (s[s.length - 1] += u.value),
						s
					);
				}, []);
				return c.length <= 1 ? c[0] || "" : c;
			}),
			(this.formatToParts = function (a) {
				return Ne(
					o.ast,
					o.locales,
					o.formatters,
					o.formats,
					a,
					void 0,
					o.message
				);
			}),
			(this.resolvedOptions = function () {
				return { locale: o.resolvedLocale.toString() };
			}),
			(this.getAst = function () {
				return o.ast;
			}),
			(this.locales = n),
			(this.resolvedLocale = e.resolveLocale(n)),
			typeof t == "string")
		) {
			if (((this.message = t), !e.__parse))
				throw new TypeError(
					"IntlMessageFormat.__parse must be set to process `message` of type `string`"
				);
			this.ast = e.__parse(t, {
				ignoreTag: i?.ignoreTag,
				locale: this.resolvedLocale
			});
		} else this.ast = t;
		if (!Array.isArray(this.ast))
			throw new TypeError("A message must be provided as a String or AST.");
		(this.formats = kl(e.formats, r)),
			(this.formatters = (i && i.formatters) || Ll(this.formatterCache));
	}
	return (
		Object.defineProperty(e, "defaultLocale", {
			get: function () {
				return (
					e.memoizedDefaultLocale ||
						(e.memoizedDefaultLocale =
							new Intl.NumberFormat().resolvedOptions().locale),
					e.memoizedDefaultLocale
				);
			},
			enumerable: !1,
			configurable: !0
		}),
		(e.memoizedDefaultLocale = null),
		(e.resolveLocale = function (t) {
			var n = Intl.NumberFormat.supportedLocalesOf(t);
			return n.length > 0
				? new Intl.Locale(n[0])
				: new Intl.Locale(typeof t == "string" ? t : t[0]);
		}),
		(e.__parse = yl),
		(e.formats = {
			number: {
				integer: { maximumFractionDigits: 0 },
				currency: { style: "currency" },
				percent: { style: "percent" }
			},
			date: {
				short: { month: "numeric", day: "numeric", year: "2-digit" },
				medium: { month: "short", day: "numeric", year: "numeric" },
				long: { month: "long", day: "numeric", year: "numeric" },
				full: {
					weekday: "long",
					month: "long",
					day: "numeric",
					year: "numeric"
				}
			},
			time: {
				short: { hour: "numeric", minute: "numeric" },
				medium: { hour: "numeric", minute: "numeric", second: "numeric" },
				long: {
					hour: "numeric",
					minute: "numeric",
					second: "numeric",
					timeZoneName: "short"
				},
				full: {
					hour: "numeric",
					minute: "numeric",
					second: "numeric",
					timeZoneName: "short"
				}
			}
		}),
		e
	);
})();
const he = {},
	Rl = (e, t, n) =>
		n && (t in he || (he[t] = {}), e in he[t] || (he[t][e] = n), n),
	Cn = (e, t) => {
		if (t == null) return;
		if (t in he && e in he[t]) return he[t][e];
		const n = He(t);
		for (let r = 0; r < n.length; r++) {
			const i = Ml(n[r], e);
			if (i) return Rl(e, t, i);
		}
	};
let ct;
const Be = ot({});
function Bn(e) {
	return e in ct;
}
function Ml(e, t) {
	if (!Bn(e)) return null;
	const n = (function (r) {
		return ct[r] || null;
	})(e);
	return (function (r, i) {
		if (i == null) return;
		if (i in r) return r[i];
		const o = i.split(".");
		let a = r;
		for (let l = 0; l < o.length; l++)
			if (typeof a == "object") {
				if (l > 0) {
					const c = o.slice(l, o.length).join(".");
					if (c in a) {
						a = a[c];
						break;
					}
				}
				a = a[o[l]];
			} else a = void 0;
		return a;
	})(n, t);
}
function Hn(e, ...t) {
	delete he[e], Be.update((n) => ((n[e] = Xo.all([n[e] || {}, ...t])), n));
}
ve([Be], ([e]) => Object.keys(e));
Be.subscribe((e) => (ct = e));
const Re = {};
function On(e) {
	return Re[e];
}
function Ge(e) {
	return (
		e != null &&
		He(e).some((t) => {
			var n;
			return (n = On(t)) === null || n === void 0 ? void 0 : n.size;
		})
	);
}
function jl(e, t) {
	return Promise.all(
		t.map(
			(r) => (
				(function (i, o) {
					Re[i].delete(o), Re[i].size === 0 && delete Re[i];
				})(e, r),
				r().then((i) => i.default || i)
			)
		)
	).then((r) => Hn(e, ...r));
}
const Se = {};
function xn(e) {
	if (!Ge(e)) return e in Se ? Se[e] : Promise.resolve();
	const t = (function (n) {
		return He(n)
			.map((r) => {
				const i = On(r);
				return [r, i ? [...i] : []];
			})
			.filter(([, r]) => r.length > 0);
	})(e);
	return (
		(Se[e] = Promise.all(t.map(([n, r]) => jl(n, r))).then(() => {
			if (Ge(e)) return xn(e);
			delete Se[e];
		})),
		Se[e]
	);
}
function Dl({ locale: e, id: t }) {
	console.warn(
		`[svelte-i18n] The message "${t}" was not found in "${He(e).join(
			'", "'
		)}".${
			Ge(pe())
				? `

Note: there are at least one loader still registered to this locale that wasn't executed.`
				: ""
		}`
	);
}
const Te = {
	fallbackLocale: null,
	loadingDelay: 200,
	formats: {
		number: {
			scientific: { notation: "scientific" },
			engineering: { notation: "engineering" },
			compactLong: { notation: "compact", compactDisplay: "long" },
			compactShort: { notation: "compact", compactDisplay: "short" }
		},
		date: {
			short: { month: "numeric", day: "numeric", year: "2-digit" },
			medium: { month: "short", day: "numeric", year: "numeric" },
			long: { month: "long", day: "numeric", year: "numeric" },
			full: { weekday: "long", month: "long", day: "numeric", year: "numeric" }
		},
		time: {
			short: { hour: "numeric", minute: "numeric" },
			medium: { hour: "numeric", minute: "numeric", second: "numeric" },
			long: {
				hour: "numeric",
				minute: "numeric",
				second: "numeric",
				timeZoneName: "short"
			},
			full: {
				hour: "numeric",
				minute: "numeric",
				second: "numeric",
				timeZoneName: "short"
			}
		}
	},
	warnOnMissingMessages: !0,
	handleMissingMessage: void 0,
	ignoreTag: !0
};
function be() {
	return Te;
}
function Fl(e) {
	const { formats: t, ...n } = e,
		r = e.initialLocale || e.fallbackLocale;
	return (
		n.warnOnMissingMessages &&
			(delete n.warnOnMissingMessages,
			n.handleMissingMessage == null
				? (n.handleMissingMessage = Dl)
				: console.warn(
						'[svelte-i18n] The "warnOnMissingMessages" option is deprecated. Please use the "handleMissingMessage" option instead.'
				  )),
		Object.assign(Te, n, { initialLocale: r }),
		t &&
			("number" in t && Object.assign(Te.formats.number, t.number),
			"date" in t && Object.assign(Te.formats.date, t.date),
			"time" in t && Object.assign(Te.formats.time, t.time)),
		Ee.set(r)
	);
}
const Je = ot(!1);
let it;
const Me = ot(null);
function wt(e) {
	return e
		.split("-")
		.map((t, n, r) => r.slice(0, n + 1).join("-"))
		.reverse();
}
function He(e, t = be().fallbackLocale) {
	const n = wt(e);
	return t ? [...new Set([...n, ...wt(t)])] : n;
}
function pe() {
	return it ?? void 0;
}
Me.subscribe((e) => {
	(it = e ?? void 0),
		typeof window < "u" &&
			e != null &&
			document.documentElement.setAttribute("lang", e);
});
const Ee = {
		...Me,
		set: (e) => {
			if (
				e &&
				(function (t) {
					if (t == null) return;
					const n = He(t);
					for (let r = 0; r < n.length; r++) {
						const i = n[r];
						if (Bn(i)) return i;
					}
				})(e) &&
				Ge(e)
			) {
				const { loadingDelay: t } = be();
				let n;
				return (
					typeof window < "u" && pe() != null && t
						? (n = window.setTimeout(() => Je.set(!0), t))
						: Je.set(!0),
					xn(e)
						.then(() => {
							Me.set(e);
						})
						.finally(() => {
							clearTimeout(n), Je.set(!1);
						})
				);
			}
			return Me.set(e);
		}
	},
	Gl = () =>
		typeof window > "u"
			? null
			: window.navigator.language || window.navigator.languages[0],
	ze = (e) => {
		const t = Object.create(null);
		return (n) => {
			const r = JSON.stringify(n);
			return r in t ? t[r] : (t[r] = e(n));
		};
	},
	Ae = (e, t) => {
		const { formats: n } = be();
		if (e in n && t in n[e]) return n[e][t];
		throw new Error(`[svelte-i18n] Unknown "${t}" ${e} format.`);
	},
	Ul = ze(({ locale: e, format: t, ...n }) => {
		if (e == null)
			throw new Error('[svelte-i18n] A "locale" must be set to format numbers');
		return t && (n = Ae("number", t)), new Intl.NumberFormat(e, n);
	}),
	Vl = ze(({ locale: e, format: t, ...n }) => {
		if (e == null)
			throw new Error('[svelte-i18n] A "locale" must be set to format dates');
		return (
			t
				? (n = Ae("date", t))
				: Object.keys(n).length === 0 && (n = Ae("date", "short")),
			new Intl.DateTimeFormat(e, n)
		);
	}),
	zl = ze(({ locale: e, format: t, ...n }) => {
		if (e == null)
			throw new Error(
				'[svelte-i18n] A "locale" must be set to format time values'
			);
		return (
			t
				? (n = Ae("time", t))
				: Object.keys(n).length === 0 && (n = Ae("time", "short")),
			new Intl.DateTimeFormat(e, n)
		);
	}),
	Xl = ({ locale: e = pe(), ...t } = {}) => Ul({ locale: e, ...t }),
	ql = ({ locale: e = pe(), ...t } = {}) => Vl({ locale: e, ...t }),
	Zl = ({ locale: e = pe(), ...t } = {}) => zl({ locale: e, ...t }),
	Wl = ze(
		(e, t = pe()) => new Nl(e, t, be().formats, { ignoreTag: be().ignoreTag })
	),
	Yl = (e, t = {}) => {
		var n, r, i, o;
		let a = t;
		typeof e == "object" && ((a = e), (e = a.id));
		const { values: l, locale: c = pe(), default: s } = a;
		if (c == null)
			throw new Error(
				"[svelte-i18n] Cannot format a message without first setting the initial locale."
			);
		let u = Cn(e, c);
		if (u) {
			if (typeof u != "string")
				return (
					console.warn(
						`[svelte-i18n] Message with id "${e}" must be of type "string", found: "${typeof u}". Gettin its value through the "$format" method is deprecated; use the "json" method instead.`
					),
					u
				);
		} else
			u =
				(o =
					(i =
						(r = (n = be()).handleMissingMessage) === null || r === void 0
							? void 0
							: r.call(n, { locale: c, id: e, defaultValue: s })) !== null &&
					i !== void 0
						? i
						: s) !== null && o !== void 0
					? o
					: e;
		if (!l) return u;
		let f = u;
		try {
			f = Wl(u, c).format(l);
		} catch (_) {
			_ instanceof Error &&
				console.warn(
					`[svelte-i18n] Message "${e}" has syntax error:`,
					_.message
				);
		}
		return f;
	},
	Jl = (e, t) => Zl(t).format(e),
	Ql = (e, t) => ql(t).format(e),
	$l = (e, t) => Xl(t).format(e),
	Kl = (e, t = pe()) => Cn(e, t),
	Ds = ve([Ee, Be], () => Yl);
ve([Ee], () => Jl);
ve([Ee], () => Ql);
ve([Ee], () => $l);
ve([Ee, Be], () => Kl);
const ea = {
		accordion: () =>
			R(
				() => import("./index-5b070a13.js"),
				[
					"./index-5b070a13.js",
					"../lite.js",
					"../lite.css",
					"./Button-5b68d65a.js",
					"./Button-4cd12e76.css",
					"./Column-4ca2f558.js",
					"./Column-2853eb31.css",
					"./index-8f1feca1.css"
				],
				import.meta.url
			),
		annotatedimage: () =>
			R(
				() => import("./index-8d9bd210.js"),
				[
					"./index-8d9bd210.js",
					"../lite.js",
					"../lite.css",
					"./Button-5b68d65a.js",
					"./Button-4cd12e76.css",
					"./BlockLabel-e392131b.js",
					"./Empty-b331fdfe.js",
					"./Image-9065c566.js",
					"./ModifyUpload.svelte_svelte_type_style_lang-ba6baa96.js",
					"./ModifyUpload-77b0d4b2.css",
					"./index-f724f960.css",
					"./DropdownArrow-5fa4dd09.css"
				],
				import.meta.url
			),
		audio: () =>
			R(
				() => import("./index-7ec48f47.js"),
				[
					"./index-7ec48f47.js",
					"../lite.js",
					"../lite.css",
					"./UploadText-45e994b7.js",
					"./UploadText-33d53a1c.css",
					"./Button-5b68d65a.js",
					"./Button-4cd12e76.css",
					"./Upload-09ed31cf.js",
					"./ModifyUpload.svelte_svelte_type_style_lang-ba6baa96.js",
					"./ModifyUpload-77b0d4b2.css",
					"./ModifyUpload-33254150.js",
					"./DropdownArrow-5fa4dd09.css",
					"./BlockLabel-e392131b.js",
					"./Empty-b331fdfe.js",
					"./index-de9ed39e.css"
				],
				import.meta.url
			),
		box: () =>
			R(
				() => import("./index-8e0bbe14.js"),
				[
					"./index-8e0bbe14.js",
					"../lite.js",
					"../lite.css",
					"./Button-5b68d65a.js",
					"./Button-4cd12e76.css"
				],
				import.meta.url
			),
		button: () =>
			R(
				() => import("./index-5351f981.js"),
				[
					"./index-5351f981.js",
					"../lite.js",
					"../lite.css",
					"./Button-5b68d65a.js",
					"./Button-4cd12e76.css"
				],
				import.meta.url
			),
		chatbot: () =>
			R(
				() => import("./index-da4562a5.js"),
				[
					"./index-da4562a5.js",
					"../lite.js",
					"../lite.css",
					"./Button-5b68d65a.js",
					"./Button-4cd12e76.css",
					"./BlockLabel-e392131b.js",
					"./ModifyUpload.svelte_svelte_type_style_lang-ba6baa96.js",
					"./ModifyUpload-77b0d4b2.css",
					"./index-84912136.css",
					"./DropdownArrow-5fa4dd09.css"
				],
				import.meta.url
			),
		checkbox: () =>
			R(
				() => import("./index-ed59afdd.js"),
				[
					"./index-ed59afdd.js",
					"../lite.js",
					"../lite.css",
					"./Button-5b68d65a.js",
					"./Button-4cd12e76.css",
					"./Info-06b02eda.js",
					"./ColorPicker-25010187.css",
					"./DropdownArrow-5fa4dd09.css"
				],
				import.meta.url
			),
		checkboxgroup: () =>
			R(
				() => import("./index-b291cd31.js"),
				[
					"./index-b291cd31.js",
					"../lite.js",
					"../lite.css",
					"./Button-5b68d65a.js",
					"./Button-4cd12e76.css",
					"./BlockTitle-1b9e69db.js",
					"./Info-06b02eda.js",
					"./ColorPicker-25010187.css",
					"./DropdownArrow-5fa4dd09.css"
				],
				import.meta.url
			),
		code: () =>
			R(
				() => import("./index-6d84c79e.js").then((e) => e.F),
				[
					"./index-6d84c79e.js",
					"../lite.js",
					"../lite.css",
					"./Button-5b68d65a.js",
					"./Button-4cd12e76.css",
					"./BlockLabel-e392131b.js",
					"./Empty-b331fdfe.js",
					"./Copy-d120a3d6.js",
					"./Download-604a4bc6.js",
					"./index-4ccfb72c.css",
					"./DropdownArrow-5fa4dd09.css"
				],
				import.meta.url
			),
		colorpicker: () =>
			R(
				() => import("./index-6827df71.js"),
				[
					"./index-6827df71.js",
					"../lite.js",
					"../lite.css",
					"./Button-5b68d65a.js",
					"./Button-4cd12e76.css",
					"./BlockTitle-1b9e69db.js",
					"./Info-06b02eda.js",
					"./ColorPicker-25010187.css",
					"./DropdownArrow-5fa4dd09.css"
				],
				import.meta.url
			),
		column: () =>
			R(
				() => import("./index-b2fa3213.js"),
				[
					"./index-b2fa3213.js",
					"./Column-4ca2f558.js",
					"../lite.js",
					"../lite.css",
					"./Column-2853eb31.css"
				],
				import.meta.url
			),
		dataframe: () =>
			R(
				() => import("./index-2076b642.js"),
				[
					"./index-2076b642.js",
					"../lite.js",
					"../lite.css",
					"./Upload-09ed31cf.js",
					"./ModifyUpload.svelte_svelte_type_style_lang-ba6baa96.js",
					"./ModifyUpload-77b0d4b2.css",
					"./Button-5b68d65a.js",
					"./Button-4cd12e76.css",
					"./dsv-576afacd.js",
					"./index-b6262459.css",
					"./DropdownArrow-5fa4dd09.css"
				],
				import.meta.url
			),
		dataset: () =>
			R(
				() => import("./index-3ee78603.js"),
				[
					"./index-3ee78603.js",
					"../lite.js",
					"../lite.css",
					"./_commonjsHelpers-042e6b4d.js",
					"./Image-aef6d5f0.js",
					"./Image-003ee87c.css",
					"./csv-b0b7514a.js",
					"./dsv-576afacd.js",
					"./Model3D-909227f7.js",
					"./Model3D-98fc2b2c.css",
					"./index-4a8edf2e.css"
				],
				import.meta.url
			),
		dropdown: () =>
			R(
				() => import("./index-45f3fe47.js"),
				[
					"./index-45f3fe47.js",
					"../lite.js",
					"../lite.css",
					"./Button-5b68d65a.js",
					"./Button-4cd12e76.css",
					"./BlockTitle-1b9e69db.js",
					"./Info-06b02eda.js",
					"./ColorPicker-25010187.css",
					"./DropdownArrow-5fa4dd09.css"
				],
				import.meta.url
			),
		file: () =>
			R(
				() => import("./index-e0a12e7c.js"),
				[
					"./index-e0a12e7c.js",
					"../lite.js",
					"../lite.css",
					"./Button-5b68d65a.js",
					"./Button-4cd12e76.css",
					"./BlockLabel-e392131b.js",
					"./Empty-b331fdfe.js",
					"./File-33a0d259.js",
					"./Upload-09ed31cf.js",
					"./ModifyUpload.svelte_svelte_type_style_lang-ba6baa96.js",
					"./ModifyUpload-77b0d4b2.css",
					"./ModifyUpload-33254150.js",
					"./DropdownArrow-5fa4dd09.css",
					"./UploadText-45e994b7.js",
					"./UploadText-33d53a1c.css",
					"./index-3d04307a.js",
					"./index-aef3869a.css"
				],
				import.meta.url
			),
		form: () =>
			R(
				() => import("./index-13cc089e.js"),
				[
					"./index-13cc089e.js",
					"./Form-60c98f5d.js",
					"../lite.js",
					"../lite.css",
					"./Form-189d7bad.css"
				],
				import.meta.url
			),
		gallery: () =>
			R(
				() => import("./index-5f435148.js"),
				[
					"./index-5f435148.js",
					"../lite.js",
					"../lite.css",
					"./Button-5b68d65a.js",
					"./Button-4cd12e76.css",
					"./BlockLabel-e392131b.js",
					"./Empty-b331fdfe.js",
					"./ModifyUpload.svelte_svelte_type_style_lang-ba6baa96.js",
					"./ModifyUpload-77b0d4b2.css",
					"./ModifyUpload-33254150.js",
					"./DropdownArrow-5fa4dd09.css",
					"./Image-9065c566.js",
					"./index-b6b90748.css"
				],
				import.meta.url
			),
		group: () =>
			R(
				() => import("./index-48037fe2.js"),
				[
					"./index-48037fe2.js",
					"../lite.js",
					"../lite.css",
					"./index-7028de6e.css"
				],
				import.meta.url
			),
		highlightedtext: () =>
			R(
				() => import("./index-c37d98cd.js"),
				[
					"./index-c37d98cd.js",
					"../lite.js",
					"../lite.css",
					"./color-1d056486.js",
					"./Button-5b68d65a.js",
					"./Button-4cd12e76.css",
					"./BlockLabel-e392131b.js",
					"./Empty-b331fdfe.js",
					"./index-928645ac.css",
					"./DropdownArrow-5fa4dd09.css"
				],
				import.meta.url
			),
		html: () =>
			R(
				() => import("./index-5e7835e4.js"),
				[
					"./index-5e7835e4.js",
					"../lite.js",
					"../lite.css",
					"./Button-5b68d65a.js",
					"./Button-4cd12e76.css",
					"./index-329f8260.css"
				],
				import.meta.url
			),
		image: () =>
			R(
				() => import("./index-f728411e.js"),
				[
					"./index-f728411e.js",
					"../lite.js",
					"../lite.css",
					"./Button-5b68d65a.js",
					"./Button-4cd12e76.css",
					"./BlockLabel-e392131b.js",
					"./Image-9065c566.js",
					"./StaticImage.svelte_svelte_type_style_lang-8f029e82.js",
					"./StaticImage-ede66243.css",
					"./DropdownArrow-5fa4dd09.css",
					"./ModifyUpload-33254150.js",
					"./ModifyUpload.svelte_svelte_type_style_lang-ba6baa96.js",
					"./ModifyUpload-77b0d4b2.css",
					"./Upload-09ed31cf.js",
					"./Empty-b331fdfe.js",
					"./Download-604a4bc6.js",
					"./UploadText-45e994b7.js",
					"./UploadText-33d53a1c.css",
					"./Image-aef6d5f0.js",
					"./Image-003ee87c.css"
				],
				import.meta.url
			),
		interpretation: () =>
			R(
				() => import("./index-dc8e0dc7.js"),
				[
					"./index-dc8e0dc7.js",
					"../lite.js",
					"../lite.css",
					"./Button-5b68d65a.js",
					"./Button-4cd12e76.css",
					"./BlockTitle-1b9e69db.js",
					"./Info-06b02eda.js",
					"./index-6acaa952.css"
				],
				import.meta.url
			),
		json: () =>
			R(
				() => import("./index-76906b25.js"),
				[
					"./index-76906b25.js",
					"../lite.js",
					"../lite.css",
					"./Copy-d120a3d6.js",
					"./Button-5b68d65a.js",
					"./Button-4cd12e76.css",
					"./Empty-b331fdfe.js",
					"./BlockLabel-e392131b.js",
					"./index-3ca142e0.css",
					"./DropdownArrow-5fa4dd09.css"
				],
				import.meta.url
			),
		label: () =>
			R(
				() => import("./index-c150fd70.js"),
				[
					"./index-c150fd70.js",
					"../lite.js",
					"../lite.css",
					"./Button-5b68d65a.js",
					"./Button-4cd12e76.css",
					"./BlockLabel-e392131b.js",
					"./Empty-b331fdfe.js",
					"./index-ab710fed.css",
					"./DropdownArrow-5fa4dd09.css"
				],
				import.meta.url
			),
		markdown: () =>
			R(
				() => import("./index-1a629947.js"),
				[
					"./index-1a629947.js",
					"../lite.js",
					"../lite.css",
					"./Button-5b68d65a.js",
					"./Button-4cd12e76.css",
					"./index-edf307d2.css"
				],
				import.meta.url
			),
		model3d: () =>
			R(
				() => import("./index-d80c90a4.js"),
				[
					"./index-d80c90a4.js",
					"../lite.js",
					"../lite.css",
					"./ModifyUpload.svelte_svelte_type_style_lang-ba6baa96.js",
					"./ModifyUpload-77b0d4b2.css",
					"./Button-5b68d65a.js",
					"./Button-4cd12e76.css",
					"./BlockLabel-e392131b.js",
					"./Empty-b331fdfe.js",
					"./File-33a0d259.js",
					"./ModifyUpload-33254150.js",
					"./DropdownArrow-5fa4dd09.css",
					"./Download-604a4bc6.js",
					"./_commonjsHelpers-042e6b4d.js",
					"./Upload-09ed31cf.js",
					"./UploadText-45e994b7.js",
					"./UploadText-33d53a1c.css",
					"./Model3D-909227f7.js",
					"./Model3D-98fc2b2c.css",
					"./index-4ffdbeab.css"
				],
				import.meta.url
			),
		number: () =>
			R(
				() => import("./index-260f157e.js"),
				[
					"./index-260f157e.js",
					"../lite.js",
					"../lite.css",
					"./Button-5b68d65a.js",
					"./Button-4cd12e76.css",
					"./BlockTitle-1b9e69db.js",
					"./Info-06b02eda.js",
					"./ColorPicker-25010187.css",
					"./DropdownArrow-5fa4dd09.css"
				],
				import.meta.url
			),
		plot: () =>
			R(
				() => import("./index-13c289c2.js"),
				[
					"./index-13c289c2.js",
					"../lite.js",
					"../lite.css",
					"./_commonjsHelpers-042e6b4d.js",
					"./color-1d056486.js",
					"./linear-58a44b5e.js",
					"./dsv-576afacd.js",
					"./Button-5b68d65a.js",
					"./Button-4cd12e76.css",
					"./Empty-b331fdfe.js",
					"./BlockLabel-e392131b.js",
					"./index-2908e8a9.css",
					"./DropdownArrow-5fa4dd09.css"
				],
				import.meta.url
			),
		radio: () =>
			R(
				() => import("./index-27afadc9.js"),
				[
					"./index-27afadc9.js",
					"../lite.js",
					"../lite.css",
					"./Button-5b68d65a.js",
					"./Button-4cd12e76.css",
					"./BlockTitle-1b9e69db.js",
					"./Info-06b02eda.js",
					"./ColorPicker-25010187.css",
					"./DropdownArrow-5fa4dd09.css"
				],
				import.meta.url
			),
		row: () =>
			R(
				() => import("./index-49afaeb6.js"),
				[
					"./index-49afaeb6.js",
					"../lite.js",
					"../lite.css",
					"./index-93c91554.css"
				],
				import.meta.url
			),
		slider: () =>
			R(
				() => import("./index-d5a657eb.js"),
				[
					"./index-d5a657eb.js",
					"../lite.js",
					"../lite.css",
					"./Button-5b68d65a.js",
					"./Button-4cd12e76.css",
					"./BlockTitle-1b9e69db.js",
					"./Info-06b02eda.js",
					"./ColorPicker-25010187.css",
					"./DropdownArrow-5fa4dd09.css"
				],
				import.meta.url
			),
		state: () =>
			R(
				() => import("./index-87612923.js"),
				["./index-87612923.js", "../lite.js", "../lite.css"],
				import.meta.url
			),
		statustracker: () =>
			R(
				() => import("./index-a63ab8a8.js"),
				["./index-a63ab8a8.js", "../lite.js", "../lite.css"],
				import.meta.url
			),
		tabs: () =>
			R(
				() => import("./index-ae488de7.js"),
				[
					"./index-ae488de7.js",
					"../lite.js",
					"../lite.css",
					"./TabItem.svelte_svelte_type_style_lang-79ba9af9.js",
					"./TabItem-ea98f884.css",
					"./Column-2853eb31.css"
				],
				import.meta.url
			),
		tabitem: () =>
			R(
				() => import("./index-70303f4e.js"),
				[
					"./index-70303f4e.js",
					"../lite.js",
					"../lite.css",
					"./TabItem.svelte_svelte_type_style_lang-79ba9af9.js",
					"./TabItem-ea98f884.css",
					"./Column-4ca2f558.js",
					"./Column-2853eb31.css"
				],
				import.meta.url
			),
		textbox: () =>
			R(
				() => import("./index-a0e9e999.js"),
				[
					"./index-a0e9e999.js",
					"./Textbox-41d74eda.js",
					"../lite.js",
					"../lite.css",
					"./Button-5b68d65a.js",
					"./Button-4cd12e76.css",
					"./BlockTitle-1b9e69db.js",
					"./Info-06b02eda.js",
					"./Copy-d120a3d6.js",
					"./ColorPicker-25010187.css",
					"./DropdownArrow-5fa4dd09.css"
				],
				import.meta.url
			),
		timeseries: () =>
			R(
				() => import("./index-2941500d.js"),
				[
					"./index-2941500d.js",
					"../lite.js",
					"../lite.css",
					"./Upload-09ed31cf.js",
					"./ModifyUpload.svelte_svelte_type_style_lang-ba6baa96.js",
					"./ModifyUpload-77b0d4b2.css",
					"./ModifyUpload-33254150.js",
					"./Button-5b68d65a.js",
					"./Button-4cd12e76.css",
					"./DropdownArrow-5fa4dd09.css",
					"./BlockLabel-e392131b.js",
					"./Empty-b331fdfe.js",
					"./color-1d056486.js",
					"./csv-b0b7514a.js",
					"./dsv-576afacd.js",
					"./linear-58a44b5e.js",
					"./UploadText-45e994b7.js",
					"./UploadText-33d53a1c.css",
					"./index-9da94804.css"
				],
				import.meta.url
			),
		uploadbutton: () =>
			R(
				() => import("./index-41095caf.js"),
				[
					"./index-41095caf.js",
					"../lite.js",
					"../lite.css",
					"./Button-5b68d65a.js",
					"./Button-4cd12e76.css",
					"./index-3d04307a.js",
					"./ModifyUpload.svelte_svelte_type_style_lang-ba6baa96.js",
					"./ModifyUpload-77b0d4b2.css",
					"./index-03d58ab8.css",
					"./DropdownArrow-5fa4dd09.css"
				],
				import.meta.url
			),
		video: () =>
			R(
				() => import("./index-dab60517.js"),
				[
					"./index-dab60517.js",
					"../lite.js",
					"../lite.css",
					"./ModifyUpload.svelte_svelte_type_style_lang-ba6baa96.js",
					"./ModifyUpload-77b0d4b2.css",
					"./Button-5b68d65a.js",
					"./Button-4cd12e76.css",
					"./Upload-09ed31cf.js",
					"./ModifyUpload-33254150.js",
					"./DropdownArrow-5fa4dd09.css",
					"./BlockLabel-e392131b.js",
					"./StaticImage.svelte_svelte_type_style_lang-8f029e82.js",
					"./StaticImage-ede66243.css",
					"./Empty-b331fdfe.js",
					"./Download-604a4bc6.js",
					"./UploadText-45e994b7.js",
					"./UploadText-33d53a1c.css",
					"./index-ed471d18.css"
				],
				import.meta.url
			)
	},
	kn = "أرسل",
	Ln = "أمسح",
	Nn = "فسِّر",
	Rn = "بلِّغ",
	Mn = "أمثلة",
	jn = "أو",
	ta = {
		interface: {
			drop_image: "أسقط الصورة هنا",
			drop_video: "أسقط الفيديو هنا",
			drop_audio: "أسقط الملف الصوتي هنا",
			drop_file: "أسقط الملف هنا",
			drop_csv: "أسقط ملف البيانات هنا",
			click_to_upload: "إضغط للتحميل",
			view_api: "إستخدم واجهة البرمجة",
			built_with_Gradio: "تم الإنشاء بإستخدام Gradio"
		},
		Submit: kn,
		Clear: Ln,
		Interpret: Nn,
		Flag: Rn,
		Examples: Mn,
		or: jn
	},
	na = Object.freeze(
		Object.defineProperty(
			{
				__proto__: null,
				Clear: Ln,
				Examples: Mn,
				Flag: Rn,
				Interpret: Nn,
				Submit: kn,
				default: ta,
				or: jn
			},
			Symbol.toStringTag,
			{ value: "Module" }
		)
	),
	Dn = "Absenden",
	Fn = "Löschen",
	Gn = "Ersteller",
	Un = "Flag",
	Vn = "Beispiele",
	zn = "oder",
	ra = {
		interface: {
			drop_image: "Bild hier ablegen",
			drop_video: "Video hier ablegen",
			drop_audio: "Audio hier ablegen",
			drop_file: "Datei hier ablegen",
			drop_csv: "CSV Datei hier ablegen",
			click_to_upload: "Hochladen",
			view_api: "API anschauen",
			built_with_Gradio: "Mit Gradio erstellt"
		},
		Submit: Dn,
		Clear: Fn,
		Interpret: Gn,
		Flag: Un,
		Examples: Vn,
		or: zn
	},
	ia = Object.freeze(
		Object.defineProperty(
			{
				__proto__: null,
				Clear: Fn,
				Examples: Vn,
				Flag: Un,
				Interpret: Gn,
				Submit: Dn,
				default: ra,
				or: zn
			},
			Symbol.toStringTag,
			{ value: "Module" }
		)
	),
	Xn = "Submit",
	qn = "Clear",
	Zn = "Interpret",
	Wn = "Flag",
	Yn = "Examples",
	Jn = "or",
	oa = {
		interface: {
			drop_image: "Drop Image Here",
			drop_video: "Drop Video Here",
			drop_audio: "Drop Audio Here",
			drop_file: "Drop File Here",
			drop_csv: "Drop CSV Here",
			click_to_upload: "Click to Upload",
			view_api: "view the api",
			built_with_Gradio: "Built with gradio",
			copy_to_clipboard: "copy json",
			loading: "Loading",
			error: "ERROR",
			empty: "Empty"
		},
		Submit: Xn,
		Clear: qn,
		Interpret: Zn,
		Flag: Wn,
		Examples: Yn,
		or: Jn
	},
	la = Object.freeze(
		Object.defineProperty(
			{
				__proto__: null,
				Clear: qn,
				Examples: Yn,
				Flag: Wn,
				Interpret: Zn,
				Submit: Xn,
				default: oa,
				or: Jn
			},
			Symbol.toStringTag,
			{ value: "Module" }
		)
	),
	Qn = "Enviar",
	$n = "Limpiar",
	Kn = "Interpretar",
	er = "Avisar",
	tr = "Ejemplos",
	nr = "o",
	aa = {
		interface: {
			drop_image: "Coloque la imagen aquí",
			drop_video: "Coloque el video aquí",
			drop_audio: "Coloque el audio aquí",
			drop_file: "Coloque el archivo aquí",
			drop_csv: "Coloque el CSV aquí",
			click_to_upload: "Haga click para cargar",
			view_api: "Ver la API",
			built_with_Gradio: "Construido con Gradio"
		},
		Submit: Qn,
		Clear: $n,
		Interpret: Kn,
		Flag: er,
		Examples: tr,
		or: nr
	},
	sa = Object.freeze(
		Object.defineProperty(
			{
				__proto__: null,
				Clear: $n,
				Examples: tr,
				Flag: er,
				Interpret: Kn,
				Submit: Qn,
				default: aa,
				or: nr
			},
			Symbol.toStringTag,
			{ value: "Module" }
		)
	),
	rr = "ارسال",
	ir = "حذف",
	or = "تفسیر",
	lr = "پرچم",
	ar = "مثال ها",
	sr = "یا",
	ua = {
		interface: {
			drop_image: "تصویر را اینجا رها کنید",
			drop_video: "ویدیو را اینجا رها کنید",
			drop_audio: "صوت را اینجا رها کنید",
			drop_file: "فایل را اینجا رها کنید",
			drop_csv: "فایل csv را  اینجا رها کنید",
			click_to_upload: "برای آپلود کلیک کنید",
			view_api: "api را مشاهده کنید",
			built_with_Gradio: "ساخته شده با gradio"
		},
		Submit: rr,
		Clear: ir,
		Interpret: or,
		Flag: lr,
		Examples: ar,
		or: sr
	},
	ca = Object.freeze(
		Object.defineProperty(
			{
				__proto__: null,
				Clear: ir,
				Examples: ar,
				Flag: lr,
				Interpret: or,
				Submit: rr,
				default: ua,
				or: sr
			},
			Symbol.toStringTag,
			{ value: "Module" }
		)
	),
	ur = "Soumettre",
	cr = "Nettoyer",
	fr = "Interpréter",
	_r = "Signaler",
	hr = "Exemples",
	pr = "ou",
	fa = {
		interface: {
			drop_image: "Déposer l'Image Ici",
			drop_video: "Déposer la Vidéo Ici",
			drop_audio: "Déposer l'Audio Ici",
			drop_file: "Déposer le Fichier Ici",
			drop_csv: "Déposer le CSV Ici",
			click_to_upload: "Cliquer pour Télécharger",
			view_api: "Voir l'API",
			built_with_Gradio: "Conçu avec Gradio"
		},
		Submit: ur,
		Clear: cr,
		Interpret: fr,
		Flag: _r,
		Examples: hr,
		or: pr
	},
	_a = Object.freeze(
		Object.defineProperty(
			{
				__proto__: null,
				Clear: cr,
				Examples: hr,
				Flag: _r,
				Interpret: fr,
				Submit: ur,
				default: fa,
				or: pr
			},
			Symbol.toStringTag,
			{ value: "Module" }
		)
	),
	mr = "שלח",
	dr = "נקה",
	gr = "לפרש",
	br = "סמן",
	vr = "דוגמות",
	Er = "או",
	ha = {
		interface: {
			drop_image: "גרור קובץ תמונה לכאן",
			drop_video: "גרור קובץ סרטון לכאן",
			drop_audio: "גרור לכאן קובץ שמע",
			drop_file: "גרור קובץ לכאן",
			drop_csv: "גרור csv קובץ לכאן",
			click_to_upload: "לחץ כדי להעלות",
			view_api: "צפה ב API",
			built_with_Gradio: "בנוי עם גרדיו"
		},
		Submit: mr,
		Clear: dr,
		Interpret: gr,
		Flag: br,
		Examples: vr,
		or: Er
	},
	pa = Object.freeze(
		Object.defineProperty(
			{
				__proto__: null,
				Clear: dr,
				Examples: vr,
				Flag: br,
				Interpret: gr,
				Submit: mr,
				default: ha,
				or: Er
			},
			Symbol.toStringTag,
			{ value: "Module" }
		)
	),
	yr = "सबमिट करे",
	Sr = "हटाये",
	Tr = "व्याख्या करे",
	Ir = "चिह्नित करे",
	wr = "उदाहरण",
	Ar = "या",
	ma = {
		interface: {
			drop_image: "यहाँ इमेज ड्रॉप करें",
			drop_video: "यहाँ वीडियो ड्रॉप करें",
			drop_audio: "यहाँ ऑडियो ड्रॉप करें",
			drop_file: "यहाँ File ड्रॉप करें",
			drop_csv: "यहाँ CSV ड्रॉप करें",
			click_to_upload: "अपलोड के लिए बटन दबायें",
			view_api: "API को देखे",
			built_with_Gradio: "Gradio से बना"
		},
		Submit: yr,
		Clear: Sr,
		Interpret: Tr,
		Flag: Ir,
		Examples: wr,
		or: Ar
	},
	da = Object.freeze(
		Object.defineProperty(
			{
				__proto__: null,
				Clear: Sr,
				Examples: wr,
				Flag: Ir,
				Interpret: Tr,
				Submit: yr,
				default: ma,
				or: Ar
			},
			Symbol.toStringTag,
			{ value: "Module" }
		)
	),
	Pr = "送信",
	Cr = "クリア",
	Br = "解釈",
	Hr = "フラグする",
	Or = "入力例",
	xr = "または",
	ga = {
		interface: {
			drop_image: "ここに画像をドロップ",
			drop_video: "ここに動画をドロップ",
			drop_audio: "ここに音声をドロップ",
			drop_file: "ここにファイルをドロップ",
			drop_csv: "ここにCSVをドロップ",
			click_to_upload: "クリックしてアップロード",
			view_api: "APIを見る",
			built_with_Gradio: "gradioで作ろう"
		},
		Submit: Pr,
		Clear: Cr,
		Interpret: Br,
		Flag: Hr,
		Examples: Or,
		or: xr
	},
	ba = Object.freeze(
		Object.defineProperty(
			{
				__proto__: null,
				Clear: Cr,
				Examples: Or,
				Flag: Hr,
				Interpret: Br,
				Submit: Pr,
				default: ga,
				or: xr
			},
			Symbol.toStringTag,
			{ value: "Module" }
		)
	),
	kr = "제출하기",
	Lr = "클리어",
	Nr = "설명하기",
	Rr = "플래그",
	Mr = "예시",
	jr = "또는",
	va = {
		interface: {
			drop_image: "이미지를 끌어 놓으세요",
			drop_video: "비디오를 끌어 놓으세요",
			drop_audio: "오디오를 끌어 놓으세요",
			drop_file: "파일을 끌어 놓으세요",
			drop_csv: "CSV파일을 끌어 놓으세요",
			click_to_upload: "클릭해서 업로드하기",
			view_api: "API 보기",
			built_with_Gradio: "gradio로 제작되었습니다"
		},
		Submit: kr,
		Clear: Lr,
		Interpret: Nr,
		Flag: Rr,
		Examples: Mr,
		or: jr
	},
	Ea = Object.freeze(
		Object.defineProperty(
			{
				__proto__: null,
				Clear: Lr,
				Examples: Mr,
				Flag: Rr,
				Interpret: Nr,
				Submit: kr,
				default: va,
				or: jr
			},
			Symbol.toStringTag,
			{ value: "Module" }
		)
	),
	Dr = "Pateikti",
	Fr = "Trinti",
	Gr = "Interpretuoti",
	Ur = "Pažymėti",
	Vr = "Pavyzdžiai",
	zr = "arba",
	ya = {
		interface: {
			drop_image: "Įkelkite paveikslėlį čia",
			drop_video: "Įkelkite vaizdo įrašą čia",
			drop_audio: "Įkelkite garso įrašą čia",
			drop_file: "Įkelkite bylą čia",
			drop_csv: "Įkelkite CSV čia",
			click_to_upload: "Spustelėkite norėdami įkelti",
			view_api: "peržiūrėti api",
			built_with_Gradio: "sukurta su gradio"
		},
		Submit: Dr,
		Clear: Fr,
		Interpret: Gr,
		Flag: Ur,
		Examples: Vr,
		or: zr
	},
	Sa = Object.freeze(
		Object.defineProperty(
			{
				__proto__: null,
				Clear: Fr,
				Examples: Vr,
				Flag: Ur,
				Interpret: Gr,
				Submit: Dr,
				default: ya,
				or: zr
			},
			Symbol.toStringTag,
			{ value: "Module" }
		)
	),
	Xr = "Zend in",
	qr = "Wis",
	Zr = "Interpreteer",
	Wr = "Vlag",
	Yr = "Voorbeelden",
	Jr = "of",
	Ta = {
		interface: {
			drop_image: "Sleep een Afbeelding hier",
			drop_video: "Sleep een Video hier",
			drop_audio: "Sleep een Geluidsbestand hier",
			drop_file: "Sleep een Document hier",
			drop_csv: "Sleep een CSV hier",
			click_to_upload: "Klik om the Uploaden",
			view_api: "zie de api",
			built_with_Gradio: "gemaakt met gradio"
		},
		Submit: Xr,
		Clear: qr,
		Interpret: Zr,
		Flag: Wr,
		Examples: Yr,
		or: Jr
	},
	Ia = Object.freeze(
		Object.defineProperty(
			{
				__proto__: null,
				Clear: qr,
				Examples: Yr,
				Flag: Wr,
				Interpret: Zr,
				Submit: Xr,
				default: Ta,
				or: Jr
			},
			Symbol.toStringTag,
			{ value: "Module" }
		)
	),
	Qr = "Zatwierdź",
	$r = "Wyczyść",
	Kr = "Interpretuj",
	ei = "Oznacz",
	ti = "Przykłady",
	ni = "lub",
	wa = {
		interface: {
			drop_image: "Przeciągnij tutaj zdjęcie",
			drop_video: "Przeciągnij tutaj video",
			drop_audio: "Przeciągnij tutaj audio",
			drop_file: "Przeciągnij tutaj plik",
			drop_csv: "Przeciągnij tutaj CSV",
			click_to_upload: "Kliknij, aby przesłać",
			view_api: "zobacz api",
			built_with_Gradio: "utworzone z gradio"
		},
		Submit: Qr,
		Clear: $r,
		Interpret: Kr,
		Flag: ei,
		Examples: ti,
		or: ni
	},
	Aa = Object.freeze(
		Object.defineProperty(
			{
				__proto__: null,
				Clear: $r,
				Examples: ti,
				Flag: ei,
				Interpret: Kr,
				Submit: Qr,
				default: wa,
				or: ni
			},
			Symbol.toStringTag,
			{ value: "Module" }
		)
	),
	ri = "Enviar",
	ii = "Limpar",
	oi = "Interpretar",
	li = "Marcar",
	ai = "Exemplos",
	si = "ou",
	Pa = {
		interface: {
			drop_image: "Solte a Imagem Aqui",
			drop_video: "Solte o Vídeo Aqui",
			drop_audio: "Solte o Áudio Aqui",
			drop_file: "Solte o Arquivo Aqui",
			drop_csv: "Solte o CSV Aqui",
			click_to_upload: "Clique para o Upload",
			view_api: "Veja a API",
			built_with_Gradio: "Construído com gradio",
			copy_to_clipboard: "copiar para o clipboard",
			loading: "Carregando",
			error: "ERRO",
			empty: "Vazio"
		},
		Submit: ri,
		Clear: ii,
		Interpret: oi,
		Flag: li,
		Examples: ai,
		or: si
	},
	Ca = Object.freeze(
		Object.defineProperty(
			{
				__proto__: null,
				Clear: ii,
				Examples: ai,
				Flag: li,
				Interpret: oi,
				Submit: ri,
				default: Pa,
				or: si
			},
			Symbol.toStringTag,
			{ value: "Module" }
		)
	),
	ui = "Исполнить",
	ci = "Очистить",
	fi = "Интерпретировать",
	_i = "Пометить",
	hi = "Примеры",
	pi = "или",
	Ba = {
		interface: {
			drop_image: "Поместите Изображение Здесь",
			drop_video: "Поместите Видео Здесь",
			drop_audio: "Поместите Аудио Здесь",
			drop_file: "Поместите Документ Здесь",
			drop_csv: "Поместите CSV Здесь",
			click_to_upload: "Нажмите, чтобы загрузить",
			view_api: "просмотр api",
			built_with_Gradio: "сделано с помощью gradio"
		},
		Submit: ui,
		Clear: ci,
		Interpret: fi,
		Flag: _i,
		Examples: hi,
		or: pi
	},
	Ha = Object.freeze(
		Object.defineProperty(
			{
				__proto__: null,
				Clear: ci,
				Examples: hi,
				Flag: _i,
				Interpret: fi,
				Submit: ui,
				default: Ba,
				or: pi
			},
			Symbol.toStringTag,
			{ value: "Module" }
		)
	),
	mi = "சமர்ப்பி",
	di = "அழி",
	gi = "உட்பொருள்",
	bi = "கொடியிடு",
	vi = "எடுத்துக்காட்டுகள்",
	Ei = "அல்லது",
	Oa = {
		interface: {
			drop_image: "படத்தை வை",
			drop_video: "வீடியோவை வை",
			drop_audio: "ஆடியோவை வை",
			drop_file: "கோப்பை வை",
			drop_csv: "சிஎஸ்வி வை",
			click_to_upload: "பதிவேற்ற கிளிக் செய்",
			view_api: "அபியை காண்",
			built_with_Gradio: "க்ரேடியோ-வுடன் கட்டப்பட்டது"
		},
		Submit: mi,
		Clear: di,
		Interpret: gi,
		Flag: bi,
		Examples: vi,
		or: Ei
	},
	xa = Object.freeze(
		Object.defineProperty(
			{
				__proto__: null,
				Clear: di,
				Examples: vi,
				Flag: bi,
				Interpret: gi,
				Submit: mi,
				default: Oa,
				or: Ei
			},
			Symbol.toStringTag,
			{ value: "Module" }
		)
	),
	yi = "Yükle",
	Si = "Temizle",
	Ti = "Yorumla",
	Ii = "Etiketle",
	wi = "örnekler",
	Ai = "veya",
	ka = {
		interface: {
			drop_image: "Resmi Buraya Sürükle",
			drop_video: "Videoyu Buraya Sürükle",
			drop_audio: "Kaydı Buraya Sürükle",
			drop_file: "Dosyayı Buraya Sürükle",
			drop_csv: "CSV'yi Buraya Sürükle",
			click_to_upload: "Yüklemek için Tıkla",
			view_api: "api'yi görüntüle",
			built_with_Gradio: "Gradio ile oluşturulmuştur"
		},
		Submit: yi,
		Clear: Si,
		Interpret: Ti,
		Flag: Ii,
		Examples: wi,
		or: Ai
	},
	La = Object.freeze(
		Object.defineProperty(
			{
				__proto__: null,
				Clear: Si,
				Examples: wi,
				Flag: Ii,
				Interpret: Ti,
				Submit: yi,
				default: ka,
				or: Ai
			},
			Symbol.toStringTag,
			{ value: "Module" }
		)
	),
	Pi = "Надіслати",
	Ci = "Очистити",
	Bi = "Пояснити результат",
	Hi = "Позначити",
	Oi = "Приклади",
	xi = "або",
	Na = {
		interface: {
			drop_image: "Перетягніть зображення сюди",
			drop_video: "Перетягніть відео сюди",
			drop_audio: "Перетягніть аудіо сюди",
			drop_file: "Перетягніть файл сюди",
			drop_csv: "Перетягніть CSV-файл сюди",
			click_to_upload: "Натисніть щоб завантажити",
			view_api: "Переглянути API",
			built_with_Gradio: "Зроблено на основі gradio"
		},
		Submit: Pi,
		Clear: Ci,
		Interpret: Bi,
		Flag: Hi,
		Examples: Oi,
		or: xi
	},
	Ra = Object.freeze(
		Object.defineProperty(
			{
				__proto__: null,
				Clear: Ci,
				Examples: Oi,
				Flag: Hi,
				Interpret: Bi,
				Submit: Pi,
				default: Na,
				or: xi
			},
			Symbol.toStringTag,
			{ value: "Module" }
		)
	),
	ki = "جمع کریں",
	Li = "ہٹا دیں",
	Ni = "تشریح کریں",
	Ri = "نشان لگائیں",
	Mi = "مثالیں",
	ji = "یا",
	Ma = {
		interface: {
			drop_image: "یہاں تصویر ڈراپ کریں",
			drop_video: "یہاں ویڈیو ڈراپ کریں",
			drop_audio: "یہاں آڈیو ڈراپ کریں",
			drop_file: "یہاں فائل ڈراپ کریں",
			drop_csv: "یہاں فائل ڈراپ کریں",
			click_to_upload: "اپ لوڈ کے لیے کلک کریں",
			view_api: "API دیکھیں",
			built_with_Gradio: "کے ساتھ بنایا گیا Gradio"
		},
		Submit: ki,
		Clear: Li,
		Interpret: Ni,
		Flag: Ri,
		Examples: Mi,
		or: ji
	},
	ja = Object.freeze(
		Object.defineProperty(
			{
				__proto__: null,
				Clear: Li,
				Examples: Mi,
				Flag: Ri,
				Interpret: Ni,
				Submit: ki,
				default: Ma,
				or: ji
			},
			Symbol.toStringTag,
			{ value: "Module" }
		)
	),
	Di = "Yubor",
	Fi = "Tozalash",
	Gi = "Tushuntirish",
	Ui = "Bayroq",
	Vi = "Namunalar",
	zi = "或",
	Da = {
		interface: {
			drop_image: "Rasmni Shu Yerga Tashlang",
			drop_video: "Videoni Shu Yerga Tashlang",
			drop_audio: "Audioni Shu Yerga Tashlang",
			drop_file: "Faylni Shu Yerga Tashlang",
			drop_csv: "CSVni Shu Yerga Tashlang",
			click_to_upload: "Yuklash uchun Bosing",
			view_api: "apini ko'ring",
			built_with_Gradio: "gradio bilan qilingan"
		},
		Submit: Di,
		Clear: Fi,
		Interpret: Gi,
		Flag: Ui,
		Examples: Vi,
		or: zi
	},
	Fa = Object.freeze(
		Object.defineProperty(
			{
				__proto__: null,
				Clear: Fi,
				Examples: Vi,
				Flag: Ui,
				Interpret: Gi,
				Submit: Di,
				default: Da,
				or: zi
			},
			Symbol.toStringTag,
			{ value: "Module" }
		)
	),
	Xi = "提交",
	qi = "清除",
	Zi = "解释",
	Wi = "标记",
	Yi = "示例",
	Ji = "或",
	Ga = {
		interface: {
			drop_image: "拖放图片至此处",
			drop_video: "拖放视频至此处",
			drop_audio: "拖放音频至此处",
			drop_file: "拖放文件至此处",
			drop_csv: "拖放CSV至此处",
			click_to_upload: "点击上传",
			view_api: "查看API",
			built_with_Gradio: "使用Gradio构建"
		},
		Submit: Xi,
		Clear: qi,
		Interpret: Zi,
		Flag: Wi,
		Examples: Yi,
		or: Ji
	},
	Ua = Object.freeze(
		Object.defineProperty(
			{
				__proto__: null,
				Clear: qi,
				Examples: Yi,
				Flag: Wi,
				Interpret: Zi,
				Submit: Xi,
				default: Ga,
				or: Ji
			},
			Symbol.toStringTag,
			{ value: "Module" }
		)
	),
	Qi = "提交",
	$i = "清除",
	Ki = "解釋",
	eo = "Flag",
	to = "範例",
	no = "或",
	Va = {
		interface: {
			drop_image: "刪除圖片",
			drop_video: "刪除影片",
			drop_audio: "刪除音頻",
			drop_file: "刪除檔案",
			drop_csv: "刪除CSV",
			click_to_upload: "點擊上傳",
			view_api: "查看API",
			built_with_Gradio: "使用Gradio構建"
		},
		Submit: Qi,
		Clear: $i,
		Interpret: Ki,
		Flag: eo,
		Examples: to,
		or: no
	},
	za = Object.freeze(
		Object.defineProperty(
			{
				__proto__: null,
				Clear: $i,
				Examples: to,
				Flag: eo,
				Interpret: Ki,
				Submit: Qi,
				default: Va,
				or: no
			},
			Symbol.toStringTag,
			{ value: "Module" }
		)
	),
	At = Object.assign({
		"./lang/ar.json": na,
		"./lang/de.json": ia,
		"./lang/en.json": la,
		"./lang/es.json": sa,
		"./lang/fa.json": ca,
		"./lang/fr.json": _a,
		"./lang/he.json": pa,
		"./lang/hi.json": da,
		"./lang/ja.json": ba,
		"./lang/ko.json": Ea,
		"./lang/lt.json": Sa,
		"./lang/nl.json": Ia,
		"./lang/pl.json": Aa,
		"./lang/pt-BR.json": Ca,
		"./lang/ru.json": Ha,
		"./lang/ta.json": xa,
		"./lang/tr.json": La,
		"./lang/uk.json": Ra,
		"./lang/ur.json": ja,
		"./lang/uz.json": Fa,
		"./lang/zh-CN.json": Ua,
		"./lang/zh-tw.json": za
	});
function Xa() {
	let e = {};
	for (const t in At) {
		const n = t.split("/").pop().split(".").shift();
		e[n] = At[t].default;
	}
	return e;
}
const Pt = Xa();
for (const e in Pt) Hn(e, Pt[e]);
function qa() {
	Fl({ fallbackLocale: "en", initialLocale: Gl() });
}
function Ct(e, t, n) {
	const r = e.slice();
	return (
		(r[8] = t[n].component),
		(r[17] = t[n].id),
		(r[2] = t[n].props),
		(r[18] = t[n].children),
		(r[9] = t[n].has_modes),
		r
	);
}
function Bt(e) {
	let t = [],
		n = new Map(),
		r,
		i,
		o = e[1];
	const a = (l) => l[17];
	for (let l = 0; l < o.length; l += 1) {
		let c = Ct(e, o, l),
			s = a(c);
		n.set(s, (t[l] = Ht(s, c)));
	}
	return {
		c() {
			for (let l = 0; l < t.length; l += 1) t[l].c();
			r = le();
		},
		m(l, c) {
			for (let s = 0; s < t.length; s += 1) t[s] && t[s].m(l, c);
			I(l, r, c), (i = !0);
		},
		p(l, c) {
			c & 235 &&
				((o = l[1]),
				ne(),
				(t = Io(t, c, a, 1, l, o, n, r.parentNode, wo, Ht, r, Ct)),
				re());
		},
		i(l) {
			if (!i) {
				for (let c = 0; c < o.length; c += 1) P(t[c]);
				i = !0;
			}
		},
		o(l) {
			for (let c = 0; c < t.length; c += 1) B(t[c]);
			i = !1;
		},
		d(l) {
			for (let c = 0; c < t.length; c += 1) t[c].d(l);
			l && S(r);
		}
	};
}
function Ht(e, t) {
	let n, r, i;
	return (
		(r = new ro({
			props: {
				component: t[8],
				target: t[6],
				id: t[17],
				props: t[2],
				root: t[3],
				instance_map: t[0],
				children: t[18],
				dynamic_ids: t[5],
				has_modes: t[9],
				theme_mode: t[7]
			}
		})),
		r.$on("destroy", t[12]),
		r.$on("mount", t[13]),
		{
			key: e,
			first: null,
			c() {
				(n = le()), X(r.$$.fragment), (this.first = n);
			},
			m(o, a) {
				I(o, n, a), q(r, o, a), (i = !0);
			},
			p(o, a) {
				t = o;
				const l = {};
				a & 2 && (l.component = t[8]),
					a & 64 && (l.target = t[6]),
					a & 2 && (l.id = t[17]),
					a & 2 && (l.props = t[2]),
					a & 8 && (l.root = t[3]),
					a & 1 && (l.instance_map = t[0]),
					a & 2 && (l.children = t[18]),
					a & 32 && (l.dynamic_ids = t[5]),
					a & 2 && (l.has_modes = t[9]),
					a & 128 && (l.theme_mode = t[7]),
					r.$set(l);
			},
			i(o) {
				i || (P(r.$$.fragment, o), (i = !0));
			},
			o(o) {
				B(r.$$.fragment, o), (i = !1);
			},
			d(o) {
				o && S(n), Z(r, o);
			}
		}
	);
}
function Za(e) {
	let t,
		n,
		r = e[1] && e[1].length && Bt(e);
	return {
		c() {
			r && r.c(), (t = le());
		},
		m(i, o) {
			r && r.m(i, o), I(i, t, o), (n = !0);
		},
		p(i, o) {
			i[1] && i[1].length
				? r
					? (r.p(i, o), o & 2 && P(r, 1))
					: ((r = Bt(i)), r.c(), P(r, 1), r.m(t.parentNode, t))
				: r &&
				  (ne(),
				  B(r, 1, 1, () => {
						r = null;
				  }),
				  re());
		},
		i(i) {
			n || (P(r), (n = !0));
		},
		o(i) {
			B(r), (n = !1);
		},
		d(i) {
			r && r.d(i), i && S(t);
		}
	};
}
function Wa(e) {
	let t, n, r, i;
	const o = [
		{ elem_id: ("elem_id" in e[2] && e[2].elem_id) || `component-${e[4]}` },
		{ elem_classes: ("elem_classes" in e[2] && e[2].elem_classes) || [] },
		{ target: e[6] },
		e[2],
		{ theme_mode: e[7] },
		{ root: e[3] }
	];
	function a(s) {
		e[15](s);
	}
	var l = e[8];
	function c(s) {
		let u = { $$slots: { default: [Za] }, $$scope: { ctx: s } };
		for (let f = 0; f < o.length; f += 1) u = To(u, o[f]);
		return (
			s[0][s[4]].props.value !== void 0 && (u.value = s[0][s[4]].props.value),
			{ props: u }
		);
	}
	return (
		l &&
			((t = pt(l, c(e))),
			e[14](t),
			je.push(() => mt(t, "value", a)),
			t.$on("prop_change", e[10])),
		{
			c() {
				t && X(t.$$.fragment), (r = le());
			},
			m(s, u) {
				t && q(t, s, u), I(s, r, u), (i = !0);
			},
			p(s, [u]) {
				const f =
					u & 220
						? vo(o, [
								u & 20 && {
									elem_id:
										("elem_id" in s[2] && s[2].elem_id) || `component-${s[4]}`
								},
								u & 4 && {
									elem_classes:
										("elem_classes" in s[2] && s[2].elem_classes) || []
								},
								u & 64 && { target: s[6] },
								u & 4 && Eo(s[2]),
								u & 128 && { theme_mode: s[7] },
								u & 8 && { root: s[3] }
						  ])
						: {};
				if (
					(u & 2097387 && (f.$$scope = { dirty: u, ctx: s }),
					!n &&
						u & 17 &&
						((n = !0), (f.value = s[0][s[4]].props.value), yo(() => (n = !1))),
					u & 256 && l !== (l = s[8]))
				) {
					if (t) {
						ne();
						const _ = t;
						B(_.$$.fragment, 1, 0, () => {
							Z(_, 1);
						}),
							re();
					}
					l
						? ((t = pt(l, c(s))),
						  s[14](t),
						  je.push(() => mt(t, "value", a)),
						  t.$on("prop_change", s[10]),
						  X(t.$$.fragment),
						  P(t.$$.fragment, 1),
						  q(t, r.parentNode, r))
						: (t = null);
				} else l && t.$set(f);
			},
			i(s) {
				i || (t && P(t.$$.fragment, s), (i = !0));
			},
			o(s) {
				t && B(t.$$.fragment, s), (i = !1);
			},
			d(s) {
				e[14](null), s && S(r), t && Z(t, s);
			}
		}
	);
}
function Ya(e, t, n) {
	let { root: r } = t,
		{ component: i } = t,
		{ instance_map: o } = t,
		{ id: a } = t,
		{ props: l } = t,
		{ children: c } = t,
		{ dynamic_ids: s } = t,
		{ has_modes: u } = t,
		{ parent: f = null } = t,
		{ target: _ } = t,
		{ theme_mode: m } = t;
	const g = lt();
	u &&
		(l.interactive === !1
			? (l.mode = "static")
			: l.interactive === !0 || s.has(a)
			? (l.mode = "dynamic")
			: (l.mode = "static")),
		cn(() => (g("mount", a), () => g("destroy", a))),
		So("BLOCK_KEY", f);
	function p(h) {
		for (const M in h.detail) n(0, (o[a].props[M] = h.detail[M]), o);
	}
	function y(h) {
		De.call(this, e, h);
	}
	function T(h) {
		De.call(this, e, h);
	}
	function C(h) {
		je[h ? "unshift" : "push"](() => {
			(o[a].instance = h), n(0, o);
		});
	}
	function E(h) {
		e.$$.not_equal(o[a].props.value, h) && ((o[a].props.value = h), n(0, o));
	}
	return (
		(e.$$set = (h) => {
			"root" in h && n(3, (r = h.root)),
				"component" in h && n(8, (i = h.component)),
				"instance_map" in h && n(0, (o = h.instance_map)),
				"id" in h && n(4, (a = h.id)),
				"props" in h && n(2, (l = h.props)),
				"children" in h && n(1, (c = h.children)),
				"dynamic_ids" in h && n(5, (s = h.dynamic_ids)),
				"has_modes" in h && n(9, (u = h.has_modes)),
				"parent" in h && n(11, (f = h.parent)),
				"target" in h && n(6, (_ = h.target)),
				"theme_mode" in h && n(7, (m = h.theme_mode));
		}),
		(e.$$.update = () => {
			e.$$.dirty & 3 &&
				n(1, (c = c && c.filter((h) => o[h.id].type !== "statustracker"))),
				e.$$.dirty & 19 &&
					o[a].type === "form" &&
					(c?.every((h) => !h.props.visible)
						? n(2, (l.visible = !1), l)
						: n(2, (l.visible = !0), l));
		}),
		[o, c, l, r, a, s, _, m, i, u, p, f, y, T, C, E]
	);
}
class ro extends se {
	constructor(t) {
		super(),
			ue(this, t, Ya, Wa, ce, {
				root: 3,
				component: 8,
				instance_map: 0,
				id: 4,
				props: 2,
				children: 1,
				dynamic_ids: 5,
				has_modes: 9,
				parent: 11,
				target: 6,
				theme_mode: 7
			});
	}
}
function Ja(e) {
	let t, n, r, i;
	return {
		c() {
			(t = ke("svg")),
				(n = ke("g")),
				(r = ke("path")),
				(i = ke("path")),
				v(
					r,
					"d",
					"M3.789,0.09C3.903,-0.024 4.088,-0.024 4.202,0.09L4.817,0.705C4.931,0.819 4.931,1.004 4.817,1.118L1.118,4.817C1.004,4.931 0.819,4.931 0.705,4.817L0.09,4.202C-0.024,4.088 -0.024,3.903 0.09,3.789L3.789,0.09Z"
				),
				v(
					i,
					"d",
					"M4.825,3.797C4.934,3.907 4.934,4.084 4.825,4.193L4.193,4.825C4.084,4.934 3.907,4.934 3.797,4.825L0.082,1.11C-0.027,1.001 -0.027,0.823 0.082,0.714L0.714,0.082C0.823,-0.027 1.001,-0.027 1.11,0.082L4.825,3.797Z"
				),
				v(t, "width", "100%"),
				v(t, "height", "100%"),
				v(t, "viewBox", "0 0 5 5"),
				v(t, "version", "1.1"),
				v(t, "xmlns", "http://www.w3.org/2000/svg"),
				v(t, "xmlns:xlink", "http://www.w3.org/1999/xlink"),
				v(t, "xml:space", "preserve"),
				fe(t, "fill", "currentColor"),
				fe(t, "fill-rule", "evenodd"),
				fe(t, "clip-rule", "evenodd"),
				fe(t, "stroke-linejoin", "round"),
				fe(t, "stroke-miterlimit", "2");
		},
		m(o, a) {
			I(o, t, a), b(t, n), b(n, r), b(n, i);
		},
		p: ae,
		i: ae,
		o: ae,
		d(o) {
			o && S(t);
		}
	};
}
class io extends se {
	constructor(t) {
		super(), ue(this, t, null, Ja, ce, {});
	}
}
function Qa(e) {
	let t, n, r, i, o, a, l, c, s, u, f, _, m, g, p;
	return (
		(_ = new io({})),
		{
			c() {
				(t = A("div")),
					(n = A("h1")),
					(n.textContent = "API Docs"),
					(r = G()),
					(i = A("p")),
					(o = O(`No named API Routes found for
		`)),
					(a = A("code")),
					(l = O(e[0])),
					(c = G()),
					(s = A("p")),
					(s.innerHTML = `To expose an API endpoint of your app in this page, set the <code>api_name</code>
		parameter of the event listener.
		<br/>
		For more information, visit the
		<a href="https://gradio.app/sharing_your_app/#api-page" target="_blank">API Page guide</a>
		. To hide the API documentation button and this page, set
		<code>show_api=False</code>
		in the
		<code>Blocks.launch()</code>
		method.`),
					(u = G()),
					(f = A("button")),
					X(_.$$.fragment),
					v(a, "class", "svelte-1i3r921"),
					v(i, "class", "attention svelte-1i3r921"),
					v(t, "class", "wrap prose svelte-1i3r921"),
					v(f, "class", "svelte-1i3r921");
			},
			m(y, T) {
				I(y, t, T),
					b(t, n),
					b(t, r),
					b(t, i),
					b(i, o),
					b(i, a),
					b(a, l),
					b(t, c),
					b(t, s),
					I(y, u, T),
					I(y, f, T),
					q(_, f, null),
					(m = !0),
					g || ((p = Pe(f, "click", e[2])), (g = !0));
			},
			p(y, [T]) {
				(!m || T & 1) && ee(l, y[0]);
			},
			i(y) {
				m || (P(_.$$.fragment, y), (m = !0));
			},
			o(y) {
				B(_.$$.fragment, y), (m = !1);
			},
			d(y) {
				y && S(t), y && S(u), y && S(f), Z(_), (g = !1), p();
			}
		}
	);
}
function $a(e, t, n) {
	const r = lt();
	let { root: i } = t;
	const o = () => r("close");
	return (
		(e.$$set = (a) => {
			"root" in a && n(0, (i = a.root));
		}),
		[i, r, o]
	);
}
class Ka extends se {
	constructor(t) {
		super(), ue(this, t, $a, Qa, ce, { root: 0 });
	}
}
function Ot(e, t, n = null) {
	return t === void 0
		? n === "py"
			? "None"
			: null
		: t === "string" || t === "str"
		? n === null
			? e
			: '"' + e + '"'
		: t === "number"
		? n === null
			? parseFloat(e)
			: e
		: t === "boolean"
		? n === "py"
			? e === "true"
				? "True"
				: "False"
			: n === "js"
			? e
			: e === "true"
		: n === null
		? e === ""
			? null
			: JSON.parse(e)
		: typeof e == "string"
		? e === ""
			? n === "py"
				? "None"
				: "null"
			: e
		: JSON.stringify(e);
}
const oo = "" + new URL("api-logo-5346f193.svg", import.meta.url).href;
function xt(e) {
	let t;
	return {
		c() {
			t = O("s");
		},
		m(n, r) {
			I(n, t, r);
		},
		d(n) {
			n && S(t);
		}
	};
}
function es(e) {
	let t,
		n,
		r,
		i,
		o,
		a,
		l,
		c,
		s,
		u,
		f,
		_,
		m,
		g,
		p,
		y,
		T,
		C,
		E = e[1] > 1 && xt();
	return (
		(p = new io({})),
		{
			c() {
				(t = A("h2")),
					(n = A("img")),
					(i = O(`
	API documentation for 
	`)),
					(o = A("span")),
					(a = O(e[0])),
					(l = O("   ")),
					(c = G()),
					(s = A("span")),
					(u = A("span")),
					(f = O(e[1])),
					(_ = O(" API endpoint")),
					E && E.c(),
					(m = G()),
					(g = A("button")),
					X(p.$$.fragment),
					Ce(n.src, (r = oo)) || v(n, "src", r),
					v(n, "alt", ""),
					v(n, "class", "svelte-9i27qi"),
					v(o, "class", "url svelte-9i27qi"),
					v(u, "class", "url svelte-9i27qi"),
					v(s, "class", "counts svelte-9i27qi"),
					v(t, "class", "svelte-9i27qi"),
					v(g, "class", "svelte-9i27qi");
			},
			m(h, M) {
				I(h, t, M),
					b(t, n),
					b(t, i),
					b(t, o),
					b(o, a),
					b(o, l),
					b(t, c),
					b(t, s),
					b(s, u),
					b(u, f),
					b(s, _),
					E && E.m(s, null),
					I(h, m, M),
					I(h, g, M),
					q(p, g, null),
					(y = !0),
					T || ((C = Pe(g, "click", e[3])), (T = !0));
			},
			p(h, [M]) {
				(!y || M & 1) && ee(a, h[0]),
					(!y || M & 2) && ee(f, h[1]),
					h[1] > 1
						? E || ((E = xt()), E.c(), E.m(s, null))
						: E && (E.d(1), (E = null));
			},
			i(h) {
				y || (P(p.$$.fragment, h), (y = !0));
			},
			o(h) {
				B(p.$$.fragment, h), (y = !1);
			},
			d(h) {
				h && S(t), E && E.d(), h && S(m), h && S(g), Z(p), (T = !1), C();
			}
		}
	);
}
function ts(e, t, n) {
	let { root: r } = t,
		{ api_count: i } = t;
	const o = lt(),
		a = () => o("close");
	return (
		(e.$$set = (l) => {
			"root" in l && n(0, (r = l.root)),
				"api_count" in l && n(1, (i = l.api_count));
		}),
		[r, i, o, a]
	);
}
class ns extends se {
	constructor(t) {
		super(), ue(this, t, ts, es, ce, { root: 0, api_count: 1 });
	}
}
function kt(e, t, n) {
	const r = e.slice();
	return (
		(r[9] = t[n].label),
		(r[10] = t[n].type),
		(r[11] = t[n].python_type),
		(r[12] = t[n].component),
		(r[13] = t[n].serializer),
		r
	);
}
function Lt(e) {
	let t;
	return {
		c() {
			t = O("(");
		},
		m(n, r) {
			I(n, t, r);
		},
		d(n) {
			n && S(t);
		}
	};
}
function Nt(e) {
	let t;
	return {
		c() {
			t = O(",");
		},
		m(n, r) {
			I(n, t, r);
		},
		d(n) {
			n && S(t);
		}
	};
}
function Rt(e) {
	let t,
		n,
		r,
		i = e[11].type + "",
		o,
		a,
		l = e[9] + "",
		c,
		s,
		u = e[12] + "",
		f,
		_,
		m = e[1].length > 1 && Nt();
	return {
		c() {
			(t = A("div")),
				(n = A("span")),
				(r = O("# ")),
				(o = O(i)),
				(a = O(`
						representing output in '`)),
				(c = O(l)),
				(s = O("' ")),
				(f = O(u)),
				(_ = O(`
						component`)),
				m && m.c(),
				v(n, "class", "desc svelte-1c7hj3i"),
				v(t, "class", "svelte-1c7hj3i"),
				Fe(t, "second-level", e[1].length > 1);
		},
		m(g, p) {
			I(g, t, p),
				b(t, n),
				b(n, r),
				b(n, o),
				b(n, a),
				b(n, c),
				b(n, s),
				b(n, f),
				b(n, _),
				m && m.m(t, null);
		},
		p(g, p) {
			p & 2 && i !== (i = g[11].type + "") && ee(o, i),
				p & 2 && l !== (l = g[9] + "") && ee(c, l),
				p & 2 && u !== (u = g[12] + "") && ee(f, u),
				g[1].length > 1
					? m || ((m = Nt()), m.c(), m.m(t, null))
					: m && (m.d(1), (m = null)),
				p & 2 && Fe(t, "second-level", g[1].length > 1);
		},
		d(g) {
			g && S(t), m && m.d();
		}
	};
}
function Mt(e) {
	let t;
	return {
		c() {
			t = O(")");
		},
		m(n, r) {
			I(n, t, r);
		},
		d(n) {
			n && S(t);
		}
	};
}
function jt(e) {
	let t, n, r;
	return (
		(n = new Ao({ props: { margin: !1 } })),
		{
			c() {
				(t = A("div")),
					X(n.$$.fragment),
					v(t, "class", "load-wrap svelte-1c7hj3i");
			},
			m(i, o) {
				I(i, t, o), q(n, t, null), (r = !0);
			},
			i(i) {
				r || (P(n.$$.fragment, i), (r = !0));
			},
			o(i) {
				B(n.$$.fragment, i), (r = !1);
			},
			d(i) {
				i && S(t), Z(n);
			}
		}
	);
}
function rs(e) {
	let t,
		n,
		r,
		i,
		o,
		a,
		l = e[1].length > 1 && Lt(),
		c = e[1],
		s = [];
	for (let _ = 0; _ < c.length; _ += 1) s[_] = Rt(kt(e, c, _));
	let u = e[1].length > 1 && Mt(),
		f = e[0] && jt();
	return {
		c() {
			(t = A("div")), (n = A("div")), l && l.c(), (r = G());
			for (let _ = 0; _ < s.length; _ += 1) s[_].c();
			(i = G()),
				u && u.c(),
				(o = G()),
				f && f.c(),
				v(n, "class", "svelte-1c7hj3i"),
				Fe(n, "hide", e[0]),
				v(t, "class", "response-wrap svelte-1c7hj3i");
		},
		m(_, m) {
			I(_, t, m), b(t, n), l && l.m(n, null), b(n, r);
			for (let g = 0; g < s.length; g += 1) s[g] && s[g].m(n, null);
			b(n, i), u && u.m(n, null), b(t, o), f && f.m(t, null), (a = !0);
		},
		p(_, m) {
			if (
				(_[1].length > 1
					? l || ((l = Lt()), l.c(), l.m(n, r))
					: l && (l.d(1), (l = null)),
				m & 2)
			) {
				c = _[1];
				let g;
				for (g = 0; g < c.length; g += 1) {
					const p = kt(_, c, g);
					s[g] ? s[g].p(p, m) : ((s[g] = Rt(p)), s[g].c(), s[g].m(n, i));
				}
				for (; g < s.length; g += 1) s[g].d(1);
				s.length = c.length;
			}
			_[1].length > 1
				? u || ((u = Mt()), u.c(), u.m(n, null))
				: u && (u.d(1), (u = null)),
				(!a || m & 1) && Fe(n, "hide", _[0]),
				_[0]
					? f
						? m & 1 && P(f, 1)
						: ((f = jt()), f.c(), P(f, 1), f.m(t, null))
					: f &&
					  (ne(),
					  B(f, 1, 1, () => {
							f = null;
					  }),
					  re());
		},
		i(_) {
			a || (P(f), (a = !0));
		},
		o(_) {
			B(f), (a = !1);
		},
		d(_) {
			_ && S(t), l && l.d(), Ie(s, _), u && u.d(), f && f.d();
		}
	};
}
function is(e) {
	let t, n, r, i;
	return (
		(r = new at({
			props: { $$slots: { default: [rs] }, $$scope: { ctx: e } }
		})),
		{
			c() {
				(t = A("h4")),
					(t.innerHTML = `<div class="toggle-icon svelte-1c7hj3i"><div class="toggle-dot svelte-1c7hj3i"></div></div>
	Return Type(s)`),
					(n = G()),
					X(r.$$.fragment),
					v(t, "class", "svelte-1c7hj3i");
			},
			m(o, a) {
				I(o, t, a), I(o, n, a), q(r, o, a), (i = !0);
			},
			p(o, [a]) {
				const l = {};
				a & 65539 && (l.$$scope = { dirty: a, ctx: o }), r.$set(l);
			},
			i(o) {
				i || (P(r.$$.fragment, o), (i = !0));
			},
			o(o) {
				B(r.$$.fragment, o), (i = !1);
			},
			d(o) {
				o && S(t), o && S(n), Z(r, o);
			}
		}
	);
}
function os(e, t, n) {
	let { dependency: r } = t,
		{ dependency_index: i } = t,
		{ instance_map: o } = t,
		{ dependency_outputs: a } = t,
		{ is_running: l } = t,
		{ root: c } = t,
		{ endpoint_returns: s } = t,
		{ named: u } = t;
	return (
		(e.$$set = (f) => {
			"dependency" in f && n(2, (r = f.dependency)),
				"dependency_index" in f && n(3, (i = f.dependency_index)),
				"instance_map" in f && n(4, (o = f.instance_map)),
				"dependency_outputs" in f && n(5, (a = f.dependency_outputs)),
				"is_running" in f && n(0, (l = f.is_running)),
				"root" in f && n(6, (c = f.root)),
				"endpoint_returns" in f && n(1, (s = f.endpoint_returns)),
				"named" in f && n(7, (u = f.named));
		}),
		[l, s, r, i, o, a, c, u]
	);
}
class lo extends se {
	constructor(t) {
		super(),
			ue(this, t, os, is, ce, {
				dependency: 2,
				dependency_index: 3,
				instance_map: 4,
				dependency_outputs: 5,
				is_running: 0,
				root: 6,
				endpoint_returns: 1,
				named: 7
			});
	}
}
function ls(e) {
	let t;
	return {
		c() {
			t = O(e[0]);
		},
		m(n, r) {
			I(n, t, r);
		},
		p(n, r) {
			r & 1 && ee(t, n[0]);
		},
		d(n) {
			n && S(t);
		}
	};
}
function as(e) {
	let t, n;
	return (
		(t = new Oo({
			props: { size: "sm", $$slots: { default: [ls] }, $$scope: { ctx: e } }
		})),
		t.$on("click", e[1]),
		{
			c() {
				X(t.$$.fragment);
			},
			m(r, i) {
				q(t, r, i), (n = !0);
			},
			p(r, [i]) {
				const o = {};
				i & 9 && (o.$$scope = { dirty: i, ctx: r }), t.$set(o);
			},
			i(r) {
				n || (P(t.$$.fragment, r), (n = !0));
			},
			o(r) {
				B(t.$$.fragment, r), (n = !1);
			},
			d(r) {
				Z(t, r);
			}
		}
	);
}
function ss(e, t, n) {
	let { code: r } = t,
		i = "copy";
	function o() {
		navigator.clipboard.writeText(r),
			n(0, (i = "copied!")),
			setTimeout(() => {
				n(0, (i = "copy"));
			}, 1500);
	}
	return (
		(e.$$set = (a) => {
			"code" in a && n(2, (r = a.code));
		}),
		[i, o, r]
	);
}
class ft extends se {
	constructor(t) {
		super(), ue(this, t, ss, as, ce, { code: 2 });
	}
}
function us(e) {
	let t, n, r, i, o, a;
	return (
		(n = new ft({ props: { code: Ft } })),
		{
			c() {
				(t = A("div")),
					X(n.$$.fragment),
					(r = G()),
					(i = A("div")),
					(o = A("pre")),
					(o.textContent = `$ ${Ft}`),
					v(t, "class", "copy svelte-1pu3gsl"),
					v(o, "class", "svelte-1pu3gsl");
			},
			m(l, c) {
				I(l, t, c), q(n, t, null), I(l, r, c), I(l, i, c), b(i, o), (a = !0);
			},
			p: ae,
			i(l) {
				a || (P(n.$$.fragment, l), (a = !0));
			},
			o(l) {
				B(n.$$.fragment, l), (a = !1);
			},
			d(l) {
				l && S(t), Z(n), l && S(r), l && S(i);
			}
		}
	);
}
function cs(e) {
	let t, n, r, i, o, a;
	return (
		(n = new ft({ props: { code: Dt } })),
		{
			c() {
				(t = A("div")),
					X(n.$$.fragment),
					(r = G()),
					(i = A("div")),
					(o = A("pre")),
					(o.textContent = `$ ${Dt}`),
					v(t, "class", "copy svelte-1pu3gsl"),
					v(o, "class", "svelte-1pu3gsl");
			},
			m(l, c) {
				I(l, t, c), q(n, t, null), I(l, r, c), I(l, i, c), b(i, o), (a = !0);
			},
			p: ae,
			i(l) {
				a || (P(n.$$.fragment, l), (a = !0));
			},
			o(l) {
				B(n.$$.fragment, l), (a = !1);
			},
			d(l) {
				l && S(t), Z(n), l && S(r), l && S(i);
			}
		}
	);
}
function fs(e) {
	let t, n, r, i;
	const o = [cs, us],
		a = [];
	function l(c, s) {
		return c[0] === "python" ? 0 : c[0] === "javascript" ? 1 : -1;
	}
	return (
		~(n = l(e)) && (r = a[n] = o[n](e)),
		{
			c() {
				(t = A("code")), r && r.c(), v(t, "class", "svelte-1pu3gsl");
			},
			m(c, s) {
				I(c, t, s), ~n && a[n].m(t, null), (i = !0);
			},
			p(c, s) {
				let u = n;
				(n = l(c)),
					n === u
						? ~n && a[n].p(c, s)
						: (r &&
								(ne(),
								B(a[u], 1, 1, () => {
									a[u] = null;
								}),
								re()),
						  ~n
								? ((r = a[n]),
								  r ? r.p(c, s) : ((r = a[n] = o[n](c)), r.c()),
								  P(r, 1),
								  r.m(t, null))
								: (r = null));
			},
			i(c) {
				i || (P(r), (i = !0));
			},
			o(c) {
				B(r), (i = !1);
			},
			d(c) {
				c && S(t), ~n && a[n].d();
			}
		}
	);
}
function _s(e) {
	let t, n;
	return (
		(t = new at({
			props: { $$slots: { default: [fs] }, $$scope: { ctx: e } }
		})),
		{
			c() {
				X(t.$$.fragment);
			},
			m(r, i) {
				q(t, r, i), (n = !0);
			},
			p(r, [i]) {
				const o = {};
				i & 3 && (o.$$scope = { dirty: i, ctx: r }), t.$set(o);
			},
			i(r) {
				n || (P(t.$$.fragment, r), (n = !0));
			},
			o(r) {
				B(t.$$.fragment, r), (n = !1);
			},
			d(r) {
				Z(t, r);
			}
		}
	);
}
let Dt = "pip install gradio_client",
	Ft = "pnpm add @gradio/client";
function hs(e, t, n) {
	let { current_language: r } = t;
	return (
		(e.$$set = (i) => {
			"current_language" in i && n(0, (r = i.current_language));
		}),
		[r]
	);
}
class ps extends se {
	constructor(t) {
		super(), ue(this, t, hs, _s, ce, { current_language: 0 });
	}
}
function ms(e) {
	let t, n, r, i;
	return {
		c() {
			(t = A("h3")),
				(n = O(`fn_index:
		`)),
				(r = A("span")),
				(i = O(e[1])),
				v(r, "class", "post svelte-41kcm6"),
				v(t, "class", "svelte-41kcm6");
		},
		m(o, a) {
			I(o, t, a), b(t, n), b(t, r), b(r, i);
		},
		p(o, a) {
			a & 2 && ee(i, o[1]);
		},
		d(o) {
			o && S(t);
		}
	};
}
function ds(e) {
	let t,
		n,
		r,
		i = "/" + e[0],
		o;
	return {
		c() {
			(t = A("h3")),
				(n = O(`api_name:
		`)),
				(r = A("span")),
				(o = O(i)),
				v(r, "class", "post svelte-41kcm6"),
				v(t, "class", "svelte-41kcm6");
		},
		m(a, l) {
			I(a, t, l), b(t, n), b(t, r), b(r, o);
		},
		p(a, l) {
			l & 1 && i !== (i = "/" + a[0]) && ee(o, i);
		},
		d(a) {
			a && S(t);
		}
	};
}
function gs(e) {
	let t;
	function n(o, a) {
		return o[2] ? ds : ms;
	}
	let r = n(e),
		i = r(e);
	return {
		c() {
			i.c(), (t = le());
		},
		m(o, a) {
			i.m(o, a), I(o, t, a);
		},
		p(o, [a]) {
			r === (r = n(o)) && i
				? i.p(o, a)
				: (i.d(1), (i = r(o)), i && (i.c(), i.m(t.parentNode, t)));
		},
		i: ae,
		o: ae,
		d(o) {
			i.d(o), o && S(t);
		}
	};
}
function bs(e, t, n) {
	let { api_name: r = null } = t,
		{ fn_index: i = null } = t,
		{ named: o } = t;
	return (
		(e.$$set = (a) => {
			"api_name" in a && n(0, (r = a.api_name)),
				"fn_index" in a && n(1, (i = a.fn_index)),
				"named" in a && n(2, (o = a.named));
		}),
		[r, i, o]
	);
}
class ao extends se {
	constructor(t) {
		super(), ue(this, t, bs, gs, ce, { api_name: 0, fn_index: 1, named: 2 });
	}
}
function Gt(e, t, n) {
	const r = e.slice();
	return (
		(r[13] = t[n].label),
		(r[14] = t[n].type),
		(r[15] = t[n].python_type),
		(r[16] = t[n].component),
		(r[17] = t[n].example_input),
		(r[18] = t[n].serializer),
		(r[20] = n),
		r
	);
}
function vs(e) {
	let t, n;
	return (
		(t = new ao({ props: { named: e[5], fn_index: e[1] } })),
		{
			c() {
				X(t.$$.fragment);
			},
			m(r, i) {
				q(t, r, i), (n = !0);
			},
			p(r, i) {
				const o = {};
				i & 32 && (o.named = r[5]), i & 2 && (o.fn_index = r[1]), t.$set(o);
			},
			i(r) {
				n || (P(t.$$.fragment, r), (n = !0));
			},
			o(r) {
				B(t.$$.fragment, r), (n = !1);
			},
			d(r) {
				Z(t, r);
			}
		}
	);
}
function Es(e) {
	let t, n;
	return (
		(t = new ao({ props: { named: e[5], api_name: e[0].api_name } })),
		{
			c() {
				X(t.$$.fragment);
			},
			m(r, i) {
				q(t, r, i), (n = !0);
			},
			p(r, i) {
				const o = {};
				i & 32 && (o.named = r[5]),
					i & 1 && (o.api_name = r[0].api_name),
					t.$set(o);
			},
			i(r) {
				n || (P(t.$$.fragment, r), (n = !0));
			},
			o(r) {
				B(t.$$.fragment, r), (n = !1);
			},
			d(r) {
				Z(t, r);
			}
		}
	);
}
function Ut(e) {
	let t, n, r, i, o, a, l, c, s, u, f, _, m, g;
	n = new ft({ props: { code: e[7]?.innerText } });
	let p = e[4],
		y = [];
	for (let h = 0; h < p.length; h += 1) y[h] = zt(Gt(e, p, h));
	function T(h, M) {
		return h[5] ? Ss : ys;
	}
	let C = T(e),
		E = C(e);
	return {
		c() {
			(t = A("div")),
				X(n.$$.fragment),
				(r = G()),
				(i = A("div")),
				(o = A("pre")),
				(a = O(`from gradio_client import Client

client = Client(`)),
				(l = A("span")),
				(c = O('"')),
				(s = O(e[2])),
				(u = O('"')),
				(f = O(`)
result = client.predict(`));
			for (let h = 0; h < y.length; h += 1) y[h].c();
			(_ = O(`
				`)),
				E.c(),
				(m = O(`
)
print(result)`)),
				v(t, "class", "copy svelte-1bqxtsy"),
				v(l, "class", "token string svelte-1bqxtsy"),
				v(o, "class", "svelte-1bqxtsy");
		},
		m(h, M) {
			I(h, t, M),
				q(n, t, null),
				I(h, r, M),
				I(h, i, M),
				b(i, o),
				b(o, a),
				b(o, l),
				b(l, c),
				b(l, s),
				b(l, u),
				b(o, f);
			for (let N = 0; N < y.length; N += 1) y[N] && y[N].m(o, null);
			b(o, _), E.m(o, null), b(o, m), e[11](i), (g = !0);
		},
		p(h, M) {
			const N = {};
			if (
				(M & 128 && (N.code = h[7]?.innerText),
				n.$set(N),
				(!g || M & 4) && ee(s, h[2]),
				M & 26)
			) {
				p = h[4];
				let W;
				for (W = 0; W < p.length; W += 1) {
					const Q = Gt(h, p, W);
					y[W] ? y[W].p(Q, M) : ((y[W] = zt(Q)), y[W].c(), y[W].m(o, _));
				}
				for (; W < y.length; W += 1) y[W].d(1);
				y.length = p.length;
			}
			C === (C = T(h)) && E
				? E.p(h, M)
				: (E.d(1), (E = C(h)), E && (E.c(), E.m(o, m)));
		},
		i(h) {
			g || (P(n.$$.fragment, h), (g = !0));
		},
		o(h) {
			B(n.$$.fragment, h), (g = !1);
		},
		d(h) {
			h && S(t), Z(n), h && S(r), h && S(i), Ie(y, h), E.d(), e[11](null);
		}
	};
}
function Vt(e) {
	let t;
	return {
		c() {
			(t = A("span")),
				(t.textContent = "ERROR"),
				v(t, "class", "error svelte-1bqxtsy");
		},
		m(n, r) {
			I(n, t, r);
		},
		d(n) {
			n && S(t);
		}
	};
}
function zt(e) {
	let t,
		n,
		r = Ot(e[17], e[15].type, "py") + "",
		i,
		o,
		a,
		l,
		c = e[15].type + "",
		s,
		u,
		f = e[13] + "",
		_,
		m,
		g = e[16] + "",
		p,
		y,
		T = e[3][e[1]][e[20]] && Vt();
	return {
		c() {
			(t = O(`
				`)),
				(n = A("span")),
				(i = O(r)),
				(o = O(",")),
				T && T.c(),
				(a = A("span")),
				(l = O("	# ")),
				(s = O(c)),
				(u = O(" representing input in '")),
				(_ = O(f)),
				(m = O("' ")),
				(p = O(g)),
				(y = O(" component")),
				v(n, "class", "example-inputs svelte-1bqxtsy"),
				v(a, "class", "desc svelte-1bqxtsy");
		},
		m(C, E) {
			I(C, t, E),
				I(C, n, E),
				b(n, i),
				I(C, o, E),
				T && T.m(C, E),
				I(C, a, E),
				b(a, l),
				b(a, s),
				b(a, u),
				b(a, _),
				b(a, m),
				b(a, p),
				b(a, y);
		},
		p(C, E) {
			E & 16 && r !== (r = Ot(C[17], C[15].type, "py") + "") && ee(i, r),
				C[3][C[1]][C[20]]
					? T || ((T = Vt()), T.c(), T.m(a.parentNode, a))
					: T && (T.d(1), (T = null)),
				E & 16 && c !== (c = C[15].type + "") && ee(s, c),
				E & 16 && f !== (f = C[13] + "") && ee(_, f),
				E & 16 && g !== (g = C[16] + "") && ee(p, g);
		},
		d(C) {
			C && S(t), C && S(n), C && S(o), T && T.d(C), C && S(a);
		}
	};
}
function ys(e) {
	let t, n;
	return {
		c() {
			(t = O("fn_index=")), (n = O(e[1]));
		},
		m(r, i) {
			I(r, t, i), I(r, n, i);
		},
		p(r, i) {
			i & 2 && ee(n, r[1]);
		},
		d(r) {
			r && S(t), r && S(n);
		}
	};
}
function Ss(e) {
	let t,
		n = e[0].api_name + "",
		r,
		i;
	return {
		c() {
			(t = O('api_name="/')), (r = O(n)), (i = O('"'));
		},
		m(o, a) {
			I(o, t, a), I(o, r, a), I(o, i, a);
		},
		p(o, a) {
			a & 1 && n !== (n = o[0].api_name + "") && ee(r, n);
		},
		d(o) {
			o && S(t), o && S(r), o && S(i);
		}
	};
}
function Ts(e) {
	let t,
		n,
		r = e[6] === "python" && Ut(e);
	return {
		c() {
			(t = A("code")), r && r.c(), v(t, "class", "svelte-1bqxtsy");
		},
		m(i, o) {
			I(i, t, o), r && r.m(t, null), (n = !0);
		},
		p(i, o) {
			i[6] === "python"
				? r
					? (r.p(i, o), o & 64 && P(r, 1))
					: ((r = Ut(i)), r.c(), P(r, 1), r.m(t, null))
				: r &&
				  (ne(),
				  B(r, 1, 1, () => {
						r = null;
				  }),
				  re());
		},
		i(i) {
			n || (P(r), (n = !0));
		},
		o(i) {
			B(r), (n = !1);
		},
		d(i) {
			i && S(t), r && r.d();
		}
	};
}
function Is(e) {
	let t, n, r, i, o, a;
	const l = [Es, vs],
		c = [];
	function s(u, f) {
		return u[5] ? 0 : 1;
	}
	return (
		(n = s(e)),
		(r = c[n] = l[n](e)),
		(o = new at({
			props: { $$slots: { default: [Ts] }, $$scope: { ctx: e } }
		})),
		{
			c() {
				(t = A("div")),
					r.c(),
					(i = G()),
					X(o.$$.fragment),
					v(t, "class", "container svelte-1bqxtsy");
			},
			m(u, f) {
				I(u, t, f), c[n].m(t, null), b(t, i), q(o, t, null), (a = !0);
			},
			p(u, [f]) {
				let _ = n;
				(n = s(u)),
					n === _
						? c[n].p(u, f)
						: (ne(),
						  B(c[_], 1, 1, () => {
								c[_] = null;
						  }),
						  re(),
						  (r = c[n]),
						  r ? r.p(u, f) : ((r = c[n] = l[n](u)), r.c()),
						  P(r, 1),
						  r.m(t, i));
				const m = {};
				f & 2097407 && (m.$$scope = { dirty: f, ctx: u }), o.$set(m);
			},
			i(u) {
				a || (P(r), P(o.$$.fragment, u), (a = !0));
			},
			o(u) {
				B(r), B(o.$$.fragment, u), (a = !1);
			},
			d(u) {
				u && S(t), c[n].d(), Z(o);
			}
		}
	);
}
function ws(e, t, n) {
	let { dependency: r } = t,
		{ dependencies: i } = t,
		{ dependency_index: o } = t,
		{ instance_map: a } = t,
		{ root: l } = t,
		{ dependency_inputs: c } = t,
		{ dependency_failures: s } = t,
		{ endpoint_parameters: u } = t,
		{ named: f } = t,
		{ current_language: _ } = t,
		m;
	function g(p) {
		je[p ? "unshift" : "push"](() => {
			(m = p), n(7, m);
		});
	}
	return (
		(e.$$set = (p) => {
			"dependency" in p && n(0, (r = p.dependency)),
				"dependencies" in p && n(8, (i = p.dependencies)),
				"dependency_index" in p && n(1, (o = p.dependency_index)),
				"instance_map" in p && n(9, (a = p.instance_map)),
				"root" in p && n(2, (l = p.root)),
				"dependency_inputs" in p && n(10, (c = p.dependency_inputs)),
				"dependency_failures" in p && n(3, (s = p.dependency_failures)),
				"endpoint_parameters" in p && n(4, (u = p.endpoint_parameters)),
				"named" in p && n(5, (f = p.named)),
				"current_language" in p && n(6, (_ = p.current_language));
		}),
		[r, o, l, s, u, f, _, m, i, a, c, g]
	);
}
class so extends se {
	constructor(t) {
		super(),
			ue(this, t, ws, Is, ce, {
				dependency: 0,
				dependencies: 8,
				dependency_index: 1,
				instance_map: 9,
				root: 2,
				dependency_inputs: 10,
				dependency_failures: 3,
				endpoint_parameters: 4,
				named: 5,
				current_language: 6
			});
	}
}
const As = "" + new URL("python-20e39c92.svg", import.meta.url).href;
function Xt(e, t, n) {
	const r = e.slice();
	return (r[15] = t[n]), (r[17] = n), r;
}
function qt(e, t, n) {
	const r = e.slice();
	return (r[15] = t[n]), (r[17] = n), r;
}
function Zt(e, t, n) {
	const r = e.slice();
	return (r[19] = t[n][0]), (r[20] = t[n][1]), r;
}
function Wt(e) {
	let t, n, r, i, o;
	const a = [Cs, Ps],
		l = [];
	function c(s, u) {
		return (
			u & 128 && (t = null),
			t == null &&
				(t = !!(
					Object.keys(s[7].named_endpoints).length +
					Object.keys(s[7].unnamed_endpoints).length
				)),
			t ? 0 : 1
		);
	}
	return (
		(n = c(e, -1)),
		(r = l[n] = a[n](e)),
		{
			c() {
				r.c(), (i = le());
			},
			m(s, u) {
				l[n].m(s, u), I(s, i, u), (o = !0);
			},
			p(s, u) {
				let f = n;
				(n = c(s, u)),
					n === f
						? l[n].p(s, u)
						: (ne(),
						  B(l[f], 1, 1, () => {
								l[f] = null;
						  }),
						  re(),
						  (r = l[n]),
						  r ? r.p(s, u) : ((r = l[n] = a[n](s)), r.c()),
						  P(r, 1),
						  r.m(i.parentNode, i));
			},
			i(s) {
				o || (P(r), (o = !0));
			},
			o(s) {
				B(r), (o = !1);
			},
			d(s) {
				l[n].d(s), s && S(i);
			}
		}
	);
}
function Ps(e) {
	let t, n;
	return (
		(t = new Ka({ props: { root: e[0] } })),
		t.$on("close", e[12]),
		{
			c() {
				X(t.$$.fragment);
			},
			m(r, i) {
				q(t, r, i), (n = !0);
			},
			p(r, i) {
				const o = {};
				i & 1 && (o.root = r[0]), t.$set(o);
			},
			i(r) {
				n || (P(t.$$.fragment, r), (n = !0));
			},
			o(r) {
				B(t.$$.fragment, r), (n = !1);
			},
			d(r) {
				Z(t, r);
			}
		}
	);
}
function Cs(e) {
	let t,
		n,
		r,
		i,
		o,
		a,
		l,
		c,
		s,
		u,
		f,
		_ = Object.keys(e[7].named_endpoints).length,
		m,
		g,
		p = Object.keys(e[7].unnamed_endpoints).length,
		y,
		T;
	(n = new ns({
		props: {
			root: e[0],
			api_count:
				Object.keys(e[7].named_endpoints).length +
				Object.keys(e[7].unnamed_endpoints).length
		}
	})),
		n.$on("close", e[10]);
	let C = e[8],
		E = [];
	for (let w = 0; w < C.length; w += 1) E[w] = Yt(Zt(e, C, w));
	u = new ps({ props: { current_language: e[3] } });
	let h = _ && Jt(),
		M = e[2],
		N = [];
	for (let w = 0; w < M.length; w += 1) N[w] = $t(qt(e, M, w));
	const W = (w) =>
		B(N[w], 1, 1, () => {
			N[w] = null;
		});
	let Q = p && Kt(),
		Y = e[2],
		V = [];
	for (let w = 0; w < Y.length; w += 1) V[w] = tn(Xt(e, Y, w));
	const Oe = (w) =>
		B(V[w], 1, 1, () => {
			V[w] = null;
		});
	return {
		c() {
			(t = A("div")),
				X(n.$$.fragment),
				(r = G()),
				(i = A("div")),
				(o = A("div")),
				(o.innerHTML =
					'<h2>Use the <a href="https://pypi.org/project/gradio-client/" target="_blank"><code class="library svelte-rzp0ym">gradio_client</code></a> Python library to query the demo via API.</h2>'),
				(a = G()),
				(l = A("div")),
				(c = A("div"));
			for (let w = 0; w < E.length; w += 1) E[w].c();
			(s = G()), X(u.$$.fragment), (f = G()), h && h.c(), (m = G());
			for (let w = 0; w < N.length; w += 1) N[w].c();
			(g = G()), Q && Q.c(), (y = G());
			for (let w = 0; w < V.length; w += 1) V[w].c();
			v(t, "class", "banner-wrap svelte-rzp0ym"),
				v(o, "class", "client-doc svelte-rzp0ym"),
				v(c, "class", "snippets svelte-rzp0ym"),
				v(l, "class", "endpoint svelte-rzp0ym"),
				v(i, "class", "docs-wrap svelte-rzp0ym");
		},
		m(w, D) {
			I(w, t, D),
				q(n, t, null),
				I(w, r, D),
				I(w, i, D),
				b(i, o),
				b(i, a),
				b(i, l),
				b(l, c);
			for (let J = 0; J < E.length; J += 1) E[J] && E[J].m(c, null);
			b(l, s), q(u, l, null), b(l, f), h && h.m(l, null), b(l, m);
			for (let J = 0; J < N.length; J += 1) N[J] && N[J].m(l, null);
			b(l, g), Q && Q.m(l, null), b(l, y);
			for (let J = 0; J < V.length; J += 1) V[J] && V[J].m(l, null);
			T = !0;
		},
		p(w, D) {
			const J = {};
			if (
				(D & 1 && (J.root = w[0]),
				D & 128 &&
					(J.api_count =
						Object.keys(w[7].named_endpoints).length +
						Object.keys(w[7].unnamed_endpoints).length),
				n.$set(J),
				D & 264)
			) {
				C = w[8];
				let x;
				for (x = 0; x < C.length; x += 1) {
					const $ = Zt(w, C, x);
					E[x] ? E[x].p($, D) : ((E[x] = Yt($)), E[x].c(), E[x].m(c, null));
				}
				for (; x < E.length; x += 1) E[x].d(1);
				E.length = C.length;
			}
			const ye = {};
			if (
				(D & 8 && (ye.current_language = w[3]),
				u.$set(ye),
				D & 128 && (_ = Object.keys(w[7].named_endpoints).length),
				_ ? h || ((h = Jt()), h.c(), h.m(l, m)) : h && (h.d(1), (h = null)),
				D & 767)
			) {
				M = w[2];
				let x;
				for (x = 0; x < M.length; x += 1) {
					const $ = qt(w, M, x);
					N[x]
						? (N[x].p($, D), P(N[x], 1))
						: ((N[x] = $t($)), N[x].c(), P(N[x], 1), N[x].m(l, g));
				}
				for (ne(), x = M.length; x < N.length; x += 1) W(x);
				re();
			}
			if (
				(D & 128 && (p = Object.keys(w[7].unnamed_endpoints).length),
				p ? Q || ((Q = Kt()), Q.c(), Q.m(l, y)) : Q && (Q.d(1), (Q = null)),
				D & 767)
			) {
				Y = w[2];
				let x;
				for (x = 0; x < Y.length; x += 1) {
					const $ = Xt(w, Y, x);
					V[x]
						? (V[x].p($, D), P(V[x], 1))
						: ((V[x] = tn($)), V[x].c(), P(V[x], 1), V[x].m(l, null));
				}
				for (ne(), x = Y.length; x < V.length; x += 1) Oe(x);
				re();
			}
		},
		i(w) {
			if (!T) {
				P(n.$$.fragment, w), P(u.$$.fragment, w);
				for (let D = 0; D < M.length; D += 1) P(N[D]);
				for (let D = 0; D < Y.length; D += 1) P(V[D]);
				T = !0;
			}
		},
		o(w) {
			B(n.$$.fragment, w), B(u.$$.fragment, w), (N = N.filter(Boolean));
			for (let D = 0; D < N.length; D += 1) B(N[D]);
			V = V.filter(Boolean);
			for (let D = 0; D < V.length; D += 1) B(V[D]);
			T = !1;
		},
		d(w) {
			w && S(t),
				Z(n),
				w && S(r),
				w && S(i),
				Ie(E, w),
				Z(u),
				h && h.d(),
				Ie(N, w),
				Q && Q.d(),
				Ie(V, w);
		}
	};
}
function Yt(e) {
	let t,
		n,
		r,
		i,
		o = e[19] + "",
		a,
		l,
		c,
		s,
		u;
	function f() {
		return e[11](e[19]);
	}
	return {
		c() {
			(t = A("li")),
				(n = A("img")),
				(i = G()),
				(a = O(o)),
				(l = G()),
				Ce(n.src, (r = e[20])) || v(n, "src", r),
				v(n, "alt", ""),
				v(n, "class", "svelte-rzp0ym"),
				v(
					t,
					"class",
					(c =
						"snippet " +
						(e[3] === e[19] ? "current-lang" : "inactive-lang") +
						" svelte-rzp0ym")
				);
		},
		m(_, m) {
			I(_, t, m),
				b(t, n),
				b(t, i),
				b(t, a),
				b(t, l),
				s || ((u = Pe(t, "click", f)), (s = !0));
		},
		p(_, m) {
			(e = _),
				m & 8 &&
					c !==
						(c =
							"snippet " +
							(e[3] === e[19] ? "current-lang" : "inactive-lang") +
							" svelte-rzp0ym") &&
					v(t, "class", c);
		},
		d(_) {
			_ && S(t), (s = !1), u();
		}
	};
}
function Jt(e) {
	let t;
	return {
		c() {
			(t = A("h2")),
				(t.textContent = "Named Endpoints"),
				v(t, "class", "header svelte-rzp0ym");
		},
		m(n, r) {
			I(n, t, r);
		},
		d(n) {
			n && S(t);
		}
	};
}
function Qt(e) {
	let t, n, r, i, o;
	return (
		(n = new so({
			props: {
				named: !0,
				endpoint_parameters:
					e[7].named_endpoints["/" + e[15].api_name].parameters,
				instance_map: e[1],
				dependency: e[15],
				dependency_index: e[17],
				current_language: e[3],
				root: e[0],
				dependency_inputs: e[9],
				dependencies: e[2],
				dependency_failures: e[6]
			}
		})),
		(i = new lo({
			props: {
				named: !0,
				endpoint_returns: e[7].named_endpoints["/" + e[15].api_name].returns,
				instance_map: e[1],
				dependency: e[15],
				dependency_index: e[17],
				is_running: e[4],
				dependency_outputs: e[5],
				root: e[0]
			}
		})),
		{
			c() {
				(t = A("div")),
					X(n.$$.fragment),
					(r = G()),
					X(i.$$.fragment),
					v(t, "class", "endpoint-container svelte-rzp0ym");
			},
			m(a, l) {
				I(a, t, l), q(n, t, null), b(t, r), q(i, t, null), (o = !0);
			},
			p(a, l) {
				const c = {};
				l & 132 &&
					(c.endpoint_parameters =
						a[7].named_endpoints["/" + a[15].api_name].parameters),
					l & 2 && (c.instance_map = a[1]),
					l & 4 && (c.dependency = a[15]),
					l & 8 && (c.current_language = a[3]),
					l & 1 && (c.root = a[0]),
					l & 4 && (c.dependencies = a[2]),
					l & 64 && (c.dependency_failures = a[6]),
					n.$set(c);
				const s = {};
				l & 132 &&
					(s.endpoint_returns =
						a[7].named_endpoints["/" + a[15].api_name].returns),
					l & 2 && (s.instance_map = a[1]),
					l & 4 && (s.dependency = a[15]),
					l & 16 && (s.is_running = a[4]),
					l & 32 && (s.dependency_outputs = a[5]),
					l & 1 && (s.root = a[0]),
					i.$set(s);
			},
			i(a) {
				o || (P(n.$$.fragment, a), P(i.$$.fragment, a), (o = !0));
			},
			o(a) {
				B(n.$$.fragment, a), B(i.$$.fragment, a), (o = !1);
			},
			d(a) {
				a && S(t), Z(n), Z(i);
			}
		}
	);
}
function $t(e) {
	let t,
		n,
		r = e[15].api_name && Qt(e);
	return {
		c() {
			r && r.c(), (t = le());
		},
		m(i, o) {
			r && r.m(i, o), I(i, t, o), (n = !0);
		},
		p(i, o) {
			i[15].api_name
				? r
					? (r.p(i, o), o & 4 && P(r, 1))
					: ((r = Qt(i)), r.c(), P(r, 1), r.m(t.parentNode, t))
				: r &&
				  (ne(),
				  B(r, 1, 1, () => {
						r = null;
				  }),
				  re());
		},
		i(i) {
			n || (P(r), (n = !0));
		},
		o(i) {
			B(r), (n = !1);
		},
		d(i) {
			r && r.d(i), i && S(t);
		}
	};
}
function Kt(e) {
	let t;
	return {
		c() {
			(t = A("h2")),
				(t.textContent = "Unnamed Endpoints"),
				v(t, "class", "header svelte-rzp0ym");
		},
		m(n, r) {
			I(n, t, r);
		},
		d(n) {
			n && S(t);
		}
	};
}
function en(e) {
	let t, n, r, i, o, a;
	return (
		(n = new so({
			props: {
				named: !1,
				endpoint_parameters: e[7].unnamed_endpoints[e[17]].parameters,
				instance_map: e[1],
				dependency: e[15],
				dependency_index: e[17],
				current_language: e[3],
				root: e[0],
				dependency_inputs: e[9],
				dependencies: e[2],
				dependency_failures: e[6]
			}
		})),
		(i = new lo({
			props: {
				named: !1,
				endpoint_returns: e[7].unnamed_endpoints[e[17]].returns,
				instance_map: e[1],
				dependency: e[15],
				dependency_index: e[17],
				is_running: e[4],
				dependency_outputs: e[5],
				root: e[0]
			}
		})),
		{
			c() {
				(t = A("div")),
					X(n.$$.fragment),
					(r = G()),
					X(i.$$.fragment),
					(o = G()),
					v(t, "class", "endpoint-container svelte-rzp0ym");
			},
			m(l, c) {
				I(l, t, c), q(n, t, null), b(t, r), q(i, t, null), b(t, o), (a = !0);
			},
			p(l, c) {
				const s = {};
				c & 128 &&
					(s.endpoint_parameters = l[7].unnamed_endpoints[l[17]].parameters),
					c & 2 && (s.instance_map = l[1]),
					c & 4 && (s.dependency = l[15]),
					c & 8 && (s.current_language = l[3]),
					c & 1 && (s.root = l[0]),
					c & 4 && (s.dependencies = l[2]),
					c & 64 && (s.dependency_failures = l[6]),
					n.$set(s);
				const u = {};
				c & 128 && (u.endpoint_returns = l[7].unnamed_endpoints[l[17]].returns),
					c & 2 && (u.instance_map = l[1]),
					c & 4 && (u.dependency = l[15]),
					c & 16 && (u.is_running = l[4]),
					c & 32 && (u.dependency_outputs = l[5]),
					c & 1 && (u.root = l[0]),
					i.$set(u);
			},
			i(l) {
				a || (P(n.$$.fragment, l), P(i.$$.fragment, l), (a = !0));
			},
			o(l) {
				B(n.$$.fragment, l), B(i.$$.fragment, l), (a = !1);
			},
			d(l) {
				l && S(t), Z(n), Z(i);
			}
		}
	);
}
function tn(e) {
	let t,
		n,
		r = e[7].unnamed_endpoints[e[17]] && en(e);
	return {
		c() {
			r && r.c(), (t = le());
		},
		m(i, o) {
			r && r.m(i, o), I(i, t, o), (n = !0);
		},
		p(i, o) {
			i[7].unnamed_endpoints[i[17]]
				? r
					? (r.p(i, o), o & 128 && P(r, 1))
					: ((r = en(i)), r.c(), P(r, 1), r.m(t.parentNode, t))
				: r &&
				  (ne(),
				  B(r, 1, 1, () => {
						r = null;
				  }),
				  re());
		},
		i(i) {
			n || (P(r), (n = !0));
		},
		o(i) {
			B(r), (n = !1);
		},
		d(i) {
			r && r.d(i), i && S(t);
		}
	};
}
function Bs(e) {
	let t,
		n,
		r = e[7] && Wt(e);
	return {
		c() {
			r && r.c(), (t = le());
		},
		m(i, o) {
			r && r.m(i, o), I(i, t, o), (n = !0);
		},
		p(i, [o]) {
			i[7]
				? r
					? (r.p(i, o), o & 128 && P(r, 1))
					: ((r = Wt(i)), r.c(), P(r, 1), r.m(t.parentNode, t))
				: r &&
				  (ne(),
				  B(r, 1, 1, () => {
						r = null;
				  }),
				  re());
		},
		i(i) {
			n || (P(r), (n = !0));
		},
		o(i) {
			B(r), (n = !1);
		},
		d(i) {
			r && r.d(i), i && S(t);
		}
	};
}
function Hs(e, t, n) {
	let { instance_map: r } = t,
		{ dependencies: i } = t,
		{ root: o } = t;
	o === "" &&
		(o = location.protocol + "//" + location.host + location.pathname),
		o.endsWith("/") || (o += "/");
	let a = "python";
	const l = [["python", As]];
	let c = !1,
		s = i.map((T) =>
			T.inputs.map((C) => {
				let E = r[C].documentation?.example_data;
				return (
					E === void 0
						? (E = "")
						: typeof E == "object" && (E = JSON.stringify(E)),
					E
				);
			})
		),
		u = i.map((T) => new Array(T.outputs.length)),
		f = i.map((T) => new Array(T.inputs.length).fill(!1));
	async function _() {
		return await (await fetch(o + "info")).json();
	}
	let m;
	_()
		.then((T) => n(7, (m = T)))
		.catch((T) => console.log(T)),
		cn(
			() => (
				(document.body.style.overflow = "hidden"),
				() => {
					document.body.style.overflow = "auto";
				}
			)
		);
	function g(T) {
		De.call(this, e, T);
	}
	const p = (T) => n(3, (a = T));
	function y(T) {
		De.call(this, e, T);
	}
	return (
		(e.$$set = (T) => {
			"instance_map" in T && n(1, (r = T.instance_map)),
				"dependencies" in T && n(2, (i = T.dependencies)),
				"root" in T && n(0, (o = T.root));
		}),
		[o, r, i, a, c, u, f, m, l, s, g, p, y]
	);
}
class Os extends se {
	constructor(t) {
		super(),
			ue(this, t, Hs, Bs, ce, { instance_map: 1, dependencies: 2, root: 0 });
	}
}
const xs = "" + new URL("logo-0a070fcf.svg", import.meta.url).href;
function nn(e) {
	return (document.title = e[3]), { c: ae, m: ae, d: ae };
}
function rn(e) {
	let t, n, r, i;
	return {
		c() {
			(t = A("script")),
				(r = G()),
				(i = A("script")),
				(i.textContent = `window.dataLayer = window.dataLayer || [];
			function gtag() {
				dataLayer.push(arguments);
			}
			gtag("js", new Date());
			gtag("config", "UA-156449732-1");`),
				(t.async = !0),
				(t.defer = !0),
				Ce(
					t.src,
					(n = "https://www.googletagmanager.com/gtag/js?id=UA-156449732-1")
				) || v(t, "src", n);
		},
		m(o, a) {
			I(o, t, a), I(o, r, a), I(o, i, a);
		},
		d(o) {
			o && S(t), o && S(r), o && S(i);
		}
	};
}
function on(e) {
	let t, n;
	return (
		(t = new ro({
			props: {
				has_modes: e[11].has_modes,
				component: e[11].component,
				id: e[11].id,
				props: e[11].props,
				children: e[11].children,
				dynamic_ids: e[16],
				instance_map: e[13],
				root: e[1],
				target: e[5],
				theme_mode: e[10]
			}
		})),
		t.$on("mount", e[17]),
		t.$on("destroy", e[24]),
		{
			c() {
				X(t.$$.fragment);
			},
			m(r, i) {
				q(t, r, i), (n = !0);
			},
			p(r, i) {
				const o = {};
				i[0] & 2048 && (o.has_modes = r[11].has_modes),
					i[0] & 2048 && (o.component = r[11].component),
					i[0] & 2048 && (o.id = r[11].id),
					i[0] & 2048 && (o.props = r[11].props),
					i[0] & 2048 && (o.children = r[11].children),
					i[0] & 8192 && (o.instance_map = r[13]),
					i[0] & 2 && (o.root = r[1]),
					i[0] & 32 && (o.target = r[5]),
					i[0] & 1024 && (o.theme_mode = r[10]),
					t.$set(o);
			},
			i(r) {
				n || (P(t.$$.fragment, r), (n = !0));
			},
			o(r) {
				B(t.$$.fragment, r), (n = !1);
			},
			d(r) {
				Z(t, r);
			}
		}
	);
}
function ln(e) {
	let t,
		n,
		r,
		i,
		o,
		a,
		l = e[6] && an(e);
	return {
		c() {
			(t = A("footer")),
				l && l.c(),
				(n = G()),
				(r = A("a")),
				(i = O(`Built with Gradio
				`)),
				(o = A("img")),
				Ce(o.src, (a = xs)) || v(o, "src", a),
				v(o, "alt", "logo"),
				v(o, "class", "svelte-1lyswbr"),
				v(r, "href", "https://gradio.app"),
				v(r, "class", "built-with svelte-1lyswbr"),
				v(r, "target", "_blank"),
				v(r, "rel", "noreferrer"),
				v(t, "class", "svelte-1lyswbr");
		},
		m(c, s) {
			I(c, t, s), l && l.m(t, null), b(t, n), b(t, r), b(r, i), b(r, o);
		},
		p(c, s) {
			c[6]
				? l
					? l.p(c, s)
					: ((l = an(c)), l.c(), l.m(t, n))
				: l && (l.d(1), (l = null));
		},
		d(c) {
			c && S(t), l && l.d();
		}
	};
}
function an(e) {
	let t, n, r, i, o, a, l, c;
	return {
		c() {
			(t = A("button")),
				(n = O("Use via API ")),
				(r = A("img")),
				(o = G()),
				(a = A("div")),
				(a.textContent = "·"),
				Ce(r.src, (i = oo)) || v(r, "src", i),
				v(r, "alt", ""),
				v(r, "class", "svelte-1lyswbr"),
				v(t, "class", "show-api svelte-1lyswbr"),
				v(a, "class", "svelte-1lyswbr");
		},
		m(s, u) {
			I(s, t, u),
				b(t, n),
				b(t, r),
				I(s, o, u),
				I(s, a, u),
				l || ((c = Pe(t, "click", e[25])), (l = !0));
		},
		p: ae,
		d(s) {
			s && S(t), s && S(o), s && S(a), (l = !1), c();
		}
	};
}
function sn(e) {
	let t, n, r, i, o, a, l, c;
	return (
		(o = new Os({
			props: { instance_map: e[13], dependencies: e[2], root: e[1] }
		})),
		o.$on("close", e[27]),
		{
			c() {
				(t = A("div")),
					(n = A("div")),
					(r = G()),
					(i = A("div")),
					X(o.$$.fragment),
					v(n, "class", "backdrop svelte-1lyswbr"),
					v(i, "class", "api-docs-wrap svelte-1lyswbr"),
					v(t, "class", "api-docs svelte-1lyswbr");
			},
			m(s, u) {
				I(s, t, u),
					b(t, n),
					b(t, r),
					b(t, i),
					q(o, i, null),
					(a = !0),
					l || ((c = Pe(n, "click", e[26])), (l = !0));
			},
			p(s, u) {
				const f = {};
				u[0] & 8192 && (f.instance_map = s[13]),
					u[0] & 4 && (f.dependencies = s[2]),
					u[0] & 2 && (f.root = s[1]),
					o.$set(f);
			},
			i(s) {
				a || (P(o.$$.fragment, s), (a = !0));
			},
			o(s) {
				B(o.$$.fragment, s), (a = !1);
			},
			d(s) {
				s && S(t), Z(o), (l = !1), c();
			}
		}
	);
}
function ks(e) {
	let t,
		n,
		r,
		i,
		o,
		a,
		l,
		c,
		s,
		u = e[8] && nn(e),
		f = e[4] && rn(),
		_ = e[0] && on(e),
		m = e[7] && ln(e),
		g = e[12] && e[0] && sn(e);
	return {
		c() {
			u && u.c(),
				(t = le()),
				f && f.c(),
				(n = le()),
				(r = G()),
				(i = A("div")),
				(o = A("div")),
				_ && _.c(),
				(a = G()),
				m && m.c(),
				(l = G()),
				g && g.c(),
				(c = le()),
				v(o, "class", "contain"),
				fe(o, "flex-grow", e[9] ? "1" : "auto"),
				v(i, "class", "wrap svelte-1lyswbr"),
				fe(i, "min-height", e[9] ? "100%" : "auto");
		},
		m(p, y) {
			u && u.m(document.head, null),
				b(document.head, t),
				f && f.m(document.head, null),
				b(document.head, n),
				I(p, r, y),
				I(p, i, y),
				b(i, o),
				_ && _.m(o, null),
				b(i, a),
				m && m.m(i, null),
				I(p, l, y),
				g && g.m(p, y),
				I(p, c, y),
				(s = !0);
		},
		p(p, y) {
			p[8]
				? u || ((u = nn(p)), u.c(), u.m(t.parentNode, t))
				: u && (u.d(1), (u = null)),
				p[4]
					? f || ((f = rn()), f.c(), f.m(n.parentNode, n))
					: f && (f.d(1), (f = null)),
				p[0]
					? _
						? (_.p(p, y), y[0] & 1 && P(_, 1))
						: ((_ = on(p)), _.c(), P(_, 1), _.m(o, null))
					: _ &&
					  (ne(),
					  B(_, 1, 1, () => {
							_ = null;
					  }),
					  re()),
				y[0] & 512 && fe(o, "flex-grow", p[9] ? "1" : "auto"),
				p[7]
					? m
						? m.p(p, y)
						: ((m = ln(p)), m.c(), m.m(i, null))
					: m && (m.d(1), (m = null)),
				y[0] & 512 && fe(i, "min-height", p[9] ? "100%" : "auto"),
				p[12] && p[0]
					? g
						? (g.p(p, y), y[0] & 4097 && P(g, 1))
						: ((g = sn(p)), g.c(), P(g, 1), g.m(c.parentNode, c))
					: g &&
					  (ne(),
					  B(g, 1, 1, () => {
							g = null;
					  }),
					  re());
		},
		i(p) {
			s || (P(_), P(g), (s = !0));
		},
		o(p) {
			B(_), B(g), (s = !1);
		},
		d(p) {
			u && u.d(p),
				S(t),
				f && f.d(p),
				S(n),
				p && S(r),
				p && S(i),
				_ && _.d(),
				m && m.d(),
				p && S(l),
				g && g.d(p),
				p && S(c);
		}
	};
}
function un(e, t, n) {
	let r = 0;
	for (;;) {
		const i = n[r];
		if (i === void 0) break;
		let o = 0;
		for (;;) {
			const a = i[t][o];
			if (a === void 0) break;
			if (a === e) return !0;
			o++;
		}
		r++;
	}
	return !1;
}
function Ls(e) {
	return (Array.isArray(e) && e.length === 0) || e === "" || e === 0 || !e;
}
function Ns(e, t, n) {
	let r;
	qa();
	let { root: i } = t,
		{ components: o } = t,
		{ layout: a } = t,
		{ dependencies: l } = t,
		{ title: c = "Gradio" } = t,
		{ analytics_enabled: s = !1 } = t,
		{ target: u } = t,
		{ autoscroll: f } = t,
		{ show_api: _ = !0 } = t,
		{ show_footer: m = !0 } = t,
		{ control_page_title: g = !1 } = t,
		{ app_mode: p } = t,
		{ theme_mode: y } = t,
		{ app: T } = t,
		C = Po();
	Co(e, C, (d) => n(23, (r = d)));
	let E = {
		id: a.id,
		type: "column",
		props: {},
		has_modes: !1,
		instance: {},
		component: {}
	};
	o.push(E);
	const h = Object.getPrototypeOf(async function () {}).constructor;
	l.forEach((d) => {
		if (d.js) {
			const H = d.backend_fn ? d.inputs.length === 1 : d.outputs.length === 1;
			try {
				d.frontend_fn = new h(
					"__fn_args",
					`let result = await (${d.js})(...__fn_args);
					return (${H} && !Array.isArray(result)) ? [result] : result;`
				);
			} catch (k) {
				console.error("Could not parse custom js method."), console.error(k);
			}
		}
	});
	let N = new URLSearchParams(window.location.search).get("view") === "api";
	const W = (d) => {
			n(12, (N = d));
			let H = new URLSearchParams(window.location.search);
			d ? H.set("view", "api") : H.delete("view"),
				history.replaceState(null, "", "?" + H.toString());
		},
		Q = o.reduce((d, { id: H, props: k }) => {
			const L = un(H, "inputs", l),
				K = un(H, "outputs", l);
			return !L && !K && Ls(k?.value) && d.add(H), L && d.add(H), d;
		}, new Set());
	let Y = o.reduce((d, H) => ((d[H.id] = H), d), {});
	function V(d) {
		return new Promise(async (H, k) => {
			try {
				const L = await ea[d]();
				H({ name: d, component: L });
			} catch (L) {
				console.error("failed to load: " + d), console.error(L), k(L);
			}
		});
	}
	const Oe = new Set(),
		w = new Map();
	async function D(d) {
		let H = Y[d.id];
		const k = (await w.get(H.type)).component;
		(H.component = k.Component),
			k.document && (H.documentation = k.document(H.props)),
			k.modes && k.modes.length > 1 && (H.has_modes = !0),
			d.children &&
				((H.children = d.children.map((L) => Y[L.id])),
				await Promise.all(d.children.map((L) => D(L))));
	}
	o.forEach(async (d) => {
		const H = V(d.type);
		Oe.add(H), w.set(d.type, H);
	});
	let { ready: J = !1 } = t;
	Promise.all(Array.from(Oe)).then(() => {
		D(a)
			.then(async () => {
				n(0, (J = !0));
			})
			.catch((d) => {
				console.error(d);
			});
	});
	function ye(d, H) {
		const k = l[H].outputs;
		d?.forEach((L, K) => {
			if (typeof L == "object" && L !== null && L.__type__ === "update") {
				for (const [_e, ie] of Object.entries(L))
					_e !== "__type__" && n(13, (Y[k[K]].props[_e] = ie), Y);
				n(11, E);
			} else n(13, (Y[k[K]].props.value = L), Y);
		});
	}
	T.on("data", ({ data: d, fn_index: H }) => {
		ye(d, H),
			C.get_status_for_fn(H) === "complete" &&
				l.forEach((L, K) => {
					L.trigger_after === H && xe(K, null);
				});
	}),
		T.on("status", ({ fn_index: d, ...H }) => {
			C.update({ ...H, fn_index: d }),
				H.status === "error" &&
					l.forEach((k, L) => {
						k.trigger_after === d && !k.trigger_only_on_success && xe(L, null);
					});
		});
	function x(d, H, k) {
		d?.props || (d.props = {}), (d.props[H] = k), n(11, E);
	}
	let $ = [];
	const xe = (d, H) => {
		let k = l[d];
		const L = C.get_status_for_fn(d);
		if (L === "pending" || L === "generating") return;
		k.cancels &&
			k.cancels.forEach((ie) => {
				T.cancel("/predict", ie);
			});
		let K = {
			fn_index: d,
			data: k.inputs.map((ie) => Y[ie].props.value),
			event_data: k.collects_event_data ? H : null
		};
		k.frontend_fn
			? k
					.frontend_fn(K.data.concat(k.outputs.map((ie) => Y[ie].props.value)))
					.then((ie) => {
						k.backend_fn ? ((K.data = ie), _e()) : ye(ie, d);
					})
			: k.backend_fn && _e();
		function _e() {
			T.predict("/predict", K);
		}
	};
	async function uo() {
		await Ho();
		for (var d = u.getElementsByTagName("a"), H = 0; H < d.length; H++)
			d[H].getAttribute("target") !== "_blank" &&
				d[H].setAttribute("target", "_blank");
		l.forEach((k, L) => {
			let { targets: K, trigger: _e, inputs: ie, outputs: mo } = k;
			const go = K.map((oe) => [oe, Y[oe]]);
			K.length === 0 &&
				!$[L]?.includes(-1) &&
				_e === "load" &&
				mo.every((oe) => Y?.[oe].instance) &&
				ie.every((oe) => Y?.[oe].instance) &&
				(xe(L, null), ($[L] = [-1])),
				go
					.filter((oe) => !!oe && !!oe[1])
					.forEach(([oe, { instance: ht }]) => {
						$[L]?.includes(oe) ||
							!ht ||
							(ht?.$on(_e, (bo) => {
								xe(L, bo.detail);
							}),
							$[L] || ($[L] = []),
							$[L].push(oe));
					});
		});
	}
	function _t(d) {
		$ = $.map((H) => H.filter((k) => k !== d));
	}
	l.forEach((d, H) => {
		C.register(H, d.inputs, d.outputs);
	});
	function co(d) {
		for (const k in d) {
			let L = d[k],
				K = l[L.fn_index];
			(L.scroll_to_output = K.scroll_to_output),
				(L.visible = K.show_progress),
				x(Y[k], "loading_status", L);
		}
		const H = C.get_inputs_to_update();
		for (const [k, L] of H) x(Y[k], "pending", L === "pending");
	}
	const fo = ({ detail: d }) => _t(d),
		_o = () => {
			W(!N);
		},
		ho = () => {
			W(!1);
		},
		po = () => {
			W(!1);
		};
	return (
		(e.$$set = (d) => {
			"root" in d && n(1, (i = d.root)),
				"components" in d && n(19, (o = d.components)),
				"layout" in d && n(20, (a = d.layout)),
				"dependencies" in d && n(2, (l = d.dependencies)),
				"title" in d && n(3, (c = d.title)),
				"analytics_enabled" in d && n(4, (s = d.analytics_enabled)),
				"target" in d && n(5, (u = d.target)),
				"autoscroll" in d && n(21, (f = d.autoscroll)),
				"show_api" in d && n(6, (_ = d.show_api)),
				"show_footer" in d && n(7, (m = d.show_footer)),
				"control_page_title" in d && n(8, (g = d.control_page_title)),
				"app_mode" in d && n(9, (p = d.app_mode)),
				"theme_mode" in d && n(10, (y = d.theme_mode)),
				"app" in d && n(22, (T = d.app)),
				"ready" in d && n(0, (J = d.ready));
		}),
		(e.$$.update = () => {
			e.$$.dirty[0] & 2097152 && Bo.update((d) => ({ ...d, autoscroll: f })),
				e.$$.dirty[0] & 8388608 && co(r);
		}),
		[
			J,
			i,
			l,
			c,
			s,
			u,
			_,
			m,
			g,
			p,
			y,
			E,
			N,
			Y,
			C,
			W,
			Q,
			uo,
			_t,
			o,
			a,
			f,
			T,
			r,
			fo,
			_o,
			ho,
			po
		]
	);
}
class Rs extends se {
	constructor(t) {
		super(),
			ue(
				this,
				t,
				Ns,
				ks,
				ce,
				{
					root: 1,
					components: 19,
					layout: 20,
					dependencies: 2,
					title: 3,
					analytics_enabled: 4,
					target: 5,
					autoscroll: 21,
					show_api: 6,
					show_footer: 7,
					control_page_title: 8,
					app_mode: 9,
					theme_mode: 10,
					app: 22,
					ready: 0
				},
				null,
				[-1, -1]
			);
	}
}
const Fs = Object.freeze(
	Object.defineProperty({ __proto__: null, default: Rs }, Symbol.toStringTag, {
		value: "Module"
	})
);
export { Fs as B, Ds as X };
//# sourceMappingURL=Blocks-b77f2878.js.map
