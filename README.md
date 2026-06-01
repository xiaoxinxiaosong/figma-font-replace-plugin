# Font Replace One Click · Figma Plugin

一个专门用来批量替换 Figma 页面字体 family 的轻量插件。

## 已支持

- 按当前页面统一替换字体 family
- 把页面中的某个原字体 family 批量替换为目标字体 family
- 字体选择支持搜索
- 兼容同一个文本节点里的混合字体分段

## 使用方式

1. 准备本地依赖

```bash
node ./scripts/ensure-local-deps.mjs
```

2. 构建插件

```bash
node ./scripts/build-plugin.mjs
```

3. 在 Figma Desktop 导入插件

- Plugins
- Development
- Import plugin from manifest…
- 选择当前目录下的 `manifest.json`

4. 在插件面板中：

- 搜索并选择原字体 family
- 搜索并选择目标字体 family
- 点击一键替换

## 目录说明

- `src/code.ts`：主线程逻辑，负责读取文本节点和执行字体替换
- `src/generated/ui-inline.ts`：内联 UI
- `scripts/build-plugin.mjs`：构建脚本
- `scripts/smoke-test-plugin-runtime.mjs`：运行时 smoke test

## Maintainers

- [xiaoxinxiaosong](https://github.com/xiaoxinxiaosong) - Owner and primary maintainer
