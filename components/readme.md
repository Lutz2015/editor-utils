# rich-editor

@wangeditor 富文本编辑的再包装, 提供了最基本的初始选项.

# rich-viewer

@wangeditor 所配套携带自定义样式的浏览器.

# tui-editor

tui-editor vue3 包装, 集成了语法高亮.

[完整文档地址](https://github.com/nhn/tui.editor/blob/04d6f8cbacf8aa8b15f481633b7b3c6f96e435ee/apps/editor/README.md)

## 获取 markdown

```vue
<template>
  <TuiEditor ref="editor" @change="handleChange"></TuiEditor>
</template>
<script lang="ts" setup>
import {ref} from 'vue';
import TuiEditor from 'triathlon-utils/components/tui-editor.vue';

const editor = ref();
const data = ref('');

function handleChange() {
  data.value = editor.value.invoke('getMarkdown');
  console.log(data.value);
}
</script>
```

## 上传图片

```vue
<TuiEditor :options="{hooks}"></TuiEditor>
<script lang="ts" setup>
import TuiEditor from 'triathlon-utils/components/tui-editor.vue';
// usePublicRequest 用于示例
import {usePublicRequest} from '@/utils/request';
import {useImageUpload} from 'triathlon-utils/helper/tui-upload';

const {hooks} = useImageUpload(async (form) => {
  const {data, error} = await usePublicRequest('upload').post(form).json<{
    path: string;
  }>();

  if (!error.value && data.value) {
    return data.value.path;
  }
});
</script>
```

# tui-viewer

tui-editor viewer vue3 包装, 集成了语法高亮.

[完整文档地址](https://github.com/nhn/tui.editor/blob/04d6f8cbacf8aa8b15f481633b7b3c6f96e435ee/apps/editor/README.md)

## 渲染

```vue
<template>
  <TuiViewer :initial-value="data"></TuiViewer>
</template>
<script lang="ts" setup>
import {ref} from 'vue';
import TuiViewer from 'triathlon-utils/components/tui-viewer.vue';

const data = ref(`# hello world`);
</script>
```
