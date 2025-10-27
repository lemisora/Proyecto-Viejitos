// Importa el módulo nativo (el objeto)
import TTSToAudioModule from './TTSToAudioModule';
// Reexportar la vista y los tipos está bien
export * from './TTSToAudioModule.types';
// export {default} from './TTSToAudioModule';

// Esta función ya estaba correcta
export async function generateAudioFromTTS(text: string): Promise<string> {
  return await TTSToAudioModule.generateAudioFromTTS(text);
}

export async function scheduleAudioPlayback(filePath: string, delayInSeconds: number): Promise<string> {
  if (delayInSeconds < 1) {
    throw new Error("Delay must be at least 1 second");
  }
  return await TTSToAudioModule.scheduleAudioPlayback(filePath, delayInSeconds);
}
// // Esta está bien (es síncrona)
// export function saveAudioToStorage(): string { 
//   return TTSToAudioModule.saveAudioToStorage();
// }

// // --- ¡CAMBIOS AQUÍ! ---
// // Estas deben ser ASYNC porque en Kotlin son AsyncFunction
// // y olvidaste pasar el argumento 'text' a addReminder

// export async function addReminder(text: string): Promise<string> { 
//   // Debe tener 'await' y pasar el argumento 'text'
//   return await TTSToAudioModule.addReminder(text);
// }

// export async function getReminders(): Promise<string> { 
//   // Debe tener 'await'
//   return await TTSToAudioModule.getReminders();
// }