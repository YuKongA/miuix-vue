# miuix-vue

将 miuix（Compose Multiplatform UI 库）的**视觉设计语言与动画曲线**移植到 Vue 3，面向 Web。

参考源仓库：`D:\GitHub\miuix\`（兄弟目录）。所有视觉决策必须能追溯到 miuix 源码。

## 三条铁律（不可违反）

1. **样式 / 动画 100% 1:1 还原，不允许"差不多"**。每一个 spring 的 dampingRatio + stiffness、每一个 dp 尺寸、每一条缓动曲线，都必须从 `D:\GitHub\miuix\miuix-ui\src\commonMain\kotlin\top\yukonga\miuix\kmp\` 对应源码**逐字抄过来**。不知道值就去读源码，禁止"调一个差不多的"。
2. **API 风格完全对齐 Vue 生态**，不照搬 Compose：
   - `type` / `size` 用字符串枚举（如 `'primary'` / `'large'`）
   - 状态绑定走 `v-model`
   - 布尔 flag：`disabled` / `loading` / `round` / `clickable`
   - 用 slot 而非 render prop；用 emit 而非 callback prop
   - 主题走 CSS 变量，**绝不暴露 `colors` 对象 prop**
   - 不暴露 `cornerRadius` / `minWidth` / `insideMargin` 这类 prop —— 这些是 CSS 变量定制项，不是单实例 prop
3. **用 `bun create vue@latest` 起项目**，然后改造成 library 模式。**禁止手搓目录结构**。

## 命名

- 包名：`miuix-vue`
- 组件：`MiuixButton`（PascalCase）；短标签 `<m-button>`
- CSS 类前缀：`.m-button`、`.m-button--primary`（BEM）
- CSS 变量前缀：`--m-color-primary`、`--m-radius-md`、`--m-text-button-size`
- Sass 变量前缀：`$m-`（如有）

## 动画参数表（权威，逐字照抄 miuix）

所有 spring 走 `src/composables/useFolmeSpring.ts` 的 `folmeSpring(dampingRatio, stiffness)`。下表数值**不允许四舍五入、不允许微调**：

| 位置                              | 规格                                              |
| :-------------------------------- | :------------------------------------------------ |
| Switch thumb offset               | `folmeSpring(0.7, 987)`                           |
| Switch thumb scale                | `folmeSpring(0.6, 987)`                           |
| Switch track color                | `folmeSpring(0.99, 438.6)`                        |
| Slider progress（拖拽中）         | `folmeSpring(0.9, 1755)`                          |
| Slider progress（静止 / 磁吸）    | `folmeSpring(0.96, 322)`                          |
| Slider thumb scale                | `folmeSpring(0.6, 987)`                           |
| Slider track alpha                | `tween 150ms`，默认 ease                          |
| Card sink                         | `folmeSpring(0.8, 600)`，scale `1.0 → 0.94`       |
| Card tilt                         | `folmeSpring(0.6, 400)`，rotation ±8°             |
| Dialog enter（大屏）              | `folmeSpringByResponse(0.9, 0.3)` → stiffness≈4376 |
| Dialog enter（小屏）              | `folmeSpring(0.88, 450)`                          |
| Dialog dim enter                  | `tween 300ms`, `DecelerateEasing(1.5)`            |
| Dialog dim exit                   | `tween 250ms`, `DecelerateEasing(1.5)`            |
| Dialog exit                       | `tween 260ms`, `DecelerateEasing(1.5)`            |
| TextField borderWidth / Color / labelOffset / labelFontSize | 全部走 Compose `animateXxxAsState` 的默认 spring，实现时若发现观感不对回源码核对 |

hover/press 缩放上限统一为 **1.127**（Switch thumb、Slider thumb）。
Card sink 缩放下限 **0.94**。
Switch 拖拽 coerce 范围 **±21dp**，磁吸阈值 50%（拖拽偏移 > 半程即翻面）。
Slider 磁吸阈值默认 **0.02**（值域的 2%）。

## 触觉反馈

**不实现**。`navigator.vibrate` 在桌面浏览器与 iOS Safari 不支持，跨平台不可能一致。POC / MVP 阶段一律不复刻 miuix 的 haptic，靠 spring 视觉反馈表达交互手感即可。

## 尺寸表（1dp = 1px @ 1x DPR）

| 组件      | 尺寸                                                                          |
| :-------- | :---------------------------------------------------------------------------- |
| Switch    | track 49×28，thumb 20，offset 4（off）/ 25（on），coerce ±21                   |
| Slider    | height 28，keyPoint 半径 3.855，knobR = thumbR × 0.72                         |
| Button    | minW 58，minH 40，padding 16×13，圆角 16                                      |
| TextField | 圆角 16，padding 16×16，border 2（focused）/ 0（unfocused），label 字号 17→10 |
| Card      | 圆角 16，sink 0.94，tilt ±8°，cameraDistance = 12 × density                   |
| Dialog    | 大屏 maxH = windowH × 2/3，小屏 back 手势 scale = 1 - back × 0.2              |

## 4 个自定义缓动曲线

| 名称             | 公式                                  | 说明                             |
| :--------------- | :------------------------------------ | :------------------------------- |
| AccelerateEasing | `x^(2*factor)`，默认 factor=1         | factor 可调                      |
| DecelerateEasing | `1 - (1-x)^(2*factor)`，默认 factor=1 | factor 可调（Dialog dim 用 1.5） |
| SinOutEasing     | `sin(x * π / 2)`                      | -                                |
| MiuixEasing      | folmeSpring 的包装                    | 见 `useFolmeSpring.ts`           |

实现优先级：用 motion-v 的自定义 ease 函数（精度高）；CSS `cubic-bezier()` 近似也接受，但必须保证 `DecelerateEasing(1.5)` 能调 factor。

## 主题

- 仅 Light / Dark 两套（动态色 / Monet / MaterialKolor 不在范围）
- 48 个颜色 token、14 个文字样式 token，全部以 CSS 变量呈现
- Light primary `#3482FF`，Dark primary `#277AF7`
- **其他 token 值**：从 `miuix-ui/src/commonMain/kotlin/top/yukonga/miuix/kmp/theme/Colors.kt` 的 `lightColorScheme()` / `darkColorScheme()` 函数体逐字面量抄过来，禁止"取个相近的"

## 技术栈

- Vue 3.5+、TypeScript、Vite library mode
- **包管理器：Bun**（唯一）。禁止在脚本 / 文档 / workflow 里出现 `npm install` / `pnpm install` / `yarn`。Lockfile 是 `bun.lock`（Bun 1.3+ 文本格式）
- motion-v（唯一动画库，不引入 GSAP / @vueuse/motion）
- Sass（仅 token 文件）
- vite-plugin-dts（生成 `.d.ts`）
- **不引入** Tailwind / UnoCSS / 任何 CSS-in-JS

## 添加 / 修改组件的工作流

1. 读 miuix 对应的 Kotlin 源码：`D:\GitHub\miuix\miuix-ui\src\commonMain\kotlin\top\yukonga\miuix\kmp\`
2. 把每一个尺寸、颜色引用、spring 参数都抠出来
3. 设计 Vue 风格的 API（props/slots/emits），遵守铁律 #2
4. 用 `folmeSpring()` + CSS 变量实现
5. 在 `playground/sections/` 加一段可对照的 demo
6. 跑 miuix `example/`（Android / Desktop），人眼对照观感

## 提交信息（Conventional Commits）

格式：

```
<type>(<scope>): <subject>
```

`<type>` 取值（首字母小写）：

| type       | 用途                                                    |
| :--------- | :------------------------------------------------------ |
| `feat`     | 新功能（新组件 / 新 prop / 新 slot）                    |
| `fix`      | bug 修复                                                |
| `docs`     | 仅文档（README / CLAUDE.md / 注释）                     |
| `style`    | 不影响代码行为的格式化（缩进、空格、引号），**非 CSS**  |
| `refactor` | 不改变外部行为的重构                                    |
| `perf`     | 性能优化                                                |
| `test`     | 仅测试相关                                              |
| `build`    | 构建系统、依赖变更（含 `package.json` / `vite.config`） |
| `chore`    | 杂项（脚手架、版本号、配置）                            |
| `release`  | 发版 commit                                             |

`<scope>` 用**组件短名**（小写），如：`button` / `switch` / `input` / `card` / `surface` / `slider` / `dialog` / `theme` / `anim`。跨组件 / 不针对单一组件时省略 scope。

`<subject>`：

- 英文小写开头，祈使句（"add X" / "fix Y" / "support Z"），不加句号
- ≤ 72 字符

示例：

```
feat(button): support loading slot
feat(switch): add drag-triggered thumb scale spring
fix(slider): correct magnetic snap threshold default
docs: add CLAUDE.md project rules
build: enable vite library mode
refactor(theme): extract color tokens to scss
perf(dialog): defer teleport mount until first open
```

每次 commit 前必须跑：

```bash
bun run format && bun run lint
```

格式错误 / lint 错误的 commit 拒绝合入。

## 包管理器

只允许 Bun。**禁止**在脚本、文档、CI workflow 里出现 `npm install` / `pnpm install` / `yarn`。Lockfile 是 `bun.lock`。
