import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useState } from "react";
import { StyleSheet, TextInput, Button, Alert } from "react-native";
import { generateAudioFromTTS, scheduleAudioPlaybackAtTimestamp } from 'tts-to-audio-module';

export default function RecordScreen() {
  const [text, setText] = useState("");

  const scheduleMessage = async () => {
    if (!text) {
      Alert.alert("Error", "Por favor ingresa un mensaje");
      return;
    }

    try {
      // 1. Generar el archivo de audio a partir del texto
      console.log("Generando audio...");
      const path = await generateAudioFromTTS(text);

      // 2. Programar la reproducción (por ejemplo, en 10 segundos)
      const scheduledDate = new Date(Date.now() + 10000);
      console.log("Programando para:", scheduledDate.toLocaleString());
      
      const result = await scheduleAudioPlaybackAtTimestamp(path, scheduledDate);

      Alert.alert("Éxito", `Audio programado: ${result}`);
    } catch (e: any) {
      console.error(e);
      Alert.alert("Error", e.message || "Fallo al programar el mensaje");
    }
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={<ThemedText style={{ fontSize: 40 }}>🎙️</ThemedText>}
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Recordatorios de Voz</ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Escribe tu mensaje</ThemedText>
        <TextInput
          style={styles.input}
          placeholder="Ej: Tomar medicina"
          placeholderTextColor="#ccc"
          onChangeText={setText}
          value={text}
        />
        <Button title="Programar en 10 segundos" onPress={scheduleMessage} />
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: { flexDirection: "row", alignItems: "center", gap: 8 },
  stepContainer: { gap: 8, marginBottom: 8 },
  input: {
    height: 45,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    color: "#fff",
    backgroundColor: 'rgba(255,255,255,0.1)'
  },
});