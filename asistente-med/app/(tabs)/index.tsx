import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Button,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import * as Speech from "expo-speech";

export default function App() {
  const [text, setText] = useState("Hola, esto es una prueba de voz con Expo.");

  const speak = () => {
    // Las opciones son opcionales y pueden variar entre iOS y Android
    const options = {
      language: "es-MX", // Define el idioma (código BCP 47)
      pitch: 1.0, // Tono de la voz (0.5 a 2.0)
      rate: 0.9, // Velocidad de la voz (0.5 a 2.0)
    };
    Speech.speak(text, options);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Prueba de Texto a Voz 🗣️</Text>
      <TextInput
        style={styles.input}
        onChangeText={setText}
        value={text}
        placeholder="Escribe algo para que lo diga en voz alta"
      />
      <Button title="Presiona para Hablar" onPress={speak} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    height: 50,
    width: "100%",
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
});
