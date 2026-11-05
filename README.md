# PDF++ 简体中文本地化版

本仓库提供可直接安装的 PDF++ 简体中文版本，并保留完整源码。

- 插件版本：`0.40.31`
- 基于官方仓库及其 `0.40.31` 发布版：https://github.com/RyotaUshio/obsidian-pdf-plus
- 中文翻译参考：https://github.com/Mongfayi/obsidian-pdf-plus-zh
- 官方插件标识仍为 `pdf-plus`，以便 Obsidian 正常识别插件数据。

## 安装

将本仓库下载或克隆到库目录下的 `.obsidian/plugins/pdf-plus/`，确认该目录中有 `main.js`、`manifest.json` 和 `styles.css`，然后在 Obsidian 设置的“第三方插件”中启用 PDF++。如果官方版已安装，请先备份其设置，再替换插件文件；设置数据仍使用 `pdf-plus` 标识。

## 从源码构建

需要 Node.js 和 pnpm。在仓库根目录运行：

```bash
pnpm install --frozen-lockfile
pnpm build
```

构建产物为根目录下的 `main.js`。

## 许可证与来源

PDF++ 原作者及上游项目的版权和许可证信息见 [LICENSE](LICENSE) 与 [THIRD_PARTY_LICENSES](THIRD_PARTY_LICENSES)。本仓库保留原作者信息，并包含简体中文本地化改动。
