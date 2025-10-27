import { requireNativeView } from 'expo';
import * as React from 'react';

import { MyTtsModuleViewProps } from './MyTtsModule.types';

const NativeView: React.ComponentType<MyTtsModuleViewProps> =
  requireNativeView('MyTtsModule');

export default function MyTtsModuleView(props: MyTtsModuleViewProps) {
  return <NativeView {...props} />;
}
