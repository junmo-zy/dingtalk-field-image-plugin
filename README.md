# 钉钉 AI 生图字段插件

基于钉钉 AI 表格的字段模板插件，支持**文生图**和**图生图**，调用 [AIFY](https://aivip.link) 平台的 NanoBanana2 模型，生成结果直接写入附件字段。

---

## 功能特性

- **文生图**：输入提示词，生成对应图片
- **图生图**：可选上传参考图，引导生成风格
- **多宽高比**：1:1 / 9:16 / 16:9 / 4:3 / 3:2 / 21:9 等 10 种比例
- **多分辨率**：1K / 2K / 4K 可选
- **异步轮询**：自动等待任务完成，最长支持 3 分钟
- **多语言**：支持中文 / English / 日本語

## 效果预览

| 配置面板 | 生成结果 |
|---------|---------|
| 选择提示词字段、宽高比、分辨率 | 图片自动写入附件列 |

---

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置本地调试授权

在项目根目录创建 `config.json`（已加入 `.gitignore`，不会提交）：

```json
{
  "authorizations": "your_aify_api_key"
}
```

> 前往 [https://aivip.link/dashboard/apikey](https://aivip.link/dashboard/apikey) 获取 API Key

### 3. 本地启动调试

```bash
npm run start
```

### 4. 构建发布包

```bash
npm run build
```

---

## 参数说明

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| 图片生成提示词 | 文本 / 字段引用 | ✅ | 描述要生成的图片内容 |
| 参考图 | 附件字段 | ❌ | 图生图的参考图片，最多 5 张 |
| 宽高比 | 单选 | ❌ | 默认 1:1 |
| 分辨率 | 单选 | ❌ | 默认 1K，4K 消耗积分翻倍 |

**返回类型**：附件（图片）

---

## 授权配置

插件使用 `Authorization: Bearer <API_KEY>` 方式鉴权。

用户在钉钉 AI 表格插件配置面板中填入自己的 AIFY API Key，框架自动注入请求头，无需手动处理。

---

## 技术栈

- **运行时**：Node.js 16.x
- **开发框架**：[dingtalk-docs-cool-app](https://www.npmjs.com/package/dingtalk-docs-cool-app)
- **AI 模型**：NanoBanana2（via [aivip.link](https://aivip.link)）
- **语言**：TypeScript
