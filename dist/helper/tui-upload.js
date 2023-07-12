"use strict";
// import {markRaw} from 'vue';
// export function useImageUpload(upload: (file: FormData) => Promise<string | undefined>) {
//   function addImageBlobHook(blob: Blob | File, callback: (url: string) => void) {
//     const form = new FormData();
//     form.append('file', blob);
//     upload(form).then(callback, (error) => {
//       // eslint-disable-next-line @typescript-eslint/no-unused-vars
//       callback = null;
//       throw new Error(error);
//     });
//   }
//   return markRaw({
//     addImageBlobHook,
//     hooks: {
//       addImageBlobHook,
//     },
//   });
// }
