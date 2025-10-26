import * as React from 'react';

import { TTSToAudioModuleViewProps } from './TTSToAudioModule.types';

export default function TTSToAudioModuleView(props: TTSToAudioModuleViewProps) {
  return (
    <div>
      <iframe
        style={{ flex: 1 }}
        src={props.url}
        onLoad={() => props.onLoad({ nativeEvent: { url: props.url } })}
      />
    </div>
  );
}
