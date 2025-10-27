import { Audio } from 'expo-av';
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Button,
  TextInput,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

// 1. Importa tu función desde el nombre del módulo
// (Esto funciona porque la app 'example' tiene tu módulo como dependencia)
import { generateAudioFromTTS } from 'tts-to-audio-module';

export default function App() {
  const [text, setText] = useState('Hola mundo desde mi módulo nativo');
  const [filePath, setFilePath] = useState<string | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  // --- Llama a tu función nativa ---
  const handleGenerateAudio = async () => {
    // Descarga el sonido anterior si existe
    if (sound) {
      await sound.unloadAsync();
      setSound(null);
    }
    setFilePath(null);

    try {
      console.log('Llamando a generateAudioFromTTS...');
      
      // 2. ¡Aquí se llama a tu código de Kotlin!
      const path = await generateAudioFromTTS(text);

      console.log('¡Éxito! Archivo generado en:', path);
      Alert.alert('¡Éxito!', `Audio generado en: ${path}`);
      setFilePath(path); // Guarda la ruta para el botón de reproducir

    } catch (e: any) {
      console.error(e);
      Alert.alert('Error Nativo', e.message);
    }
  };

  // --- Reproduce el archivo generado ---
  const handlePlayAudio = async () => {
    if (!filePath) {
      Alert.alert('Error', 'Primero genera un audio');
      return;
    }

    try {
      console.log('Cargando sonido desde:', filePath);
      
      // 3. Usa expo-av para reproducir el archivo local
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: 'file://' + filePath }, // El prefijo 'file://' es crucial
      );

      setSound(newSound);
      await newSound.playAsync();

    } catch (e: any) {
      console.error(e);
      Alert.alert('Error de reproducción', e.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Prueba de Módulo TTS</Text>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Escribe algo..."
        />
        <Button title="Generar Audio (.wav)" onPress={handleGenerateAudio} />

        {filePath && (
          <View style={styles.playbackSection}>
            <Text style={styles.filePath} numberOfLines={1}>
              Archivo: {filePath}
            </Text>
            <Button
              title="▶️ Reproducir Audio"
              onPress={handlePlayAudio}
              color="#34A853"
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  playbackSection: {
    marginTop: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  filePath: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
    fontStyle: 'italic',
  },
});