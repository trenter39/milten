window.createRichTextEditor = function ({ editorElement, contentInput, initialContent = '' }) {
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
        clear() {
            quill.setText('');
            this.sync();
        },
        focus() {
            quill.focus();
        },
        setContent(content) {
            quill.setText('');
            if (content) quill.clipboard.dangerouslyPasteHTML(content);
            this.sync();
        },
    };
};

window.createPostEditor = function (form) {
    return window.createRichTextEditor({
        editorElement: form.querySelector('#post-editor'),
        contentInput: form.querySelector('input[name="content"]'),
        initialContent: form.querySelector('#initial-content')?.value || '',
    });
};