// endpoints
export const HOST_URL = "host";
export const API_URL = "api/predict/";
export const SSE_URL_V0 = "queue/join";
export const SSE_DATA_URL_V0 = "queue/data";
export const SSE_URL = "queue/data";
export const SSE_DATA_URL = "queue/join";
export const UPLOAD_URL = "upload";
export const LOGIN_URL = "login";
export const CONFIG_URL = "config";
export const API_INFO_URL = "info";
export const RUNTIME_URL = "runtime";
export const SLEEPTIME_URL = "sleeptime";
export const RAW_API_INFO_URL = "info?serialize=False";
export const SPACE_FETCHER_URL =
	"https://gradio-space-api-fetcher-v2.hf.space/api";
export const RESET_URL = "reset";
export const SPACE_URL = "https://hf.space/{}";

// messages
export const QUEUE_FULL_MSG =
	"This application is currently busy. Please try again. ";
export const BROKEN_CONNECTION_MSG = "Connection errored out. ";
export const CONFIG_ERROR_MSG = "Could not resolve app config. ";
export const SPACE_STATUS_ERROR_MSG = "Could not get space status. ";
export const API_INFO_ERROR_MSG = "Could not get API info. ";
export const SPACE_METADATA_ERROR_MSG = "Space metadata could not be loaded. ";
