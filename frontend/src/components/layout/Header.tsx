import React from 'react';
import {
    Box,
    Flex,
    Button,
    Text,
    AvatarRoot,
    AvatarImage,
    AvatarFallback,
    IconButton, HStack,
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useAppDispatch } from "../../store/hooks";
import { logout } from '../../store/slices/authSlice';
import {ColorModeButton} from "../ui/color-mode.tsx";
import { MenuContent, MenuRoot, MenuTrigger, MenuItem } from "../ui/menu"

interface HeaderProps {
    onMenuClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
    const { user, isAuthenticated } = useAuth();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await dispatch(logout());
        navigate('/login');
    };

    return (
        <Box
            as="header"
            position="sticky"
            top={0}
            zIndex={10}
            bg="white"
            borderBottom="1px"
            borderColor="gray.200"
            boxShadow="sm"
            p={4}
            py={3}
        >
            <Flex justify="space-between" align="center" maxW="7xl" mx="auto">
                <Flex gap="4">
                    {onMenuClick && (
                        <IconButton
                            aria-label="打开菜单"
                            children={<span>☰</span>}
                            variant="ghost"
                            onClick={onMenuClick}
                        />
                    )}

                    <RouterLink to="/">
                        <Text fontSize="xl" fontWeight="bold" color="blue.500">
                            我的博客
                        </Text>
                    </RouterLink>

                    <Flex gap="4" display={{ base: 'none', md: 'flex' }}>
                        <RouterLink to="/">
                            <Button variant="ghost">首页</Button>
                        </RouterLink>
                        <RouterLink to="/blog">
                            <Button variant="ghost">文章</Button>
                        </RouterLink>
                        <RouterLink to="/categories">
                            <Button variant="ghost">分类</Button>
                        </RouterLink>
                        {isAuthenticated ? (
                            <RouterLink to="/dashboard">
                                <Button variant="ghost">仪表盘</Button>
                            </RouterLink>
                        ) : null}
                    </Flex>
                </Flex>

                <HStack gap="4">

                    <ColorModeButton value="ghost"/>
                    {isAuthenticated ? (
                        <MenuRoot positioning={{ placement: "bottom-end", gutter: 8 }} >
                            <MenuTrigger asChild>
                                <Flex gap="2">
                                    <AvatarRoot size="sm">
                                        <AvatarImage src={user?.avatar || undefined} />
                                        <AvatarFallback>
                                            {(user?.display_name || user?.name || '用户').charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </AvatarRoot>
                                    <Text display={{ base: 'none', md: 'block' }}>
                                        {user?.display_name || user?.name || '用户'}
                                    </Text>
                                </Flex>
                            </MenuTrigger>
                            <MenuContent portalled color="gray.800" bg="white">
                                <MenuItem value="profile" onClick={() => navigate('/profile')}>
                                    个人资料
                                </MenuItem>
                                <MenuItem value="posts" onClick={() => navigate('/dashboard/posts')}>
                                    我的文章
                                </MenuItem>
                                <MenuItem value="create" onClick={() => navigate('/dashboard/create')}>
                                    写文章
                                </MenuItem>
                                {user?.is_admin ? (
                                    <MenuItem value="admin" onClick={() => navigate('/admin')}>
                                        管理后台
                                    </MenuItem>
                                ) : null}
                                <MenuItem value="logout" onClick={handleLogout} color="red.500">
                                    退出登录
                                </MenuItem>
                            </MenuContent>
                        </MenuRoot>
                    ) : (
                        <Flex gap="2">
                            <RouterLink to='/login'>
                                <Button variant="ghost">登录</Button>
                            </RouterLink>
                            <RouterLink to='/register'>
                                <Button colorScheme="blue">注册</Button>
                            </RouterLink>
                        </Flex>
                    )}
                </HStack>
            </Flex>
        </Box>
    );
};

export default Header;