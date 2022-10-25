const tw_theme = require("tailwindcss/defaultTheme");
import colors from "tailwindcss/colors";

const { borderRadius, borderWidth, spacing } = tw_theme;
console.log(tw_theme);
// const foundation = {
// 	spacing: {
// 		sm: 0,
// 		md: 0,
// 		lg: 0,
// 		1: spacing[0],
// 		2: spacing[2],
// 		3: spacing[3],
// 		4: spacing[4],
// 		5: spacing[5],
// 		6: spacing[6],
// 		7: spacing[7],
// 		8: spacing[8]
// 	},
// 	dimensions: {},
// 	border: {
// 		radius: {
// 			sm: borderRadius.sm,
// 			md: borderRadius.md,
// 			lg: borderRadius.lg,
// 			full: borderRadius.full,
// 			none: borderRadius.none
// 		},
// 		width: {
// 			0: borderWidth[0],
// 			1: borderWidth[2]
// 		},
// 		style: {
// 			solid: "solid",
// 			dashed: "dashed",
// 			dotted: "dotted"
// 		}
// 	},
// 	colors
// };

const foundation_light = {};
const foundation_dark = {
	colors: {
		background: {
			primary: colors.gray[900],
			secondary: colors.gray[800]
		},
		accent: {
			base: "",
			light: "",
			dark: ""
		},
		button: {
			default: "",
			cta: "",
			warning: ""
		}
	}
};

const theme = {
	block: {
		border: {
			radius: "",
			style: "",
			color: "",
			width: ""
		},
		background: {
			color: ""
		}
	},
	uploadable: {
		border: {
			style: { hover: "", loaded: "" },
			color: { hover: "", loaded: "" }
		},
		font: {
			family: "",
			size: "",
			style: "",
			color: ""
		}
	},
	block_label: {
		border: {
			radius: "",
			style: "",
			color: "",
			width: ""
		},
		background: {
			color: ""
		},
		font: {
			family: "",
			size: "",
			style: "",
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
		font: {
			family: "",
			size: "",
			style: "",
			color: ""
		},
		label: {
			font: {
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
		font: {
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
			font: {
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
			font: {
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
			},
			user: {
				background: { color: { base: "", latest: "" } },
				font: { color: { base: "", latest: "" } }
			},
			bot: {
				background: { color: { base: "", latest: "" } },
				font: { color: { base: "", latest: "" } }
			}
		}
	}
};

console.log(foundation, theme);
