import { Link } from 'react-router-dom'
import { MOVIES } from '../data/movies.js'

export default function Home({ favorites }) {
      const favoriteMovies = MOVIES.filter(m => favorites.includes(m.id));
      const heroPosters = favoriteMovies.slice(0, 3);

      return (
        <div>
          {/* 主框 */}
          <section className="hero">
            <div className="hero-text">
              <h1>我最爱的电影</h1>
              <Link className="btn" to="/movies">进入电影列表 →</Link>
            </div>

            <div className="hero-posters">
              {heroPosters.map(m => (
                <img key={m.id} src={m.poster} alt={m.title} />
              ))}
            </div>
          </section>

          {/* 收藏夹 */}
          <div className="section-head">
            <h2 className="section-title">收藏夹</h2>
          </div>

          {favoriteMovies.length === 0 ? (
            <p className="empty">收藏夹是空的</p>
          ) : (
            <div className="fav-grid">
              {favoriteMovies.map(m => (
                <Link key={m.id} className="fav-card" to={"/movies/" + m.id}>
                  <img className="fav-poster" src={m.poster} alt={m.title} />
                  <div className="fav-info">
                    <span className="fav-title">{m.title}</span>
                    <span className="fav-meta">{m.year} · {m.genre} · {m.rating}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      );
    }