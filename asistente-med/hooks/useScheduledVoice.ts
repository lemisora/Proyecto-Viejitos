import { useState, useEffect, useCallback } from "react";

import { BackgroundVoiceService } from "../services/BackgroundVoiceService";
import {
  ScheduledMessage,
  checkPendingMessages,
} from "../services/backgroundTasks";

export const useScheduledVoice = () => {
  const [scheduledMessages, setScheduledMessages] = useState<
    ScheduledMessage[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadActiveMessages = useCallback(async () => {
    try {
      const messages = await BackgroundVoiceService.getActiveMessages();
      setScheduledMessages(messages);
    } catch (err) {
      setError("Error al cargar mensajes programados");
      console.error(err);
    }
  }, []);

  // Cargar mensajes activos al montar el componente
  useEffect(() => {
    loadActiveMessages();

    // Verificar mensajes pendientes cada 5 segundos
    // Verificar mensajes pendientes cada 5 segundos
    const interval = setInterval(async () => {
      await checkPendingMessages(); // Llama a la función de la tarea en segundo plano
      loadActiveMessages(); // Refresca el estado de la UI
    }, 5000);
    checkPendingMessages();
    loadActiveMessages();

    return () => clearInterval(interval);
  }, [loadActiveMessages]); // Added loadActiveMessages to dependency array to fix the diagnostic

  const scheduleMessage = useCallback(
    async (
      message: string,
      delayInSeconds: number = 10,
      options?: {
        language?: string;
        pitch?: number;
        rate?: number;
      },
    ): Promise<string | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const messageId = await BackgroundVoiceService.scheduleMessage(
          message,
          delayInSeconds,
          options,
        );

        await loadActiveMessages();
        return messageId;
      } catch (err) {
        setError("Error al programar el mensaje");
        console.error(err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [loadActiveMessages],
  );

  const cancelMessage = useCallback(
    async (messageId: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        const success =
          await BackgroundVoiceService.cancelScheduledMessage(messageId);
        if (success) {
          await loadActiveMessages();
        }
        return success;
      } catch (err) {
        setError("Error al cancelar el mensaje");
        console.error(err);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [loadActiveMessages],
  );

  const clearAllMessages = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      await BackgroundVoiceService.clearAllScheduledMessages();
      setScheduledMessages([]);
    } catch (err) {
      setError("Error al limpiar todos los mensajes");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getTimeUntilMessage = useCallback(
    (message: ScheduledMessage): number => {
      const currentTime = Date.now();
      const timeLeft = message.scheduledTime - currentTime;
      return Math.max(0, Math.ceil(timeLeft / 1000));
    },
    [],
  );

  const formatTimeRemaining = useCallback((seconds: number): string => {
    if (seconds <= 0) return "Listo para reproducir";

    if (seconds < 60) {
      return `${seconds} segundos`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return `${hours}h ${minutes}m`;
    }
  }, []);

  return {
    scheduledMessages,
    isLoading,
    error,
    scheduleMessage,
    cancelMessage,
    clearAllMessages,
    getTimeUntilMessage,
    formatTimeRemaining,
    refreshMessages: loadActiveMessages,
  };
};
