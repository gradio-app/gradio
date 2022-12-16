// @ts-nocheck
const tw_theme = require("tailwindcss/defaultTheme");

const colors = require("tailwindcss/colors");
const fs = require("fs");
const path = require("path");
const { borderRadius, borderWidth, spacing } = tw_theme;

const foundation_light = {
	color: {
		focus: {
			primary: "var(--color-blue-300)",
			secondary: "var(--color-blue-500)"
		},
		background: {
			primary: "white",
			secondary: "var(--color-grey-50)",
			tertiary: "white"
		},
		text: {
			body: "var(--color-grey-700)",
			label: "var(--color-grey)",
			placeholder: "var(--color-grey-400)",
			subdued: "var(--color-grey-400)"
		},
		border: {
			primary: "var(--color-grey-200)",
			secondary: "var(--color-grey-600)",
			highlight: "color.accent.base"
		},
		accent: {
			base: "var(--color-orange-500)",
			light: "var(--color-orange-300)",
			dark: "var(--color-orange-700)"
		},
		functional: {
			error: "var(--color-red)", //red
			info: "var(--color-yellow-300)", //yellow
			success: "var(--color-green)" //green
		}
	},
	shadow: {
		drop: "rgba(0,0,0,0.05) 0px 1px 2px 0px",
		"drop-lg": "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
		inset: "rgba(0,0,0,0.05) 0px 2px 4px 0px inset"
	}
};

const foundation_dark = {
	color: {
		focus: {
			primary: "var(--color-grey-700)",
			secondary: "var(--color-grey-600)"
		},
		background: {
			primary: "var(--color-grey-950)",
			secondary: "var(--color-grey-900)",
			tertiary: "var(--color-grey-800)"
		},
		text: {
			body: "var(--color-grey-300)",
			label: "var(--color-grey-200)",
			placeholder: "var(--color-grey)",
			subdued: "var(--color-grey-400)" // i dont know what this is for? upload text?
		},
		border: {
			primary: "var(--color-grey-700)",
			secondary: "var(--color-grey-600)",
			highlight: "color.accent.base"
		},
		accent: {
			base: "var(--color-orange-500)",
			light: "var(--color-orange-300)",
			dark: "var(--color-orange-700)"
		},

		functional: {
			error: "var(--color-red)", //red
			info: "var(--color-yellow-300)", //yellow
			success: "var(--color-green)" //green
		}
	}
};

const theme_light = {
	block: {
		border: {
			radius: "var(--radius-lg)",
			color: "color.border.primary",
			width: "1px"
		},
		background: "color.background.tertiary"
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
			color: "color.text.subdued"
		}
	},
	block_label: {
		border: {
			radius: "var(--radius-lg)",
			style: "solid",
			color: "color.border.primary",
			width: "1px"
		},
		icon: {
			color: "color.text.label"
		},
		shadow: "shadow.drop", // gradient
		background: "color.background.primary"
	},
	icon_button: {
		icon: {
			color: { base: "color.text.label", hover: "color.text.label" }
		},
		background: {
			base: "color.background.primary",
			hover: "color.background.primary"
		},
		border: {
			radius: "var(--radius-sm)",
			color: { base: "color.background.primary", hover: "color.border.primary" }
		},
		shadow: "shadow.drop"
	},
	input: {
		text: {
			style: "normal",
			color: "color.text.body"
		},
		border: {
			radius: "var(--radius-lg)",
			color: {
				base: "color.border.primary",
				hover: "color.border.primary",
				focus: "color.focus.primary"
			}
		},
		background: {
			base: "color.background.primary",
			hover: "color.background.primary",
			focus: "color.background.primary"
		},
		shadow: "shadow.inset"
	},
	checkbox: {
		shadow: "shadow.drop",
		border: {
			radius: "var(--radius-md)",
			color: {
				base: "color.border.primary",
				hover: "color.border.primary",
				focus: "color.focus.primary",
				selected: "color.focus.secondary"
			}
		},
		background: {
			base: "color.background.primary",
			hover: "color.background.primary",
			focus: "color.background.primary",
			selected: "color.focus.secondary"
		},
		label: {
			border: {
				radius: "var(--radius-lg)",
				color: {
					base: "color.border.primary",
					hover: "color.border.primary",
					focus: "color.border.primary"
				}
			},
			background: {
				base: "", //gradient
				hover: "", //gradient
				focus: "color.background.primary"
			},
			shadow: "shadow.drop"
		}
	},
	form: {
		seperator: {
			style: "solid",
			width: "border.width.default",
			color: "color.border.primary"
		}
	},
	button: {
		large: {
			radius: "var(--radius-lg)",
			text: {
				size: "var(--scale-0)",
				weight: "600"
			}
		},
		small: {
			radius: "var(--radius-md)",
			text: {
				size: "var(--scale-00)",
				weight: "400"
			}
		},
		primary: {
			border: {
				color: {
					base: "var(--color-orange-200)",
					hover: "var(--color-orange-200)",
					focus: "var(--color-orange-200)"
				}
			},
			text: {
				color: {
					base: "var(--color-orange-600)",
					hover: "var(--color-orange-600)",
					focus: "var(--color-orange-600)"
				}
			},
			background: {
				base: "linear-gradient(to bottom right, rgb(255 216 180 / 0.7), rgb(255 176 102 / 0.8))",
				hover:
					"linear-gradient(to bottom right, rgb(255 216 180 / 0.7), rgb(255 216 180 / 0.9))",
				focus:
					"linear-gradient(to bottom right, rgb(255 216 180 / 0.7), rgb(255 216 180 / 0.9))"
			}
		},
		secondary: {
			border: {
				color: {
					base: "var(--color-grey-200)",
					hover: "var(--color-grey-200)",
					focus: "var(--color-grey-200)"
				}
			},
			text: {
				color: {
					base: "var(--border-grey-700)",
					hover: "var(--border-grey-700)",
					focus: "var(--border-grey-700)"
				}
			},
			background: {
				base: "linear-gradient(to bottom right, rgb(243 244 246 / .7), rgb(229 231 235 / .8))",
				hover:
					"linear-gradient(to bottom right, rgb(243 244 246 / .7), rgb(243 244 246 / .9))",
				focus:
					"linear-gradient(to bottom right, rgb(243 244 246 / .7), rgb(243 244 246 / .9))"
			}
		},
		cancel: {
			border: {
				color: {
					base: "var(--color-red-200)",
					hover: "var(--color-red-200)",
					focus: "var(--color-red-200)"
				}
			},
			text: {
				color: {
					base: "var(--color-red-600)",
					hover: "var(--color-red-600)",
					focus: "var(--color-red-600)"
				}
			},
			background: {
				base: "linear-gradient(to bottom right, rgb(254 202 202 / 0.7), rgb(252 165 165 / 0.8))",
				hover:
					"linear-gradient(to bottom right, rgb(254 202 202 / 0.7), rgb(254 202 202 / 0.9))",
				focus:
					"linear-gradient(to bottom right, rgb(254 202 202 / 0.7), rgb(254 202 202 / 0.9))"
			}
		}
	},
	highlighted_text: {
		outer: {
			border: {
				radius: "var(--radius-xs)"
			}
		},
		inner: {
			border: {
				radius: "var(--radius-xs)"
			}
		}
	},
	gallery: {
		thumb: {
			border: {
				radius: "var(--radius-sm)",
				// width: "",
				style: {
					base: "solid",
					hover: "solid",
					focus: "solid",
					selected: "solid"
				},
				color: {
					base: "color.border.primary",
					hover: "color.accent.light",
					focus: "color.focus.secondary",
					selected: "color.accent.base"
				}
			},
			scale: { base: 0.9, hover: 0.9, focus: 0.9, selected: 1 }
		}
	},
	chatbot: {
		border: {
			radius: "var(--radius-3xl)",
			width: "0"
		},
		// do we do this via theme or constructor?
		user: {
			background: {
				base: "var(--color-orange-400)",
				latest: "var(--color-orange-400)"
			},
			text: { color: { base: "white", latest: "white" } },
			border: { color: { base: "transparent", latest: "transparent" } }
		},
		bot: {
			background: {
				base: "var(--color-grey-400)",
				latest: "var(--color-grey-400)"
			},
			text: { color: { base: "white", latest: "white" } },
			border: { color: { base: "transparent", latest: "transparent" } }
		}
	}
};

const theme_dark = {
	block: {
		border: {
			color: "color.border.primary"
		},
		background: "color.background.tertiary"
	},
	uploadable: {
		border: {
			color: {
				hover: "color.border.primary",
				loaded: "color.functional.success"
			}
		},
		text: {
			color: "color.text.subdued"
		}
	},
	block_label: {
		border: {
			color: "color.border.primary"
		},
		icon: {
			color: "color.text.label"
		},
		shadow: "shadow.drop",
		background: "color.background.secondary"
	},
	icon_button: {
		icon: {
			color: { base: "color.text.label", hover: "color.text.label" }
		},
		background: {
			base: "color.background.primary",
			hover: "color.background.primary"
		},
		border: {
			color: {
				base: "color.background.primary",
				hover: "color.border.secondary"
			}
		}
	},
	input: {
		text: {
			color: "color.text.body"
		},
		border: {
			color: {
				base: "color.border.primary",
				hover: "color.border.primary",
				focus: "color.focus.primary"
			}
		},
		background: {
			base: "color.background.primary",
			hover: "color.background.primary",
			focus: "color.background.primary"
		},
		shadow: "shadow.inset"
	},
	checkbox: {
		border: {
			color: {
				base: "color.border.primary",
				hover: "color.border.primary",
				focus: "color.focus.primary",
				selected: "color.focus.secondary"
			}
		},
		background: {
			base: "color.background.primary",
			hover: "color.background.primary",
			focus: "color.background.primary",
			selected: "color.focus.secondary"
		},
		label: {
			border: {
				color: {
					base: "color.border.primary",
					hover: "color.border.primary",
					focus: "color.border.primary"
				}
			},
			background: {
				base: "", //gradient
				hover: "", //gradient
				focus: "color.background.primary"
			}
		}
	},
	form: {
		seperator: {
			color: "color.border.primary"
		}
	},
	button: {
		primary: {
			border: {
				color: {
					base: "var(--color-orange-600)",
					hover: "var(--color-orange-600)",
					focus: "var(--color-orange-600)"
				}
			},
			text: {
				color: { base: "white", hover: "white", focus: "white" }
			},
			background: {
				base: "linear-gradient(to bottom right, var(--color-orange-700), var(--color-orange-700))",
				hover:
					"linear-gradient(to bottom right, var(--color-orange-700), var(--color-orange-500))",
				focus:
					"linear-gradient(to bottom right, var(--color-orange-700), var(--color-orange-500))"
			}
		},
		secondary: {
			border: {
				color: {
					base: "var(--color-grey-600)",
					hover: "var(--color-grey-600)",
					focus: "var(--color-grey-600)"
				}
			},
			text: {
				color: { base: "white", hover: "white", focus: "white" }
			},
			background: {
				base: "linear-gradient(to bottom right, var(--color-grey-600), var(--color-grey-700))",
				hover:
					"linear-gradient(to bottom right, var(--color-grey-600), var(--color-grey-600))",
				focus:
					"linear-gradient(to bottom right, var(--color-grey-600), var(--color-grey-600))"
			}
		},
		cancel: {
			border: {
				color: {
					base: "var(--color-red-600)",
					// TODO: these should inherit from base
					hover: "var(--color-red-600)",
					focus: "var(--color-red-600)"
				}
			},
			text: {
				color: {
					base: "white",
					// TODO: these should inherit from base
					hover: "white",
					focus: "white"
				}
			},
			background: {
				// TODO: how can these inherit from each other?
				base: "linear-gradient(to bottom right, var(--color-red-700), var(--color-red-700))",
				focus:
					"linear-gradient(to bottom right, var(--color-red-700), var(--color-red-500))",
				hover:
					"linear-gradient(to bottom right, var(--color-red-700), var(--color-red-500))"
			}
		}
	},
	gallery: {
		thumb: {
			border: {
				color: {
					base: "color.border.primary",
					hover: "color.accent.light",
					focus: "color.focus.secondary",
					selected: "color.accent.base"
				}
			}
		}
	},
	chatbot: {
		border: {
			border: {
				color: { base: "transparent", latest: "transparent" }
			}
		},
		// do we do this via theme or constructor?
		user: {
			background: { base: "", latest: "" }, // orange-400
			text: { color: { base: "white", latest: "white" } }
		},
		bot: {
			background: { base: "", latest: "" }, // grey-400
			text: { color: { base: "white", latest: "white" } }
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
			const is_var =
				typeof object[key] === "string" && RE_PATH.test(object[key]);

			_paths[`--${[...paths, key].join("-")}`] = is_var
				? `var(--${object[key].replace(/\./g, "-")})`
				: object[key];
		}
	}
	// }

	return _paths;
}

// console.log(get_path({ ...foundation_dark, ...theme }));

function generate_theme() {
	const light_props = get_path({ ...foundation_light, ...theme_light });
	let light_css = "";
	for (const key in light_props) {
		light_css += `\t${key}: ${light_props[key]};\n`;
	}

	const dark_props = get_path({ ...foundation_dark, ...theme_dark });
	let dark_css = "";
	for (const key in dark_props) {
		dark_css += `\t${key}: ${dark_props[key]};\n`;
	}

	const css = `:root {
${light_css}
}

.dark {
${dark_css}	
}
`;

	fs.writeFileSync(path.join(__dirname, "theme.css"), css);
}

exports.get_path = get_path;
generate_theme();
