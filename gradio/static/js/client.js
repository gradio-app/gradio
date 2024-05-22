// This code snippet is responsible for emitting an event to the backend when a file is removed from a `gr.File` component.

document.addEventListener("DOMContentLoaded", function() {
    const fileInputs = document.querySelectorAll('.file_input');

    fileInputs.forEach(input => {
        input.addEventListener('change', function(e) {
            if (e.target.files.length === 0) { // No file is selected, which means a file was removed
                const event = new CustomEvent('fileRemoved', { detail: { fileName: e.target.getAttribute('data-file-name') } });
                document.dispatchEvent(event);
            }
        });
    });
});
