import React, { useState, useEffect } from "react";
import type { BoxProps, ComponentDefaultProps, HeadingProps, TextProps } from "@chakra-ui/react";
import { Box, Heading, Text, useColorMode, Tooltip, IconButton } from "@chakra-ui/react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight, oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { FiCopy, FiCheck } from "react-icons/fi";
import { MDXProvider } from "@mdx-js/react";
import type { AnchorHTMLAttributes, PropsWithChildren } from "react";
import Callout from "./Callout";
import { InternalLink } from "./InternalLink";
import YouTubePlayer from "./YouTubePlayer";

const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);
  const { colorMode } = useColorMode();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // 2초 후 복사 상태 초기화
    } catch (error) {
      console.error("Failed to copy text:", error);
    }
  };

  return (
    <Tooltip label={copied ? "Copied!" : "Copy"} hasArrow placement="top">
      <IconButton
        icon={copied ? <FiCheck /> : <FiCopy />}
        onClick={handleCopy}
        size="md"
        position="absolute"
        top="12px"
        right="8px"
        aria-label="Copy code"
        backgroundColor={colorMode === "dark" ? "gray.800" : "gray.200"} // 모드별 색상
        color={colorMode === "dark" ? "white" : "gray.900"} // 모드별 색상
        _hover={{
          backgroundColor: colorMode === "dark" ? "gray.600" : "gray.400", // 모드별 호버 색상
        }}
        _active={{
          backgroundColor: colorMode === "dark" ? "gray.700" : "gray.500", // 모드별 클릭 색상
        }}
        borderRadius="10px"
      />
    </Tooltip>
  );
};

const CodeBlock = (props: any) => {
  const { className, children } = props;
  const match = /language-(\w+)/.exec(className || "");
  const { colorMode } = useColorMode();
  const theme = colorMode === "dark" ? oneDark : oneLight;
  const backgroundColor = theme["code[class*=\"language-\"]"]?.background || "inherit";

  const [fontSize, setFontSize] = useState(14); // 기본 폰트 크기

  useEffect(() => {
    const updateFontSize = () => {
      const width = window.innerWidth;

      if (width < 768) {
        setFontSize(13); // 모바일
      } else if (width < 1024) {
        setFontSize(14); // 태블릿
      } else {
        setFontSize(15); // 데스크톱
      }
    };

    updateFontSize(); // 초기 폰트 크기 설정
    window.addEventListener("resize", updateFontSize);

    return () => {
      window.removeEventListener("resize", updateFontSize);
    };
  }, []);

  if (!match) {
    return (
      <Text
        as="code"
        sx={{
          borderRadius: "4px",
          padding: "2px 4px",
          letterSpacing: "-0.04px",
          fontWeight: "600",
          color: "gray.900",
          _dark: {
            color: "gray.50",
          },
        }}
      >
        {children}
      </Text>
    );
  }

  return (
    <Box
      position="relative"
      borderRadius="10px"
      overflow="hidden"
      mb="20px"
      boxShadow={colorMode === "dark"
        ? "0px 4px 12px rgba(0, 0, 0, 0.6)"
        : "0px 4px 12px rgba(0, 0, 0, 0.2)"}
    >
      <Box
        bg={backgroundColor}
        height="40px"
        px="10px"
        display="flex"
        alignItems="center"
        borderBottom={`1px solid ${colorMode === "dark" ? "gray.700" : "gray.400"}`}
        paddingLeft="20px"
        paddingTop="25px"
        paddingBottom="25px"
      >
        <Box display="flex" gap="8px">
          <Box width="12px" height="12px" borderRadius="full" bg="red.500" />
          <Box width="12px" height="12px" borderRadius="full" bg="yellow.500" />
          <Box width="12px" height="12px" borderRadius="full" bg="green.500" />
        </Box>
      </Box>

      <Box>
        <CopyButton text={String(children).replace(/\n$/, "")} />
        <SyntaxHighlighter
          style={theme}
          customStyle={{
            margin: "0px",
            borderRadius: "0px 0px 10px 10px",
            fontFamily: "Fira Code, monospace",
            fontSize: `${fontSize}px`, // 동적 폰트 크기
          }}
          showLineNumbers
          lineNumberStyle={{
            width: "42px",
            textAlign: "right",
            paddingRight: "18px",
            fontSize: `${fontSize - 2}px`, // 라인 넘버 크기
          }}
          PreTag="div"
          language={match[1]}
          {...props}
        >
          {String(children).replace(/\n$/, "")}
        </SyntaxHighlighter>
      </Box>
    </Box>
  );
};

const customComponents = {
  h1: (props: HeadingProps) => <Heading as="h1" fontSize={36} mt="80px" {...props} />,
  h2: (props: HeadingProps) => <Heading as="h2" fontSize={32} mt="80px" mb="40px" {...props} />,
  h3: (props: HeadingProps) => <Heading as="h3" fontSize={24} mt="60px" mb="30px" {...props} />,
  h4: (props: HeadingProps) => <Heading as="h4" fontSize={20} mt="40px" mb="20px" {...props} />,
  p: (props: TextProps) => <Text fontSize={16} mt="16px" lineHeight="2" {...props} />,
  li: (props: BoxProps) => (
    <Box
      as="li"
      sx={{
        listStyleType: "disc", // 기본 bullet 사용
        listStylePosition: "inside", // bullet이 텍스트와 같은 시작점에 위치
        marginBottom: "8px", // 항목 간 간격
        wordBreak: "break-word", // 단어가 너무 길 경우 줄바꿈
        lineHeight: "1.6", // 텍스트의 줄 간격
      }}
      fontSize={16}
      {...props}
    />
  ),
  ol: (props: BoxProps) => <Box as="ol" fontSize={16} mt="16px" listStylePos="inside" {...props} />,
  ul: (props: BoxProps) => (
    <Box
      as="ul"
      sx={{
        "* > ul": {
          margin: 0,
          marginLeft: "20px",
        },
      }}
      fontSize={16}
      mt="16px"
      listStylePos="inside"
      {...props}
    />
  ),
  a: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => {
    const ariaHidden = props["aria-hidden"];
    const isInternalLink = props.href?.startsWith("/");
    const href = props.href;

    if (!href) return <a {...props} />;

    if (isInternalLink) {
      return <InternalLink to={href}>{props.children}</InternalLink>;
    }

    return (
      <Box
        as="span"
        _hover={{
          textDecoration: "underline",
        }}
      >
        <a
          style={{
            fontWeight: 600,
            color: "var(--chakra-colors-blue-400)",
          }}
          target={!ariaHidden ? "_blank" : undefined}
          {...props}
        />
      </Box>
    );
  },
  blockquote: (props: ComponentDefaultProps) => {
    const children = props.children;
    return <Callout>{children}</Callout>;
  },
  code: CodeBlock,
  Callout,
  YouTubePlayer,
};

export default function ({ children }: PropsWithChildren) {
  return <MDXProvider components={customComponents as any}>{children}</MDXProvider>;
}