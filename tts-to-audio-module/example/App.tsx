import { Audio } from "expo-av";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Button,
  TextInput,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Notifications from "expo-notifications";

// 1. Importa tu función desde el nombre del módulo
// (Esto funciona porque la app 'example' tiene tu módulo como dependencia)
import {
  generateAudioFromTTS,
  scheduleAudioPlayback,
  scheduleAudioPlaybackAtTimestamp,
} from "tts-to-audio-module";

import DateTimePickerModal from "react-native-modal-datetime-picker";

export default function App() {
  const [text, setText] = useState("Hola mundo desde mi módulo nativo");
  const [filePath, setFilePath] = useState<string | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  const [delay, setDelay] = useState("10"); // 10 segundos por defecto
  const [date, setDate] = useState(new Date(Date.now() + 60000));
  const [isPickerVisible, setPickerVisible] = useState(false);

  async function requestPermissions() {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permiso denegado", "No se podrán mostrar notificaciones.");
      return false;
    }
    return true;
  }

  // --- Llama a tu función nativa ---
  const handleGenerateAudio = async () => {
    // Descarga el sonido anterior si existe
    if (sound) {
      await sound.unloadAsync();
      setSound(null);
    }
    setFilePath(null);

    try {
      console.log("Llamando a generateAudioFromTTS...");

      // 2. ¡Aquí se llama a tu código de Kotlin!
      const path = await generateAudioFromTTS(text);

      console.log("¡Éxito! Archivo generado en:", path);
      Alert.alert("¡Éxito!", `Audio generado en: ${path}`);
      setFilePath(path); // Guarda la ruta para el botón de reproducir
    } catch (e: any) {
      console.error(e);
      Alert.alert("Error Nativo", e.message);
    }
  };

  // --- Reproduce el archivo generado ---
  const handlePlayAudio = async () => {
    if (!filePath) {
      Alert.alert("Error", "Primero genera un audio");
      return;
    }

    try {
      console.log("Cargando sonido desde:", filePath);

      // 3. Usa expo-av para reproducir el archivo local
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: "file://" + filePath }, // El prefijo 'file://' es crucial
      );

      setSound(newSound);
      await newSound.playAsync();
    } catch (e: any) {
      console.error(e);
      Alert.alert("Error de reproducción", e.message);
    }
  };

  const handleScheduleAudio = async () => {
    if (!filePath) {
      Alert.alert("Error", "Primero genera un archivo de audio.");
      return;
    }

    const delaySeconds = parseInt(delay, 10);
    if (isNaN(delaySeconds) || delaySeconds <= 0) {
      Alert.alert("Error", "Ingresa un número válido de segundos.");
      return;
    }

    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      return; // No continúa si el usuario denegó el permiso
    }

    try {
      const result = await scheduleAudioPlayback(filePath, delaySeconds);
      Alert.alert("¡Programado!", `${result}\nCierra la app para probar.`);
      console.log(result);
    } catch (e: any) {
      Alert.alert("Error al programar", e.message);
    }
  };

  const showDateTimePicker = () => {
    setPickerVisible(true);
  };

  const hideDateTimePicker = () => {
    setPickerVisible(false);
  };

  const handleConfirm = (selectedDate: Date) => {
    setDate(selectedDate);
    hideDateTimePicker();
  };

  const handleScheduleAtTimestamp = async () => {
    if (!filePath) {
      Alert.alert("Error", "Primero genera un archivo de audio.");
      return;
    }

    // 1. Pide permisos de notificación
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      // 2. ¡Llama a la nueva función del módulo!
      const result = await scheduleAudioPlaybackAtTimestamp(filePath, date);
      Alert.alert(
        "¡Programado!",
        `${result}\n\nProgramado para: ${date.toLocaleString()}\n\nCierra la app para probar.`,
      );
      console.log(result);
    } catch (e: any) {
      Alert.alert("Error al programar", e.message);
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

        {filePath && (
          <View style={styles.schedulingSection}>
            <Text style={styles.title}>Programar Reproducción</Text>
            <TextInput
              style={styles.input}
              value={delay}
              onChangeText={setDelay}
              placeholder="Segundos de espera"
              keyboardType="number-pad"
            />
            <Button
              title={`Programar audio en ${delay} seg.`}
              onPress={handleScheduleAudio}
              color="#FF6347"
            />
          </View>
        )}

        {filePath && (
          <View style={styles.schedulingSection}>
            <Text style={styles.title}>Programar por Fecha/Hora</Text>

            <Button
              title="Seleccionar Fecha y Hora"
              onPress={showDateTimePicker}
            />

            <Text style={styles.dateText}>
              Programado para: {date.toLocaleString()}
            </Text>

            {/* 4. EL COMPONENTE ES DIFERENTE */}
            <DateTimePickerModal
              isVisible={isPickerVisible}
              mode="datetime"
              onConfirm={handleConfirm}
              onCancel={hideDateTimePicker}
              date={date} // Opcional: para que inicie en la fecha seleccionada
              minimumDate={new Date(Date.now() + 10000)}
            />

            <Button
              title="Programar en esta Fecha"
              onPress={handleScheduleAtTimestamp}
              color="#841584"
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
    backgroundColor: "#fff",
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  playbackSection: {
    marginTop: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  filePath: {
    fontSize: 12,
    color: "#666",
    marginBottom: 10,
    fontStyle: "italic",
  },
  schedulingSection: {
    marginTop: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  dateText: {
    // Estilo para el texto de la fecha
    textAlign: "center",
    fontSize: 16,
    marginVertical: 10,
  },
});
