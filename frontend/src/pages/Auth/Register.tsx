import {useForm} from "react-hook-form";
import {useAppDispatch} from "../../store/hooks.ts";
import {useNavigate} from "react-router-dom";
import {useState} from "react";
import { register as registerUser } from '../../store/slices/authSlice';
import {toaster} from "../../components/ui/toaster.tsx";
import { Alert } from "../../components/ui/alert.tsx";
import {Box, Container, Heading, Input, Stack, VStack, Text, Button} from "@chakra-ui/react";
import { LuInfo } from "react-icons/lu"
import { Field } from "../../components/ui/field.tsx";
import { Link } from "@chakra-ui/react"
import { Link as RouterLink } from "react-router-dom"


interface RegisterForm {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  display_name?: string;
}

const Register = () => {
    const {register, handleSubmit,watch,formState: {errors,isSubmitting}}=useForm<RegisterForm>();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const [error, setError] = useState<string | null>(null);
    const password = watch('password');

    const onSubmit = async (data: RegisterForm) => {
        setError(null);
        const { confirmPassword, ...registerData } = data;

        try {
            await dispatch(registerUser(registerData)).unwrap();
            toaster.create({
                title: '注册成功',
                type:'success',
                description: '请登录以继续。',
                duration: 3000,
                closable: true,
            })
            navigate('/login');
        } catch (err:any) {
            const errorMessage = err || '注册失败，请稍后重试';
            setError(errorMessage);
        }
    };

    return (
        <Container maxW="md" py={12}>
            <VStack gap={8}>
                <Heading size="xl">注册</Heading>
                <Box w="100%" p={6} borderWidth={1} borderRadius="lg" boxShadow="md">
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <Stack gap={4}>
                            {error && (
                                <Alert status="error" borderRadius="md">
                                    <LuInfo />
                                    {error}
                                </Alert>
                            )}
                            <Field
                                label={"用户名"}
                                invalid={!!errors.username}
                                errorText={errors.username?.message as string}
                            >
                                <Input {...register('username', {
                                    required: '用户名不能为空',
                                    minLength: { value: 3, message: '至少3个字符' },
                                    maxLength: { value: 50, message: '最多50个字符' },
                                })}
                                />

                                {errors.username && (
                                    <Text color="red.500" fontSize="sm" mt={1}>
                                        {errors.username.message}
                                    </Text>
                                )}
                            </Field>

                            <Field
                                label={"邮箱"}
                                invalid={!!errors.email}
                                errorText={errors.email?.message as string}
                            >
                                <Input
                                    type="email"
                                    {...register('email', {
                                        required: '邮箱不能为空',
                                        pattern: {
                                          value: /^\S+@\S+\.\S+$/,
                                          message: '请输入有效的邮箱地址',
                                        },
                                    })}
                                />
                            </Field>
                            {errors.email && (
                                <Text color="red.500" fontSize="sm" mt={1}>
                                    {errors.email.message}
                                </Text>
                            )}

                            <Field
                                label={"昵称（可选）"}
                                invalid={!!errors.display_name}
                            >
                                <Input
                                    {...register('display_name', {
                                        maxLength: { value: 100, message: '最多100个字符' },
                                    })}
                                />
                                {errors.display_name && (
                                    <Text color="red.500" fontSize="sm" mt={1}>
                                        {errors.display_name.message}
                                    </Text>
                                )}
                            </Field>

                            <Field
                                label={"密码"}
                                invalid={!!errors.password}
                                errorText={errors.password?.message as string}
                            >
                                <Input
                                    type="password"
                                    {...register('password', {
                                        required: '密码不能为空',
                                        minLength: { value: 8, message: '密码至少8个字符' },
                                    })}
                                />
                                {errors.password && (
                                    <Text color="red.500" fontSize="sm" mt={1}>
                                        {errors.password.message}
                                    </Text>
                                )}
                            </Field>

                            <Field
                                label={"确认密码"}
                                invalid={!!errors.confirmPassword}
                                errorText={errors.confirmPassword?.message as string}
                            >
                                <Input
                                    type="password"
                                    {...register('confirmPassword', {
                                        required: '请确认密码',
                                        validate: (value) =>
                                            value === password || '两次输入的密码不一致',
                                    })}
                                />
                                {errors.confirmPassword && (
                                    <Text color="red.500" fontSize="sm" mt={1}>
                                        {errors.confirmPassword.message}
                                    </Text>
                                )}
                            </Field>

                            <Button
                                type="submit"
                                colorScheme="brand"
                                size="lg"
                                fontSize="md"
                                loading={isSubmitting}
                                loadingText="注册中"
                            >
                                注册
                            </Button>

                        </Stack>
                    </form>
                </Box>
                <Text>
                    已有账号？{' '}
                    <Link asChild color="brand.500">
                        <RouterLink to="/login">
                            立即登录
                        </RouterLink>
                    </Link>
                </Text>
            </VStack>
        </Container>
    );


};

export default Register;