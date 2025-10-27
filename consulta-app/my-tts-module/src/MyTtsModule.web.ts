import { registerWebModule, NativeModule } from 'expo';

import { MyTtsModuleEvents } from './MyTtsModule.types';

class MyTtsModule extends NativeModule<MyTtsModuleEvents> {
  PI = Math.PI;
  async setValueAsync(value: string): Promise<void> {
    this.emit('onChange', { value });
  }
  hello() {
    return 'Hello world! 👋';
  }
}

export default registerWebModule(MyTtsModule, 'MyTtsModule');
