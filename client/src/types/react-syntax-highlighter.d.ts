declare module 'react-syntax-highlighter' {
  import * as React from 'react';
  export interface SyntaxHighlighterProps {
    language?: string;
    style?: unknown;
    PreTag?: unknown;
    wrapLongLines?: boolean;
    customStyle?: React.CSSProperties;
    children?: React.ReactNode;
  }
  export const Prism: unknown;
  const SyntaxHighlighter: unknown;
  export default SyntaxHighlighter;
}

declare module 'react-syntax-highlighter/dist/esm/styles/prism' {
  export const oneDark: unknown;
  export const oneLight: unknown;
  const _default: unknown;
  export default _default;
}
