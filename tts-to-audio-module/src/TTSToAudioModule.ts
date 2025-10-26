import { NativeModule, requireNativeModule } from 'expo';

import { TTSToAudioModuleEvents } from './TTSToAudioModule.types';

declare class TTSToAudioModule extends NativeModule<TTSToAudioModuleEvents> {
  PI: number;
  hello(): string;
  setValueAsync(value: string): Promise<void>;
  
  // AsyncFunction en Kotlin -> Promise<string> en TypeScript
  generateAudioFromTTS(text: string): Promise<string>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<TTSToAudioModule>('TTSToAudioModule');
