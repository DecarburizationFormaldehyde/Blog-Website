import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Heading,
  VStack,
  Input,
  Textarea,
  Button,
  HStack,
  Spinner,
} from '@chakra-ui/react';
// 从本地 UI 目录导入封装好的组件
import { Field } from "../../components/ui/field.tsx";
import { Tag } from "../../components/ui/tag.tsx";
import {
  NativeSelectRoot,
  NativeSelectField
} from "../../components/ui/native-select.tsx";
import { InputGroup } from "../../components/ui/input-group.tsx";
import { toaster } from "../../components/ui/toaster.tsx";

import MDEditor from '@uiw/react-md-editor';
import { useForm, Controller } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { createPost, updatePost, fetchPost } from '../../store/slices/postSlice';
import { fetchCategories } from '../../store/slices/categorySlice';
import { fetchTags } from '../../store/slices/tagSlice';

interface PostFormData {
  title: string;
  content: string;
  excerpt: string;
  status: 'draft' | 'published';
  category_id?: string | number | null;
  series_id?: string | number | null;
  tags: string[];
}

const PostEditor = () => {
  const { id, slug } = useParams<{ id: string; slug: string }>();
  
  // 确定使用的参数
  const articleId = id || slug;
  
  // 添加调试信息
  useEffect(() => {}, [id, slug, articleId]);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentPost, isLoading } = useAppSelector((state) => {
    return state.posts;
  });
  const { categories } = useAppSelector((state) => state.categories);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PostFormData>({
    defaultValues: {
      title: '',
      content: '',
      excerpt: '',
      status: 'draft',
      category_id: undefined,
      tags: [],
    },
  });

  useEffect(() => {
    // 确保 articleId 存在且为有效数字后再发起请求
    if (articleId && !isNaN(Number(articleId))) {
      dispatch(fetchPost(parseInt(articleId)));
    } else if (articleId) {
      console.error('无效的文章参数:', articleId);
      toaster.create({
        title: '参数错误',
        description: '文章ID格式不正确',
        type: 'error',
      });
    }
    dispatch(fetchCategories());
    dispatch(fetchTags());
  }, [dispatch, articleId]);

  useEffect(() => {
    
    // 严格验证数据完整性
    if (currentPost && articleId) {
      // 验证必要字段
      if (!currentPost.id) {
        console.error('文章数据缺少ID字段:', currentPost);
        toaster.create({
          title: '数据错误',
          description: '文章数据不完整，缺少ID字段',
          type: 'error',
        });
        return;
      }
      
      if (currentPost.id !== parseInt(articleId)) {
        console.warn('文章ID不匹配:', currentPost.id, 'vs', parseInt(articleId));
      }
      
      // 填充表单数据
      setValue('title', currentPost.title || '');
      setValue('content', currentPost.content || '');
      setValue('excerpt', currentPost.excerpt || '');
      setValue('status', currentPost.status as 'draft' | 'published');
      setValue('category_id', currentPost.category_id || undefined);
      setTags(currentPost.tags?.map((t) => t.name) || []);
    } else if (currentPost === null && articleId) {
      // 文章不存在的情况
      toaster.create({
        title: '文章不存在',
        description: `ID为 ${articleId} 的文章不存在`,
        type: 'error',
      });
      navigate('/dashboard');
    }
  }, [currentPost, articleId, setValue, navigate, id, slug]);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      const newTags = [...tags, tagInput.trim()];
      setTags(newTags);
      setValue('tags', newTags);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = tags.filter((t) => t !== tagToRemove);
    setTags(newTags);
    setValue('tags', newTags);
  };

  const onSubmit = async (data: PostFormData) => {
    try {
      console.log('原始表单数据:', data);
      
      // 前端验证：检查必填字段
      const trimmedTitle = data.title?.trim();
      const trimmedContent = data.content?.trim();
      
      if (!trimmedTitle || trimmedTitle.length === 0) {
        toaster.create({
          title: '验证失败',
          description: '标题不能为空',
          type: 'error',
        });
        return;
      }
      
      if (!trimmedContent || trimmedContent.length === 0) {
        toaster.create({
          title: '验证失败',
          description: '内容不能为空',
          type: 'error',
        });
        return;
      }
      
      // 数据清洗：处理空字符串转换为null
      const cleanedData = {
        title: trimmedTitle,
        content: trimmedContent,
        excerpt: data.excerpt?.trim() || '',
        status: data.status,
        category_id: data.category_id === undefined ? null : (data.category_id ? parseInt(data.category_id.toString()) : null),
        series_id: data.series_id === undefined ? null : (data.series_id ? parseInt(data.series_id.toString()) : null),
        tags: data.tags || [],
      };
      
      // 最终验证：确保关键字段不为空
      if (!cleanedData.title || cleanedData.title.length === 0) {
        toaster.create({
          title: '验证失败',
          description: '标题不能为空',
          type: 'error',
        });
        return;
      }
      
      if (!cleanedData.content || cleanedData.content.length === 0) {
        toaster.create({
          title: '验证失败',
          description: '内容不能为空',
          type: 'error',
        });
        return;
      }
      
      console.log('清洗后的数据:', cleanedData);
      
      if (articleId) {
        await dispatch(updatePost({ id: parseInt(articleId), postData: cleanedData })).unwrap();
        toaster.create({ title: '文章更新成功', type: 'success' });
      } else {
        await dispatch(createPost(cleanedData)).unwrap();
        toaster.create({ title: '文章创建成功', type: 'success' });
      }
      navigate('/dashboard');
    } catch (err: any) {
      console.error('API错误详情:', err);
      toaster.create({
        title: articleId ? '更新失败' : '创建失败',
        description: err.message || err.detail || '未知错误',
        type: 'error',
      });
    }
  };

  if (articleId && isLoading) {
    return (
      <Container maxW="4xl" py={8} textAlign="center">
        <Spinner size="xl" />
      </Container>
    );
  }

  return (
    <Container maxW="4xl" py={8}>
      <Heading size="lg" mb={6}>{articleId ? '编辑文章' : '写新文章'}</Heading>

      <form onSubmit={handleSubmit(onSubmit)}>
        <VStack gap={6} align="stretch">

          <Field label="标题" invalid={!!errors.title} errorText={errors.title?.message}>
            <Input
              {...register('title', { required: '标题不能为空' })}
              placeholder="请输入文章标题"
            />
          </Field>

          <Field label="摘要">
            <Textarea
              {...register('excerpt')}
              placeholder="可选：文章摘要"
              rows={3}
            />
          </Field>

          <Field label="内容" invalid={!!errors.content} errorText={errors.content?.message}>
            <Controller
              name="content"
              control={control}
              rules={{ required: '内容不能为空' }}
              render={({ field }) => (
                <Box data-color-mode="light" width="100%">
                  <MDEditor
                    value={field.value}
                    onChange={(val) => field.onChange(val || '')}
                    height={400}
                  />
                </Box>
              )}
            />
          </Field>

          <Field label="分类">
            <NativeSelectRoot>
              <NativeSelectField {...register('category_id')} placeholder="选择分类">
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </NativeSelectField>
            </NativeSelectRoot>
          </Field>

          <Field label="标签">
            <InputGroup
              width="100%"
              endElement={
                <Button h="1.75rem" size="xs" onClick={handleAddTag} variant="subtle">添加</Button>
              }
            >
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="输入标签后按回车添加"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
              />
            </InputGroup>
            <HStack gap={2} mt={2} wrap="wrap">
              {tags.map((tag) => (
                <Tag
                  key={tag}
                  closable
                  onClose={() => handleRemoveTag(tag)}
                  colorPalette="blue"
                  variant="subtle"
                >
                  {tag}
                </Tag>
              ))}
            </HStack>
          </Field>

          <Field label="状态">
            <NativeSelectRoot>
              <NativeSelectField {...register('status')}>
                <option value="draft">草稿</option>
                <option value="published">发布</option>
              </NativeSelectField>
            </NativeSelectRoot>
          </Field>

          <HStack gap={4} justify="flex-end" pt={4}>
            <Button variant="ghost" onClick={() => navigate('/dashboard')}>取消</Button>
            <Button type="submit" colorPalette="brand" loading={isSubmitting}>
              {id ? '更新' : '发布'}
            </Button>
          </HStack>
        </VStack>
      </form>
    </Container>
  );
};

export default PostEditor;