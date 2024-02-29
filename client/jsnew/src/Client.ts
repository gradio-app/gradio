import {
	ApiInfo,
	ClientOptions,
	Config,
	JsApiData,
	Status,
	SubmitReturn,
	UploadResponse
} from "./types";
import { view_api } from "./utils/view_api";
import { upload_files } from "./utils/upload_files";
import { handle_blob } from "./utils/handle_blob";
import { post_data } from "./utils/post_data";
import { predict } from "./utils/predict";
import { submit } from "./utils/submit";
import { map_names_to_ids, process_endpoint, resolve_config } from "./helpers";

export class NodeBlob extends Blob {
	constructor(blobParts?: BlobPart[], options?: BlobPropertyBag) {
		super(blobParts, options);
	}
}

export class Client {
	app_reference: string;
	options: ClientOptions;

	public config?: Config;
	api?: ApiInfo<JsApiData>;
	api_map: Record<string, number> = {};
	session_hash: string = Math.random().toString(36).substring(2);
	jwt: string | false = false;
	last_status: Record<string, Status["stage"]> = {};

	view_api: (config?: Config) => Promise<ApiInfo<JsApiData>>;
	upload_files: (
		root: string,
		files: (Blob | File)[],
		token?: `hf_${string}`,
		upload_id?: string
	) => Promise<UploadResponse>;
	handle_blob: (
		endpoint: string,
		data: unknown[],
		api_info: any,
		token?: `hf_${string}`
	) => Promise<unknown[]>;
	post_data: (
		endpoint: string,
		data: unknown[],
		api_info: any,
		token?: `hf_${string}`
	) => Promise<unknown[]>;
	submit: (
		endpoint: string | number,
		data: unknown[],
		event_data: unknown,
		trigger_id: number | null
	) => Promise<SubmitReturn>;
	predict: (
		endpoint: string | number,
		data: unknown[],
		event_data?: unknown
	) => Promise<any>;

	constructor(app_reference: string, options: ClientOptions = {}) {
		this.app_reference = app_reference;
		this.options = options;

		this.view_api = view_api.bind(this);
		this.upload_files = upload_files.bind(this);
		this.handle_blob = handle_blob.bind(this);
		this.post_data = post_data.bind(this);
		this.submit = submit.bind(this);
		this.predict = predict.bind(this);

		this.initialize_client_vars();
	}

	async initialize_client_vars(): Promise<void> {
		const { hf_token } = this.options;

		const { http_protocol, host } = await process_endpoint(
			this.app_reference,
			hf_token ? `hf_${hf_token}` : undefined
		);

		try {
			this.config = await resolve_config(
				fetch,
				`${http_protocol}//${host}`,
				this.options.hf_token
			);

			this.session_hash = Math.random().toString(36).substring(2);
			this.api_map = map_names_to_ids(this.config?.dependencies || []);
			this.last_status = {};
		} catch (e) {
			throw new Error("Could not get config. " + (e as Error).message);
		}
	}
}
