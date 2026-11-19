# 我的电影收藏（Vite 版）

把最初的单文件 React 应用迁移到 **Vite + React Router 7** 的版本。迁移过程中记录遇到的问题和解决思路。

- 单文件原版：[movie-collection](https://github.com/macoto-wcr/movie-collection)
- 线上预览（单文件版）：<https://macoto-wcr.github.io/movie-collection/>

> 当前状态：迁移已完成，`lint` 与 `build` 均通过，待部署。

## 技术栈

| 技术 | 用途 |
| --- | --- |
| React 19 | 组件、状态、渲染 |
| React Router 7 | `HashRouter` 多页面路由 |
| Vite 8 | 开发服务器与打包 |
| 原生 CSS | Grid / Flex / 渐变背景 / 响应式 |
| localStorage | 收藏数据持久化 |

## 本地运行

```bash
npm install
npm run dev
```

打开终端显示的地址（默认 <http://localhost:5173>）。

```bash
npm run build     # 打包到 dist/
npm run preview   # 本地预览打包结果
```

## 目录结构

```
src/
├── main.jsx              # 入口：createRoot + 全局样式
├── App.jsx               # 收藏状态 + 路由总装
├── styles.css            # 全部样式
├── assets/               # 电影海报
├── data/movies.js        # 电影数据
├── components/Navbar.jsx
└── pages/
    ├── Home.jsx
    ├── MovieList.jsx
    ├── MovieDetail.jsx
    └── NotFound.jsx
```

## 迁移进度

- [x] 项目骨架、依赖安装
- [x] 样式、图片、数据拆分
- [x] Navbar、Home
- [x] MovieList（含中文输入法修复）
- [x] MovieDetail、NotFound
- [x] App 路由组装
- [x] ESLint 与 `npm run build` 通过
- [ ] 部署上线

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

```jsx
const urlKeyword = new URLSearchParams(location.search).get('q') || ''
const [input, setInput] = useState(urlKeyword)

useEffect(() => {
  setInput(urlKeyword)
}, [urlKeyword])

function handleSubmit(e) {
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

## 后续计划

- 部署上线
- 后续可迁移到 TypeScript

## 说明

本项目为个人学习作品，电影海报版权归原片方所有。
