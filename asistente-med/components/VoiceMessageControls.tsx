import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ScheduledMessage } from "../services/backgroundTasks";

interface VoiceMessageControlsProps {
  onScheduleMessage: (
    message: string,
    delay: number,
    options: {
      language?: string;
      pitch?: number;
      rate?: number;
    },
  ) => Promise<void>;
  scheduledMessages: ScheduledMessage[];
}

export const VoiceMessageControls: React.FC<VoiceMessageControlsProps> = ({
  onScheduleMessage,
  scheduledMessages,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [quickMessage, setQuickMessage] = useState("");
  const [customDelay, setCustomDelay] = useState("");
  const [advancedSettings, setAdvancedSettings] = useState(false);
  const [language, setLanguage] = useState("es-MX");
  const [pitch, setPitch] = useState("1.0");
  const [rate, setRate] = useState("0.9");

  const quickMessages = [
    { text: "Es hora de tomar tu medicina", delay: 10, icon: "💊" },
    { text: "Recuerda tomar agua", delay: 30, icon: "💧" },
    { text: "Hora de caminar un poco", delay: 60, icon: "🚶‍♂️" },
    { text: "Es momento de descansar", delay: 120, icon: "😴" },
    { text: "Revisa tu presión arterial", delay: 300, icon: "🩺" },
  ];

  const handleQuickSchedule = async (message: string, delay: number) => {
    try {
      await onScheduleMessage(message, delay, {
        language,
        pitch: parseFloat(pitch),
        rate: parseFloat(rate),
      });
      Alert.alert(
        "Programado",
        `"${message}" se reproducirá en ${delay} segundos`,
      );
    } catch (_error) {
      // Renamed to _error to suppress unused variable warning
      Alert.alert("Error", "No se pudo programar el mensaje");
    }
  };

  const handleCustomSchedule = async () => {
    if (!quickMessage.trim()) {
      Alert.alert("Error", "Por favor ingresa un mensaje");
      return;
    }

    const delay = parseInt(customDelay);
    if (isNaN(delay) || delay < 1) {
      Alert.alert("Error", "El tiempo debe ser un número válido mayor a 0");
      return;
    }

    try {
      await onScheduleMessage(quickMessage, delay, {
        language,
        pitch: parseFloat(pitch),
        rate: parseFloat(rate),
      });
      setQuickMessage("");
      setCustomDelay("");
      setModalVisible(false);
      Alert.alert(
        "Programado",
        `"${quickMessage}" se reproducirá en ${delay} segundos`,
      );
    } catch (_error) {
      // Renamed to _error to suppress unused variable warning
      Alert.alert("Error", "No se pudo programar el mensaje");
    }
  };

  const getNextMessage = () => {
    if (scheduledMessages.length === 0) return null;

    const now = Date.now();
    const activeMessages = scheduledMessages.filter(
      (msg) => msg.isActive && msg.scheduledTime > now,
    );

    if (activeMessages.length === 0) return null;

    return activeMessages.reduce((earliest, current) =>
      current.scheduledTime < earliest.scheduledTime ? current : earliest,
    );
  };

  const nextMessage = getNextMessage();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mensajes Rápidos</Text>
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          style={styles.customButton}
        >
          <Ionicons name="add-circle" size={24} color="#007AFF" />
          <Text style={styles.customButtonText}>Personalizado</Text>
        </TouchableOpacity>
      </View>

      {nextMessage && (
        <View style={styles.nextMessageCard}>
          <Ionicons name="time-outline" size={20} color="#007AFF" />
          <Text style={styles.nextMessageText}>
            Próximo: "{nextMessage.message.substring(0, 30)}..."
          </Text>
        </View>
      )}

      <View style={styles.quickMessagesGrid}>
        {quickMessages.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.quickMessageCard}
            onPress={() => handleQuickSchedule(item.text, item.delay)}
          >
            <Text style={styles.quickMessageIcon}>{item.icon}</Text>
            <Text style={styles.quickMessageText} numberOfLines={2}>
              {item.text}
            </Text>
            <Text style={styles.quickMessageDelay}>{item.delay}s</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Mensaje Personalizado</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.modalInput}
              placeholder="Escribe tu mensaje personalizado..."
              value={quickMessage}
              onChangeText={setQuickMessage}
              multiline={true}
              numberOfLines={3}
            />

            <TextInput
              style={styles.modalInput}
              placeholder="Tiempo en segundos (ej: 60)"
              value={customDelay}
              onChangeText={setCustomDelay}
              keyboardType="numeric"
            />

            <View style={styles.advancedToggle}>
              <Text style={styles.advancedToggleText}>
                Configuración avanzada
              </Text>
              <Switch
                value={advancedSettings}
                onValueChange={setAdvancedSettings}
                trackColor={{ false: "#767577", true: "#81b0ff" }}
                thumbColor={advancedSettings ? "#007AFF" : "#f4f3f4"}
              />
            </View>

            {advancedSettings && (
              <View style={styles.advancedSettingsContainer}>
                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>Idioma:</Text>
                  <TextInput
                    style={styles.settingInput}
                    value={language}
                    onChangeText={setLanguage}
                    placeholder="es-MX"
                  />
                </View>

                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>Tono (0.5-2.0):</Text>
                  <TextInput
                    style={styles.settingInput}
                    value={pitch}
                    onChangeText={setPitch}
                    placeholder="1.0"
                    keyboardType="decimal-pad"
                  />
                </View>

                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>Velocidad (0.5-2.0):</Text>
                  <TextInput
                    style={styles.settingInput}
                    value={rate}
                    onChangeText={setRate}
                    placeholder="0.9"
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>
            )}

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.scheduleButton]}
                onPress={handleCustomSchedule}
              >
                <Text style={styles.scheduleButtonText}>Programar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  customButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f8ff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  customButtonText: {
    marginLeft: 5,
    color: "#007AFF",
    fontSize: 14,
    fontWeight: "500",
  },
  nextMessageCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f8ff",
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  nextMessageText: {
    marginLeft: 8,
    color: "#007AFF",
    fontSize: 14,
    flex: 1,
  },
  quickMessagesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  quickMessageCard: {
    width: "48%",
    backgroundColor: "#f8f9fa",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  quickMessageIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  quickMessageText: {
    textAlign: "center",
    fontSize: 12,
    fontWeight: "500",
    color: "#333",
    marginBottom: 5,
  },
  quickMessageDelay: {
    fontSize: 10,
    color: "#666",
    backgroundColor: "#e9ecef",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    width: "90%",
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
  },
  closeButton: {
    padding: 5,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 15,
    fontSize: 16,
    minHeight: 50,
  },
  advancedToggle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  advancedToggleText: {
    fontSize: 16,
    color: "#333",
  },
  advancedSettingsContainer: {
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  settingLabel: {
    fontSize: 14,
    color: "#666",
    flex: 1,
  },
  settingInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    width: 100,
    textAlign: "center",
    backgroundColor: "white",
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    minWidth: 100,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  cancelButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "500",
  },
  scheduleButton: {
    backgroundColor: "#007AFF",
  },
  scheduleButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
