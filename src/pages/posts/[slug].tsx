import { GetStaticPaths } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Box, chakra } from '@chakra-ui/react';

import {
  PostContentBody,
  PostContentTitle,
  PostContentContainer,
  Utterances,
} from '../../components';

import type PostType from '../../types/post';

import markdownToHtml from '../../lib/markdownToHtml';
import { getAllPosts, getPathBySlug, getPostBySlug } from '../../lib/api';
import { CONTENT_ELEMENTS } from '../../constants';

interface Props {
  post: PostType;
  preview?: boolean;
}

const Section = chakra(Box, {
  baseStyle: {
    display: 'flex',
    justifyContent: 'center',
    width: '100vw',
    minHeight: 'calc(100vh - 170px)', // TODO: 바꿔야함 100vh - (2 * header)
  },
});

const Post = ({ post, preview }: Props) => {
  const router = useRouter();

  if (!router.isFallback && !post?.slug) {
    return <div>statusCode 404</div>; // TODO: 에러 페이지 만들기
  }

  return (
    <>
      {router.isFallback ? (
        <div>Loading…</div> // TODO: 로딩 페이지 만들기
      ) : (
        <Section as="section">
          {/* TODO: NEXESCRIPT 컴포넌트로 묶어보기 */}
          <Head>
            <title>{post.title} | junghyeonsu.dev</title>
            <meta property="og:image" content={post.coverImage} />
            <meta property="og:title" content={post.title} />
            <meta property="og:description" content={post.description} />
            <meta property="og:type" content="website" />
          </Head>
          <PostContentContainer>
            <PostContentTitle title={post.title} date={post.date} coverImage={post.coverImage} />
            <PostContentBody content={post.content} />
            <Utterances />
          </PostContentContainer>
        </Section>
      )}
    </>
  );
};

export default Post;

interface Params {
  params: {
    slug: string;
  };
}

export async function getStaticProps({ params }: Params) {
  const path = getPathBySlug(params.slug);
  const post = getPostBySlug({ slug: params.slug, path }, CONTENT_ELEMENTS.POST_WITH_CONTENT);
  const content = await markdownToHtml(post.content || '');

  return {
    props: {
      post: {
        ...post,
        content,
      },
    },
  };
}

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = getAllPosts(CONTENT_ELEMENTS.POST_PATHS);

  return {
    paths: posts.map(post => {
      return {
        params: {
          slug: post.slug,
        },
      };
    }),
    fallback: false,
  };
};
