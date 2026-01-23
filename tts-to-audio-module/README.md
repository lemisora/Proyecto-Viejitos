# tts-to-audio-module

Generador de audio a partir de texto mediante las funciones de TTS nativas del sistema operativo móvil en el que se ejecuta, actualmente limitado únicamente a Android.

## Objetivo del módulo
- Generar audio y grabar en archivo de audio a partir de texto
- Ofrecer una interfaz mediante la que en React Native se pueda mandar texto a la función de TTS nativa del sistema operativo móvil
- Permitir la reproducción de audio a partir de archivo de audio
- Permitir la reproducción de dicho audio en segundo plano sin tantas exclusiones por ahorro de batería por parte de las distintas capas de personalización de Android.

## Funciones disponibles
- ```typescript
  generateAudioFromTTS(text: string): Promise<string>
  Se manda el texto como parámetro y devuelve la ruta del archivo de audio generado.

  Ejemplo:
  const audioPath = await TTSToAudioModule.generateAudioFromTTS("Hola, ¿cómo estás?");
  ```

- ```typescript
  scheduleAudioPlayback(filePath: string, delayInSeconds: number): Promise<string>
  Programa la reproducción de un archivo de audio después de un retraso.
  El archivo de audio debe estar en el almacenamiento interno de la aplicación (no requiere permisos).

  Ejemplo:
  const audioPath = await TTSToAudioModule.scheduleAudioPlayback("audio.wav", 5);
  ```

- ```typescript
  scheduleAudioPlaybackAtTimestamp(filePath: string, timestampInMillis: number): Promise<string>
  Programa la reproducción de un audio en una fecha y hora específicas.
  El archivo de audio debe estar en el almacenamiento interno de la aplicación (no requiere permisos).


  Ejemplo:
  const audioPath = await TTSToAudioModule.scheduleAudioPlaybackAtTimestamp("audio.wav", 1650000000);
```

