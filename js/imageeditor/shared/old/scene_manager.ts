import {
	Container,
	RenderTexture,
	Sprite,
	Filter,
	Color,
	Texture,
	type IRenderer
} from "pixi.js";
import { type Command, make_graphics } from "./commands";
import { erase_shader } from "./utils";
