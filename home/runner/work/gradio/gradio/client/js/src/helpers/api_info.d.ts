import type { ApiData, ApiInfo, Config, JsApiData, EndpointInfo, Status } from "../types";
export declare const RE_SPACE_NAME: RegExp;
export declare const RE_SPACE_DOMAIN: RegExp;
export declare function process_endpoint(app_reference: string, hf_token?: `hf_${string}`): Promise<{
    space_id: string | false;
    host: string;
    ws_protocol: "ws" | "wss";
    http_protocol: "http:" | "https:";
}>;
export declare const join_urls: (...urls: string[]) => string;
export declare function transform_api_info(api_info: ApiInfo<ApiData>, config: Config, api_map: Record<string, number>): ApiInfo<JsApiData>;
export declare function get_type(type: {
    type: any;
    description: string;
}, component: string, serializer: string, signature_type: "return" | "parameter"): string | undefined;
export declare function get_description(type: {
    type: any;
    description: string;
}, serializer: string): string;
export declare function handle_message(data: any, last_status: Status["stage"]): {
    type: "hash" | "data" | "update" | "complete" | "generating" | "log" | "none" | "heartbeat" | "streaming" | "unexpected_error";
    data?: any;
    status?: Status;
    original_msg?: string;
};
/**
 * Maps the provided `data` to the parameters defined by the `/info` endpoint response.
 * This allows us to support both positional and keyword arguments passed to the client
 * and ensures that all parameters are either directly provided or have default values assigned.
 *
 * @param {unknown[] | Record<string, unknown>} data - The input data for the function,
 *        which can be either an array of values for positional arguments or an object
 *        with key-value pairs for keyword arguments.
 * @param {JsApiData[]} parameters - Array of parameter descriptions retrieved from the
 *        `/info` endpoint.
 *
 * @returns {unknown[]} - Returns an array of resolved data where each element corresponds
 *         to the expected parameter from the API. The `parameter_default` value is used where
 *         a value is not provided for a parameter, and optional parameters without defaults are
 * 		   set to `undefined`.
 *
 * @throws {Error} - Throws an error:
 *         - If more arguments are provided than are defined in the parameters.
 *  *      - If no parameter value is provided for a required parameter and no default value is defined.
 *         - If an argument is provided that does not match any defined parameter.
 */
export declare const map_data_to_params: (data: (unknown[] | Record<string, unknown>) | undefined, endpoint_info: EndpointInfo<JsApiData | ApiData>) => unknown[];
