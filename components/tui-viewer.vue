<template>
  <div :class="ViewerClass.viewer" ref="viewerEl"></div>
</template>
<script setup lang="ts">
import 'prismjs/themes/prism.css';
import '@toast-ui/editor-plugin-code-syntax-highlight/dist/toastui-editor-plugin-code-syntax-highlight.css';
import '@toast-ui/editor/dist/toastui-editor-viewer.css';
import ViewerClass from './tui-viewer.module.css';
import {ref, onMounted, onUnmounted, watch} from 'vue';
import Prism from 'prismjs';
import codeSyntaxHighlight from '@toast-ui/editor-plugin-code-syntax-highlight';
import Viewer, {type ViewerOptions} from '@toast-ui/editor/dist/toastui-editor-viewer';
import {ZoomImage} from './tui-plugins/zoomImage';

const props = withDefaults(
  defineProps<{
    initialValue?: string;
    options?: Pick<ViewerOptions, Exclude<keyof ViewerOptions, 'el' | 'height' | 'initialValue'>>;
  }>(),
  {
    height: '300px',
    initialValue: '',
    options: () => {
      return {
        plugins: [[codeSyntaxHighlight, {highlighter: Prism}], ZoomImage],
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
}>();

const eventMap = {
  load: () => emit('load'),
  change: () => emit('change'),
  caretChange: () => emit('caretChange'),
  focus: () => emit('focus'),
  blur: () => emit('blur'),
};

const viewerEl = ref<HTMLElement>();
let viewer: Viewer;

defineExpose({
  invoke<T extends keyof Viewer>(
    methodName: T,
    ...args: Parameters<Viewer[T]>
  ): ReturnType<Viewer[T]> {
    if (viewer) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return viewer[methodName](...args);
    }

    throw new Error('editor instance not found!');
  },
  getRootElement() {
    return viewer;
  },
});

onMounted(() => {
  const {options, ...restOptions} = props;

  if (viewerEl.value) {
    viewer = new Viewer({
      el: viewerEl.value,
      events: eventMap,
      ...restOptions,
      ...options,
    });
  }
});

onUnmounted(() => {
  for (const eventName of Object.keys(eventMap)) {
    viewer.off(eventName);
  }
  viewer.destroy();
});

watch(
  () => props.initialValue,
  (value) => {
    viewer.setMarkdown(value);
  }
);
</script>
