import { IEditorConfig } from '@wangeditor/editor';
export declare function createImageUpload(upload: (form: FormData) => Promise<{
    filename: string;
    path: string;
} | void>): (file: File, insertFn: any) => Promise<void>;
export declare function createImageUploadConfig(upload: (form: FormData) => Promise<{
    filename: string;
    path: string;
} | void>): Partial<IEditorConfig>;
