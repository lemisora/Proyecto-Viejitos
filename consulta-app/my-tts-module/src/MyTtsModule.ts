import { NativeModule, requireNativeModule } from 'expo';

import { MyTtsModuleEvents } from './MyTtsModule.types';

declare class MyTtsModule extends NativeModule<MyTtsModuleEvents> {
  PI: number;
  hello(): string;
  setValueAsync(value: string): Promise<void>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<MyTtsModule>('MyTtsModule');
