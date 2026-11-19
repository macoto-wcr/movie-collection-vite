import { Link, useNavigate, useParams } from 'react-router-dom'
import { MOVIES } from '../data/movies.js'

export default function MovieDetail({ favorites, toggleFavorite }) {
    const { id } = useParams();
    const navigate = useNavigate()

    const movie = MOVIES.find(m => m.id === Number(id));
    const isFavorite = favorites.includes(Number(id));

    if (!movie) {
        return (
            <div>
                <h1 className="page-title">找不到这部电影</h1>
                <p className="page-desc">网址里的编号 {id} 不存在。</p>
                <Link className="btn" to="/movies">返回列表</Link>
            </div>
        );
    }

    return (
        <div>
            <button className="back" onClick={() => navigate(-1)}>← 返回上一页</button>

            <div className="detail-card">
                <img className="detail-poster" src={movie.poster} alt={movie.title} />

                <div>
                    <div className="detail-top">
                        <h1>{movie.title}</h1>
                        {isFavorite && <span className="fav-badge">收藏夹</span>}
                    </div>

                    <p className="en">{movie.en}</p>

                    <div className="chips">
                        <span className="chip">{movie.year}</span>
                        <span className="chip">{movie.genre}</span>
                        <span className="chip">{movie.duration} 分钟</span>
                        <span className="chip">{movie.rating}</span>
                    </div>

                    <button
                        className={"fav-btn" + (isFavorite ? " on" : "")}
                        onClick={() => toggleFavorite(movie.id)}
                    >
                        {isFavorite ? "已收藏" : "收藏"}
                    </button>

                    <div className="detail-rows">
                        <p><span>导演</span>{movie.director}</p>
                        <p><span>主演</span>{movie.cast}</p>
                    </div>

                    <p className="synopsis">{movie.synopsis}</p>
                </div>
            </div>
        </div>
    );
}