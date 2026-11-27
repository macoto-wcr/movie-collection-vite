import { useEffect, useState } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import MovieList from './pages/MovieList'
import MovieDetail from './pages/MovieDetail'
import NotFound from './pages/NotFound'
import { MOVIES } from './data/movies'

export default function App() {
    const [favorites, setFavorites] = useState(() => {
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

    useEffect(() => {
        localStorage.setItem('movie-favorites', JSON.stringify(favorites))
    }, [favorites])

    function toggleFavorite(id: number) {
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