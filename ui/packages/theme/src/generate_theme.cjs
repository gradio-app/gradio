// @ts-nocheck
const tw_theme = require("tailwindcss/defaultTheme");

const colors = require("tailwindcss/colors");
const fs = require("fs");
const path = require("path");
const { borderRadius, borderWidth, spacing } = tw_theme;

const foundation_light = {};
const foundation_dark = {
	spacing: {
		1: spacing[0],
		2: spacing[2],
		3: spacing[3],
		4: spacing[4],
		5: spacing[5],
		6: spacing[6],
		7: spacing[7],
		8: spacing[8]
	},
	border: {
		radius: {
			sm: borderRadius.sm,
			md: borderRadius.md,
			lg: borderRadius.lg,
			full: borderRadius.full,
			none: borderRadius.none
		},
		width: {
			0: borderWidth[0],
			1: "1px",
			2: borderWidth[2]
		}
	},
	color: {
		background: {
			primary: colors.gray[900],
			secondary: colors.gray[800]
		},
		text: {
			body: colors.gray[300],
			label: colors.gray[300],
			blocklabel: colors.gray[500],
			placeholder: colors.gray[500], // don't know how this works
			subdued: colors.gray[400]
		},
		border: {
			primary: colors.gray[200],
			secondary: colors.gray[600],
			highlight: "color.accent.base"
		},
		accent: {
			base: colors.orange[500],
			light: colors.orange[200],
			dark: colors.orange[800]
		},
		button: {
			default: "",
			cta: "color.accent.base",
			warning: "color.functional.error"
		},
		functional: {
			error: "", //red
			info: "", //yellow
			success: "" //green
		},
		"focus-ring": {}
	},
	dimensions: {}
};

const theme = {
	block: {
		border: {
			radius: "border.radius.sm",
			style: "solid",
			color: "color.border.primary",
			width: "border.width.1"
		},
		background: {
			color: "color.background.secondary"
		}
	},
	uploadable: {
		border: {
			style: {
				default: "dashed",
				hover: "solid",
				loaded: "solid"
			},
			color: {
				hover: "color.border.primary",
				loaded: "color.functional.success"
			}
		},
		text: {
			family: "text.family.primary",
			size: "text.size.xl",
			style: "normal",
			color: "colors.text.subdued"
		}
	},
	block_label: {
		border: {
			radius: "border.radius.sm",
			style: "solid",
			color: "color.border.primary",
			width: "border.width.1"
		},
		background: {
			color: "color.background.primary"
		},
		text: {
			family: "text.family.primary",
			size: "text.size.xs",
			style: "normal",
			color: ""
		}
	},
	icon_button: {
		icon: {
			color: { base: "", hover: "" }
		},
		bacground: {
			color: { base: "", hover: "" }
		},
		border: {
			radius: "",
			style: { base: "", hover: "" },
			color: { base: "", hover: "" },
			width: ""
		}
	},
	input: {
		text: {
			family: "",
			size: "",
			style: "",
			color: ""
		},
		label: {
			text: {
				family: "",
				size: "",
				style: "",
				color: ""
			}
		},
		border: {
			radius: "",
			style: { base: "", hover: "", focus: "" },
			color: { base: "", hover: "", focus: "" },
			width: ""
		},
		background: { color: { base: "", hover: "", focus: "" } }
	},
	checkbox: {
		"focus-ring": {
			width: { focus: "", active: "" },
			color: { focus: "", active: "" }
		},
		border: {
			radius: "",
			style: { base: "", hover: "", focus: "" },
			color: { base: "", hover: "", focus: "" },
			width: ""
		},
		background: { color: { base: "", hover: "", focus: "" } },
		label: {
			border: {
				radius: "",
				style: { base: "", hover: "", focus: "" },
				color: { base: "", hover: "", focus: "" },
				width: ""
			},
			background: { color: { base: "", hover: "", focus: "" } }
		}
	},
	tab: {
		// needs tokens
	},
	form: {
		seperator: {
			border: {
				style: "",
				width: "",
				color: ""
			}
		}
	},
	accordion: {
		text: {
			family: "",
			size: "",
			style: "",
			color: "",
			weight: ""
		}
	},
	button: {
		primary: {
			border: {
				radius: "",
				width: "",
				style: { base: "", hover: "", focus: "" },
				color: { base: "", hover: "", focus: "" }
			},
			text: {
				family: "",
				size: "",
				style: { base: "", hover: "", focus: "" },
				color: { base: "", hover: "", focus: "" },
				weight: { base: "", hover: "", focus: "" }
			},
			background: {
				color: { base: "", hover: "", focus: "" }
			},
			"focus-ring": {
				width: { hover: "", focus: "" },
				color: { hover: "", focus: "" }
			}
		},
		secondary: {
			border: {
				radius: "",
				width: "",
				style: { base: "", hover: "", focus: "" },
				color: { base: "", hover: "", focus: "" }
			},
			text: {
				family: "",
				size: "",
				style: { base: "", hover: "", focus: "" },
				color: { base: "", hover: "", focus: "" },
				weight: { base: "", hover: "", focus: "" }
			},
			background: {
				color: { base: "", hover: "", focus: "" }
			},
			"focus-ring": {
				width: { hover: "", focus: "" },
				color: { hover: "", focus: "" }
			}
		},
		cta: {},
		warning: {}
	},
	highlighted_text: {
		outer: {
			border: {
				radius: ""
			}
		},
		inner: {
			border: {
				radius: ""
			}
		}
	},
	json: {
		// colours?
	},
	gallery: {
		thumb: {
			width: "",
			border: {
				radius: "",
				width: "",
				style: { base: "", hover: "", focus: "", selected: "" },
				color: { base: "", hover: "", focus: "", selected: "" }
			},
			scale: { base: "", hover: "", focus: "", selected: "" }
		}
	},
	chatbot: {
		border: {
			border: {
				radius: "",
				width: "",
				style: { base: "", latest: "" },
				color: { base: "", latest: "" }
			}
		},
		user: {
			background: { color: { base: "", latest: "" } },
			text: { color: { base: "", latest: "" } }
		},
		bot: {
			background: { color: { base: "", latest: "" } },
			text: { color: { base: "", latest: "" } }
		}
	}
};

// console.log(theme);

const RE_PATH = /^(([a-z]+|[0-9])+\.)+([a-z]+|[0-9]+)$/;

function get_path(object, paths = [], current_node = object) {
	let _paths = {};

	for (const key in object) {
		if (typeof object[key] === "object") {
			_paths = { ..._paths, ...get_path(object[key], [...paths, key]) };
		} else {
			const is_var = RE_PATH.test(object[key]);

			_paths[`--${[...paths, key].join("-")}`] = is_var
				? `var(--${object[key].replace(/\./g, "-")})`
				: object[key];
		}
	}
	// }

	return _paths;
}

console.log(get_path({ ...foundation_dark, ...theme }));

function generate_theme() {
	const props = get_path({ ...foundation_dark, ...theme });
	let css = "";
	for (const key in props) {
		css += `\t${key}: ${props[key]};\n`;
	}

	css = `:root {
${css}
}`;

	fs.writeFileSync(path.join(__dirname, "theme.css"), css);
}

exports.get_path = get_path;
generate_theme();
