export default [
	{
		name: "annotatedimage",
		props: {
			format: "webp",
			show_legend: true,
			show_label: true,
			container: true,
			min_width: 160,
			visible: true,
			elem_classes: [],
			show_fullscreen_button: true,
			name: "annotatedimage",
			_selectable: false,
			interactive: true,
			server: {},
			value: null
		}
	},
	{
		name: "audio",
		props: {
			streamable: false,
			sources: ["upload", "microphone"],
			type: "numpy",
			show_label: true,
			container: true,
			min_width: 160,
			interactive: false,
			visible: true,
			streaming: false,
			elem_classes: [],
			format: "wav",
			autoplay: false,
			show_share_button: false,
			editable: true,
			waveform_options: {
				waveform_color: null,
				waveform_progress_color: null,
				trim_region_color: null,
				show_recording_waveform: true,
				show_controls: false,
				skip_length: 5,
				sample_rate: 44100
			},
			loop: false,
			name: "audio",
			_selectable: false,
			server: {},
			value: null
		}
	},
	{
		name: "audio",
		props: {
			streamable: false,
			sources: ["upload", "microphone"],
			type: "numpy",
			show_label: true,
			container: true,
			min_width: 160,
			interactive: true,
			visible: true,
			streaming: false,
			elem_classes: [],
			format: "wav",
			autoplay: false,
			show_share_button: false,
			editable: true,
			waveform_options: {
				waveform_color: null,
				waveform_progress_color: null,
				trim_region_color: null,
				show_recording_waveform: true,
				show_controls: false,
				skip_length: 5,
				sample_rate: 44100
			},
			loop: false,
			name: "audio",
			_selectable: false,
			server: {},
			value: null
		}
	},
	{
		name: "nativeplot",
		props: {
			x_label_angle: 0,
			y_label_angle: 0,
			show_label: false,
			container: true,
			min_width: 160,
			visible: true,
			elem_classes: [],
			name: "barplot",
			_selectable: false,
			interactive: true,
			server: {}
		}
	},
	{
		name: "nativeplot",
		props: {
			x_label_angle: 0,
			y_label_angle: 0,
			show_label: false,
			container: true,
			min_width: 160,
			visible: true,
			elem_classes: [],
			name: "barplot",
			_selectable: false,
			interactive: true,
			server: {}
		}
	},
	{
		name: "button",
		props: {
			value: "Run",
			variant: "secondary",
			visible: true,
			interactive: false,
			elem_classes: [],
			name: "button",
			_selectable: false,
			server: {}
		}
	},
	{
		name: "button",
		props: {
			value: "Run",
			variant: "secondary",
			visible: true,
			interactive: true,
			elem_classes: [],
			name: "button",
			_selectable: false,
			server: {}
		}
	},
	{
		name: "chatbot",
		props: {
			likeable: false,
			value: [],
			type: "tuples",
			show_label: true,
			container: true,
			min_width: 160,
			visible: true,
			elem_classes: [],
			latex_delimiters: [{ left: "$$", right: "$$", display: true }],
			rtl: false,
			show_share_button: false,
			show_copy_button: false,
			avatar_images: [null, null],
			sanitize_html: true,
			render_markdown: true,
			bubble_full_width: true,
			line_breaks: true,
			show_copy_all_button: false,
			name: "chatbot",
			_selectable: false,
			interactive: true,
			server: {}
		}
	},
	{
		name: "checkbox",
		props: {
			value: false,
			show_label: true,
			container: true,
			min_width: 160,
			interactive: false,
			visible: true,
			elem_classes: [],
			name: "checkbox",
			_selectable: false,
			server: {}
		}
	},
	{
		name: "checkbox",
		props: {
			value: false,
			show_label: true,
			container: true,
			min_width: 160,
			interactive: true,
			visible: true,
			elem_classes: [],
			name: "checkbox",
			_selectable: false,
			server: {}
		}
	},
	{
		name: "checkboxgroup",
		props: {
			choices: [],
			value: [],
			type: "value",
			show_label: true,
			container: true,
			min_width: 160,
			interactive: false,
			visible: true,
			elem_classes: [],
			name: "checkboxgroup",
			_selectable: false,
			server: {}
		}
	},
	{
		name: "checkboxgroup",
		props: {
			choices: [],
			value: [],
			type: "value",
			show_label: true,
			container: true,
			min_width: 160,
			interactive: true,
			visible: true,
			elem_classes: [],
			name: "checkboxgroup",
			_selectable: false,
			server: {}
		}
	},
	{
		name: "button",
		props: {
			value: "Clear",
			variant: "secondary",
			visible: true,
			interactive: false,
			elem_classes: [],
			show_api: false,
			name: "button",
			_selectable: false,
			server: {}
		}
	},
	{
		name: "button",
		props: {
			value: "Clear",
			variant: "secondary",
			visible: true,
			interactive: true,
			elem_classes: [],
			show_api: false,
			name: "button",
			_selectable: false,
			server: {}
		}
	},
	{
		name: "code",
		props: {
			lines: 5,
			interactive: false,
			show_label: true,
			container: true,
			min_width: 160,
			visible: true,
			elem_classes: [],
			name: "code",
			_selectable: false,
			server: {},
			value: ""
		}
	},
	{
		name: "code",
		props: {
			lines: 5,
			interactive: true,
			show_label: true,
			container: true,
			min_width: 160,
			visible: true,
			elem_classes: [],
			name: "code",
			_selectable: false,
			server: {},
			value: ""
		}
	},
	{
		name: "colorpicker",
		props: {
			show_label: true,
			container: true,
			min_width: 160,
			interactive: false,
			visible: true,
			elem_classes: [],
			name: "colorpicker",
			_selectable: false,
			server: {}
		}
	},
	{
		name: "colorpicker",
		props: {
			show_label: true,
			container: true,
			min_width: 160,
			interactive: true,
			visible: true,
			elem_classes: [],
			name: "colorpicker",
			_selectable: false,
			server: {}
		}
	},
	{
		name: "dataframe",
		props: {
			value: { headers: ["1", "2", "3"], data: [["", "", ""]], metadata: null },
			headers: ["1", "2", "3"],
			row_count: [1, "dynamic"],
			col_count: [3, "dynamic"],
			datatype: "str",
			type: "pandas",
			latex_delimiters: [{ left: "$$", right: "$$", display: true }],
			show_label: true,
			height: 500,
			min_width: 160,
			interactive: false,
			visible: true,
			elem_classes: [],
			wrap: false,
			line_breaks: true,
			column_widths: [],
			name: "dataframe",
			_selectable: false,
			server: {}
		}
	},
	{
		name: "dataframe",
		props: {
			value: { headers: ["1", "2", "3"], data: [["", "", ""]], metadata: null },
			headers: ["1", "2", "3"],
			row_count: [1, "dynamic"],
			col_count: [3, "dynamic"],
			datatype: "str",
			type: "pandas",
			latex_delimiters: [{ left: "$$", right: "$$", display: true }],
			show_label: true,
			height: 500,
			min_width: 160,
			interactive: true,
			visible: true,
			elem_classes: [],
			wrap: false,
			line_breaks: true,
			column_widths: [],
			name: "dataframe",
			_selectable: false,
			server: {}
		}
	},
	{
		name: "dataset",
		props: {
			component_props: [],
			samples: [[]],
			headers: [],
			type: "values",
			samples_per_page: 10,
			visible: true,
			elem_classes: [],
			container: true,
			min_width: 160,
			name: "dataset",
			_selectable: false,
			components: [],
			component_ids: [],
			interactive: true,
			server: {},
			value: null
		}
	},
	{
		name: "datetime",
		props: {
			include_time: true,
			type: "timestamp",
			show_label: true,
			min_width: 160,
			visible: true,
			elem_classes: [],
			name: "datetime",
			_selectable: false,
			interactive: true,
			server: {},
			value: ""
		}
	},
	{
		name: "downloadbutton",
		props: {
			label: "Download",
			variant: "secondary",
			visible: true,
			interactive: false,
			elem_classes: [],
			name: "downloadbutton",
			_selectable: false,
			server: {}
		}
	},
	{
		name: "downloadbutton",
		props: {
			label: "Download",
			variant: "secondary",
			visible: true,
			interactive: true,
			elem_classes: [],
			name: "downloadbutton",
			_selectable: false,
			server: {}
		}
	},
	{
		name: "dropdown",
		props: {
			choices: [],
			type: "value",
			allow_custom_value: false,
			filterable: true,
			show_label: true,
			container: true,
			min_width: 160,
			interactive: false,
			visible: true,
			elem_classes: [],
			name: "dropdown",
			_selectable: false,
			server: {}
		}
	},
	{
		name: "dropdown",
		props: {
			choices: [],
			type: "value",
			allow_custom_value: false,
			filterable: true,
			show_label: true,
			container: true,
			min_width: 160,
			interactive: true,
			visible: true,
			elem_classes: [],
			name: "dropdown",
			_selectable: false,
			server: {}
		}
	},
	{
		name: "button",
		props: {
			value: "Duplicate Space",
			variant: "secondary",
			size: "sm",
			visible: true,
			interactive: false,
			elem_classes: [],
			scale: 0,
			name: "button",
			_selectable: false,
			server: {}
		}
	},
	{
		name: "button",
		props: {
			value: "Duplicate Space",
			variant: "secondary",
			size: "sm",
			visible: true,
			interactive: true,
			elem_classes: [],
			scale: 0,
			name: "button",
			_selectable: false,
			server: {}
		}
	},
	{
		name: "file",
		props: {
			file_count: "single",
			type: "filepath",
			show_label: true,
			container: true,
			min_width: 160,
			visible: true,
			elem_classes: [],
			name: "file",
			_selectable: false,
			interactive: true,
			server: {}
		}
	},
	{
		name: "file",
		props: {
			file_count: "single",
			type: "filepath",
			show_label: true,
			container: true,
			min_width: 160,
			interactive: true,
			visible: true,
			elem_classes: [],
			name: "file",
			_selectable: false,
			server: {}
		}
	},
	{
		name: "fileexplorer",
		props: {
			glob: "**/*",
			file_count: "multiple",
			root_dir: "/Users/peterallen/Projects/gradio/demo/_all_components",
			show_label: true,
			container: true,
			min_width: 160,
			interactive: false,
			visible: true,
			elem_classes: [],
			name: "fileexplorer",
			_selectable: false,
			server_fns: ["ls"],
			server: {}
		}
	},
	{
		name: "fileexplorer",
		props: {
			glob: "**/*",
			file_count: "multiple",
			root_dir: "/Users/peterallen/Projects/gradio/demo/_all_components",
			show_label: true,
			container: true,
			min_width: 160,
			interactive: true,
			visible: true,
			elem_classes: [],
			name: "fileexplorer",
			_selectable: false,
			server_fns: ["ls"],
			server: {}
		}
	},
	{
		name: "gallery",
		props: {
			value: [],
			format: "webp",
			show_label: true,
			container: true,
			min_width: 160,
			visible: true,
			elem_classes: [],
			columns: 2,
			allow_preview: true,
			show_share_button: false,
			show_download_button: true,
			interactive: false,
			type: "filepath",
			show_fullscreen_button: true,
			name: "gallery",
			_selectable: false,
			server: {}
		}
	},
	{
		name: "gallery",
		props: {
			value: [],
			format: "webp",
			show_label: true,
			container: true,
			min_width: 160,
			visible: true,
			elem_classes: [],
			columns: 2,
			allow_preview: true,
			show_share_button: false,
			show_download_button: true,
			interactive: true,
			type: "filepath",
			show_fullscreen_button: true,
			name: "gallery",
			_selectable: false,
			server: {}
		}
	},
	{
		name: "highlightedtext",
		props: {
			show_legend: false,
			show_inline_category: true,
			combine_adjacent: false,
			adjacent_separator: "",
			show_label: true,
			container: true,
			min_width: 160,
			visible: true,
			elem_classes: [],
			interactive: false,
			name: "highlightedtext",
			_selectable: false,
			server: {}
		}
	},
	{
		name: "highlightedtext",
		props: {
			show_legend: false,
			show_inline_category: true,
			combine_adjacent: false,
			adjacent_separator: "",
			show_label: true,
			container: true,
			min_width: 160,
			visible: true,
			elem_classes: [],
			interactive: true,
			name: "highlightedtext",
			_selectable: false,
			server: {}
		}
	},
	{
		name: "html",
		props: {
			show_label: false,
			visible: true,
			elem_classes: [],
			name: "html",
			_selectable: false,
			interactive: true,
			server: {},
			value: ""
		}
	},
	{
		name: "image",
		props: {
			streamable: false,
			format: "webp",
			image_mode: "RGB",
			sources: ["upload", "webcam", "clipboard"],
			type: "numpy",
			show_label: true,
			show_download_button: true,
			container: true,
			min_width: 160,
			interactive: false,
			visible: true,
			streaming: false,
			elem_classes: [],
			mirror_webcam: true,
			show_share_button: false,
			show_fullscreen_button: true,
			name: "image",
			_selectable: false,
			server: {},
			value: null
		}
	},
	{
		name: "image",
		props: {
			streamable: false,
			format: "webp",
			image_mode: "RGB",
			sources: ["upload", "webcam", "clipboard"],
			type: "numpy",
			show_label: true,
			show_download_button: true,
			container: true,
			min_width: 160,
			interactive: true,
			visible: true,
			streaming: false,
			elem_classes: [],
			mirror_webcam: true,
			show_share_button: false,
			show_fullscreen_button: true,
			name: "image",
			_selectable: false,
			server: {},
			value: null
		}
	},
	{
		name: "imageeditor",
		props: {
			image_mode: "RGBA",
			sources: ["upload", "webcam", "clipboard"],
			type: "numpy",
			show_label: true,
			show_download_button: true,
			container: true,
			min_width: 160,
			interactive: false,
			visible: true,
			elem_classes: [],
			mirror_webcam: true,
			show_share_button: false,
			_selectable: false,
			transforms: ["crop"],
			eraser: { default_size: "auto" },
			brush: {
				default_size: "auto",
				colors: [
					"rgb(204, 50, 50)",
					"rgb(173, 204, 50)",
					"rgb(50, 204, 112)",
					"rgb(50, 112, 204)",
					"rgb(173, 50, 204)"
				],
				default_color: "auto",
				color_mode: "defaults"
			},
			format: "webp",
			layers: true,
			show_fullscreen_button: true,
			name: "imageeditor",
			server_fns: ["accept_blobs"],
			server: {},
			value: { background: null, layers: [], composite: null }
		}
	},
	{
		name: "imageeditor",
		props: {
			image_mode: "RGBA",
			sources: ["upload", "webcam", "clipboard"],
			type: "numpy",
			show_label: true,
			show_download_button: true,
			container: true,
			min_width: 160,
			interactive: true,
			visible: true,
			elem_classes: [],
			mirror_webcam: true,
			show_share_button: false,
			_selectable: false,
			transforms: ["crop"],
			eraser: { default_size: "auto" },
			brush: {
				default_size: "auto",
				colors: [
					"rgb(204, 50, 50)",
					"rgb(173, 204, 50)",
					"rgb(50, 204, 112)",
					"rgb(50, 112, 204)",
					"rgb(173, 50, 204)"
				],
				default_color: "auto",
				color_mode: "defaults"
			},
			format: "webp",
			layers: true,
			show_fullscreen_button: true,
			name: "imageeditor",
			server_fns: ["accept_blobs"],
			server: {},
			value: { background: null, layers: [], composite: null }
		}
	},
	{
		name: "json",
		props: {
			show_label: true,
			container: true,
			min_width: 160,
			visible: true,
			elem_classes: [],
			open: false,
			show_indices: false,
			name: "json",
			_selectable: false,
			interactive: true,
			server: {}
		}
	},
	{
		name: "label",
		props: {
			value: {},
			show_label: true,
			container: true,
			min_width: 160,
			visible: true,
			elem_classes: [],
			name: "label",
			_selectable: false,
			interactive: false,
			server: {}
		}
	},
	{
		name: "nativeplot",
		props: {
			x_label_angle: 0,
			y_label_angle: 0,
			show_label: false,
			container: true,
			min_width: 160,
			visible: true,
			elem_classes: [],
			name: "lineplot",
			_selectable: false,
			interactive: true,
			server: {}
		}
	},
	{
		name: "nativeplot",
		props: {
			x_label_angle: 0,
			y_label_angle: 0,
			show_label: false,
			container: true,
			min_width: 160,
			visible: true,
			elem_classes: [],
			name: "lineplot",
			_selectable: false,
			interactive: true,
			server: {}
		}
	},
	{
		name: "markdown",
		props: {
			show_label: true,
			rtl: false,
			latex_delimiters: [{ left: "$$", right: "$$", display: true }],
			visible: true,
			elem_classes: [],
			sanitize_html: true,
			line_breaks: false,
			header_links: false,
			show_copy_button: false,
			name: "markdown",
			_selectable: false,
			interactive: true,
			server: {},
			value: ""
		}
	},
	{
		name: "model3d",
		props: {
			clear_color: [0, 0, 0, 0],
			camera_position: [null, null, null],
			zoom_speed: 1,
			pan_speed: 1,
			show_label: true,
			container: true,
			min_width: 160,
			interactive: false,
			visible: true,
			elem_classes: [],
			name: "model3d",
			_selectable: false,
			server: {},
			value: null
		}
	},
	{
		name: "model3d",
		props: {
			clear_color: [0, 0, 0, 0],
			camera_position: [null, null, null],
			zoom_speed: 1,
			pan_speed: 1,
			show_label: true,
			container: true,
			min_width: 160,
			interactive: true,
			visible: true,
			elem_classes: [],
			name: "model3d",
			_selectable: false,
			server: {},
			value: null
		}
	},
	{
		name: "multimodaltextbox",
		props: {
			value: { text: "", files: [] },
			file_count: "single",
			lines: 1,
			max_lines: 20,
			show_label: true,
			container: true,
			min_width: 160,
			interactive: false,
			visible: true,
			autofocus: false,
			autoscroll: true,
			elem_classes: [],
			rtl: false,
			submit_btn: true,
			name: "multimodaltextbox",
			_selectable: false,
			server: {}
		}
	},
	{
		name: "multimodaltextbox",
		props: {
			value: { text: "", files: [] },
			file_count: "single",
			lines: 1,
			max_lines: 20,
			show_label: true,
			container: true,
			min_width: 160,
			interactive: true,
			visible: true,
			autofocus: false,
			autoscroll: true,
			elem_classes: [],
			rtl: false,
			submit_btn: true,
			name: "multimodaltextbox",
			_selectable: false,
			server: {}
		}
	},
	{
		name: "number",
		props: {
			show_label: true,
			container: true,
			min_width: 160,
			visible: true,
			elem_classes: [],
			step: 1,
			name: "number",
			_selectable: false,
			interactive: true,
			server: {},
			value: 0
		}
	},
	{
		name: "number",
		props: {
			show_label: true,
			container: true,
			min_width: 160,
			interactive: true,
			visible: true,
			elem_classes: [],
			step: 1,
			name: "number",
			_selectable: false,
			server: {},
			value: 0
		}
	},
	{
		name: "paramviewer",
		props: {
			language: "python",
			header: "Parameters",
			name: "paramviewer",
			_selectable: false,
			interactive: true,
			server: {}
		}
	},
	{
		name: "plot",
		props: {
			format: "webp",
			show_label: true,
			container: true,
			min_width: 160,
			visible: true,
			elem_classes: [],
			name: "plot",
			_selectable: false,
			bokeh_version: "3.4.1",
			interactive: true,
			server: {},
			value: null
		}
	},
	{
		name: "radio",
		props: {
			choices: [],
			type: "value",
			show_label: true,
			container: true,
			min_width: 160,
			interactive: false,
			visible: true,
			elem_classes: [],
			name: "radio",
			_selectable: false,
			server: {},
			value: null
		}
	},
	{
		name: "radio",
		props: {
			choices: [],
			type: "value",
			show_label: true,
			container: true,
			min_width: 160,
			interactive: true,
			visible: true,
			elem_classes: [],
			name: "radio",
			_selectable: false,
			server: {},
			value: null
		}
	},
	{
		name: "nativeplot",
		props: {
			x_label_angle: 0,
			y_label_angle: 0,
			show_label: false,
			container: true,
			min_width: 160,
			visible: true,
			elem_classes: [],
			name: "scatterplot",
			_selectable: false,
			interactive: true,
			server: {}
		}
	},
	{
		name: "nativeplot",
		props: {
			x_label_angle: 0,
			y_label_angle: 0,
			show_label: false,
			container: true,
			min_width: 160,
			visible: true,
			elem_classes: [],
			name: "scatterplot",
			_selectable: false,
			interactive: true,
			server: {}
		}
	},
	{
		name: "slider",
		props: {
			minimum: 0,
			maximum: 100,
			value: 0,
			step: 1,
			show_label: true,
			container: true,
			min_width: 160,
			interactive: false,
			visible: true,
			elem_classes: [],
			name: "slider",
			_selectable: false,
			server: {}
		}
	},
	{
		name: "slider",
		props: {
			minimum: 0,
			maximum: 100,
			value: 0,
			step: 1,
			show_label: true,
			container: true,
			min_width: 160,
			interactive: true,
			visible: true,
			elem_classes: [],
			name: "slider",
			_selectable: false,
			server: {}
		}
	},
	{
		name: "state",
		props: {
			time_to_live: null,
			delete_callback:
				"<function State.__init__.<locals>.<lambda> at 0x12ec05800>",
			name: "state",
			_selectable: false,
			interactive: true,
			server: {}
		}
	},
	{
		name: "textbox",
		props: {
			lines: 1,
			max_lines: 20,
			show_label: true,
			container: true,
			min_width: 160,
			interactive: false,
			visible: true,
			autofocus: false,
			autoscroll: true,
			elem_classes: [],
			type: "text",
			rtl: false,
			show_copy_button: false,
			name: "textbox",
			_selectable: false,
			server: {},
			value: ""
		}
	},
	{
		name: "textbox",
		props: {
			lines: 1,
			max_lines: 20,
			show_label: true,
			container: true,
			min_width: 160,
			interactive: true,
			visible: true,
			autofocus: false,
			autoscroll: true,
			elem_classes: [],
			type: "text",
			rtl: false,
			show_copy_button: false,
			name: "textbox",
			_selectable: false,
			server: {},
			value: ""
		}
	},
	{
		name: "timer",
		props: {
			value: 1,
			active: true,
			name: "timer",
			_selectable: false,
			interactive: false,
			server: {}
		}
	},
	{
		name: "uploadbutton",
		props: {
			label: "Upload a File",
			variant: "secondary",
			visible: true,
			interactive: true,
			elem_classes: [],
			type: "filepath",
			file_count: "single",
			name: "uploadbutton",
			_selectable: false,
			server: {}
		}
	},
	{
		name: "uploadbutton",
		props: {
			label: "Upload a File",
			variant: "secondary",
			visible: true,
			interactive: true,
			elem_classes: [],
			type: "filepath",
			file_count: "single",
			name: "uploadbutton",
			_selectable: false,
			server: {}
		}
	},
	{
		name: "video",
		props: {
			sources: ["upload", "webcam"],
			show_label: true,
			container: true,
			min_width: 160,
			interactive: false,
			visible: true,
			elem_classes: [],
			mirror_webcam: true,
			include_audio: true,
			autoplay: false,
			show_share_button: false,
			loop: false,
			name: "video",
			_selectable: false,
			server: {},
			value: null
		}
	},
	{
		name: "video",
		props: {
			sources: ["upload", "webcam"],
			show_label: true,
			container: true,
			min_width: 160,
			interactive: true,
			visible: true,
			elem_classes: [],
			mirror_webcam: true,
			include_audio: true,
			autoplay: false,
			show_share_button: false,
			loop: false,
			name: "video",
			_selectable: false,
			server: {},
			value: null
		}
	},
	{
		name: "form",
		props: {
			scale: 0,
			min_width: 0,
			name: "form",
			interactive: true,
			server: {},
			visible: true
		}
	},
	{
		name: "form",
		props: {
			scale: 0,
			min_width: 0,
			name: "form",
			interactive: true,
			server: {},
			visible: true
		}
	},
	{
		name: "form",
		props: {
			scale: 0,
			min_width: 0,
			name: "form",
			interactive: true,
			server: {},
			visible: true
		}
	},
	{
		name: "form",
		props: {
			scale: 0,
			min_width: 0,
			name: "form",
			interactive: true,
			server: {},
			visible: true
		}
	},
	{
		name: "form",
		props: {
			scale: 0,
			min_width: 0,
			name: "form",
			interactive: true,
			server: {},
			visible: true
		}
	},
	{
		name: "form",
		props: {
			scale: 0,
			min_width: 0,
			name: "form",
			interactive: true,
			server: {},
			visible: true
		}
	},
	{
		name: "form",
		props: {
			scale: 0,
			min_width: 0,
			name: "form",
			interactive: true,
			server: {},
			visible: true
		}
	},
	{ name: "column", props: { interactive: false, scale: null, server: {} } }
];
