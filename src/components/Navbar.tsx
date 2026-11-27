import { Link, NavLink } from 'react-router-dom'
import type { NavLinkRenderProps } from 'react-router-dom'

function navClass({ isActive }:NavLinkRenderProps) {
  return isActive ? 'active' : ''
}

export default function Navbar() {
  return (
    <nav className="nav">
      <Link className="logo" to="/">
        我的电影收藏
      </Link>

      <div className="nav-links">
        <NavLink to="/" end className={navClass}>
          首页
        </NavLink>
        <NavLink to="/movies" className={navClass}>
          电影列表
        </NavLink>
      </div>
    </nav>
  )
}