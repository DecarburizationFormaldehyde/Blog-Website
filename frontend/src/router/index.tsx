import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home/Home';
// import Blog from '../pages/Blog/Blog';          // 需要创建
import PostDetail from '../pages/PostDetail/PostDetail';
// import Login from '../pages/Auth/Login';        // 需要创建
// import Register from '../pages/Auth/Register';  // 需要创建
// import Dashboard from '../pages/Dashboard/Dashboard'; // 需要创建

export const AppRoutes = () => {
  return (
    <Routes>
        <Route path="/" element={<Home />} />
      {/*<Route path="/blog" element={<Blog />} />*/}
      <Route path="/posts/:slug" element={<PostDetail />} />
      {/*<Route path="/login" element={<Login />} />*/}
      {/*<Route path="/register" element={<Register />} />*/}
      {/*<Route path="/dashboard/*" element={<Dashboard />} />*/}
    </Routes>
  );
};