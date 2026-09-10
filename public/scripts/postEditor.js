window.createPostEditor = function (form) {
    const editorElement = form.querySelector('#post-editor');
    const contentInput = form.querySelector('input[name="content"]');
    const initialContent = form.querySelector('#initial-content')?.value || '';

    const quill = new Quill(editorElement, {
        theme: 'snow',
        modules: {
            toolbar: [
                ['bold', 'italic', 'underline', 'strike'],
                [{ script: 'super' }],
                ['link'],
                [{ list: 'bullet' }, { list: 'ordered' }],
                ['blockquote', 'code-block'],
            ],
        },
    });

    if (initialContent) {
        quill.clipboard.dangerouslyPasteHTML(initialContent);
    }

    return {
        sync() {
            contentInput.value = quill.getSemanticHTML
                ? quill.getSemanticHTML()
                : quill.root.innerHTML;
        },
        isEmpty() {
            return quill.getText().trim().length === 0;
        },
    };
};