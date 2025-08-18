declare module 'react-syntax-highlighter' {
  import * as React from 'react';
  export interface SyntaxHighlighterProps {
    language?: string;
    style?: any;
    PreTag?: any;
    wrapLongLines?: boolean;
    customStyle?: React.CSSProperties;
    children?: React.ReactNode;
  }
  export const Prism: any;
  const SyntaxHighlighter: any;
  export default SyntaxHighlighter;
}

declare module 'react-syntax-highlighter/dist/esm/styles/prism' {
  export const oneDark: any;
  export const oneLight: any;
  const _default: any;
  export default _default;
}
