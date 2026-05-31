# miuix-vue

将 miuix（Compose Multiplatform UI 库）的**视觉设计语言与动画曲线**移植到 Vue 3，面向 Web。

参考源仓库：`../miuix/`（与本项目同级的兄弟目录）。所有视觉决策必须能追溯到 miuix 源码。

## 三条铁律（不可违反）

1. **样式 / 动画 100% 1:1 还原，不允许"差不多"**。每一个 spring 的 dampingRatio + stiffness、每一个 dp 尺寸、每一条缓动曲线，都必须从 `../miuix/miuix-ui/src/commonMain/kotlin/top/yukonga/miuix/kmp/` 对应源码**逐字抄过来**。不知道值就去读源码，禁止"调一个差不多的"。
2. **API 风格完全对齐 Vue 生态**，不照搬 Compose：
   - `type` / `size` 用字符串枚举（如 `'primary'` / `'large'`）
   - 状态绑定走 `v-model`
   - 布尔 flag：`disabled` / `loading` / `round` / `clickable`
   - 用 slot 而非 render prop；用 emit 而非 callback prop
   - 主题走 CSS 变量，**绝不暴露 `colors` 对象 prop**
   - 不暴露 `cornerRadius` / `minWidth` / `insideMargin` 这类 prop —— 这些是 CSS 变量定制项，不是单实例 prop
3. **目录结构由 `bun create vue@latest` 脚手架起底、再改造成 library 模式（已完成）**。后续新增 / 调整沿用既有约定（见「目录结构」），**禁止手搓 / 另起炉灶**。

## 命名

- 包名：`miuix-vue`
- 组件：`MiuixButton`（PascalCase）；短标签 `<m-button>`
- CSS 类前缀：`.m-button`、`.m-button--primary`（BEM）
- CSS 变量前缀：`--m-color-primary`、`--m-radius-md`、`--m-text-button-size`
- Sass 变量前缀：`$m-`（目前只用 CSS 变量，无 Sass 变量）

## 目录结构

```
src/
  index.ts              # 总出口（barrel）：全部组件 + 主题/动画 API + version
  anim/                 # folmeSpring.ts（spring→motion-v 换算）、easings.ts（公式型曲线）、index.ts
  theme/                # tokens.scss（全部 CSS 变量）、index.ts（setTheme/setThemeMode/useTheme）
  icons/                # index.ts（基础图标，内部用）、extended/（生成的扩展包，独立构建入口）
  components/<name>/     # 每个组件 = <Component>.vue + index.ts
example/                # 多页 demo：App.vue + pages/*.vue + components/FpsMonitor.vue + appState.ts
scripts/                # generate-extended-icons.mjs（生成扩展图标包）
```

- **两个构建入口**：`miuix-vue`（核心，~88KB，不含图标数据）+ `miuix-vue/icons`（扩展包，~1.3MB，按需引）。
- 每个组件目录一律 `Component.vue` + `index.ts`；新增组件后到 `src/index.ts` 补出口。

## 组件清单（33 个公开组件，均已实现 + 构建通过）

- **基础**：Button、IconButton、FloatingActionButton、Card、Surface、BasicComponent、Text、SmallTitle、Divider、Icon
- **表单 / 输入**：Switch、Slider、RangeSlider、Input（完整 TextField + 浮动 label）、Checkbox、RadioButton、NumberPicker、ColorPicker（仅 HSV）、SearchBar
- **Preference 行**（对应 miuix `*Preference`）：SwitchPreference、ArrowPreference、CheckboxPreference、RadioButtonPreference、DropdownPreference、SpinnerPreference
- **导航 / 容器**：TopAppBar、NavigationBar、TabRow、BottomSheet、Dialog、ScrollArea
- **反馈**：ProgressIndicator（linear / circular / infinite）、Snackbar（`MiuixSnackbarHost` + 命令式 `showSnackbar` / `dismiss*`）

> ColorSlider 是 ColorPicker 的内部子组件，不单独导出。
> **命令式 API**：主题 `setTheme` / `setThemeMode` / `useTheme`；动画 `folmeSpring` / `folmeSpringByResponse` / `accelerateEasing` / `decelerateEasing` / `sinOutEasing`；Snackbar `showSnackbar` / `dismissSnackbar` / `dismissNewestSnackbar` / `dismissOldestSnackbar`；基础图标 `IconArrowRight` / `IconArrowUpDown` / `IconCheck` / `IconSearch`；`version`。
> **未做**：FloatingToolbar、FloatingNavigationBar、NavigationRail、横向 ScrollBar、PullToRefresh、ListPopup 顶栏菜单、OkLab / OkHSV 取色器、TopAppBar 滚动折叠。

## 常用命令

```bash
bun install                                # 安装依赖（唯一包管理器）
bun run dev                                # example 开发服务器 → localhost:5173
bun run build                              # type-check + 构建库到 dist/
bun run build:example                      # 构建 example 站点到 dist-example/
bun run type-check                         # vue-tsc 类型检查
bun run format                             # prettier（src/ + example/）
bun run lint                               # oxlint + eslint（均带 --fix）
bun scripts/generate-extended-icons.mjs    # 改图标包后重新生成
```

> 提交前必跑 `bun run format && bun run lint`（见文末「提交信息」）。

## 动画（spring / 缓动）

所有 spring 走 `src/anim/folmeSpring.ts`：`folmeSpring(dampingRatio, stiffness)`，response 制的走 `folmeSpringByResponse(damping, response)`（stiffness = (2π/response)²）；公式型缓动走 `src/anim/easings.ts`。

**每个组件的 spring / tween 精确参数，逐字照抄 miuix（不允许四舍五入 / 微调），钉死在对应 `.vue` 的文件头注释里 —— 那是单一权威来源。** 改 / 加组件时直接读组件头注释 + miuix 源码取值，本文件不再复列一份逐值表（避免双份维护漂移）。

跨组件不变量（设计约束，所有组件统一，新组件也须遵守）：

- hover/press 缩放上限统一 **1.127**（Switch / Slider thumb）
- Card sink 缩放下限 **0.94**，tilt 固定 **±8°**
- Switch 磁吸阈值 50%（拖拽偏移 > 半程即翻面；coerce ±21 见尺寸表）
- Slider 磁吸阈值默认 **0.02**（值域的 2%）

## 触觉反馈

**不实现**。`navigator.vibrate` 在桌面浏览器与 iOS Safari 不支持，跨平台不可能一致。一律不复刻 miuix 的 haptic，靠 spring 视觉反馈表达交互手感即可。

## 尺寸表（1dp = 1px @ 1x DPR）

| 组件      | 尺寸                                                                          |
| :-------- | :---------------------------------------------------------------------------- |
| Switch    | track 49×28，thumb 20，offset 4（off）/ 25（on），coerce ±21                  |
| Slider    | height 28，keyPoint 半径 3.855，knobR = thumbR × 0.72                         |
| Button    | minW 58，minH 40，padding 16×13，圆角 16                                      |
| TextField | 圆角 16，padding 16×16，border 2（focused）/ 0（unfocused），label 字号 17→10 |
| Card      | 圆角 16，sink 0.94，tilt ±8°，cameraDistance = 12 × density                   |
| Dialog    | 大屏 maxH = windowH × 2/3（小屏置底，无固定 maxH）                            |

> **Card tilt 的 cameraDistance**：`12 × density` 是 Compose 的相机矩阵参数，与 CSS `perspective`（视点距离）不是同一套单位、无法 1:1 复刻（12px 视点会让卡片穿过相机而塌陷）。web 改用与卡片宽度成比例的 perspective（`rect.width × TILT_PERSPECTIVE_FACTOR`，默认 1.6，相机点取按下的支点角，见 `Card.vue`），倾斜角仍固定 ±8°。这是铁律 #1 下唯一因单位不可映射而做的近似。
> **弹窗形态**：Dialog 复刻 miuix 的 `isLargeScreen()` 判断（`windowH ≥ 480 && windowW ≥ 840`，1dp=1px）：大屏居中 + 缩放进场，小屏（手机 / 矮窗口）置底 + 上滑进场（`folmeSpring(0.88, 450)`）。不复刻 super / window 变体与小屏 back 手势（scale / 下拉）。BottomSheet 仍只做置底一种形态。

## 4 个自定义缓动曲线

| 名称             | 公式                                  | 说明                             |
| :--------------- | :------------------------------------ | :------------------------------- |
| AccelerateEasing | `x^(2*factor)`，默认 factor=1         | factor 可调                      |
| DecelerateEasing | `1 - (1-x)^(2*factor)`，默认 factor=1 | factor 可调（Dialog dim 用 1.5） |
| SinOutEasing     | `sin(x * π / 2)`                      | -                                |
| MiuixEasing      | folmeSpring 的包装                    | 见 `src/anim/folmeSpring.ts`     |

实现优先级：用 motion-v 的自定义 ease 函数（精度高）；CSS `cubic-bezier()` 近似也接受，但必须保证 `DecelerateEasing(1.5)` 能调 factor。

公式型 3 条实现在 `src/anim/easings.ts`，导出为 `accelerateEasing(factor)` / `decelerateEasing(factor)` / `sinOutEasing`（直接当 motion-v `transition.ease` 用）；spring 换算在 `src/anim/folmeSpring.ts`（`folmeSpring` / `folmeSpringByResponse`，表中「MiuixEasing」即这层包装）。两者经 `src/anim/index.ts` 汇总，再由 `src/index.ts` re-export 给库使用者。

## 主题

- 仅 Light / Dark 两套（动态色 / Monet / MaterialKolor 不在范围）
- **53 个颜色 token**、14 个文字样式 token（共 16 条 `--m-text-*`：14 个 `-size` + `subtitle-weight` + `paragraph-line-height`），全部以 CSS 变量呈现
- Light primary `#3482FF`，Dark primary `#277AF7`
- **运行时 API**（`src/theme/index.ts`）：`setTheme('light' | 'dark')` 钉死主题、`setThemeMode('system' | 'light' | 'dark')`（`'system'` 实时跟随 OS `prefers-color-scheme`）、`useTheme()` 取响应式 `theme` / `mode`。切换机制 = 在 `<html>` 上 toggle `.m-theme-dark`
- **其他 token 值**：从 `../miuix/miuix-ui/src/commonMain/kotlin/top/yukonga/miuix/kmp/theme/Colors.kt` 的 `lightColorScheme()` / `darkColorScheme()` 函数体逐字面量抄过来，禁止"取个相近的"。`0xAARRGGBB` → CSS `#RRGGBBAA`（alpha 字节从头移到尾，别丢）
- **只复刻颜色「值 + 语义角色名」，不照搬 Compose 颜色机制**：Compose 的 `Colors` 数据类 / `LocalColors` / 每 token `mutableStateOf` / `Color.copy(alpha=)` / `animateColorAsState` 在 web 都由原生 CSS 更好地实现 —— 具名色板 = CSS 变量、明暗切换 = 级联 + `.m-theme-dark` 类、派生半透明 = `::after` opacity 叠层或 `color-mix()` / 烤进 8 位 hex、色值动画 = CSS `transition`（仅铁律钉死弹簧的色值如 Switch 轨道走 motion-v）。绝不在 JS 里造 `colors` 对象（违反铁律 #2）

## 图标

- **基础图标**（ArrowRight / ArrowUpDown / Check / Search）逐字抄自 `icon/basic/*.kt`，作为函数式组件放 `src/icons/index.ts`，供组件内部用。
- **扩展图标包** = miuix `miuix-icons` 全集（155 icon × 5 weight = 775）。由 `scripts/generate-extended-icons.mjs` 从兄弟仓库 SVG（`../miuix/docs/public/icons/extended`）生成到 `src/icons/extended/icons.ts`（每个 weight 只存 `{vw,vh,d}`；该包统一为单 path、`fill-rule:nonzero`、竖直翻转 `matrix(1 0 0 -1 0 vh)`，由渲染器套用）。改包后跑 `bun scripts/generate-extended-icons.mjs` 重新生成（生成文件已在 prettier / oxlint / eslint 忽略）。
- 用 `<MiuixIcon :icon weight>` 渲染（`icon` 传整支 `ExtendedIcon` 按 `weight` 取，默认 `regular`；或已解析的 weight 数据），**不为每个图标建组件**。
- 扩展包作为**独立构建入口** `miuix-vue/icons`（按需 ~1.3MB）；核心包不含图标数据（`MiuixIcon` 只 `import type`，故 `miuix-vue.js` 仍 ~88KB）。

## 技术栈

- Vue 3.5+、TypeScript、**Vite 8** library mode（Vite 8 的打包内核是 **Rolldown** —— 库配置用 `build.rolldownOptions`，**不是** `rollupOptions`）
- **包管理器：Bun**（唯一）。禁止在脚本 / 文档 / workflow 里出现 `npm install` / `pnpm install` / `yarn`。Lockfile 是 `bun.lock`（Bun 1.3+ 文本格式）
- motion-v（唯一动画库，不引入 GSAP / @vueuse/motion）
- Sass（仅 token 文件 `src/theme/tokens.scss`）
- **unplugin-dts** 生成 `.d.ts`（入口 `unplugin-dts/vite`）。它是 `vite-plugin-dts` 的下一代（v1 = vite-plugin-dts v5 的内核，多打包器通用）；配置项用 `bundleTypes` / `outDirs`，旧名 `rollupTypes` / `outDir` 已弃用
- **不引入** Tailwind / UnoCSS / 任何 CSS-in-JS

## 添加 / 修改组件的工作流

1. 读 miuix 对应的 Kotlin 源码：`../miuix/miuix-ui/src/commonMain/kotlin/top/yukonga/miuix/kmp/`
2. 把每一个尺寸、颜色引用、spring 参数都抠出来
3. 设计 Vue 风格的 API（props/slots/emits），遵守铁律 #2
4. 用 `folmeSpring()` + CSS 变量实现
5. 在 `example/pages/`（如 `MainPage.vue` 对应小节）加一段可对照的 demo
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
