const api_prefix = "gradio_api";

// endpoints
export const HOST_URL = `${api_prefix}/host`;
export const API_URL = `${api_prefix}/predict/`;
export const SSE_URL_V0 = `queue/join`;
export const SSE_DATA_URL_V0 = `queue/data`;
export const SSE_URL = `${api_prefix}/queue/data`;
export const SSE_DATA_URL = `${api_prefix}/queue/join`;
export const UPLOAD_URL = `${api_prefix}/upload`;
export const LOGIN_URL = `${api_prefix}/login`;
export const CONFIG_URL = `${api_prefix}/config`;
export const API_INFO_URL = `${api_prefix}/info`;
export const RUNTIME_URL = `${api_prefix}/runtime`;
export const SLEEPTIME_URL = `${api_prefix}/sleeptime`;
export const HEARTBEAT_URL = `${api_prefix}/heartbeat`;
export const COMPONENT_SERVER_URL = `${api_prefix}/component_server`;
export const RESET_URL = `${api_prefix}/reset`;
export const CANCEL_URL = `${api_prefix}/cancel`;

export const RAW_API_INFO_URL = `${api_prefix}/info?serialize=False`;
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
export const NODEJS_FS_ERROR_MSG =
	"File system access is only available in Node.js environments";
export const ROOT_URL_ERROR_MSG = "Root URL not found in client config";
export const FILE_PROCESSING_ERROR_MSG = "Error uploading file";
