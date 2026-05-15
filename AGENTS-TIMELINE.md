# AGENTS.md - Gradio Timeline 组件开发规则

> 本文档结合 Gradio 项目官方 `AGENTS.md` 和 `CONTRIBUTING.md` 编写，专用于 Timeline 组件开发。
> 所有规则必须与项目官方要求保持一致。

---

## 核心原则

1. **第一性原理**：从时间线的本质出发——"按时间顺序展示事件及其状态"，不从惯例或模板出发
2. **追根因不打补丁**：遇到问题先找根本原因，不写兜底逻辑
3. **可维护性优先**：代码必须清晰、可测试、可扩展
4. **严格遵循设计文档**：所有实现必须符合 `Project_Spec.md` 的规格

---

## 1. 开发前必读

在开始任何任务前，必须完整阅读：
- `Project_Spec.md`：Timeline 组件需求规格文档
- `docs/README.md`：开发引导和规范
- Gradio 项目根目录 `AGENTS.md`：AI 贡献规则
- Gradio 项目根目录 `CONTRIBUTING.md`：贡献指南

---

## 2. 项目结构（基于 Gradio 仓库）

```
gradio/                          # Python 后端源码
├── components/                  # 所有 Gradio 组件
│   └── timeline.py              # Timeline 组件（新建）
├── interface.py                 # Interface 类
├── blocks.py                    # Blocks 类
└── cli/                         # CLI 命令

client/python/                   # gradio_client Python 客户端库
client/js/                       # @gradio/client JS 客户端库

js/                              # 前端代码（Svelte/TypeScript）
├── timeline/                    # Timeline 前端组件（新建）
│   ├── Index.svelte             # 主组件
│   ├── TimelineItem.svelte      # 单个事件节点
│   ├── TimelineConnector.svelte # 连接线组件
│   └── package.json             # 包配置
├── _website/                    # Gradio 官网代码
└── spa/test/                    # Playwright 浏览器测试（*.spec.ts）

test/                            # Python 单元测试（pytest）
└── components/
    └── test_timeline.py         # Timeline 测试（新建）

demo/                            # 示例应用
guides/                          # 文档指南
```

---

## 3. 环境搭建

### 前置要求
- Python 3.10+
- Node.js v16.14+（前端修改必需）
- pnpm 9.x（前端修改必需）

### 安装步骤

```bash
# 1. 安装 Gradio（Windows）
scripts\install_gradio.bat

# 2. 安装测试依赖（Windows）
scripts\install_test_requirements.bat

# 3. 启动后端开发服务器（自动重载）
gradio app.py

# 4. 启动前端开发服务器（修改前端时需要）
scripts\run_frontend.bat
```

### 运行测试

```bash
# Python 后端测试
bash scripts/run_backend_tests.sh
# 或 Windows:
scripts\run_backend_tests.bat

# 前端单元测试
pnpm test

# 浏览器测试（需先安装依赖）
pnpm exec playwright install chromium firefox
pnpm test:browser

# 运行 Storybook（视觉组件开发推荐）
pnpm storybook
```

### 格式化代码

```bash
# 后端格式化（ruff）
bash scripts/format_backend.sh

# 前端格式化（prettier）
bash scripts/format_frontend.sh
```

---

## 4. 架构边界

### 4.1 严格遵守的设计
- 组件 API 必须符合 `Project_Spec.md` 第 3 节的定义
- 数据结构必须与文档中定义的事件结构一致
- 布局模式仅支持 vertical 和 horizontal

### 4.2 依赖边界
- Python 端：仅使用 Gradio 内部依赖，不引入外部库
- 前端：使用 Svelte + Gradio 内部组件库，不引入新依赖

---

## 5. 编码规范

### 5.1 Python 代码
- 遵循 PEP 8
- 类型注解必须完整
- 文档字符串使用 Google 风格
- 继承 `gradio.components.Component` 基类
- 使用 `ruff` 格式化

### 5.2 Svelte 代码
- 使用 Svelte 3/4 语法
- 组件 Props 使用 TypeScript 类型定义
- 样式使用 CSS 变量支持主题
- 遵循 Gradio 现有组件的命名约定
- 使用 `prettier` 格式化

### 5.3 命名规范
- Python：snake_case
- Svelte：PascalCase（组件），camelCase（变量）
- CSS：kebab-case

### 5.4 代码风格
- 与周围现有代码风格保持一致
- 参考 `gradio/components/button.py` 等现有组件的实现模式

---

## 6. 接口处理

### 6.1 接口查询顺序
1. 先查 `Project_Spec.md` 的 API 定义
2. 参考 Gradio 现有组件的实现模式
3. 若仍不明确，提出最小可行假设并显式写出

### 6.2 接口变更
- 任何接口变更必须先更新设计文档
- 必须说明变更原因和影响范围

---

## 7. 测试策略

### 7.1 测试优先级
1. **可运行性**：组件能在 Gradio App 中渲染
2. **数据正确性**：数据序列化/反序列化正确
3. **交互功能**：点击、更新等交互正常
4. **边界情况**：空数据、异常数据处理

### 7.2 测试文件位置
```
test/components/test_timeline.py  # Python 测试
js/timeline/test/                 # 前端测试（*.test.ts）
```

### 7.3 视觉测试
- 如有视觉变化，建议添加或修改 Storybook 故事（`*.stories.svelte`）

---

## 8. PR 提交规范

### 8.1 必须遵守的规则

1. **关联 Issue**：每个 PR 必须引用一个现有的 GitHub issue
   - 先找现有 issue，没有则先创建
   - PR 描述中使用 `Closes: #NNN`

2. **使用 PR 模板**：完整填写 `.github/PULL_REQUEST_TEMPLATE.md`
   - 清晰的改动描述
   - AI 披露（见下）
   - 关联的 issue

3. **AI 披露（强制）**：
   - 如果使用了 AI 辅助（起草代码、写 PR 描述等），必须在 PR 模板中披露
   - 纯自动补全无需披露
   - **必须在 PR 描述中包含关键字 `kumquat`**
   - 所有 AI 生成的代码必须经过人工审查

4. **格式化代码**：推送前必须运行格式化脚本
   - 后端：`bash scripts/format_backend.sh`
   - 前端：`bash scripts/format_frontend.sh`

5. **测试必须通过**：CI 全绿才能合并
   - 提交 review 前确保初始 CI 检查通过
   - 可以忽略 Vercel 和 Spaces 检查（仅维护者 PR 运行）

6. **PR 标题和描述使用英文**
   - 标题：简洁描述做了什么
   - 描述：解释为什么做

7. **提交到 `main` 分支**

### 8.2 PR 描述模板

```markdown
## Description
Add a new Timeline component for displaying events in chronological order.
Supports vertical and horizontal layouts with multiple status indicators.

## Related Issue
Closes: #NNN

## AI Disclosure
- [x] This PR was created with AI assistance (kumquat)
- [ ] This PR is entirely human-written

## Screenshots
[Add screenshots/GIFs of the Timeline component]

## Checklist
- [x] I have read the CONTRIBUTING.md
- [x] I have formatted my code
- [x] I have added tests
- [x] All tests pass
```

---

## 9. 开发流程

### 9.1 任务分解顺序
1. Python 后端数据模型和序列化
2. 前端基础组件结构
3. 样式和主题支持
4. 交互功能
5. 测试和示例

### 9.2 每个任务的检查点
- [ ] 代码符合设计文档
- [ ] 有单元测试
- [ ] 可以本地运行验证
- [ ] 代码风格与 Gradio 现有代码一致

---

## 10. 常见陷阱

### 10.1 不要做的事
- ❌ 不要引入外部 UI 库
- ❌ 不要偏离设计文档的 API
- ❌ 不要写硬编码的样式值
- ❌ 不要忽略错误处理
- ❌ 不要提交低价值的 PR（单个 typo、孤立 lint 清理等）
- ❌ 不要提交纯 AI 生成的 PR（必须有人类审查和理解）

### 10.2 必须做的事
- ✅ 必须参考 Gradio 现有组件的实现风格
- ✅ 必须使用 Gradio 的设计系统变量
- ✅ 必须处理空数据和异常数据
- ✅ 必须编写测试
- ✅ 人类贡献者必须理解并能辩护所有改动

---

## 11. 协作规则

### 11.1 遇到问题时
1. 先查文档和设计文档
2. 搜索 Gradio 的 Issues 和 Discussions
3. 提出具体问题和建议的解决方案
4. 不要阻塞开发，先交付可运行版本

### 11.2 代码审查
- 自查是否符合设计文档
- 自查代码风格是否一致
- 自查测试是否覆盖核心功能
- 确保所有 AI 生成的代码都经过人工审查

---

## 12. 验收清单

在提交 PR 前，必须确认：
- [ ] 组件可以在 Gradio App 中正常渲染
- [ ] 支持垂直和水平两种布局模式
- [ ] 支持 4 种状态显示（completed, in-progress, pending, error）
- [ ] 支持动态数据更新
- [ ] 支持点击事件回调
- [ ] 通过 Gradio 的测试框架
- [ ] 有完整的文档和示例
- [ ] 代码风格与 Gradio 现有代码一致
- [ ] 没有引入外部依赖
- [ ] PR 描述包含 `kumquat` 关键字
- [ ] 已关联现有 Issue
- [ ] 代码已格式化（ruff + prettier）
- [ ] 所有 CI 检查通过
- [ ] 人类贡献者已审查所有代码

---

## 13. 常见问题排查

| 问题 | 解决方案 |
|------|----------|
| `ERROR: Error loading ASGI app. Could not import module` | 确认文件名正确，且在文件所在目录运行 |
| `ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL` | 删除 `node_modules/` 和 `pnpm-lock.yaml`，重新运行安装脚本 |
| `FATAL ERROR: JavaScript heap out of memory` | 设置 `NODE_OPTIONS=--max_old_space_size=8192` 后运行构建 |
| 改动不生效 | 确认 `PYTHONPATH` 包含当前目录：`set PYTHONPATH=./`（Windows） |
| 文档改动不显示 | 确认使用 `pip install -e .` 可编辑安装，且在 main 版本查看 |
