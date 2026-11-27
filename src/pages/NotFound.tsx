import { Link } from 'react-router-dom'

export default function NotFound() {
    return (
        <div>
            <h1 className="page-title">404 · 页面不存在</h1>
            <p className="page-desc">这个网址没有对应的页面，可能地址打错了。</p>
            <Link className="btn" to="/">
                回首页
            </Link>
        </div>
    )
}