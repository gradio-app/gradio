// endpoints
export const HOST_URL = `host`;
export const API_URL = `predict/`;
export const SSE_URL_V0 = `queue/join`;
export const SSE_DATA_URL_V0 = `queue/data`;
export const SSE_URL = `queue/data`;
export const SSE_DATA_URL = `queue/join`;
export const UPLOAD_URL = `upload`;
export const LOGIN_URL = `login`;
export const CONFIG_URL = `config`;
export const API_INFO_URL = `info`;
export const RUNTIME_URL = `runtime`;
export const SLEEPTIME_URL = `sleeptime`;
export const HEARTBEAT_URL = `heartbeat`;
export const COMPONENT_SERVER_URL = `component_server`;
export const RESET_URL = `reset`;
export const CANCEL_URL = `cancel`;
export const APP_ID_URL = `app_id`;

export const RAW_API_INFO_URL = `info?serialize=False`;
export const SPACE_FETCHER_URL =
	"https://gradio-space-api-fetcher-v2.hf.space/api";
export const SPACE_URL = "https://hf.space/{}";

// messages
export const QUEUE_FULL_MSG =
	"This application is currently busy. Please try again. ";
export const BROKEN_CONNECTION_MSG = "Connection errored out. ";
export const CONFIG_ERROR_MSG = "Could not resolve app config. ";
export const SPACE_STATUS_ERROR_MSG = "Could not get space status. ";
export const API_INFO_ERROR_MSG = "Could not get API info. ";
export const SPACE_METADATA_ERROR_MSG = "Space metadata could not be loaded. ";
export const INVALID_URL_MSG = "Invalid URL. A full URL path is required.";
export const UNAUTHORIZED_MSG = "Not authorized to access this space. ";
export const INVALID_CREDENTIALS_MSG = "Invalid credentials. Could not login. ";
export const MISSING_CREDENTIALS_MSG =
	"Login credentials are required to access this space.";
export const PRIVATE_SPACE_MSG =
	"Could not access this app (received a 401 response). If it is a private Hugging Face Space, pass a valid Hugging Face token to the `token` option of `Client.connect`. You can generate a token at https://huggingface.co/settings/tokens.";
export const SPACE_NOT_FOUND_MSG = (space: string, status: number): string =>
	`Space "${space}" could not be accessed (received a ${status} response from the Hugging Face API). ` +
	"Check that the Space name is spelled correctly and that the Space exists. If the Space is private, " +
	"pass a valid Hugging Face token to the `token` option of `Client.connect`. You can generate a token at https://huggingface.co/settings/tokens.";
export const NO_API_INFO_MSG =
	"No API information is available for this app. This can happen when the app's `/info` endpoint cannot be reached, or when the app is running a legacy version of Gradio that is not supported by this client. ";
export const WS_PROTOCOL_MSG =
	"This app appears to be running a legacy version of Gradio (3.x or earlier) that communicates over WebSockets, which is not supported by this version of @gradio/client. Please upgrade the app to a newer version of Gradio, or connect to it with @gradio/client version 0.x.";
export const NODEJS_FS_ERROR_MSG =
	"File system access is only available in Node.js environments";
export const ROOT_URL_ERROR_MSG = "Root URL not found in client config";
export const FILE_PROCESSING_ERROR_MSG = "Error uploading file";
