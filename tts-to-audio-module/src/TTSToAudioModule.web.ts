import { registerWebModule, NativeModule } from 'expo';

import { TTSToAudioModuleEvents } from './TTSToAudioModule.types';

class TTSToAudioModule extends NativeModule<TTSToAudioModuleEvents> {
  PI = Math.PI;
  async setValueAsync(value: string): Promise<void> {
    this.emit('onChange', { value });
  }
  hello() {
    return 'Hello world! 👋';
  }
}

export default registerWebModule(TTSToAudioModule, 'TTSToAudioModule');
