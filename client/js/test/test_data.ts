import type { ApiData, ApiInfo, Config, EndpointInfo } from "../src/types";

export const test_endpoint_info: EndpointInfo<ApiData> = {
	parameters: [
		{
			label: "TextInput",
			type: {
				type: "string",
				description: ""
			},
			component: "TextInput",
			example_input: "1",
			serializer: "StringSerializer",
			python_type: {
				type: "str",
				description: ""
			}
		}
	],
	returns: [
		{
			label: "Checkbox",
			type: {
				type: "boolean",
				description: ""
			},
			component: "Checkbox",
			example_input: true,
			serializer: "BooleanSerializer",
			python_type: {
				type: "bool",
				description: ""
			}
		}
	]
};

export const test_api_info: ApiInfo<ApiData> = {
	named_endpoints: {
		"/predict": test_endpoint_info
	},
	unnamed_endpoints: {
		"0": test_endpoint_info
	}
};

export const test_config: Config = {
	version: "3.24.1\n",
	mode: "blocks",
	dev_mode: false,
	analytics_enabled: true,
	components: [
		{
			id: 1,
			type: "markdown",
			props: {
				value: "<h1>Whisper Speech Recognition</h1>\n",
				name: "markdown",
				visible: true,
				style: {}
			},
			serializer: "Serializable",
			info: {
				input: ["str", "value"],
				output: ["str", "value"]
			}
		},
		{
			id: 2,
			type: "group",
			props: {
				type: "group",
				visible: true,
				style: {}
			}
		},
		{
			id: 3,
			type: "box",
			props: {
				type: "box",
				visible: true,
				style: {}
			}
		},
		{
			id: 4,
			type: "row",
			props: {
				type: "row",
				variant: "default",
				visible: true,
				style: {
					equal_height: true
				}
			}
		},
		{
			id: 5,
			type: "audio",
			props: {
				source: "microphone",
				streaming: false,
				label: "Input Audio",
				show_label: false,
				name: "audio",
				visible: true,
				style: {}
			},
			serializer: "FileSerializable",
			info: {
				input: ["str", "filepath or URL"],
				output: ["str", "filepath or URL"]
			}
		},
		{
			id: 6,
			type: "button",
			props: {
				value: "Transcribe",
				variant: "secondary",
				interactive: true,
				name: "button",
				visible: true,
				style: {}
			},
			serializer: "Serializable",
			info: {
				input: ["str", "value"],
				output: ["str", "value"]
			}
		},
		{
			id: 7,
			type: "textbox",
			props: {
				lines: 1,
				max_lines: 20,
				value: "",
				type: "text",
				show_label: false,
				name: "textbox",
				visible: true,
				elem_id: "result-textarea",
				style: {}
			},
			serializer: "Serializable",
			info: {
				input: ["str", "value"],
				output: ["str", "value"]
			}
		},
		{
			id: 8,
			type: "group",
			props: {
				type: "group",
				visible: true,
				elem_id: "share-btn-container",
				style: {}
			}
		},
		{
			id: 9,
			type: "html",
			props: {
				value:
					'<svg id="share-btn-share-icon" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" focusable="false" role="img" width="1em" height="1em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 32 32">\n    <path d="M20.6081 3C21.7684 3 22.8053 3.49196 23.5284 4.38415C23.9756 4.93678 24.4428 5.82749 24.4808 7.16133C24.9674 7.01707 25.4353 6.93643 25.8725 6.93643C26.9833 6.93643 27.9865 7.37587 28.696 8.17411C29.6075 9.19872 30.0124 10.4579 29.8361 11.7177C29.7523 12.3177 29.5581 12.8555 29.2678 13.3534C29.8798 13.8646 30.3306 14.5763 30.5485 15.4322C30.719 16.1032 30.8939 17.5006 29.9808 18.9403C30.0389 19.0342 30.0934 19.1319 30.1442 19.2318C30.6932 20.3074 30.7283 21.5229 30.2439 22.6548C29.5093 24.3704 27.6841 25.7219 24.1397 27.1727C21.9347 28.0753 19.9174 28.6523 19.8994 28.6575C16.9842 29.4379 14.3477 29.8345 12.0653 29.8345C7.87017 29.8345 4.8668 28.508 3.13831 25.8921C0.356375 21.6797 0.754104 17.8269 4.35369 14.1131C6.34591 12.058 7.67023 9.02782 7.94613 8.36275C8.50224 6.39343 9.97271 4.20438 12.4172 4.20438H12.4179C12.6236 4.20438 12.8314 4.2214 13.0364 4.25468C14.107 4.42854 15.0428 5.06476 15.7115 6.02205C16.4331 5.09583 17.134 4.359 17.7682 3.94323C18.7242 3.31737 19.6794 3 20.6081 3ZM20.6081 5.95917C20.2427 5.95917 19.7963 6.1197 19.3039 6.44225C17.7754 7.44319 14.8258 12.6772 13.7458 14.7131C13.3839 15.3952 12.7655 15.6837 12.2086 15.6837C11.1036 15.6837 10.2408 14.5497 12.1076 13.1085C14.9146 10.9402 13.9299 7.39584 12.5898 7.1776C12.5311 7.16799 12.4731 7.16355 12.4172 7.16355C11.1989 7.16355 10.6615 9.33114 10.6615 9.33114C10.6615 9.33114 9.0863 13.4148 6.38031 16.206C3.67434 18.998 3.5346 21.2388 5.50675 24.2246C6.85185 26.2606 9.42666 26.8753 12.0653 26.8753C14.8021 26.8753 17.6077 26.2139 19.1799 25.793C19.2574 25.7723 28.8193 22.984 27.6081 20.6107C27.4046 20.212 27.0693 20.0522 26.6471 20.0522C24.9416 20.0522 21.8393 22.6726 20.5057 22.6726C20.2076 22.6726 19.9976 22.5416 19.9116 22.222C19.3433 20.1173 28.552 19.2325 27.7758 16.1839C27.639 15.6445 27.2677 15.4256 26.746 15.4263C24.4923 15.4263 19.4358 19.5181 18.3759 19.5181C18.2949 19.5181 18.2368 19.4937 18.2053 19.4419C17.6743 18.557 17.9653 17.9394 21.7082 15.6009C25.4511 13.2617 28.0783 11.8545 26.5841 10.1752C26.4121 9.98141 26.1684 9.8956 25.8725 9.8956C23.6001 9.89634 18.2311 14.9403 18.2311 14.9403C18.2311 14.9403 16.7821 16.496 15.9057 16.496C15.7043 16.496 15.533 16.4139 15.4169 16.2112C14.7956 15.1296 21.1879 10.1286 21.5484 8.06535C21.7928 6.66715 21.3771 5.95917 20.6081 5.95917Z" fill="#FF9D00"></path>\n    <path d="M5.50686 24.2246C3.53472 21.2387 3.67446 18.9979 6.38043 16.206C9.08641 13.4147 10.6615 9.33111 10.6615 9.33111C10.6615 9.33111 11.2499 6.95933 12.59 7.17757C13.93 7.39581 14.9139 10.9401 12.1069 13.1084C9.29997 15.276 12.6659 16.7489 13.7459 14.713C14.8258 12.6772 17.7747 7.44316 19.304 6.44221C20.8326 5.44128 21.9089 6.00204 21.5484 8.06532C21.188 10.1286 14.795 15.1295 15.4171 16.2118C16.0391 17.2934 18.2312 14.9402 18.2312 14.9402C18.2312 14.9402 25.0907 8.49588 26.5842 10.1752C28.0776 11.8545 25.4512 13.2616 21.7082 15.6008C17.9646 17.9393 17.6744 18.557 18.2054 19.4418C18.7372 20.3266 26.9998 13.1351 27.7759 16.1838C28.5513 19.2324 19.3434 20.1173 19.9117 22.2219C20.48 24.3274 26.3979 18.2382 27.6082 20.6107C28.8193 22.9839 19.2574 25.7722 19.18 25.7929C16.0914 26.62 8.24723 28.3726 5.50686 24.2246Z" fill="#FFD21E"></path>\n</svg>',
				show_label: true,
				name: "html",
				visible: false,
				style: {}
			},
			serializer: "Serializable",
			info: {
				input: ["str", "value"],
				output: ["str", "value"]
			}
		},
		{
			id: 10,
			type: "html",
			props: {
				value:
					'<svg id="share-btn-loading-icon" style="display:none;" class="animate-spin"\n   style="color: #ffffff; \n"\n   xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" fill="none" focusable="false" role="img" width="1em" height="1em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><circle style="opacity: 0.25;" cx="12" cy="12" r="10" stroke="white" stroke-width="4"></circle><path style="opacity: 0.75;" fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>',
				show_label: true,
				name: "html",
				visible: false,
				style: {}
			},
			serializer: "Serializable",
			info: {
				input: ["str", "value"],
				output: ["str", "value"]
			}
		},
		{
			id: 11,
			type: "button",
			props: {
				value: "Share to community",
				variant: "secondary",
				interactive: true,
				name: "button",
				visible: false,
				elem_id: "share-btn",
				style: {}
			},
			serializer: "Serializable",
			info: {
				input: ["str", "value"],
				output: ["str", "value"]
			}
		},
		{
			id: 12,
			type: "html",
			props: {
				value:
					'\n        <div class="footer">\n                    <p>Model by <a href="https://github.com/openai/whisper" style="text-decoration: underline;" target="_blank">OpenAI</a> - Gradio Demo by 🤗 Hugging Face\n                    </p>\n        </div>\n        ',
				show_label: true,
				name: "html",
				visible: true,
				style: {}
			},
			serializer: "Serializable",
			info: {
				input: ["str", "value"],
				output: ["str", "value"]
			}
		},
		{
			id: 13,
			type: "form",
			props: {
				type: "form",
				visible: true,
				style: {}
			}
		}
	],
	css: "\n        .gradio-container {\n            font-family: 'IBM Plex Sans', sans-serif;\n        }\n        .gr-button {\n            color: white;\n            border-color: black;\n            background: black;\n        }\n        input[type='range'] {\n            accent-color: black;\n        }\n        .dark input[type='range'] {\n            accent-color: #dfdfdf;\n        }\n        .container {\n            max-width: 730px;\n            margin: auto;\n            padding-top: 1.5rem;\n        }\n     \n        .details:hover {\n            text-decoration: underline;\n        }\n        .gr-button {\n            white-space: nowrap;\n        }\n        .gr-button:focus {\n            border-color: rgb(147 197 253 / var(--tw-border-opacity));\n            outline: none;\n            box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000);\n            --tw-border-opacity: 1;\n            --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);\n            --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(3px var(--tw-ring-offset-width)) var(--tw-ring-color);\n            --tw-ring-color: rgb(191 219 254 / var(--tw-ring-opacity));\n            --tw-ring-opacity: .5;\n        }\n        .footer {\n            margin-bottom: 45px;\n            margin-top: 35px;\n            text-align: center;\n            border-bottom: 1px solid #e5e5e5;\n        }\n        .footer>p {\n            font-size: .8rem;\n            display: inline-block;\n            padding: 0 10px;\n            transform: translateY(10px);\n            background: white;\n        }\n        .dark .footer {\n            border-color: #303030;\n        }\n        .dark .footer>p {\n            background: #0b0f19;\n        }\n        .prompt h4{\n            margin: 1.25em 0 .25em 0;\n            font-weight: bold;\n            font-size: 115%;\n        }\n        .animate-spin {\n            animation: spin 1s linear infinite;\n        }\n        @keyframes spin {\n            from {\n                transform: rotate(0deg);\n            }\n            to {\n                transform: rotate(360deg);\n            }\n        }\n        #share-btn-container {\n            display: flex; margin-top: 1.5rem !important; padding-left: 0.5rem !important; padding-right: 0.5rem !important; background-color: #000000; justify-content: center; align-items: center; border-radius: 9999px !important; width: 13rem;\n        }\n        #share-btn {\n            all: initial; color: #ffffff;font-weight: 600; cursor:pointer; font-family: 'IBM Plex Sans', sans-serif; margin-left: 0.5rem !important; padding-top: 0.25rem !important; padding-bottom: 0.25rem !important;\n        }\n        #share-btn * {\n            all: unset;\n        }\n",
	title: "Gradio",
	is_space: true,
	enable_queue: true,
	show_error: false,
	show_api: true,
	is_colab: false,
	stylesheets: [
		"https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@400;600&display=swap",
		"https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&display=swap"
	],
	root: "",
	theme: "default",
	layout: {
		id: 0,
		children: [
			{
				id: 1
			},
			{
				id: 2,
				children: [
					{
						id: 3,
						children: [
							{
								id: 4,
								children: [
									{
										id: 5
									},
									{
										id: 6
									}
								]
							}
						]
					},
					{
						id: 13,
						children: [
							{
								id: 7
							}
						]
					},
					{
						id: 8,
						children: [
							{
								id: 9
							},
							{
								id: 10
							},
							{
								id: 11
							}
						]
					},
					{
						id: 12
					}
				]
			}
		]
	},
	dependencies: [
		{
			targets: [6],
			trigger: "click",
			inputs: [5],
			outputs: [7],
			backend_fn: true,
			js: null,
			queue: null,
			api_name: "predict",
			scroll_to_output: false,
			show_progress: true,
			every: null,
			batch: false,
			max_batch_size: 4,
			cancels: [],
			types: {
				continuous: false,
				generator: false
			},
			collects_event_data: false,
			trigger_after: null,
			trigger_only_on_success: false
		},
		{
			targets: [11],
			trigger: "click",
			inputs: [],
			outputs: [],
			backend_fn: false,
			js: "async () => {\n\tasync function uploadFile(file){\n\t\tconst UPLOAD_URL = 'https://huggingface.co/uploads';\n\t\tconst response = await fetch(UPLOAD_URL, {\n\t\t\tmethod: 'POST',\n\t\t\theaders: {\n\t\t\t\t'Content-Type': 'audio/wav',\n\t\t\t\t'X-Requested-With': 'XMLHttpRequest',\n\t\t\t},\n\t\t\tbody: file, /// <- File inherits from Blob\n\t\t});\n\t\tconst url = await response.text();\n\t\treturn url;\n\t}\n\n\tfunction audioResample(buffer, sampleRate){\n\t\tconst offlineCtx = new OfflineAudioContext(2, (buffer.length / buffer.sampleRate) * sampleRate, sampleRate);\n\t\tconst source = offlineCtx.createBufferSource();\n\t\tsource.buffer = buffer;\n\t\tsource.connect(offlineCtx.destination);\n\t\tsource.start();\n\t\treturn offlineCtx.startRendering();\n\t};\n\n\tfunction audioReduceChannels(buffer, targetChannelOpt){\n\t\tif(targetChannelOpt === 'both' || buffer.numberOfChannels < 2) return buffer;\n\t\tconst outBuffer = new AudioBuffer({\n\t\t\tsampleRate: buffer.sampleRate, \n\t\t\tlength: buffer.length, \n\t\t\tnumberOfChannels: 1\n\t\t});\n\n\t\tconst data = [buffer.getChannelData(0), buffer.getChannelData(1)];\n\t\tconst newData = new Float32Array(buffer.length);\n\t\tfor(let i = 0; i < buffer.length; ++i)\n\t\t\tnewData[i] = \n\t\t\t\ttargetChannelOpt === 'left'? data[0][i] :\n\t\t\t\ttargetChannelOpt === 'right'? data[1][i] :\n\t\t\t\t(data[0][i] + data[1][i]) / 2 ;\n\t\toutBuffer.copyToChannel(newData, 0);\n\t\treturn outBuffer;\n\t};\n\n\tfunction audioNormalize(buffer){\n\t\tconst data = Array.from(Array(buffer.numberOfChannels)).map((_, idx) => buffer.getChannelData(idx));\n\t\tconst maxAmplitude = Math.max(...data.map(chan => chan.reduce((acc, cur) => Math.max(acc, Math.abs(cur)), 0)));\n\t\tif(maxAmplitude >= 1.0) return buffer;\n\t\tconst coeff = 1.0 / maxAmplitude;\n\t\tdata.forEach(chan => {\n\t\t\tchan.forEach((v, idx) => chan[idx] = v*coeff);\n\t\t\tbuffer.copyToChannel(chan, 0);\n\t\t});\n\t\treturn buffer;\n\t};\n\n\tasync function processAudioFile(\n\t\taudioBufferIn,\n\t\ttargetChannelOpt,\n\t\ttargetSampleRate\n\t) {\n\t\tconst resampled = await audioResample(audioBufferIn, targetSampleRate);\n\t\tconst reduced = audioReduceChannels(resampled, targetChannelOpt);\n\t\tconst normalized = audioNormalize(reduced);\n\t\treturn normalized;\n\t}\n\n\tfunction audioToRawWave(audioChannels, bytesPerSample, mixChannels=false) {\n\t\tconst bufferLength = audioChannels[0].length;\n\t\tconst numberOfChannels = audioChannels.length === 1 ? 1 : 2;\n\t\tconst reducedData = new Uint8Array(\n\t\t\tbufferLength * numberOfChannels * bytesPerSample\n\t\t);\n\t\tfor (let i = 0; i < bufferLength; ++i) {\n\t\t\tfor (\n\t\t\t\tlet channel = 0;\n\t\t\t\tchannel < (mixChannels ? 1 : numberOfChannels);\n\t\t\t\t++channel\n\t\t\t) {\n\t\t\t\tconst outputIndex = (i * numberOfChannels + channel) * bytesPerSample;\n\t\t\t\tlet sample;\n\t\t\t\tif (!mixChannels) sample = audioChannels[channel][i];\n\t\t\t\telse\n\t\t\t\t\tsample =\n\t\t\t\t\t\taudioChannels.reduce((prv, cur) => prv + cur[i], 0) /\n\t\t\t\t\t\tnumberOfChannels;\n\t\t\t\tsample = sample > 1 ? 1 : sample < -1 ? -1 : sample; //check for clipping\n\t\t\t\t//bit reduce and convert to Uint8\n\t\t\t\tswitch (bytesPerSample) {\n\t\t\t\t\tcase 2:\n\t\t\t\t\t\tsample = sample * 32767;\n\t\t\t\t\t\treducedData[outputIndex] = sample;\n\t\t\t\t\t\treducedData[outputIndex + 1] = sample >> 8;\n\t\t\t\t\t\tbreak;\n\t\t\t\t\tcase 1:\n\t\t\t\t\t\treducedData[outputIndex] = (sample + 1) * 127;\n\t\t\t\t\t\tbreak;\n\t\t\t\t\tdefault:\n\t\t\t\t\t\tthrow \"Only 8, 16 bits per sample are supported\";\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t\treturn reducedData;\n\t}\n\n\tfunction makeWav(data, channels, sampleRate, bytesPerSample) {\n\t\tconst headerLength = 44;\n\t\tvar wav = new Uint8Array(headerLength + data.length);\n\t\tvar view = new DataView(wav.buffer);\n\n\t\tview.setUint32(0, 1380533830, false); // RIFF identifier 'RIFF'\n\t\tview.setUint32(4, 36 + data.length, true); // file length minus RIFF identifier length and file description length\n\t\tview.setUint32(8, 1463899717, false); // RIFF type 'WAVE'\n\t\tview.setUint32(12, 1718449184, false); // format chunk identifier 'fmt '\n\t\tview.setUint32(16, 16, true); // format chunk length\n\t\tview.setUint16(20, 1, true); // sample format (raw)\n\t\tview.setUint16(22, channels, true); // channel count\n\t\tview.setUint32(24, sampleRate, true); // sample rate\n\t\tview.setUint32(28, sampleRate * bytesPerSample * channels, true); // byte rate (sample rate * block align)\n\t\tview.setUint16(32, bytesPerSample * channels, true); // block align (channel count * bytes per sample)\n\t\tview.setUint16(34, bytesPerSample * 8, true); // bits per sample\n\t\tview.setUint32(36, 1684108385, false); // data chunk identifier 'data'\n\t\tview.setUint32(40, data.length, true); // data chunk length\n\n\t\twav.set(data, headerLength);\n\n\t\treturn new Blob([wav.buffer], { type: \"audio/wav\" });\n\t}\n\n    const gradioEl = document.querySelector('body > gradio-app');\n    const audioEl = gradioEl.querySelector('audio');\n    const resultTxt = gradioEl.querySelector('#result-textarea textarea').value;\n    const shareBtnEl = gradioEl.querySelector('#share-btn');\n    const shareIconEl = gradioEl.querySelector('#share-btn-share-icon');\n    const loadingIconEl = gradioEl.querySelector('#share-btn-loading-icon');\n\n    if(!audioEl){\n        return;\n    };\n\n    shareBtnEl.style.pointerEvents = 'none';\n    shareIconEl.style.display = 'none';\n    loadingIconEl.style.removeProperty('display');\n\n    const res = await fetch(audioEl.src);\n    const blob = await res.blob();\n\n    const channelOpt = \"both\";\n    const sampleRate = 48000;\n    const bytesPerSample = 1; // or 2\n    const audioBufferIn = await new AudioContext().decodeAudioData(\n        await blob.arrayBuffer()\n    );\n    const audioBuffer = await processAudioFile(\n        audioBufferIn,\n        channelOpt,\n        sampleRate\n    );\n    const rawData = audioToRawWave(\n        channelOpt === \"both\"\n            ? [audioBuffer.getChannelData(0), audioBuffer.getChannelData(1)]\n            : [audioBuffer.getChannelData(0)],\n        bytesPerSample\n    );\n    const blobWav = makeWav(\n        rawData,\n        channelOpt === \"both\" ? 2 : 1,\n        sampleRate,\n        bytesPerSample\n    );\n\n    const fileName = `whisper-demo-input.wav`;\n    const audioFile = new File([blobWav], fileName, { type: 'audio/wav' });\n\n    const url = await uploadFile(audioFile);\n\n\tconst descriptionMd = `#### Input audio:\n<audio controls src='${url}'></audio>\n\n#### Transcription:\n\n> ${resultTxt}`;\n\n    const params = new URLSearchParams({\n        description: descriptionMd,\n    });\n\n\tconst paramsStr = params.toString();\n\twindow.open(`https://huggingface.co/spaces/openai/whisper/discussions/new?${paramsStr}`, '_blank');\n\n    shareBtnEl.style.removeProperty('pointer-events');\n    shareIconEl.style.removeProperty('display');\n    loadingIconEl.style.display = 'none';\n}",
			queue: false,
			api_name: null,
			scroll_to_output: false,
			show_progress: true,
			every: null,
			batch: false,
			max_batch_size: 4,
			cancels: [],
			types: {
				continuous: false,
				generator: false
			},
			collects_event_data: false,
			trigger_after: null,
			trigger_only_on_success: false
		}
	]
};
