 export interface Movie {
    id: number
    title: string
    en: string
    year: number
    genre: string
    director: string
    directorEn: string
    cast: string
    duration: number
    rating: number
    poster: string
    favorite?: boolean   // ← 注意这个问号
    synopsis: string
  }