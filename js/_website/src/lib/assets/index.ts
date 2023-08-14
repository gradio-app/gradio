export { default as gradio_logo } from "./gradio.svg";
export { default as twitter } from "./img/twitter.svg";
export { default as github } from "./img/github.svg";
export { default as github_black } from "./img/github-black.svg";

import google from "./logos/google.svg";
import amazon from "./logos/amazon.svg";
import fb from "./logos/fb.svg";
import cisco from "./logos/cisco.svg";
import twitter from "./logos/twitter.svg";
import vm from "./logos/vmware.svg";
import hf from "./logos/huggingface.svg";
import siemens from "./logos/siemens.svg";
import mit from "./logos/mit-svg-50.png";
import stanford from "./logos/stanford.svg";
import uipath from "./logos/uipath.svg";
import unify from "./logos/unifyid.svg";
import humans from "./logos/humaniseai.svg";
import factmata from "./logos/factmata.svg";
import wns from "./logos/wns.png";

import _tweets from "./tweets.json";

export const logos = [
	{ img: google, contrast: false, description: "Google Logo" },
	{ img: amazon, contrast: true, description: "Amazon logo" },
	{ img: fb, contrast: false, description: "Facebook logo" },
	{ img: cisco, contrast: false, description: "CISCO logo" },
	{ img: twitter, contrast: false, description: "Twitter logo" },
	{ img: vm, contrast: false, description: "VMwarelogo" },
	{ img: hf, contrast: false, description: "Hugging Face logo" },
	{ img: siemens, contrast: false, description: "Siemens logo" },
	{ img: mit, contrast: true, description: "MIT logo" },
	{ img: stanford, contrast: false, description: "Stanford logo" },
	{ img: uipath, contrast: false, description: "UI Path logo" },
	{ img: unify, contrast: false, description: "UnifyID logo" },
	{ img: humans, contrast: true, description: "Humanise AI logo" },
	{ img: factmata, contrast: true, description: "Factmata logo" },
	{ img: wns, contrast: true, description: "WNS logo" }
];

export const twitter_pics = (
	Object.entries(import.meta.glob("./twitter/**", { eager: true })) as [
		string,
		{ default: string }
	][]
).reduce(
	(a, [k, mod]) => {
		a[k.replace("./twitter/", "")] = mod.default;
		return a;
	},
	{} as Record<string, string>
);

export const tweets = _tweets.map((x) => ({
	...x,
	profile_pic: twitter_pics[x.profile_pic]
}));
