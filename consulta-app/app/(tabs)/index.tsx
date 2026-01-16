import { Image } from 'expo-image';
import { Platform, StyleSheet, Button, Alert } from 'react-native';

import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

// Se importan las funciones del módulo nativo TTS
import { generateAudioFromTTS} from 'tts-to-audio-module';

export default function HomeScreen() {

  // Función para probar la generación de audio
  const handleGenerateAudio = async () => {
    try {
      const result = await generateAudioFromTTS("Hola, este es un audio generado desde NixOS");
      Alert.alert("Éxito", `Audio generado en: ${result}`);
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  // Función para probar añadir un recordatorio
  const handleAddReminder = async () => {
    try {
      // const result = await addReminder("Tomar medicina");
      Alert.alert("Recordatorio", "Recordatorio agregado");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome!</ThemedText>
        <HelloWave />
      </ThemedView>

      {/*Sección para probar la generación de audio*/}
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 4: Native Module Test</ThemedText>
        <ThemedText>
          Usa los botones de abajo para probar tu módulo nativo TTS.
        </ThemedText>
        <ThemedView style={styles.buttonContainer}>
          <Button title="Generar Audio TTS" onPress={handleGenerateAudio} />
          <Button title="Añadir Recordatorio" onPress={handleAddReminder} color="#4CAF50" />
        </ThemedView>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  buttonContainer: {
    gap: 10,
    marginTop: 5,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});