import React, { useState, useEffect } from 'react';
import {
  View,
  Button,
  Alert,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';

// 1. Importa 'expo-av' para reproducir el audio
import { Audio } from 'expo-av';

// 2. Importa tus funciones nativas
//    ¡Asegúrate de que esta ruta sea correcta!
import {
  generateAudioFromTTS,
  addReminder,
  getReminders,
} from './modules/ttstoaudiomodule';

// Un tipo simple para tus recordatorios (basado en el JSON de ejemplo)
type Reminder = {
  id: number;
  text: string;
};

export default function App() {
  const [textToSpeak, setTextToSpeak] = useState('Hola mundo desde Expo');
  const [reminderText, setReminderText] = useState('');
  
  const [filePath, setFilePath] = useState<string | null>(null);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  // --- Función 1: Generar Audio ---
  const handleGenerateAudio = async () => {
    if (!textToSpeak.trim()) {
      Alert.alert('Error', 'Por favor ingresa un texto para generar el audio.');
      return;
    }
    
    try {
      console.log('Solicitando generación de audio...');
      // Llama a la función nativa
      const path = await generateAudioFromTTS(textToSpeak);
      
      console.log('¡Audio generado! Ruta:', path);
      setFilePath(path); // Guarda la ruta en el estado
      Alert.alert('¡Éxito!', 'Audio generado en: ' + path);
    } catch (e: any) {
      console.error(e);
      Alert.alert('Error al generar audio', e.message);
    }
  };

  // --- Función 2: Reproducir Audio ---
  const handlePlayAudio = async () => {
    if (!filePath) {
      Alert.alert('Error', 'Primero debes generar un archivo de audio.');
      return;
    }

    console.log('Cargando sonido desde:', filePath);
    try {
      // Detiene y descarga el sonido anterior si existe
      if (sound) {
        await sound.unloadAsync();
      }

      // Crea y reproduce el nuevo sonido
      // Prefijamos con 'file://' para que expo-av sepa que es un archivo local
      const { sound: newSound } = await Audio.Sound.createAsync(
         { uri: 'file://' + filePath }
      );
      setSound(newSound);
      
      console.log('Reproduciendo sonido...');
      await newSound.playAsync();
    } catch (e: any) {
      console.error(e);
      Alert.alert('Error al reproducir audio', e.message);
    }
  };

  // --- Función 3: Añadir Recordatorio ---
  const handleAddReminder = async () => {
    if (!reminderText.trim()) {
      Alert.alert('Error', 'Por favor ingresa el texto del recordatorio.');
      return;
    }

    try {
      const response = await addReminder(reminderText);
      Alert.alert('Éxito', response);
      setReminderText(''); // Limpia el input
      handleGetReminders(); // Actualiza la lista
    } catch (e: any) {
      console.error(e);
      Alert.alert('Error al añadir recordatorio', e.message);
    }
  };

  // --- Función 4: Obtener Recordatorios ---
  const handleGetReminders = async () => {
    try {
      // getReminders() devuelve un string JSON
      const remindersJsonString = await getReminders();
      // Parseamos el JSON para convertirlo en un objeto/array de JavaScript
      const remindersArray = JSON.parse(remindersJsonString);
      setReminders(remindersArray);
    } catch (e: any) {
      console.error(e);
      Alert.alert('Error al obtener recordatorios', e.message);
    }
  };

  // Efecto para descargar el sonido cuando la app se cierra
  useEffect(() => {
    return sound
      ? () => {
          console.log('Descargando sonido...');
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        
        {/* --- SECCIÓN 1: TTS --- */}
        <View style={styles.section}>
          <Text style={styles.title}>Generador de Audio TTS</Text>
          <TextInput
            style={styles.input}
            placeholder="Escribe algo para convertir a voz..."
            value={textToSpeak}
            onChangeText={setTextToSpeak}
          />
          <Button title="Generar Audio" onPress={handleGenerateAudio} />
        </View>

        {/* --- SECCIÓN 2: REPRODUCTOR --- */}
        {filePath && (
          <View style={styles.section}>
            <Text style={styles.filePathText}>Archivo: {filePath}</Text>
            <Button title="▶️ Reproducir Audio Generado" onPress={handlePlayAudio} />
          </View>
        )}

        {/* --- SECCIÓN 3: RECORDATORIOS --- */}
        <View style={styles.section}>
          <Text style={styles.title}>Recordatorios</Text>
          <TextInput
            style={styles.input}
            placeholder="Escribe un nuevo recordatorio..."
            value={reminderText}
            onChangeText={setReminderText}
          />
          <Button title="Añadir Recordatorio" onPress={handleAddReminder} />
        </View>

        {/* --- SECCIÓN 4: LISTA DE RECORDATORIOS --- */}
        <View style={styles.section}>
          <Button title="Refrescar Lista de Recordatorios" onPress={handleGetReminders} />
          <Text style={styles.subtitle}>Lista:</Text>
          {reminders.length === 0 ? (
            <Text>No hay recordatorios.</Text>
          ) : (
            reminders.map((reminder) => (
              <Text key={reminder.id} style={styles.reminderItem}>
                - {reminder.text}
              </Text>
            ))
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// --- Estilos ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 12,
  },
  filePathText: {
    fontSize: 12,
    color: '#555',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  reminderItem: {
    fontSize: 16,
    paddingVertical: 4,
  },
});