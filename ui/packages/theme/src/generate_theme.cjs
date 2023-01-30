// @ts-nocheck
const fs = require("fs");
const path = require("path");

const foundation_light = {
	color: {
		focus: {
			primary: "var(--color-blue-300)",
			secondary: "var(--color-blue-500)",
			ring: "rgb(191 219 254 / 0.5)"
		},
		background: {
			primary: "white",
			secondary: "var(--color-grey-50)",
			tertiary: "white"
		},
		text: {
			body: "var(--color-grey-800)",
			label: "var(--color-grey)",
			placeholder: "var(--color-grey-400)",
			subdued: "var(--color-grey-400)",
			link: {
				base: "var(--color-blue-600)",
				hover: "var(--color-blue-700)",
				visited: "var(--color-blue-500)",
				active: "var(--color-blue-600)"
			},
			code: {
				background: "var(--color-grey-200)",
				border: "color.border-primary"
			}
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
			error: {
				base: "var(--color-red)",
				subdued: "var(--color-red-300)",
				background:
					"linear-gradient(to right,var(--color-red-100),var(--color-background-secondary))"
			}, //red
			info: { base: "var(--color-yellow)", subdued: "var(--color-yellow-300)" }, //yellow
			success: {
				base: "var(--color-green)",
				subdued: "var(--color-green-300)"
			}
		}
	},
	shadow: {
		drop: "rgba(0,0,0,0.05) 0px 1px 2px 0px",
		"drop-lg": "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
		inset: "rgba(0,0,0,0.05) 0px 2px 4px 0px inset",
		spread: "3px"
	}
};

const foundation_dark = {
	color: {
		focus: {
			primary: "var(--color-grey-700)",
			secondary: "var(--color-grey-600)",
			ring: "rgb(55 65 81)"
		},
		background: {
			primary: "var(--color-grey-950)",
			secondary: "var(--color-grey-900)",
			tertiary: "var(--color-grey-800)"
		},
		text: {
			body: "var(--color-grey-100)",
			label: "var(--color-grey-200)",
			placeholder: "var(--color-grey)",
			subdued: "var(--color-grey-400)", // i dont know what this is for? upload text?
			link: {
				base: "var(--color-blue-500)",
				hover: "var(--color-blue-400)",
				visited: "var(--color-blue-600)",
				active: "var(--color-blue-500)"
			},
			code: {
				background: "var(--color-grey-800)",
				border: "color.border-primary"
			}
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
			error: {
				base: "var(--color-red-400)",
				subdued: "var(--color-red-300)",
				background: "var(--color-background-primary)"
			}, //red
			info: { base: "var(--color-yellow)", subdued: "var(--color-yellow-300)" }, //yellow
			success: {
				base: "var(--color-green)",
				subdued: "var(--color-green-300)"
			}
		}
	},
	shadow: {
		spread: "2px"
	}
};

const theme_light = {
	api: {
		background:
			"linear-gradient(to bottom, rgba(255, 216, 180, 0.2), transparent)",
		pill: {
			background: "var(--color-orange-100)",
			border: "var(--color-orange-200)",
			text: "var(--color-orange-600)"
		}
	},
	block_label: {
		border: {
			color: "color.border.primary"
		},
		icon: {
			color: "color.text.label"
		},
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
			color: { base: "color.background.primary", hover: "color.border.primary" }
		}
	},
	input: {
		border: {
			color: {
				base: "color.border.primary",
				hover: "color.border.primary",
				focus: "color.focus.primary"
			}
		},
		background: {
			base: "color.background.tertiary",
			hover: "color.background.tertiary",
			focus: "color.focus.tertiary"
		}
	},
	checkbox: {
		border: {
			radius: "var(--radius-sm)",
			color: {
				base: "var(--color-grey-300)",
				hover: "var(--color-grey-300)",
				focus: "var(--color-blue-500)",
				selected: "var(--color-blue-600)"
			}
		},
		background: {
			base: "color.background.primary",
			hover: "color.background.primary",
			focus: "color.background.primary",
			selected: "var(--color-blue-600)"
		},
		label: {
			border: {
				color: {
					base: "color.border.primary",
					hover: "color.border.primary",
					focus: "color.focus.secondary"
				}
			},
			background: {
				hover: "linear-gradient(to top, var(--color-grey-100), white)",
				base: "linear-gradient(to top, var(--color-grey-50), white)",
				focus: "linear-gradient(to top, var(--color-grey-100), white)"
			}
		}
	},
	button: {
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
		},
		plain: {
			border: {
				color: {
					base: "var(--color-border-primary)",
					hover: "var(--color-border-primary)",
					focus: "var(--color-border-primary)"
				}
			},
			text: {
				color: {
					base: "var(--color-text-body)",
					hover: "var(--color-text-body)",
					focus: "var(--color-text-body)"
				}
			},
			background: {
				base: "white",
				hover: "white",
				focus: "white"
			}
		}
	},
	gallery: {
		label: {
			background: {
				base: "var(--color-grey-50)",
				hover: "var(--color-grey-50)"
			},
			border: {
				color: {
					base: "color.border.primary",
					hover: "color.border.primary"
				}
			}
		},
		thumb: {
			background: {
				base: "var(--color-grey-100)",
				hover: "white"
			},
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
	},
	label: {
		gradient: {
			from: "var(--color-orange-400)",
			to: "var(--color-orange-200)"
		}
	},
	table: {
		even: {
			background: "white"
		},

		odd: {
			background: "var(--color-grey-50)"
		},
		background: {
			edit: "var(--color-orange-50)"
		}
	},
	dataset: {
		gallery: {
			background: {
				base: "white",
				hover: "var(--color-grey-50)"
			}
		},
		dataframe: {
			border: {
				base: "var(--color-grey-300)",
				hover: "var(--color-grey-300)"
			}
		},
		table: {
			background: {
				base: "transparent",
				hover: "var(--color-orange-50)"
			},
			border: {
				base: "var(--color-border-primary)",
				hover: "var(--color-orange-100)"
			}
		}
	}
};

const theme_dark = {
	api: {
		background:
			"linear-gradient(to bottom, rgba(255, 216, 180, 0.05), transparent)",
		pill: {
			background: "var(--color-orange-400)",
			border: "var(--color-orange-600)",
			text: "var(--color-orange-900)"
		}
	},
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
				focus: "color.border.primary"
			}
		},
		background: {
			base: "color.background.tertiary",
			hover: "color.background.tertiary",
			focus: "color.background.tertiary"
		},
		shadow: "shadow.inset"
	},
	checkbox: {
		border: {
			color: {
				base: "color.border.primary",
				hover: "color.focus.primary",
				focus: "var(--color-blue-500)"
			}
		},
		background: {
			base: "color.background.primary",
			hover: "color.background.primary",
			focus: "color.background.primary",
			selected: "var(--color-blue-600)"
		},
		label: {
			border: {
				color: {
					base: "color.border.primary",
					hover: "color.border.primary",
					focus: "color.border.secondary"
				}
			},
			background: {
				base: "linear-gradient(to top, var(--color-grey-900), var(--color-grey-800))", //gradient
				hover:
					"linear-gradient(to top, var(--color-grey-900), var(--color-grey-800))", //gradient
				focus:
					"linear-gradient(to top, var(--color-grey-900), var(--color-grey-800))"
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
		},
		plain: {
			border: {
				color: {
					base: "var(--color-grey-600)",
					hover: "var(--color-grey-500)",
					focus: "var(--color-grey-500)"
				}
			},
			text: {
				color: {
					base: "var(--color-text-body)",
					hover: "var(--color-text-body)",
					focus: "var(--color-text-body)"
				}
			},
			background: {
				base: "var(--color-grey-700)",
				hover: "var(--color-grey-700)",
				focus: "var(--color-grey-700)"
			}
		}
	},
	gallery: {
		label: {
			background: {
				base: "var(--color-grey-50)",
				hover: "var(--color-grey-50)"
			},
			border: {
				color: {
					base: "color.border.primary",
					hover: "color.border.primary"
				}
			}
		},
		thumb: {
			background: {
				base: "var(--color-grey-900)",
				hover: "var(--color-grey-900)"
			},
			border: {
				color: {
					base: "color.border.primary",
					hover: "color.accent.base",
					focus: "var(--color-blue-500)",
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
	},
	label: {
		gradient: {
			from: "var(--color-orange-400)",
			to: "var(--color-orange-600)"
		}
	},
	table: {
		odd: {
			background: "var(--color-grey-900)"
		},
		even: {
			background: "var(--color-grey-950)"
		},
		background: {
			edit: "transparent"
		}
	},
	dataset: {
		gallery: {
			background: {
				base: "var(--color-background-primary)",

				hover: "var(--color-grey-800)"
			}
		},
		dataframe: {
			border: {
				base: "var(--color-border-primary)",
				hover: "var(--color-border-secondary)"
			}
		},
		table: {
			background: {
				base: "transparent",
				hover: "var(--color-grey-700)"
			},
			border: {
				base: "var(--color-grey-800)",
				hover: "var(--color-grey-800)"
			}
		}
	}
};

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

	return _paths;
}

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

	const css = `:root, :host {
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
