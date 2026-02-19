import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {type JSX} from "react";

interface ProtectedRouteProps {
  children: JSX.Element;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    // 可以返回一个加载中组件
    return <div>加载中...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;