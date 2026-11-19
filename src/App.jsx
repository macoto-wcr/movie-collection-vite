import { useEffect, useState } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Home from './pages/Home.jsx'
import MovieList from './pages/MovieList.jsx'
import MovieDetail from './pages/MovieDetail.jsx'
import NotFound from './pages/NotFound.jsx'
import { MOVIES } from './data/movies.js'

export default function App() {
    const [favorites, setFavorites] = useState(() => {
        try {
            const saved = JSON.parse(localStorage.getItem('movie-favorites'))
            if (Array.isArray(saved)) return saved
        } catch {
            // 本地存储内容损坏时忽略，使用默认值
        }
        return MOVIES.filter((m) => m.favorite).map((m) => m.id)
    })

    useEffect(() => {
        localStorage.setItem('movie-favorites', JSON.stringify(favorites))
    }, [favorites])

    function toggleFavorite(id) {
        setFavorites((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
        )
    }

    return (
        <HashRouter>
            <Navbar />

            <main className="container">
                <Routes>
                    <Route path="/" element={<Home favorites={favorites} />} />
                    <Route path="/movies" element={<MovieList />} />
                    <Route
                        path="/movies/:id"
                        element={
                            <MovieDetail
                                favorites={favorites}
                                toggleFavorite={toggleFavorite}
                            />
                        }
                    />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </main>

            <footer>电影收藏</footer>
        </HashRouter>
    )
}