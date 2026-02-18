import { useCallback }from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchPosts, fetchPost, clearCurrentPost } from '../store/slices/postSlice';

export const usePosts = () => {
    const dispatch = useAppDispatch();
    const { posts, currentPost, isLoading, error } = useAppSelector((state) => state.posts);

    const loadPosts = useCallback((params?:any)=>{
        dispatch(fetchPosts(params));
    },[dispatch]);

    const loadPost = useCallback((idOrSlug:number | string)=>{
        dispatch(fetchPost(idOrSlug));
    },[dispatch]);

    const clearPost = useCallback(()=>{
        dispatch(clearCurrentPost());
    },[dispatch]);

    return{
        posts,
        currentPost,
        isLoading,
        error,
        loadPosts,
        loadPost,
        clearPost
    };
};