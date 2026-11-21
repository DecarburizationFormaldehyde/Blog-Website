import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home/Home';
// import Blog from '../pages/Blog/Blog';          // 需要创建
import PostDetail from '../pages/PostDetail/PostDetail';
import Login from '../pages/Auth/Login';
import Register from '../pages/Auth/Register';
import ProtectedRoute from "./ProtectedRoute.tsx";
import Dashboard from '../pages/Dashboard/Dashboard';
import PostEditor from "../pages/Dashboard/PostEditor.tsx";
import NotFound from "../pages/NotFound/NotFound.tsx";
import UnderConstruction from "../pages/UnderConstruction/UnderConstruction.tsx";

export const AppRoutes = () => {
  return (
    <Routes>
        {/*在建工程*/}
        <Route path="/about" element={<UnderConstruction />} />
        <Route path="/settings" element={<UnderConstruction />} />
        <Route path="/help" element={<UnderConstruction />} />
        <Route path="/blog" element={<UnderConstruction />} />
        <Route path="/profile" element={<UnderConstruction />} />
        <Route path="/profile" element={<UnderConstruction />} />
        <Route path="dashboard/posts" element={<UnderConstruction />} />
        <Route path="/admin" element={<UnderConstruction />} />

        <Route path="/" element={<Home />} />
        <Route path="/posts/:slug" element={<PostDetail />} />
        <Route path="/post/:slug" element={<PostDetail />} />
        <Route path="/login" element={<Login/>} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="new" element={
            <ProtectedRoute>
                <PostEditor />
            </ProtectedRoute>
        } />
        <Route path="/dashboard/new" element={
            <ProtectedRoute>
                <PostEditor />
            </ProtectedRoute>
        } />
        <Route path="/dashboard/edit/:id" element={
            <ProtectedRoute>
                <PostEditor/>
            </ProtectedRoute>
        } />
        
        {/* 保留slug版本以兼容旧链接 */}
        <Route path="/dashboard/edit/:slug" element={
            <ProtectedRoute>
                <PostEditor />
            </ProtectedRoute>
        } />

        {/*404 Not Found*/}
        <Route path="*" element={<NotFound />} />
    </Routes>
  );
};