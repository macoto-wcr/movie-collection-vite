# 我的电影收藏（Vite + TypeScript 版）

一个电影收藏夹应用，支持列表浏览、关键词搜索、详情查看与收藏，收藏数据保存在 `localStorage`。

这个项目有三种形态，记录了一步步重构的过程：

| 版本 | 技术 | 位置 |
| --- | --- | --- |
| 单文件版 | React 18 + React Router v5 | [movie-collection](https://github.com/macoto-wcr/movie-collection) |
| 组件拆分版 | Vite + React 19 + React Router 7（JavaScript） | 本仓库 `v1-js` 标签 |
| **当前版本** | 组件拆分版 + **TypeScript** | 本仓库 `main` 分支 |

- 单文件版线上预览：<https://macoto-wcr.github.io/movie-collection/>
- JS 拆分版源码：<https://github.com/macoto-wcr/movie-collection-vite/tree/v1-js>

> 当前状态：`typecheck`、`lint`、`build` 全部通过，已部署上线。

## 线上预览

<https://movie-collection-vite.vercel.app/>

> 推送 `main` 后由 Vercel 自动构建部署。`*.vercel.app` 在国内需代理访问。

## 技术栈

| 技术 | 用途 |
| --- | --- |
| React 19 | 组件、状态、渲染 |
| React Router 7 | `HashRouter` 多页面路由 |
| **TypeScript 7** | 全量类型标注，`strict` 模式 |
| Vite 8 | 开发服务器与打包 |
| 原生 CSS | Grid / Flex / 渐变背景 / 响应式 |
| localStorage | 收藏数据持久化 |

## 本地运行

```bash
npm install
npm run dev        # 启动开发服务器（默认 http://localhost:5173）
```

其他命令：

```bash
npm run typecheck  # 类型检查（tsc --noEmit）
npm run lint       # ESLint
npm run build      # 打包到 dist/
npm run preview    # 本地预览打包结果
```

> **注意**：`npm run build` 使用 esbuild 转译，**不做类型检查**。类型是否正确必须单独跑 `typecheck`。

## 目录结构

```
src/
├── main.tsx              # 入口：createRoot + 全局样式
├── App.tsx               # 收藏状态 + 路由总装
├── types.ts              # Movie 接口定义
├── vite-env.d.ts         # Vite 客户端类型声明（.webp 等资源 import）
├── styles.css            # 全部样式
├── assets/               # 电影海报
├── data/movies.ts        # 电影数据（标注为 Movie[]）
├── components/Navbar.tsx
└── pages/
    ├── Home.tsx
    ├── MovieList.tsx
    ├── MovieDetail.tsx
    └── NotFound.tsx

tsconfig.json             # TypeScript 编译配置
```

---

## TypeScript 迁移记录

### 迁移方式：渐进式改造，不重写

没有另起炉灶重写一遍，而是**在原有代码基础上逐个文件迁移**：

1. 复制一份项目，安装 TypeScript，写 `tsconfig.json`
2. 定义数据模型（`Movie` 接口）
3. 按依赖顺序从叶子组件往上改：`NotFound` → `Navbar` → `Home` → `MovieList` → `MovieDetail` → `App` → `main`
4. 每改完一个文件就跑一次 `npm run typecheck`，一次只处理少量报错

这样做的好处是：每一步都有明确的反馈，报错能被精确定位到刚改的地方。

### 关键类型处理

#### 1. 类型描述现实，而不是理想状态

六部电影里只有三部标了 `favorite: true`，其余根本没有这个键。所以不能写 `favorite: boolean`：

```ts
export interface Movie {
  id: number
  title: string
  // ...
  favorite?: boolean   // 可选属性：有的数据没有这个字段
  synopsis: string
}
```

写成必填属性会立刻报错——类型必须和真实数据一致。

#### 2. 外部数据先接成 `unknown`，再验证

`localStorage` 里的内容用户能手动修改，属于**不可信的外部输入**。`JSON.parse` 的返回值是 `any`，会一路污染下去，所以先声明成 `unknown` 强制检查：

```ts
const [favorites, setFavorites] = useState<number[]>(() => {
  try {
    const raw = localStorage.getItem('movie-favorites')
    const saved: unknown = raw ? JSON.parse(raw) : null
    if (Array.isArray(saved) && saved.every((n) => typeof n === 'number')) {
      return saved
    }
  } catch {
    // 本地存储内容损坏时忽略，使用默认值
  }
  return MOVIES.filter((m) => m.favorite).map((m) => m.id)
})
```

`any` 是「随便用，出事别找我」，`unknown` 是「先证明你是什么，才能用」。只写 `Array.isArray` 是不够的——它能挡住「不是数组」，但挡不住 `["a", "b"]` 这种「是数组但不是数字」的脏数据。

#### 3. 路由参数天生可能不存在

`useParams()` 的返回值中，每个参数的类型都是 `string | undefined`：

```ts
const { id } = useParams()                          // string | undefined
const movie = MOVIES.find((m) => m.id === Number(id))

if (!movie) {
  return <NotFound />                               // 类型在此收窄
}
// 往下走，movie 一定是 Movie，不会是 undefined
```

原有的「找不到电影」兜底逻辑，天然就是 TypeScript 需要的类型收窄。

#### 4. 组件的 props 用独立接口描述

```ts
interface MovieDetailProps {
  favorites: number[]
  toggleFavorite: (id: number) => void
}

export default function MovieDetail({ favorites, toggleFavorite }: MovieDetailProps) { ... }
```

`(id: number) => void` 表示「接收一个数字、不关心返回值的函数」。回调的类型写清楚，父子组件之间的契约就固定了。

#### 5. 优先使用库提供的类型，而不是手写猜

`NavLink` 的 `className` 可以接收函数，参数类型由库定义：

```ts
import type { NavLinkRenderProps } from 'react-router-dom'

function navClass({ isActive }: NavLinkRenderProps) {
  return isActive ? 'active' : ''
}
```

用库的类型而不是手写 `{ isActive: boolean }`，库升级新增字段时能自动跟上。

### 踩坑：React 19 中 `FormEvent` 已被标记废弃

表单提交处理器的参数，网上大量教程（React 18 时代）都写成 `React.FormEvent<HTMLFormElement>`，但在 `@types/react@19` 中它已标注 `@deprecated`，编辑器会显示删除线：

```ts
/**
 * @deprecated FormEvent doesn't actually exist.
 *             You probably meant to use ChangeEvent, InputEvent, SubmitEvent,
 *             or just SyntheticEvent instead depending on the event type.
 */
```

浏览器里并没有通用的「form 事件」，表单提交对应的是 `submit` 事件。正确写法：

```ts
function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
  e.preventDefault()
  // ...
}
```

**结论**：类型该怎么写，以编辑器的类型签名为准——把鼠标悬停在 `onSubmit` 上就能看到官方定义，比任何教程都可靠。

### `tsconfig.json` 关键配置

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noEmit": true,
    "isolatedModules": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

| 配置 | 原因 |
| --- | --- |
| `strict: true` | 开启全部严格检查，包括 `noImplicitAny` |
| `noEmit: true` | 只做类型检查，编译交给 Vite，避免生成多余的 `.js` |
| `moduleResolution: "bundler"` | 匹配 Vite 的模块解析规则 |
| `jsx: "react-jsx"` | React 19 的自动 JSX 运行时，无需手动 `import React` |

> 用 `npx tsc --init` 生成的默认配置是面向 Node 项目的（`module: "nodenext"`、开启 `declaration`、额外的严格选项），在 React + Vite 项目中需要调整。

### 验收标准

- [x] `npm run typecheck` 零错误
- [x] `npm run build` 成功
- [x] `npm run lint` 零警告
- [x] 全项目无 `any`、无 `as any`
- [x] import 路径不带文件扩展名
- [x] 浏览器功能回归：搜索、收藏、刷新后收藏保留、访问不存在的 id
- [x] 部署成功

---

## 踩坑记录：中文输入法下输入重复

### 现象

在搜索框用中文输入法输入「诺兰」时，刚敲下 `n`、`u`，输入框就变成了类似：

```
nnunuonuo...
```

字符不断重复，无法正常选字。

### 原因

这是三个因素叠加的结果：

1. **输入框是受控组件**，`value` 来自网址上的 `?q=`
2. **每次 `onChange` 都调用 `navigate` 修改网址**
3. **React Router 7 的 `navigate` 默认使用 `startTransition`**，属于低优先级、可中断的更新，输入框的值会晚一步才同步回来

而中文输入法在「组词」阶段（`composition`）会自己管理输入框里的临时文本。它正在写 `nu`，React 却拿上一次的值覆盖回来，输入法再把组词内容补回去——两边互相覆盖，就出现了重复字符。

作为对比，单文件版用的是 **React 18 + React Router v5** 的 `history.replace`，属于同步更新，冲突窗口很小，所以没有触发这个问题。

### 错误写法

```jsx
const keyword = new URLSearchParams(location.search).get('q') || ''

<input
  value={keyword}
  onChange={(e) => {
    navigate('/movies?q=' + encodeURIComponent(e.target.value), { replace: true })
  }}
/>
```

每敲一个字母 → 改网址 → 重新渲染 → 覆盖输入框。

### 修复方式

把「输入框显示的内容」和「网址保存的内容」拆成两层：

- 输入框使用本地 `useState`
- 打字时只更新本地状态，**不碰网址**
- 按回车（表单提交）时才把关键词写入网址
- 网址被刷新、后退、前进改变时，再用 `useEffect` 同步回输入框

```tsx
const urlKeyword = new URLSearchParams(location.search).get('q') || ''
const [input, setInput] = useState(urlKeyword)

useEffect(() => {
  setInput(urlKeyword)
}, [urlKeyword])

function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
  e.preventDefault()
  navigate(input ? '/movies?q=' + encodeURIComponent(input) : '/movies', {
    replace: true,
  })
}

return (
  <form onSubmit={handleSubmit}>
    <input
      value={input}
      onChange={(e) => setInput(e.target.value)}
      placeholder="输入后按回车搜索"
    />
  </form>
)
```

列表过滤使用本地 `input`，所以打字时结果依然实时变化；网址只在提交时更新。

### 为什么有效

| 阶段 | 输入框（本地 state） | 网址 |
| --- | --- | --- |
| 组词中 | 输入法自由写入，React 只 `setInput` | 不动 |
| 选字完成 | 更新为最终文字 | 不动 |
| 按回车 | 不变 | 写入 `?q=` |
| 刷新/分享 | 从网址初始化 | 保留 |

组词期间没有外部值覆盖输入框，输入法就不会被打断。

### 取舍

- 需要**按回车**才会把搜索词写进网址
- 打字但未提交时，网址仍是上一次提交的结果
- 刷新、分享链接、前进后退都能还原上一次提交的搜索

### ESLint 说明

新版 `react-hooks` 规则会提示「不要在 effect 里同步调用 setState」。这里的 effect 是从 URL 这个外部数据源同步状态，只在网址变化时执行，不会在打字过程中触发，因此按需局部关闭了该规则并加了注释。

### 验证方式

1. 用中文输入法输入「诺兰」，输入框不应出现重复字符
2. 按回车后，地址变为 `#/movies?q=诺兰`
3. 刷新页面，搜索词和结果仍然保留
4. 浏览器后退/前进，输入框内容跟随网址变化

---

## 后续计划

- 增加单元测试（Vitest）
- 视需要增加 GitHub Pages 或自定义域名，方便国内访问

## 说明

本项目为个人学习作品，电影海报版权归原片方所有。
