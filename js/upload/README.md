# `@gradio/upload`

```html
<script>
    import { Upload, ModifyUpload, normalise_file, get_fetchable_url_or_file, upload, prepare_files } from "@gradio/upload";
</script>
```

Upload
```javascript
	export let filetype: string | null = null;
	export let dragging = false;
	export let boundedheight = true;
	export let center = true;
	export let flex = true;
	export let file_count = "single";
	export let disable_click = false;
	export let root: string;
	export let hidden = false;
```

ModifyUpload
```javascript
    export let editable = false;
	export let undoable = false;
	export let absolute = true;
	export let i18n: I18nFormatter;
```

```javascript
export function normalise_file(
	file: FileData | null,
	server_url: string,
	proxy_url: string | null
): FileData | null;

export function normalise_file(
	file: FileData[] | null,
	server_url: string,
	proxy_url: string | null
): FileData[] | null;

export function normalise_file(
	file: FileData[] | FileData | null,
	server_url: string, // root: string,
	proxy_url: string | null // root_url: string | null
): FileData[] | FileData | null;

export function normalise_file(
	file: FileData[] | FileData | null,
	server_url: string, // root: string,
	proxy_url: string | null // root_url: string | null
): FileData[] | FileData | null;

export function get_fetchable_url_or_file(
	path: string | null,
	server_url: string,
	proxy_url: string | null
): string

export async function upload(
	file_data: FileData[],
	root: string,
	upload_fn: typeof upload_files = upload_files
): Promise<(FileData | null)[] | null>

export async function prepare_files(
	files: File[],
	is_stream?: boolean
): Promise<FileData[]> {
	return files.map(
		(f, i) =>
			new FileData({
				path: f.name,
				orig_name: f.name,
				blob: f,
				size: f.size,
				mime_type: f.type,
				is_stream
			})
	);
}
```