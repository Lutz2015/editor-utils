<template>
  <div ref="editorEl"></div>
</template>
<script lang="ts" setup>
import 'prismjs/themes/prism.css';
import '@toast-ui/editor-plugin-code-syntax-highlight/dist/toastui-editor-plugin-code-syntax-highlight.css';
import '@toast-ui/editor/dist/i18n/zh-cn';
import '@toast-ui/editor/dist/toastui-editor.css';
import Prism from 'prismjs';
import codeSyntaxHighlight from '@toast-ui/editor-plugin-code-syntax-highlight';
import Editor, {type PreviewStyle, EditorType, EditorOptions} from '@toast-ui/editor';
import {ref, onMounted, onUnmounted, watch} from 'vue';

const props = withDefaults(
  defineProps<{
    previewStyle?: PreviewStyle;
    height?: string;
    initialEditType?: EditorType;
    initialValue?: string;
    options?: Pick<
      EditorOptions,
      Exclude<
        keyof EditorOptions,
        'el' | 'previewStyle' | 'height' | 'initialEditType' | 'initialValue'
      >
    >;
  }>(),
  {
    previewStyle: 'vertical',
    height: '300px',
    initialValue: '',
    initialEditType: 'markdown',
    options: () => {
      return {
        plugins: [[codeSyntaxHighlight, {highlighter: Prism}]],
        language: 'zh-CN',
      };
    },
  }
);

const emit = defineEmits<{
  (e: 'load'): void;
  (e: 'change'): void;
  (e: 'caretChange'): void;
  (e: 'focus'): void;
  (e: 'blur'): void;
  (e: 'keyup'): void;
  (e: 'keydown'): void;
  // (e: 'beforePreviewRender'): void;
  // (e: 'beforeConvertWysiwygToMarkdown'): void;
}>();

const editorEl = ref<HTMLElement | null>(null);
let editor: Editor;

const eventMap = {
  load: () => emit('load'),
  change: () => emit('change'),
  caretChange: () => emit('caretChange'),
  focus: () => emit('focus'),
  blur: () => emit('blur'),
  keyup: () => emit('keyup'),
  keydown: () => emit('keydown'),
  // beforePreviewRender: () => {
  //   emit('beforePreviewRender');
  // },
  // beforeConvertWysiwygToMarkdown: () => {
  //   emit('beforeConvertWysiwygToMarkdown');
  // },
};

onMounted(() => {
  if (editorEl.value) {
    const {options, ...restOptions} = props;

    editor = new Editor({
      el: editorEl.value,
      events: eventMap,
      ...restOptions,
      ...options,
    });
  }
});

onUnmounted(() => {
  for (const eventName of Object.keys(eventMap)) {
    editor.off(eventName);
  }
  editor.destroy();
});

defineExpose({
  invoke<T extends Exclude<keyof Editor, 'eventEmitter'>>(
    methodName: T,
    ...args: Parameters<Editor[T]>
  ): ReturnType<Editor[T]> {
    if (editor) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return editor[methodName](...args);
    }

    throw new Error('editor instance not found!');
  },
  getRootElement() {
    return editor;
  },
});

watch(
  () => props.initialValue,
  (value) => {
    if (editor) {
      editor.setMarkdown(value);
    }
  }
);

watch(
  () => props.previewStyle,
  (value) => {
    if (editor) {
      editor.changePreviewStyle(value);
    }
  }
);

watch(
  () => props.height,
  (height) => {
    if (editor) {
      editor.setHeight(height);
    }
  }
);
</script>
