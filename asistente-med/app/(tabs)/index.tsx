import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Button,
  ScrollView,
  Alert,
  TouchableOpacity,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import * as Speech from "expo-speech";
import { useScheduledVoice } from "../../hooks/useScheduledVoice";
import { VoiceMessageControls } from "../../components/VoiceMessageControls";

export default function App() {
  const [text, setText] = useState("Hola, esto es una prueba de voz con Expo.");
  const [delaySeconds, setDelaySeconds] = useState("10");

  const {
    scheduledMessages,
    isLoading,
    _error, // Renamed to suppress 'error' is defined but never used warning
    scheduleMessage,
    cancelMessage,
    clearAllMessages,
    getTimeUntilMessage,
    formatTimeRemaining,
  } = useScheduledVoice();

  // La inicialización del servicio de fondo ahora se maneja en _layout.tsx
  // y la verificación de mensajes pendientes en el hook useScheduledVoice.

  const speak = () => {
    // Las opciones son opcionales y pueden variar entre iOS y Android
    const options = {
      language: "es-MX", // Define el idioma (código BCP 47)
      pitch: 0.9, // Tono de la voz (0.5 a 2.0)
      rate: 0.9, // Velocidad de la voz (0.5 a 2.0)
    };
    Speech.speak(text, options);
  };

  const scheduleVoiceMessage = async () => {
    if (!text.trim()) {
      Alert.alert("Error", "Por favor escribe un mensaje");
      return;
    }

    const delay = parseInt(delaySeconds);
    if (isNaN(delay) || delay < 1) {
      Alert.alert("Error", "El tiempo debe ser un número válido mayor a 0");
      return;
    }

    const messageId = await scheduleMessage(text, delay, {
      language: "es-MX",
      pitch: 1.0,
      rate: 0.9,
    });

    if (messageId) {
      Alert.alert(
        "Mensaje Programado",
        `El mensaje se reproducirá en ${delay} segundos`,
        [{ text: "OK" }],
      );
    } else {
      Alert.alert("Error", "No se pudo programar el mensaje");
    }
  };

  const handleCancelMessage = async (messageId: string) => {
    const success = await cancelMessage(messageId);
    if (success) {
      Alert.alert("Cancelado", "Mensaje cancelado correctamente");
    } else {
      Alert.alert("Error", "No se pudo cancelar el mensaje");
    }
  };

  const handleClearAll = () => {
    Alert.alert(
      "Confirmar",
      "¿Estás seguro de que quieres cancelar todos los mensajes programados?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Sí", onPress: clearAllMessages },
      ],
    );
  };

  const handleScheduleFromControls = async (
    message: string,
    delay: number,
    options: {
      language?: string;
      pitch?: number;
      rate?: number;
    },
  ) => {
    const messageId = await scheduleMessage(message, delay, options);
    if (!messageId) {
      throw new Error("Failed to schedule message");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Asistente de Voz 🗣️</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mensaje</Text>
          <TextInput
            style={styles.input}
            onChangeText={setText}
            value={text}
            placeholder="Escribe algo para que lo diga en voz alta"
            multiline={true}
            numberOfLines={3}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tiempo de espera (segundos)</Text>
          <TextInput
            style={styles.input}
            onChangeText={setDelaySeconds}
            value={delaySeconds}
            placeholder="10"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.buttonContainer}>
          <Button title="Hablar Ahora" onPress={speak} color="#007AFF" />
          <View style={styles.buttonSpacer} />
          <Button
            title="Programar Mensaje"
            onPress={scheduleVoiceMessage}
            disabled={isLoading}
            color="#34C759"
          />
        </View>

        {_error && <Text style={styles.errorText}>{_error}</Text>}

        <VoiceMessageControls
          onScheduleMessage={handleScheduleFromControls}
          scheduledMessages={scheduledMessages}
        />

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Mensajes Programados ({scheduledMessages.length})
            </Text>
            {scheduledMessages.length > 0 && (
              <TouchableOpacity
                onPress={handleClearAll}
                style={styles.clearButton}
              >
                <Text style={styles.clearButtonText}>Limpiar Todo</Text>
              </TouchableOpacity>
            )}
          </View>

          {scheduledMessages.length === 0 ? (
            <Text style={styles.emptyText}>No hay mensajes programados</Text>
          ) : (
            scheduledMessages.map((message) => (
              <View key={message.id} style={styles.messageCard}>
                <Text style={styles.messageText} numberOfLines={2}>
                  {message.message}
                </Text>
                <Text style={styles.timeText}>
                  {formatTimeRemaining(getTimeUntilMessage(message))}
                </Text>
                <TouchableOpacity
                  onPress={() => handleCancelMessage(message.id)}
                  style={styles.cancelButton}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
    color: "#333",
  },
  section: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },
  input: {
    backgroundColor: "white",
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 50,
  },
  buttonContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  buttonSpacer: {
    width: 15,
  },
  errorText: {
    color: "#FF3B30",
    textAlign: "center",
    marginBottom: 15,
    fontSize: 14,
  },
  emptyText: {
    textAlign: "center",
    color: "#666",
    fontStyle: "italic",
    marginTop: 10,
  },
  messageCard: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  messageText: {
    fontSize: 16,
    color: "#333",
    marginBottom: 8,
  },
  timeText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
  },
  cancelButton: {
    backgroundColor: "#FF3B30",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  cancelButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  clearButton: {
    backgroundColor: "#FF3B30",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  clearButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
});
