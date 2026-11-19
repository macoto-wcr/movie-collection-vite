import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { MOVIES } from '../data/movies.js'

export default function MovieList() {
  const location = useLocation()
  const navigate = useNavigate()

  // 网址里保存的搜索词（用于刷新、分享、前进后退）
  const urlKeyword = new URLSearchParams(location.search).get('q') || ''

  // 输入框自己的状态：打字时只改这里，不碰网址
  const [input, setInput] = useState(urlKeyword)

  // 网址被外部改变时（刷新、后退、前进），同步回输入框。
  // 打字时 urlKeyword 不变，所以这个 effect 不会干扰中文输入法。
  // 新版 react-hooks 规则对 effect 中的 setState 一律报警，这里按需关闭。
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setInput(urlKeyword)
  }, [urlKeyword])

  const q = input.trim()
  const kw = q.toLowerCase()

  const matched = MOVIES.filter(
    (m) =>
      m.title.includes(q) ||
      m.en.toLowerCase().includes(kw) ||
      m.genre.includes(q) ||
      m.director.includes(q) ||
      m.directorEn.toLowerCase().includes(kw),
  )

  // 只有提交（回车）时才把搜索词写进网址
  function handleSubmit(e) {
    e.preventDefault()
    navigate(q ? '/movies?q=' + encodeURIComponent(q) : '/movies', {
      replace: true,
    })
  }

  return (
    <div>
      <h1 className="page-title list-title">电影列表</h1>

      <form onSubmit={handleSubmit}>
        <input
          className="search"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="输入后按回车搜索，比如「诺兰」「Nolan」"
        />
      </form>

      <p className="count">
        {q ? `找到 ${matched.length} 部电影` : `共 ${MOVIES.length} 部电影`}
      </p>

      {matched.length === 0 ? (
        <p className="empty">没有找到和「{q}」有关的电影</p>
      ) : (
        <div className="movie-grid">
          {matched.map((m) => (
            <Link key={m.id} className="movie-card" to={'/movies/' + m.id}>
              <img className="movie-poster" src={m.poster} alt={m.title} />
              <h2>{m.title}</h2>
              <p className="movie-meta">
                {m.year} · {m.genre} · {m.rating}
              </p>
              <p className="movie-synopsis">{m.synopsis}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
