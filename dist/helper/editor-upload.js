export function createImageUpload(upload) {
    return async function customUpload(file, insertFn) {
        const form = new FormData();
        form.append('file', file);
        const data = await upload(form);
        if (data) {
            insertFn(data.path, data.filename, data.filename);
        }
    };
}
export function createImageUploadConfig(upload) {
    return {
        MENU_CONF: {
            uploadImage: {
                customUpload: createImageUpload(upload),
            },
        },
    };
}
