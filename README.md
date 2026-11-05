# PDF++ 简体中文本地化版

基于官方 PDF++ **0.40.31**，本地化修订日期 **2026-11-05**。保留官方插件标识 `pdf-plus`、模板语法和设置数据结构。

## 本次修复

- 修复新版 Obsidian 的“页面预览”内部字段变更导致设置页中断、顶部只出现两个导航图标的问题。兼容新版 `options` 与旧版 `overrides`，并保留明确设置为 `false` 的值。
- 补全显示文本格式和复制格式菜单、设置下拉选项、工具栏提示、命令、通知及多处对话框的简体中文。
- 修复未替换的翻译占位符，以及命令在翻译初始化之前创建而显示英文的问题。
- 旧 `data.json` 中未修改的默认格式名称会以中文显示；用户自定义名称、模板内容、颜色标识和链接参数保持原样，不批量改写设置。

## 安装或更新

1. 下载本仓库的 ZIP，并从解压目录取出 `main.js`、`manifest.json`、`styles.css`。
2. 先备份已有插件目录，然后将这三个文件放入目标库的 `.obsidian/plugins/pdf-plus/`。
3. **保留原有 `data.json`**，不要使用其他人的设置覆盖它。
4. 重启 Obsidian，或在第三方插件设置中关闭后重新启用 PDF++。

Obsidian 自带的 PDF 查看器文字沿用应用语言；PDF 正文、代码示例、技术标识、第三方服务名称和用户自定义名称不做全局替换。

## 从源码构建和检查

使用 Node.js 22 与 pnpm 10.28.2：

```bash
pnpm install --frozen-lockfile
pnpm test
pnpm build
```

构建产物是仓库根目录的 `main.js`。回归检查涵盖翻译键和占位符、语言回退、旧模板名称、用户自定义名称和新旧“页面预览”设置结构。

本修订还在独立 Obsidian **1.15.0** 测试库中验证了 31 个设置分区导航、PDF 工具栏的显示文本格式与复制格式菜单，以及多种设置开关状态。此验证不等同于对所有 PDF 编辑功能的完整回归。

## 来源与许可证

- 官方项目与原作者：https://github.com/RyotaUshio/obsidian-pdf-plus （Ryota Ushio）
- 中文本地化参考：https://github.com/Mongfayi/obsidian-pdf-plus-zh
- 本仓库：https://github.com/DavidAdison/obsidian_pdf_plus_zh

保留原作者信息和 MIT 许可证，第三方许可见 [LICENSE](LICENSE) 与 [THIRD_PARTY_LICENSES](THIRD_PARTY_LICENSES)。