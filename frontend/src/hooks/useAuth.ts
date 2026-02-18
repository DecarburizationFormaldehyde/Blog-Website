import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { getCurrentUser } from '../store/slices/authSlice';

export const useAuth = () =>{
    const dispatch = useAppDispatch();
    const { user,isAuthenticated, isLoading,token } = useAppSelector((state) => state.auth);
    useEffect(()=>{
        //
        if (token && !user && !isLoading){
            dispatch(getCurrentUser())
        }
    },[dispatch,token,user,isLoading]);

    return{
        user,
        isAuthenticated,
        isLoading,
        hasToken: !!token,
    };
};