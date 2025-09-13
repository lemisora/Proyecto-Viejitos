import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SCHEDULED_MESSAGES_KEY = "scheduled_messages";

export interface ScheduledMessage {
  id: string;
  message: string;
  scheduledTime: number;
  isActive: boolean;
  language?: string;
  pitch?: number;
  rate?: number;
}

export class BackgroundVoiceService {
  static async scheduleMessage(
    message: string,
    delayInSeconds: number = 10,
    options?: {
      language?: string;
      pitch?: number;
      rate?: number;
    },
  ): Promise<string> {
    try {
      const messageId =
        Date.now().toString() + Math.random().toString(36).substr(2, 9);
      const scheduledTime = Date.now() + delayInSeconds * 1000;

      const scheduledMessage: ScheduledMessage = {
        id: messageId,
        message,
        scheduledTime,
        isActive: true,
        language: options?.language || "es-MX",
        pitch: options?.pitch || 1.0,
        rate: options?.rate || 0.9,
      };

      // Guardar en AsyncStorage
      await this.saveScheduledMessage(scheduledMessage);

      // Programar notificación local como respaldo
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Mensaje programado",
          body: message,
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: delayInSeconds,
        },
      });

      console.log(
        `Mensaje programado para ${delayInSeconds} segundos: ${message}`,
      );
      return messageId;
    } catch (error) {
      console.error("Error al programar mensaje:", error);
      throw error;
    }
  }

  static async cancelScheduledMessage(messageId: string): Promise<boolean> {
    try {
      const messages = await this._getScheduledMessages();
      const updatedMessages = messages.map((msg) =>
        msg.id === messageId ? { ...msg, isActive: false } : msg,
      );

      await this._saveScheduledMessages(updatedMessages);
      return true;
    } catch (error) {
      console.error("Error al cancelar mensaje:", error);
      return false;
    }
  }

  static async getActiveMessages(): Promise<ScheduledMessage[]> {
    const messages = await this._getScheduledMessages();
    return messages.filter((msg) => msg.isActive);
  }

  static async clearAllScheduledMessages(): Promise<void> {
    try {
      await AsyncStorage.removeItem(SCHEDULED_MESSAGES_KEY);
    } catch (error) {
      console.error("Error al limpiar mensajes:", error);
    }
  }

  private static async saveScheduledMessage(
    message: ScheduledMessage,
  ): Promise<void> {
    try {
      const existingMessages = await this._getScheduledMessages();
      existingMessages.push(message);
      await this._saveScheduledMessages(existingMessages);
    } catch (error) {
      console.error("Error al guardar mensaje:", error);
      throw error;
    }
  }

  // Funciones auxiliares internas para la clase BackgroundVoiceService
  private static async _getScheduledMessages(): Promise<ScheduledMessage[]> {
    try {
      const messagesString = await AsyncStorage.getItem(SCHEDULED_MESSAGES_KEY);
      return messagesString ? JSON.parse(messagesString) : [];
    } catch (error) {
      console.error("Error al obtener mensajes (interno de BVS):", error);
      return [];
    }
  }

  private static async _saveScheduledMessages(
    messages: ScheduledMessage[],
  ): Promise<void> {
    try {
      await AsyncStorage.setItem(
        SCHEDULED_MESSAGES_KEY,
        JSON.stringify(messages),
      );
    } catch (error) {
      console.error("Error al guardar mensajes (interno de BVS):", error);
      throw error;
    }
  }
}
