let async_mode_flag = false;
let legacy_mode_flag = false;
let tracing_mode_flag = false;

function enable_async_mode_flag() {
	async_mode_flag = true;
}

function enable_legacy_mode_flag() {
	legacy_mode_flag = true;
}

function enable_tracing_mode_flag() {
	tracing_mode_flag = true;
}

export { enable_legacy_mode_flag as a, enable_tracing_mode_flag as b, async_mode_flag as c, enable_async_mode_flag as e, legacy_mode_flag as l, tracing_mode_flag as t };
