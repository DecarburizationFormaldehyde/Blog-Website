// frontend/src/pages/Auth/Login.tsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Box, Button, Container,
  Input, Stack, Heading, Text, VStack
} from '@chakra-ui/react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../store/hooks';
import { login } from '../../store/slices/authSlice';
import { toaster } from "../../components/ui/toaster.tsx";
import { Field } from "../../components/ui/field.tsx";

interface LoginForm {
  username: string;
  password: string;
}

const Login = () => {
    const {register, handleSubmit,formState: {errors}}=useForm<LoginForm>();
    const dispath =useAppDispatch();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const onSubmit = async (data: LoginForm)=>{
        setIsLoading(true);
        try{
            await dispath(login(data)).unwrap ();
            toaster.create( {title: '登录成功',type:'success'});
            navigate('/');
        }catch (err:any){
            toaster.create( {title: '登录失败',type:'error',description:err.message});
        }finally {
            setIsLoading(false);
        }
    };
    return (
        <Container maxW="md" py={12}>
            <VStack gap={8}>
                <Heading>登录</Heading>
                <Box as="form" onSubmit={handleSubmit(onSubmit)} width="100%">
                <Stack gap={4}>
                    <Field
                        label="用户名"
                        invalid={!!errors.username}
                        errorText={errors.username?.message as string}
                    >
                        <Input {...register('username',{required:'用户名不能为空'})} autoComplete="username"/>
                    </Field>
                    <Field
                        label="密码"
                        invalid={!!errors.password}
                        errorText={errors.password?.message as string}
                    >
                        <Input {...register('password',{required:'密码不能为空'})} type="password" autoComplete="current-password"/>
                    </Field>
                    <Button type="submit" loading={isLoading} colorScheme="brand">登录</Button>
                </Stack>
                </Box>
                <Text>
                    还没有账号？ <Link to="/register">立即注册</Link>
                </Text>
            </VStack>
        </Container>
  );
};

export default Login;