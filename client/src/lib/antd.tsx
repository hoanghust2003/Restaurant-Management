'use client';

import { StyleProvider } from '@ant-design/cssinjs';
import { PropsWithChildren } from 'react';

export default function AntdRegistry({ children }: PropsWithChildren) {
  return <StyleProvider hashPriority="high">{children}</StyleProvider>;
}
