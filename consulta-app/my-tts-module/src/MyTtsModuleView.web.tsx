import * as React from 'react';

import { MyTtsModuleViewProps } from './MyTtsModule.types';

export default function MyTtsModuleView(props: MyTtsModuleViewProps) {
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
