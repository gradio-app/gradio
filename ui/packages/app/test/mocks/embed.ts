function cheap_clone(obj: object) {
	return JSON.parse(JSON.stringify(obj));
}

export const RUNNING = {
	_id: "63d2d66613d86bc148071e75",
	id: "pngwn/music-visualizer",
	author: "pngwn",
	sha: "4090039c565c73d5a0485d14bc3067ca6b25967c",
	lastModified: "2023-01-26T19:37:53.000Z",
	private: false,
	cardData: {
		title: "Music Visualizer",
		emoji: "🐨",
		colorFrom: "gray",
		colorTo: "indigo",
		sdk: "gradio",
		sdk_version: "3.16.2",
		app_file: "app.py",
		pinned: false,
		duplicated_from: "nateraw/music-visualizer"
	},
	gated: false,
	disabled: false,
	subdomain: "pngwn-music-visualizer",
	tags: ["gradio"],
	likes: 1,
	datasets: ["nateraw/misc"],
	sdk: "gradio",
	runtime: {
		stage: "RUNNING",
		sdk: "gradio",
		sdkVersion: "3.16.2",
		hardware: {
			current: "cpu-basic",
			requested: "cpu-basic"
		},
		spaceId: "pngwn/music-visualizer"
	},
	siblings: [
		{
			rfilename: ".gitattributes"
		},
		{
			rfilename: "README.md"
		},
		{
			rfilename: "app.py"
		},
		{
			rfilename: "requirements.txt"
		}
	]
};

export const BUILDING = {
	_id: "621ffddf36468d709f184f2b",
	id: "pngwn/test",
	author: "pngwn",
	sha: "5d35bea1c37f0b727798d9325532a3a47cedb8d8",
	lastModified: "2022-01-10T11:02:33.000Z",
	private: false,
	cardData: {
		title: "Test",
		emoji: "🌖",
		colorFrom: "purple",
		colorTo: "indigo",
		sdk: "gradio",
		app_file: "app.py",
		pinned: false
	},
	gated: false,
	disabled: false,
	subdomain: "pngwn-test",
	tags: ["gradio"],
	likes: 0,
	sdk: "gradio",
	runtime: {
		stage: "BUILDING",
		hardware: {
			current: "cpu-basic",
			requested: "cpu-basic"
		},
		resources: {
			requests: {
				cpu: 0.2,
				memory: "1G",
				gpu: "0",
				gpuModel: "",
				ephemeral: "0G"
			},
			limits: {
				cpu: 8,
				memory: "16G",
				gpu: "0",
				gpuModel: "",
				ephemeral: "50G"
			},
			replicas: 1,
			throttled: false,
			is_custom: false,
			ports: []
		},
		gcTimeout: null
	},
	siblings: [
		{
			rfilename: ".gitattributes"
		},
		{
			rfilename: "README.md"
		},
		{
			rfilename: "app.py"
		}
	]
};

export const RUNNING_BUILDING = {
	_id: "621ffddf36468d709f184f2b",
	id: "pngwn/test",
	author: "pngwn",
	sha: "5d35bea1c37f0b727798d9325532a3a47cedb8d8",
	lastModified: "2022-01-10T11:02:33.000Z",
	private: false,
	cardData: {
		title: "Test",
		emoji: "🌖",
		colorFrom: "purple",
		colorTo: "indigo",
		sdk: "gradio",
		app_file: "app.py",
		pinned: false
	},
	gated: false,
	disabled: false,
	subdomain: "pngwn-test",
	tags: ["gradio"],
	likes: 0,
	sdk: "gradio",
	runtime: {
		stage: "RUNNING_BUILDING",
		sdk: "gradio",
		sdkVersion: "3.18.0",
		hardware: {
			current: "cpu-basic",
			requested: "cpu-basic"
		},
		resources: {
			requests: {
				cpu: "0.2",
				memory: "1G",
				gpu: "0",
				gpuModel: null,
				ephemeral: "0G"
			},
			limits: {
				cpu: "2.0",
				memory: "16G",
				gpu: "0",
				gpuModel: null,
				ephemeral: "50G"
			},
			replicas: 1,
			throttled: false,
			is_custom: false,
			ports: []
		},
		gcTimeout: null
	},
	siblings: [
		{
			rfilename: ".gitattributes"
		},
		{
			rfilename: "README.md"
		},
		{
			rfilename: "app.py"
		}
	]
};

export const NO_APP_FILE = {
	_id: "627a52a6f652717251c6f238",
	id: "pngwn/AnimeGANv2_v3",
	author: "pngwn",
	sha: "977cfd1d60a3dcdb18577c37210257f8702b58dd",
	lastModified: "2022-05-10T11:55:18.000Z",
	private: false,
	cardData: {
		title: "AnimeGANv2_v3",
		emoji: "🔥",
		colorFrom: "green",
		colorTo: "pink",
		sdk: "gradio",
		sdk_version: "2.9.4",
		app_file: "app.py",
		pinned: false
	},
	gated: false,
	disabled: false,
	subdomain: "pngwn-animeganv2-v3",
	tags: ["gradio"],
	likes: 0,
	sdk: "gradio",
	runtime: {
		stage: "NO_APP_FILE",
		hardware: {
			current: null,
			requested: "cpu-basic"
		},
		resources: {
			replicas: 1,
			ports: []
		},
		gcTimeout: null
	},
	siblings: [
		{
			rfilename: ".gitattributes"
		},
		{
			rfilename: "README.md"
		}
	]
};

export const CONFIG_ERROR = {
	_id: "627d3fd94918f2e0b4333354",
	id: "pngwn/clear-inputs",
	author: "pngwn",
	sha: "d8fe24c4d35a195feacdfa9d0cbf6cfa9a7efdfc",
	lastModified: "2022-05-12T17:38:44.000Z",
	private: false,
	cardData: {
		title: "Clear Inputs",
		emoji: "🐢",
		colorFrom: "indigo",
		colorTo: "gray",
		sdk: "gradio",
		sdk_version: "2.9b26",
		app_file: "app.py",
		pinned: false
	},
	gated: false,
	disabled: false,
	subdomain: "pngwn-clear-inputs",
	tags: ["gradio"],
	likes: 0,
	sdk: "gradio",
	runtime: {
		stage: "CONFIG_ERROR",
		errorMessage: "ConfigError: Gradio version does not exist",
		hardware: {
			current: null,
			requested: "cpu-basic"
		},
		spaceId: "pngwn/clear-inputs"
	},
	siblings: [
		{
			rfilename: ".gitattributes"
		},
		{
			rfilename: "README.md"
		},
		{
			rfilename: "app.py"
		}
	]
};

export const RUNTIME_ERROR = {
	_id: "634825a6c241cb6791d3472f",
	id: "pngwn/altair-charts",
	author: "pngwn",
	sha: "f304b7c624bbd9e47a3a6dc59b03986416aa22fa",
	lastModified: "2022-10-13T17:27:52.000Z",
	private: false,
	cardData: {
		title: "Altair Charts",
		emoji: "🚀",
		colorFrom: "green",
		colorTo: "gray",
		sdk: "gradio",
		sdk_version: "3.4.1",
		app_file: "app.py",
		pinned: false
	},
	gated: false,
	disabled: false,
	subdomain: "pngwn-altair-charts",
	tags: ["gradio"],
	likes: 0,
	sdk: "gradio",
	runtime: {
		stage: "RUNTIME_ERROR",
		errorMessage: "launch timed out, space was not healthy after 30 min",
		hardware: {
			current: null,
			requested: "cpu-basic"
		},
		resources: {
			replicas: 1,
			ports: []
		},
		gcTimeout: null
	},
	siblings: [
		{
			rfilename: ".gitattributes"
		},
		{
			rfilename: "README.md"
		},
		{
			rfilename: "app.py"
		},
		{
			rfilename: "requirements.txt"
		}
	]
};
