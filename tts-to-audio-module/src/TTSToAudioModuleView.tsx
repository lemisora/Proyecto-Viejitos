import { requireNativeView } from 'expo';
import * as React from 'react';

import { TTSToAudioModuleViewProps } from './TTSToAudioModule.types';

const NativeView: React.ComponentType<TTSToAudioModuleViewProps> =
  requireNativeView('TTSToAudioModule');

export default function TTSToAudioModuleView(props: TTSToAudioModuleViewProps) {
  return <NativeView {...props} />;
}
