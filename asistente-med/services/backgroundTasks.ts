import * as TaskManager from "expo-task-manager";
import * as Speech from "expo-speech";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const BACKGROUND_VOICE_TASK = "background-voice-task";
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

// Configurar las notificaciones si aún no están configuradas
// Esto es importante para que las tareas en segundo plano puedan mostrar notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Funciones auxiliares movidas aquí para que la tarea las pueda usar
async function getScheduledMessages(): Promise<ScheduledMessage[]> {
  try {
    const messagesString = await AsyncStorage.getItem(SCHEDULED_MESSAGES_KEY);
    return messagesString ? JSON.parse(messagesString) : [];
  } catch (error) {
    console.error("Error al obtener mensajes en background task:", error);
    return [];
  }
}

async function updateMessageStatus(
  messageId: string,
  isActive: boolean,
): Promise<void> {
  try {
    const messages = await getScheduledMessages();
    const updatedMessages = messages.map((msg) =>
      msg.id === messageId ? { ...msg, isActive } : msg,
    );
    await AsyncStorage.setItem(
      SCHEDULED_MESSAGES_KEY,
      JSON.stringify(updatedMessages),
    );
  } catch (error) {
    console.error(
      "Error al actualizar estado del mensaje en background task:",
      error,
    );
  }
}

async function speakMessage(message: ScheduledMessage): Promise<void> {
  try {
    const options = {
      language: message.language || "es-MX",
      pitch: message.pitch || 1.0,
      rate: message.rate || 0.9,
    };
    console.log(
      `Intentando reproducir mensaje: "${message.message}" con Speech.speak`,
    );
    await Speech.speak(message.message, options);
    console.log(`Mensaje "${message.message}" reproducido exitosamente.`);
  } catch (error) {
    console.error("Error al reproducir mensaje en background task:", error);
  }
}

async function sendNotification(message: string): Promise<void> {
  try {
    // Usamos presentNotificationAsync si la app está en foreground
    // o scheduleNotificationAsync con trigger: null para que se muestre inmediatamente
    // si la app está en background/killed y la tarea la disparó.
    // La idea es que la notificación sirva como un "aviso visual" de que el audio se ejecutó.
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Mensaje de Asistente Med",
        body: `Se ha reproducido: "${message}"`,
        sound: true, // Esto reproducirá un sonido de notificación estándar
      },
      trigger: null, // Dispara la notificación inmediatamente
    });
    console.log(`Notificación enviada para mensaje: ${message}`);
  } catch (error) {
    console.error("Error al enviar notificación en background task:", error);
  }
}

// Definir la tarea en segundo plano
TaskManager.defineTask(BACKGROUND_VOICE_TASK, async ({ data, error }) => {
  if (error) {
    console.error("Error en tarea de segundo plano:", error.message);
    return TaskManager.Result.Failed;
  }
  if (data) {
    console.log("Datos recibidos en tarea de segundo plano:", data);
  }

  try {
    console.log("Ejecutando BACKGROUND_VOICE_TASK...");

    const scheduledMessages = await getScheduledMessages();
    const currentTime = Date.now();

    let messagesProcessed = 0;
    for (const message of scheduledMessages) {
      if (message.isActive && message.scheduledTime <= currentTime) {
        console.log(
          `Procesando mensaje programado: ${message.message} (ID: ${message.id})`,
        );
        await speakMessage(message); // Reproducir el mensaje de voz
        await updateMessageStatus(message.id, false); // Marcar como inactivo
        await sendNotification(message.message); // Enviar notificación visual
        messagesProcessed++;
      }
    }

    if (messagesProcessed > 0) {
      console.log(
        `${messagesProcessed} mensajes reproducidos en segundo plano.`,
      );
      return TaskManager.Result.NewData;
    } else {
      console.log("No hay mensajes pendientes para reproducir.");
      return TaskManager.Result.NoData;
    }
  } catch (e) {
    console.error("Error global en BACKGROUND_VOICE_TASK:", e);
    return TaskManager.Result.Failed;
  }
});

// Función para inicializar la tarea en segundo plano al inicio de la aplicación
// Función para inicializar la tarea en segundo plano al inicio de la aplicación
export async function registerBackgroundVoiceTask(): Promise<void> {
  const isRegistered = await TaskManager.isTaskRegisteredAsync(
    BACKGROUND_VOICE_TASK,
  );
  if (isRegistered) {
    console.log("Tarea de voz en segundo plano ya registrada.");
    // Asegurarse de que el handler de notificaciones esté configurado
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
    return;
  }

  try {
    // Solicitar permisos de notificación si no se han otorgado
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") {
      console.warn(
        "Permisos de notificación no otorgados. Algunas funcionalidades pueden verse afectadas.",
      );
    }

    // Registrar la tarea. La clave es que TaskManager.defineTask se haya llamado
    // antes de cualquier intento de ejecutar la tarea, lo cual se hace al inicio del archivo.
    // No se requiere TaskManager.registerTaskAsync ni setBackgroundFetchTaskAsync aquí,
    // a menos que se desee una tarea de 'fetch' periódica que no dependa de notificaciones.
    console.log(
      "Tarea de voz en segundo plano definida y lista para ser ejecutada por Expo.",
    );
  } catch (error) {
    console.error("Error al registrar tarea en segundo plano:", error);
  }
}

// Función para verificar mensajes pendientes (llamar periódicamente)
export async function checkPendingMessages(): Promise<void> {
  try {
    const messages = await getScheduledMessages();
    const currentTime = Date.now();

    for (const message of messages) {
      if (message.isActive && message.scheduledTime <= currentTime) {
        await speakMessage(message);
        await updateMessageStatus(message.id, false);
        await sendNotification(message.message);
      }
    }
  } catch (error) {
    console.error("Error al verificar mensajes pendientes:", error);
  }
}
