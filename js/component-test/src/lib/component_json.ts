import base_image from "./images/base.webp";
import mask_image from "./images/images_mask.png";
import audio from "./images/cantina.wav";
import video from "./images/world.mp4";
import duck from "./images/duck.glb";

const make_data = (url: string): Record<string, any> => {
	return {
		url: url,
		path: url,
		orig_name: url.split("/").pop(),
		size: Math.random() * 1000000
	};
};

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
			value: {
				image: make_data(base_image),
				annotations: [
					{
						label: "buildings",
						image: make_data(mask_image)
					}
				]
			},
			label: "Annotated Image"
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
			label: "Static Audio",
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
			value: make_data(audio)
		}
	},
	{
		name: "audio",
		props: {
			label: "Interactive Audio",
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
			value: {
				columns: ["time", "temperature", "humidity", "location"],
				data: [
					[1609459200000, 54, 61, "indoor"],
					[1609460936683, 65, 71, "outdoor"],
					[1609462673366, 54, 51, "indoor"],
					[1609464410050, 66, 61, "outdoor"],
					[1609466146733, 58, 63, "indoor"],
					[1609467883417, 60, 70, "outdoor"],
					[1609469620100, 51, 62, "indoor"],
					[1609471356783, 80, 64, "outdoor"],
					[1609473093467, 63, 65, "indoor"],
					[1609474830150, 63, 80, "outdoor"],
					[1609476566834, 55, 63, "indoor"],
					[1609478303517, 64, 72, "outdoor"],
					[1609480040201, 62, 61, "indoor"],
					[1609481776884, 70, 75, "outdoor"],
					[1609483513567, 65, 65, "indoor"],
					[1609485250251, 79, 70, "outdoor"],
					[1609486986934, 53, 64, "indoor"],
					[1609488723618, 76, 64, "outdoor"],
					[1609490460301, 57, 65, "indoor"],
					[1609492196984, 60, 63, "outdoor"],
					[1609493933668, 58, 64, "indoor"],
					[1609495670351, 73, 75, "outdoor"],
					[1609497407035, 60, 65, "indoor"],
					[1609499143718, 61, 65, "outdoor"],
					[1609500880402, 56, 59, "indoor"],
					[1609502617085, 77, 64, "outdoor"],
					[1609504353768, 61, 64, "indoor"],
					[1609506090452, 60, 65, "outdoor"],
					[1609507827135, 60, 62, "indoor"],
					[1609509563819, 80, 62, "outdoor"],
					[1609511300502, 61, 61, "indoor"],
					[1609513037185, 78, 63, "outdoor"],
					[1609514773869, 59, 55, "indoor"],
					[1609516510552, 77, 60, "outdoor"],
					[1609518247236, 56, 60, "indoor"],
					[1609519983919, 76, 77, "outdoor"],
					[1609521720603, 56, 59, "indoor"],
					[1609523457286, 71, 71, "outdoor"],
					[1609525193969, 61, 60, "indoor"],
					[1609526930653, 63, 74, "outdoor"],
					[1609528667336, 53, 62, "indoor"],
					[1609530404020, 77, 60, "outdoor"],
					[1609532140703, 58, 64, "indoor"],
					[1609533877386, 75, 64, "outdoor"],
					[1609535614070, 53, 56, "indoor"],
					[1609537350753, 71, 70, "outdoor"],
					[1609539087437, 52, 63, "indoor"],
					[1609540824120, 61, 76, "outdoor"],
					[1609542560804, 64, 62, "indoor"],
					[1609544297487, 73, 80, "outdoor"],
					[1609546034170, 63, 59, "indoor"],
					[1609547770854, 79, 73, "outdoor"],
					[1609549507537, 62, 60, "indoor"],
					[1609551244221, 71, 61, "outdoor"],
					[1609552980904, 59, 51, "indoor"],
					[1609554717587, 72, 62, "outdoor"],
					[1609556454271, 56, 61, "indoor"],
					[1609558190954, 68, 73, "outdoor"],
					[1609559927638, 63, 64, "indoor"],
					[1609561664321, 80, 74, "outdoor"],
					[1609563401005, 59, 62, "indoor"],
					[1609565137688, 71, 75, "outdoor"],
					[1609566874371, 61, 65, "indoor"],
					[1609568611055, 68, 79, "outdoor"],
					[1609570347738, 65, 57, "indoor"],
					[1609572084422, 67, 63, "outdoor"],
					[1609573821105, 58, 57, "indoor"],
					[1609575557788, 75, 71, "outdoor"],
					[1609577294472, 54, 61, "indoor"],
					[1609579031155, 67, 65, "outdoor"],
					[1609580767839, 60, 54, "indoor"],
					[1609582504522, 74, 71, "outdoor"],
					[1609584241206, 61, 61, "indoor"],
					[1609585977889, 73, 80, "outdoor"],
					[1609587714572, 55, 59, "indoor"],
					[1609589451256, 65, 76, "outdoor"],
					[1609591187939, 61, 62, "indoor"],
					[1609592924623, 61, 80, "outdoor"],
					[1609594661306, 53, 64, "indoor"],
					[1609596397989, 74, 60, "outdoor"],
					[1609598134673, 59, 58, "indoor"],
					[1609599871356, 64, 78, "outdoor"],
					[1609601608040, 50, 53, "indoor"],
					[1609603344723, 78, 79, "outdoor"],
					[1609605081407, 57, 55, "indoor"],
					[1609606818090, 71, 77, "outdoor"],
					[1609608554773, 57, 53, "indoor"],
					[1609610291457, 72, 71, "outdoor"],
					[1609612028140, 63, 62, "indoor"],
					[1609613764824, 61, 64, "outdoor"],
					[1609615501507, 50, 61, "indoor"],
					[1609617238190, 69, 73, "outdoor"],
					[1609618974874, 58, 63, "indoor"],
					[1609620711557, 72, 68, "outdoor"],
					[1609622448241, 52, 62, "indoor"],
					[1609624184924, 64, 67, "outdoor"],
					[1609625921608, 53, 54, "indoor"],
					[1609627658291, 67, 76, "outdoor"],
					[1609629394974, 55, 56, "indoor"],
					[1609631131658, 77, 64, "outdoor"],
					[1609632868341, 54, 65, "indoor"],
					[1609634605025, 79, 60, "outdoor"],
					[1609636341708, 53, 53, "indoor"],
					[1609638078391, 64, 76, "outdoor"],
					[1609639815075, 52, 58, "indoor"],
					[1609641551758, 72, 72, "outdoor"],
					[1609643288442, 62, 52, "indoor"],
					[1609645025125, 74, 74, "outdoor"],
					[1609646761809, 59, 53, "indoor"],
					[1609648498492, 66, 65, "outdoor"],
					[1609650235175, 50, 63, "indoor"],
					[1609651971859, 63, 70, "outdoor"],
					[1609653708542, 65, 55, "indoor"],
					[1609655445226, 63, 73, "outdoor"],
					[1609657181909, 54, 65, "indoor"],
					[1609658918592, 80, 79, "outdoor"],
					[1609660655276, 59, 51, "indoor"],
					[1609662391959, 69, 79, "outdoor"],
					[1609664128643, 58, 57, "indoor"],
					[1609665865326, 61, 63, "outdoor"],
					[1609667602010, 57, 60, "indoor"],
					[1609669338693, 69, 62, "outdoor"],
					[1609671075376, 59, 57, "indoor"],
					[1609672812060, 62, 64, "outdoor"],
					[1609674548743, 61, 60, "indoor"],
					[1609676285427, 73, 74, "outdoor"],
					[1609678022110, 50, 65, "indoor"],
					[1609679758793, 61, 68, "outdoor"],
					[1609681495477, 54, 64, "indoor"],
					[1609683232160, 62, 64, "outdoor"],
					[1609684968844, 52, 59, "indoor"],
					[1609686705527, 71, 78, "outdoor"],
					[1609688442211, 61, 51, "indoor"],
					[1609690178894, 65, 77, "outdoor"],
					[1609691915577, 53, 62, "indoor"],
					[1609693652261, 61, 79, "outdoor"],
					[1609695388944, 63, 53, "indoor"],
					[1609697125628, 67, 75, "outdoor"],
					[1609698862311, 63, 51, "indoor"],
					[1609700598994, 68, 79, "outdoor"],
					[1609702335678, 59, 59, "indoor"],
					[1609704072361, 73, 70, "outdoor"],
					[1609705809045, 60, 61, "indoor"],
					[1609707545728, 79, 80, "outdoor"],
					[1609709282412, 52, 57, "indoor"],
					[1609711019095, 72, 69, "outdoor"],
					[1609712755778, 59, 59, "indoor"],
					[1609714492462, 60, 70, "outdoor"],
					[1609716229145, 58, 52, "indoor"],
					[1609717965829, 80, 72, "outdoor"],
					[1609719702512, 55, 65, "indoor"],
					[1609721439195, 67, 64, "outdoor"],
					[1609723175879, 60, 50, "indoor"],
					[1609724912562, 70, 65, "outdoor"],
					[1609726649246, 58, 54, "indoor"],
					[1609728385929, 62, 63, "outdoor"],
					[1609730122613, 55, 50, "indoor"],
					[1609731859296, 65, 74, "outdoor"],
					[1609733595979, 55, 63, "indoor"],
					[1609735332663, 67, 69, "outdoor"],
					[1609737069346, 59, 65, "indoor"],
					[1609738806030, 71, 73, "outdoor"],
					[1609740542713, 59, 56, "indoor"],
					[1609742279396, 71, 64, "outdoor"],
					[1609744016080, 50, 51, "indoor"],
					[1609745752763, 60, 68, "outdoor"],
					[1609747489447, 56, 51, "indoor"],
					[1609749226130, 76, 74, "outdoor"],
					[1609750962814, 58, 64, "indoor"],
					[1609752699497, 80, 77, "outdoor"],
					[1609754436180, 64, 53, "indoor"],
					[1609756172864, 69, 71, "outdoor"],
					[1609757909547, 60, 50, "indoor"],
					[1609759646231, 78, 65, "outdoor"],
					[1609761382914, 65, 62, "indoor"],
					[1609763119597, 63, 69, "outdoor"],
					[1609764856281, 60, 55, "indoor"],
					[1609766592964, 72, 63, "outdoor"],
					[1609768329648, 50, 64, "indoor"],
					[1609770066331, 71, 67, "outdoor"],
					[1609771803015, 53, 56, "indoor"],
					[1609773539698, 79, 75, "outdoor"],
					[1609775276381, 54, 51, "indoor"],
					[1609777013065, 75, 76, "outdoor"],
					[1609778749748, 50, 56, "indoor"],
					[1609780486432, 78, 72, "outdoor"],
					[1609782223115, 59, 57, "indoor"],
					[1609783959798, 68, 78, "outdoor"],
					[1609785696482, 53, 53, "indoor"],
					[1609787433165, 68, 76, "outdoor"],
					[1609789169849, 65, 56, "indoor"],
					[1609790906532, 62, 80, "outdoor"],
					[1609792643216, 56, 51, "indoor"],
					[1609794379899, 72, 76, "outdoor"],
					[1609796116582, 64, 59, "indoor"],
					[1609797853266, 76, 74, "outdoor"],
					[1609799589949, 60, 60, "indoor"],
					[1609801326633, 71, 75, "outdoor"],
					[1609803063316, 53, 59, "indoor"],
					[1609804800000, 74, 78, "outdoor"]
				],
				datatypes: {
					time: "temporal",
					temperature: "quantitative",
					humidity: "quantitative",
					location: "nominal"
				},
				mark: "line"
			},
			x: "time",
			y: "temperature",
			x_label_angle: 0,
			y_label_angle: 0,
			show_label: false,
			container: true,
			min_width: 160,
			visible: true,
			elem_classes: [],
			name: "lineplot",
			_selectable: true,
			attached_events: ["select"],
			interactive: false,
			server: {}
		}
	},

	{
		name: "button",
		props: {
			value: "Static Button",
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
			value: "Interactive Button",
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
			value: [
				[
					"This is **bold text**. This is *italic text*. This is a [link](https://gradio.app).",
					"I love you"
				],
				["thanks.", "I love you"]
			],
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
			server: {},
			label: "Interactive Chatbot"
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
			server: {},
			label: "Static Checkbox"
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
			server: {},
			label: "Interactive Checkbox"
		}
	},
	{
		name: "checkboxgroup",
		props: {
			choices: [
				["First Choice", "First Choice"],
				["Second Choice", "Second Choice"],
				["Third Choice", "Third Choice"]
			],
			value: ["First Choice"],
			type: "value",
			show_label: true,
			container: true,
			min_width: 160,
			interactive: false,
			visible: true,
			elem_classes: [],
			name: "checkboxgroup",
			_selectable: false,
			server: {},
			label: "Static Checkbox Group"
		}
	},
	{
		name: "checkboxgroup",
		props: {
			choices: [
				["First Choice", "First Choice"],
				["Second Choice", "Second Choice"],
				["Third Choice", "Third Choice"]
			],
			value: ["First Choice"],
			type: "value",
			show_label: true,
			container: true,
			min_width: 160,
			interactive: true,
			visible: true,
			elem_classes: [],
			name: "checkboxgroup",
			_selectable: false,
			server: {},
			label: "Interactive Checkbox Group"
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
			value: `console.log("hello")`,
			label: "Static Code"
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
			value: `console.log("hello")`,
			language: "js",
			label: "Interactive Code"
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
			server: {},
			label: "Static Color Picker"
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
			server: {},
			label: "Interactive Color Picker"
		}
	},
	{
		name: "dataframe",
		props: {
			value: {
				headers: ["A", "B", "C", "D", "E"],
				data: [
					[14, 5, 20, 14, 23],
					[4, 2, 20, 3, 45],
					[5, 54, 7, 6, 64],
					[4, 3, 3, 2, 32],
					[1, 2, 8, 6, 23]
				],
				metadata: {
					display_value: [
						["14", "5", "20", "14", "23"],
						["4", "2", "20", "3", "45"],
						["5", "54", "7", "6", "64"],
						["4", "3", "3", "2", "32"],
						["1", "2", "8", "6", "23"]
					],
					styling: [
						[
							"background-color: lightgreen",
							"",
							"background-color: lightgreen",
							"background-color: lightgreen",
							""
						],
						["", "", "background-color: lightgreen", "", ""],
						[
							"",
							"background-color: lightgreen",
							"",
							"",
							"background-color: lightgreen"
						],
						["", "", "", "", ""],
						["", "", "", "", ""]
					]
				}
			},
			headers: ["1", "2", "3"],
			row_count: [1, "dynamic"],
			col_count: [3, "dynamic"],
			datatype: "str",
			type: "pandas",
			latex_delimiters: [{ left: "$$", right: "$$", display: true }],
			show_label: true,
			min_width: 160,
			interactive: false,
			visible: true,
			elem_classes: [],
			wrap: false,
			line_breaks: true,
			column_widths: [],
			name: "dataframe",
			_selectable: false,
			server: {},
			label: "Static DataFrame"
		}
	},
	{
		name: "dataframe",
		props: {
			value: {
				headers: ["A", "B", "C", "D", "E"],
				data: [
					[14, 5, 20, 14, 23],
					[4, 2, 20, 3, 45],
					[5, 54, 7, 6, 64],
					[4, 3, 3, 2, 32],
					[1, 2, 8, 6, 23]
				],
				metadata: {
					display_value: [
						["14", "5", "20", "14", "23"],
						["4", "2", "20", "3", "45"],
						["5", "54", "7", "6", "64"],
						["4", "3", "3", "2", "32"],
						["1", "2", "8", "6", "23"]
					],
					styling: [
						[
							"background-color: lightgreen",
							"",
							"background-color: lightgreen",
							"background-color: lightgreen",
							""
						],
						["", "", "background-color: lightgreen", "", ""],
						[
							"",
							"background-color: lightgreen",
							"",
							"",
							"background-color: lightgreen"
						],
						["", "", "", "", ""],
						["", "", "", "", ""]
					]
				}
			},
			headers: ["1", "2", "3"],
			row_count: [1, "dynamic"],
			col_count: [3, "dynamic"],
			datatype: "str",
			type: "pandas",
			latex_delimiters: [{ left: "$$", right: "$$", display: true }],
			show_label: true,
			min_width: 160,
			interactive: true,
			visible: true,
			elem_classes: [],
			wrap: false,
			line_breaks: true,
			column_widths: [],
			name: "dataframe",
			_selectable: false,
			server: {},
			label: "Interactive DataFrame"
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
			value: null,
			label: "Interactive Dataset"
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
			value: "",
			label: "Interactive DateTime"
		}
	},
	{
		name: "downloadbutton",
		props: {
			label: "Static Download Button",
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
			variant: "secondary",
			visible: true,
			interactive: true,
			elem_classes: [],
			name: "downloadbutton",
			_selectable: false,
			server: {},
			label: "Interactive Download Button"
		}
	},
	{
		name: "dropdown",
		props: {
			choices: [
				["First Choice", "First Choice"],
				["Second Choice", "Second Choice"],
				["Third Choice", "Third Choice"]
			],
			value: "First Choice",
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
			server: {},
			label: "Static Dropdown"
		}
	},
	{
		name: "dropdown",
		props: {
			choices: [
				["First Choice", "First Choice"],
				["Second Choice", "Second Choice"],
				["Third Choice", "Third Choice"]
			],
			value: "First Choice",
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
			server: {},
			label: "Interactive Dropdown"
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
			interactive: false,
			server: {},
			label: "Static File",
			value: [make_data(base_image), make_data(mask_image)]
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
			server: {},
			label: "Interactive File"
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
			server: {},
			label: "Static File Explorer"
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
			server: {},
			label: "Interactive File Explorer"
		}
	},
	{
		name: "gallery",
		props: {
			value: [
				{ image: make_data(base_image) },
				{ image: make_data(mask_image) },
				{ image: make_data(base_image) },
				{ image: make_data(mask_image) },
				{ image: make_data(base_image) },
				{ image: make_data(mask_image) }
			],
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
			server: {},
			label: "Static Gallery"
		}
	},
	{
		name: "gallery",
		props: {
			value: [
				{ image: make_data(base_image) },
				{ image: make_data(mask_image) },
				{ image: make_data(base_image) },
				{ image: make_data(mask_image) },
				{ image: make_data(base_image) },
				{ image: make_data(mask_image) }
			],
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
			server: {},
			label: "Interactive Gallery"
		}
	},
	{
		name: "highlightedtext",
		props: {
			show_legend: true,
			show_inline_category: true,
			combine_adjacent: true,
			adjacent_separator: "",
			show_label: true,
			container: true,
			min_width: 160,
			visible: true,
			elem_classes: [],
			interactive: false,
			name: "highlightedtext",
			_selectable: false,
			server: {},
			label: "Static Highlighted Text",
			value: [
				{
					token: "The ",
					class_or_confidence: null
				},
				{
					token: "fast",
					class_or_confidence: "+"
				},
				{
					token: "quick",
					class_or_confidence: "-"
				},
				{
					token: " brown fox jump",
					class_or_confidence: null
				},
				{
					token: "s",
					class_or_confidence: "+"
				},
				{
					token: "ed",
					class_or_confidence: "-"
				},
				{
					token: " over",
					class_or_confidence: null
				},
				{
					token: " the",
					class_or_confidence: "-"
				},
				{
					token: " lazy dogs.",
					class_or_confidence: null
				}
			]
		}
	},
	{
		name: "highlightedtext",
		props: {
			show_legend: true,
			show_inline_category: true,
			combine_adjacent: true,
			adjacent_separator: "",
			show_label: true,
			container: true,
			min_width: 160,
			visible: true,
			elem_classes: [],
			interactive: true,
			name: "highlightedtext",
			_selectable: false,
			server: {},
			label: "Interactive Highlighted Text",
			value: [
				{
					token: "The ",
					class_or_confidence: null
				},
				{
					token: "fast",
					class_or_confidence: "+"
				},
				{
					token: "quick",
					class_or_confidence: "-"
				},
				{
					token: " brown fox jump",
					class_or_confidence: null
				},
				{
					token: "s",
					class_or_confidence: "+"
				},
				{
					token: "ed",
					class_or_confidence: "-"
				},
				{
					token: " over",
					class_or_confidence: null
				},
				{
					token: " the",
					class_or_confidence: "-"
				},
				{
					token: " lazy dogs.",
					class_or_confidence: null
				}
			]
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
			value: "<h1>hello</h1>",
			label: "Interactive HTML"
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
			value: make_data(base_image),
			label: "Static Image"
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
			value: null,
			label: "Interactive Image"
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
			value: { background: null, layers: [], composite: null },
			label: "Interactive Image Editor"
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
			server: {},
			value: {
				a: 1,
				b: 2,
				c: {
					a: 1,
					b: 2,
					c: {
						a: 1,
						b: 2
					}
				}
			},
			label: "Interactive JSON"
		}
	},
	{
		name: "label",
		props: {
			value: {
				label: "First Label",
				confidences: [
					{
						label: "First Label",
						confidence: 0.7
					},
					{
						label: "Second Label",
						confidence: 0.2
					},
					{
						label: "Third Label",
						confidence: 0.1
					}
				]
			},
			show_label: true,
			container: true,
			min_width: 160,
			visible: true,
			elem_classes: [],
			name: "label",
			_selectable: false,
			interactive: false,
			server: {},
			label: "Static Label"
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
			value:
				"This is **bold text**. This is *italic text*. This is a [link](https://gradio.app).",
			label: "Interactive Markdown"
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
			value: make_data(duck),
			label: "Static 3D Model"
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
			value: null,
			label: "Interactive 3D Model"
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
			server: {},
			label: "Static Multimodal Textbox"
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
			server: {},
			label: "Interactive Multimodal Textbox"
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
			interactive: false,
			server: {},
			value: 0,
			label: "Static Number"
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
			value: 0,
			label: "Interactive Number"
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
			server: {},
			value: {
				number: {
					type: "int | float",
					description: "The number to round",
					default: null
				},
				ndigits: {
					type: "int",
					description: "The number of digits to round to",
					default: "0"
				}
			},
			label: "Interactive Parameter Viewer"
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
			value: null,
			label: "Interactive Plot"
		}
	},
	{
		name: "radio",
		props: {
			choices: [
				["First Choice", "First Choice"],
				["Second Choice", "Second Choice"],
				["Third Choice", "Third Choice"]
			],
			value: "First Choice",
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
			label: "Static Radio"
		}
	},
	{
		name: "radio",
		props: {
			choices: [
				["First Choice", "First Choice"],
				["Second Choice", "Second Choice"],
				["Third Choice", "Third Choice"]
			],
			value: "First Choice",
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
			label: "Interactive Radio"
		}
	},
	{
		name: "slider",
		props: {
			minimum: 25,
			maximum: 100,
			value: 46,
			step: 1,
			show_label: true,
			container: true,
			min_width: 160,
			interactive: false,
			visible: true,
			elem_classes: [],
			name: "slider",
			_selectable: false,
			server: {},
			label: "Static Slider"
		}
	},
	{
		name: "slider",
		props: {
			minimum: 25,
			maximum: 100,
			value: 46,
			step: 1,
			show_label: true,
			container: true,
			min_width: 160,
			interactive: true,
			visible: true,
			elem_classes: [],
			name: "slider",
			_selectable: false,
			server: {},
			label: "Interactive Slider"
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
			value: "Hello there\n\nHello again",
			label: "Static Textbox"
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
			value: "Hello there\n\nHello again",
			label: "Interactive Textbox"
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
			server: {},
			label: "Static Timer"
		}
	},
	{
		name: "uploadbutton",
		props: {
			variant: "secondary",
			visible: true,
			interactive: true,
			elem_classes: [],
			type: "filepath",
			file_count: "single",
			name: "uploadbutton",
			_selectable: false,
			server: {},
			label: "Interactive Upload Button"
		}
	},
	{
		name: "uploadbutton",
		props: {
			variant: "secondary",
			visible: true,
			interactive: true,
			elem_classes: [],
			type: "filepath",
			file_count: "single",
			name: "uploadbutton",
			_selectable: false,
			server: {},
			label: "Interactive Upload Button"
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
			value: { video: make_data(video) },
			label: "Static Video"
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
			value: null,
			label: "Interactive Video"
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
			visible: true,
			label: "Interactive Form"
		}
	},

	{ name: "column", props: { interactive: false, scale: null, server: {} } },
	{ name: "row", props: { interactive: false, scale: null, server: {} } }
];
