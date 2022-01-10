<script>
    export let load, filetype, theme;
    export let single_file = true;
    export let include_file_metadata = true;
    let hidden_upload;

    const openFileUpload = () => {
        hidden_upload.click();
    };
    const loadFiles = (files) => {
        if (!files.length || !window.FileReader) {
            return;
        }
        if (single_file) {
            files = [files[0]];
        }
        var all_file_data = [];
        files.forEach((file, i) => {
            let ReaderObj = new FileReader();
            ReaderObj.readAsDataURL(file);
            ReaderObj.onloadend = function (e) {
                all_file_data[i] = include_file_metadata
                    ? {
                          name: file.name,
                          size: file.size,
                          data: this.result,
                          is_example: false,
                      }
                    : this.result;
                if (Object.keys(all_file_data).length === files.length) {
                    load(single_file ? all_file_data[0] : all_file_data);
                }
            };
        });
    };
    const loadFilesFromUpload = (e) => {
        loadFiles(e.target.files);
    };
    const loadFilesFromDrop = (e) => {
        loadFiles(e.dataTransfer.files);
    };
</script>

<div
    class="upload h-60 border-gray-300 text-gray-400 dark:text-gray-500 dark:border-gray-500 border-8 border-dashed w-full flex justify-center items-center text-3xl text-center cursor-pointer leading-10"
    {theme}
    on:drag|preventDefault|stopPropagation
    on:dragstart|preventDefault|stopPropagation
    on:dragend|preventDefault|stopPropagation
    on:dragover|preventDefault|stopPropagation
    on:dragenter|preventDefault|stopPropagation
    on:dragleave|preventDefault|stopPropagation
    on:drop|preventDefault|stopPropagation
    on:click={openFileUpload}
    on:drop={loadFilesFromDrop}
>
    <slot />
    <input
        class="hidden-upload hidden"
        type="file"
        bind:this={hidden_upload}
        on:change={loadFilesFromUpload}
        accept={filetype}
    />
</div>

<style lang="postcss">
    .upload[theme="default"] {
        @apply transition hover:border-gray-400 hover:text-gray-500 dark:hover:border-gray-300 dark:hover:text-gray-300;
    }
</style>
