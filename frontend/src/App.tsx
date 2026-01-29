import {useEffect, useState} from 'react'
import './App.css'


interface Post {
    id: number,
    title: string,
    content: string,
    slug: string,
    excerpt: string | null,
    featured_image: string|null,
    status: string
    created_at: string,
    published_at: string,
    author: User[],
    category: category[]
}

interface User {
    id: number,
}

interface category {
    id: number,
}

function App() {
    const [posts, setPosts]=useState<Post[]>([])
    const [loading, setLoading]=useState(true)
    const [newPost, setNewPost] = useState({ title: '', content: '' })

    const API_URL = 'http://localhost:8000/api/v1'

    // 获取文章列表
    useEffect(() => {
        fetchPosts()
    },[])

    const fetchPosts = async () => {
        try{
            const response = await fetch(`${API_URL}/posts`)
            const data = await response.json()
            setPosts(data)
        }catch (error){
            console.error("获取文章失败",error)
        }finally {
            setLoading(false)
        }
    }

    // 创建新文章
    const handleSubmit=async (e: React.FormEvent) => {
        e.preventDefault()
        try{
            const response =await fetch(`${API_URL}/posts`,{
                method:'POST',
                headers:{
                    'Content-Type':'application/json'
                }, body:JSON.stringify(newPost)
            })
            if (response.ok){
                const createdPost = await response.json()
                setPosts([createdPost,...posts])
                setNewPost({ title: '', content: '' })
                alert('文章创建成功')
            }
        }
        catch (error){
            console.error('创建文章失败',error)
        }
    }

    if (loading) return <div>Loading...</div>

    return (
        <>
            <div>
                <header>
                    <h1>📝我的极简博客</h1>
                    <p>快速验证：React + Vite + TypeScript + FastAPI + SQLite</p>
                </header>
                <div className={'create-post'}>
                    <h2>写新文章</h2>
                    <form onSubmit={handleSubmit}>
                        <input
                            type={"text"}
                            placeholder={"标题"}
                            value={newPost.title}
                            onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                            required={ true}
                            />
                        <textarea
                            placeholder={"内容"}
                            rows={4}
                            value={newPost.content}
                            onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                            required={ true}
                        />
                        <button type={"submit"}>发布文章</button>
                    </form>
                </div>
                <div className='posts-list'>
                    <h2>文章列表</h2>
                    {posts.length === 0 ? (
                        <p>还没有文章，赶紧写一篇吧！</p>
                    ): (
                        posts.map((post) => (
                            <div key={post.id} className={'post-card'}>
                                <h3>{post.title}</h3>
                                {post.excerpt!= null ? (post.excerpt): ("这是摘要")}
                                <p>{post.created_at}</p>
                                 <div className="post-meta">
                                  <span>ID: {post.id}</span>
                                  <span>发布于: {new Date(post.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                        )
                    ))}
                </div>
                <footer className="footer">
                    <p>当前有 {posts.length} 篇文章</p>
                    <button onClick={fetchPosts}>
                      刷新列表
                    </button>
                </footer>
            </div>
        </>
    )
    }

export default App
