import {
	ApiInfo,
	ClientOptions,
	Config,
	JsApiData,
	SpaceStatus,
	Status,
	SubmitReturn,
	UploadResponse,
	client_return
} from "./types";
import { view_api } from "./utils/view_api";
import { upload_files } from "./utils/upload_files";
import { handle_blob } from "./utils/handle_blob";
import { post_data } from "./utils/post_data";
import { predict } from "./utils/predict";
import { submit } from "./utils/submit";
import {
	RE_SPACE_NAME,
	map_names_to_ids,
	process_endpoint,
	resolve_config
} from "./helpers";
import { check_space_status } from "./helpers/spaces";

export class NodeBlob extends Blob {
	constructor(blobParts?: BlobPart[], options?: BlobPropertyBag) {
		super(blobParts, options);
	}
}

export class Client {
	app_reference: string;
	options: ClientOptions;

	config!: Config;
	api!: ApiInfo<JsApiData>;
	api_map: Record<string, number> = {};
	session_hash: string = Math.random().toString(36).substring(2);
	jwt: string | false = false;
	last_status: Record<string, Status["stage"]> = {};

	view_api: (this: Client, config?: Config) => Promise<ApiInfo<JsApiData>>;
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
		data?: unknown[],
		event_data?: unknown,
		trigger_id?: any
	) => SubmitReturn;
	predict: (
		endpoint: string | number,
		data?: unknown[],
		event_data?: unknown
	) => Promise<any>;

	private constructor(app_reference: string, options: ClientOptions = {}) {
		this.app_reference = app_reference;
		this.options = options;

		this.view_api = view_api.bind(this);
		this.upload_files = upload_files.bind(this);
		this.handle_blob = handle_blob.bind(this);
		this.post_data = post_data.bind(this);
		this.submit = submit.bind(this);
		this.predict = predict.bind(this);
	}

	private async init(): Promise<void> {
		this.config = await this._resolve_config();
		this.api = await this.view_api(this.config);
		this.api_map = map_names_to_ids(this.config?.dependencies || []);
	}

	static async create(
		app_reference: string,
		options: ClientOptions
	): Promise<Client> {
		const client = new Client(app_reference, options);
		await client.init();
		return client;
	}

	private async _resolve_config(): Promise<any> {
		const { http_protocol, host, space_id } = await process_endpoint(
			this.app_reference,
			this.options.hf_token
		);

		const { hf_token, status_callback } = this.options;
		let config: Config | undefined;

		try {
			config = await resolve_config(
				fetch,
				`${http_protocol}//${host}`,
				hf_token
			);

			if (!config) {
				throw new Error("No config or app_id set");
			}

			return this.config_success(config);
		} catch (e) {
			console.error(e);
			if (space_id) {
				check_space_status(
					space_id,
					RE_SPACE_NAME.test(space_id) ? "space_name" : "subdomain",
					this.handle_space_success.bind(this)
				);
			} else {
				if (status_callback)
					status_callback({
						status: "error",
						message: "Could not load this space.",
						load_status: "error",
						detail: "NOT_FOUND"
					});
			}
		}
	}

	private async config_success(
		_config: Config
	): Promise<Config | client_return> {
		this.config = _config;

		if (
			typeof window !== "undefined" &&
			window.location.protocol === "https:"
		) {
			this.config.root = this.config.root.replace("http://", "https://");
		}

		this.api_map = map_names_to_ids(_config.dependencies || []);

		if (this.config.auth_required) {
			return this.prepare_return_obj();
		}

		try {
			this.api = await this.view_api(this.config);
		} catch (e) {
			console.error(`Could not get API details: ${(e as Error).message}`);
		}

		return { ...this.config };
	}

	async handle_space_success(status: SpaceStatus): Promise<Config | void> {
		const { status_callback } = this.options;
		if (status_callback) status_callback(status);
		if (status.status === "running") {
			try {
				this.config = await this._resolve_config();
				const config_result = await this.config_success(this.config);
				return config_result as Config;
			} catch (e) {
				console.error(e);
				if (status_callback) {
					status_callback({
						status: "error",
						message: "Could not load this space.",
						load_status: "error",
						detail: "NOT_FOUND"
					});
				}
			}
		}
	}

	public async component_server(
		component_id: number,
		fn_name: string,
		data: unknown[]
	): Promise<unknown> {
		const headers: {
			Authorization?: string;
			"Content-Type": "application/json";
		} = { "Content-Type": "application/json" };

		if (this.options.hf_token) {
			headers.Authorization = `Bearer ${this.options.hf_token}`;
		}
		let root_url: string;
		let component = this.config.components.find(
			(comp) => comp.id === component_id
		);
		if (component?.props?.root_url) {
			root_url = component.props.root_url;
		} else {
			root_url = this.config.root;
		}
		const response = await fetch(`${root_url}/component_server/`, {
			method: "POST",
			body: JSON.stringify({
				data: data,
				component_id: component_id,
				fn_name: fn_name,
				session_hash: this.session_hash
			}),
			headers
		});

		if (!response.ok) {
			throw new Error(
				"Could not connect to component server: " + response.statusText
			);
		}

		const output = await response.json();
		return output;
	}

	private prepare_return_obj(): client_return {
		return {
			predict: this.predict,
			submit: this.submit,
			view_api: this.view_api,
			component_server: this.component_server
		};
	}
}

export type ClientInstance = Client;
