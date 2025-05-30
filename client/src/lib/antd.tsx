'use client';

import { createCache, StyleProvider } from '@ant-design/cssinjs';
import { PropsWithChildren } from 'react';

export default function AntdRegistry({ children }: PropsWithChildren) {
  const cache = createCache();

  return (
    <StyleProvider 
      hashPriority="high"
      ssrInline={true}
      cache={cache}
    >
      {children}
    </StyleProvider>
  );
}
