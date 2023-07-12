# triathlon-utils

信息安全铁人三项赛跨包共享脚本资源, 本包所存放的脚本, 组件不依赖当前项目, 被设计为可复用在多个不同的项目中.

# src/useFetch

`@vueuse/core@8.2.0` 版本的修改版, 去掉了部分兼容代码, 只可以运行在 vue3 + 浏览器环境.

相较于原版 useFetch, 这个版与原版有两点不同:

1. 此版本会在错误回调中携带 response
2. 此版本提供了一个 ignore400Error 设置, 默认启用, 启用后在返回 400 时会触发失败, 默认 fetch 在服务端响应 400 时不会失败.

# src/useRequest

这个版本是针对 `src/userFetch` 的包装, 提供:

1. 请求校验回调
2. 服务器响应 400 后回调
3. 错误后自动弹窗.

这个文件依赖 vite 编译上下文, 依赖 element-plus.

# src/now

获取系统高精度时间或者回退到 `Date.now()`

# src/useCountdown

带有与服务端同步时钟功能的倒计时器.

# src/loop

带有开闭控制的异步轮询器

# helper/toQueryParams

一个针对 `URLSearchParams` 包装的小工具, 在确保 `URLSearchParams` 类型安全的同时也可以避免默认强制值为 `string` 类型.

# helper/editor-upload

提供了 @wangeditor 编辑器图片上传菜单配置逻辑的基本封装.

# types/FormRulesMap

用于 element-plus 的表单校验对象的类型声明.
