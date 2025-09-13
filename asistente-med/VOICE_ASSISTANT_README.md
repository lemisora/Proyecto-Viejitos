# Asistente de Voz con Mensajes Programados

Este proyecto es un asistente de voz desarrollado en React Native con Expo que permite programar mensajes de voz para reproducir en segundo plano, ideal para recordatorios médicos y cuidado de adultos mayores.

## 🚀 Características

- **Texto a voz inmediato**: Reproduce mensajes instantáneamente
- **Mensajes programados**: Programa mensajes para reproducir después de un tiempo específico
- **Funcionamiento en segundo plano**: Los mensajes se reproducen aunque la app esté cerrada
- **Mensajes rápidos preconfigurados**: Recordatorios médicos comunes
- **Configuración avanzada**: Ajusta idioma, tono y velocidad de la voz
- **Notificaciones**: Recibe notificaciones cuando se reproduce un mensaje
- **Interfaz intuitiva**: Diseño amigable para adultos mayores

## 📱 Funcionalidades Principales

### 1. Reproducción Inmediata
- Escribe cualquier mensaje y reprodúcelo instantáneamente
- Configuración de idioma, tono y velocidad

### 2. Mensajes Programados
- Programa mensajes para reproducir en 10 segundos, 1 minuto, 5 minutos, etc.
- Los mensajes se reproducen aunque la app esté en segundo plano
- Lista de mensajes activos con tiempo restante

### 3. Mensajes Rápidos
- **💊 "Es hora de tomar tu medicina"** (10 segundos)
- **💧 "Recuerda tomar agua"** (30 segundos)
- **🚶‍♂️ "Hora de caminar un poco"** (1 minuto)
- **😴 "Es momento de descansar"** (2 minutos)
- **🩺 "Revisa tu presión arterial"** (5 minutos)

### 4. Configuración Avanzada
- **Idioma**: es-MX, en-US, etc.
- **Tono**: 0.5 a 2.0 (más grave a más agudo)
- **Velocidad**: 0.5 a 2.0 (más lento a más rápido)

## 🛠️ Instalación y Configuración

### Requisitos Previos
- Node.js (versión 14 o superior)
- Expo CLI
- Un dispositivo móvil o emulador

### Instalación de Dependencias

```bash
npm install
```

### Dependencias Principales Instaladas
```json
{
  "expo-speech": "~14.0.7",
  "expo-task-manager": "latest",
  "expo-background-task": "latest",
  "@react-native-async-storage/async-storage": "latest",
  "expo-notifications": "latest"
}
```

### Permisos Requeridos

El proyecto está configurado con los siguientes permisos en `app.json`:

**iOS:**
- `UIBackgroundModes`: background-fetch, background-processing

**Android:**
- `android.permission.FOREGROUND_SERVICE`
- `android.permission.WAKE_LOCK`
- `android.permission.VIBRATE`
- `android.permission.RECEIVE_BOOT_COMPLETED`

## 🚀 Ejecución

### Modo de Desarrollo
```bash
npm start
```

### Para Android
```bash
npm run android
```

### Para iOS
```bash
npm run ios
```

## 📁 Estructura del Proyecto

```
asistente-med/
├── app/
│   ├── (tabs)/
│   │   └── index.tsx          # Componente principal
│   └── _layout.tsx            # Layout raíz con inicialización
├── components/
│   └── VoiceMessageControls.tsx  # Controles avanzados
├── hooks/
│   └── useScheduledVoice.ts   # Hook para mensajes programados
├── services/
│   └── BackgroundVoiceService.ts  # Servicio de segundo plano
└── assets/                    # Recursos multimedia
```

## 🔧 Uso del Sistema

### 1. Programar un Mensaje Simple

```typescript
import { BackgroundVoiceService } from '../services/BackgroundVoiceService';

// Programar mensaje para 30 segundos
const messageId = await BackgroundVoiceService.scheduleMessage(
  "Recuerda tomar tu medicina",
  30,  // segundos
  {
    language: "es-MX",
    pitch: 1.0,
    rate: 0.9
  }
);
```

### 2. Usando el Hook Personalizado

```typescript
import { useScheduledVoice } from '../hooks/useScheduledVoice';

const {
  scheduledMessages,
  scheduleMessage,
  cancelMessage,
  clearAllMessages
} = useScheduledVoice();

// Programar mensaje
const messageId = await scheduleMessage(
  "Hora de caminar",
  60,
  { language: "es-MX" }
);

// Cancelar mensaje específico
await cancelMessage(messageId);

// Limpiar todos los mensajes
await clearAllMessages();
```

### 3. Verificar Mensajes Activos

```typescript
const activeMessages = await BackgroundVoiceService.getActiveMessages();
console.log(`Tienes ${activeMessages.length} mensajes programados`);
```

## 🎯 Casos de Uso Principales

### Para Adultos Mayores
- **Recordatorios de medicamentos**: Programa alertas para tomar pastillas
- **Hidratación**: Recordatorios para beber agua regularmente
- **Ejercicio**: Alertas para caminar o hacer ejercicio ligero
- **Descanso**: Recordatorios para tomar siestas o descansar

### Para Cuidadores
- **Monitoreo remoto**: Programa mensajes que se activen cuando no estés presente
- **Rutinas de salud**: Recordatorios para medir presión, glucosa, etc.
- **Actividades diarias**: Alertas para comidas, medicinas, ejercicio

## 🔄 Funcionamiento en Segundo Plano

El sistema utiliza varias tecnologías para asegurar que los mensajes se reproduzcan incluso cuando la app está cerrada:

1. **TaskManager de Expo**: Para tareas programadas
2. **AsyncStorage**: Para persistir mensajes programados
3. **Notificaciones locales**: Como respaldo cuando la app está cerrada
4. **Verificación periódica**: Check cada 5 segundos de mensajes pendientes

## 🐛 Solución de Problemas

### Los mensajes no se reproducen en segundo plano
1. Verifica que los permisos estén otorgados
2. En iOS, asegúrate de que la app tenga permisos de actualización en segundo plano
3. En Android, desactiva la optimización de batería para la app

### Los mensajes se reproducen múltiples veces
- Esto puede ocurrir si hay múltiples instancias de verificación ejecutándose
- Reinicia la aplicación para limpiar el estado

### Problemas con el idioma de voz
- Verifica que el idioma esté instalado en el dispositivo
- Algunos dispositivos tienen configuraciones de idioma limitadas

## 📱 Configuración de Dispositivo

### Android
1. Ve a **Configuración > Apps > Asistente Med**
2. Activa **"Permitir en segundo plano"**
3. Desactiva **"Optimización de batería"**

### iOS
1. Ve a **Configuración > General > Actualización en segundo plano**
2. Activa la opción para **"Asistente Med"**

## 🔮 Próximas Funcionalidades

- [ ] Integración con sensores de salud
- [ ] Recordatorios recurrentes (diarios, semanales)
- [ ] Múltiples voces y idiomas
- [ ] Integración con calendarios
- [ ] Estadísticas de uso
- [ ] Modo de emergencia con contactos

## 🤝 Contribución

Para contribuir al proyecto:

1. Fork el repositorio
2. Crea una rama para tu funcionalidad (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👥 Soporte

Si tienes problemas o preguntas:

1. Revisa la documentación
2. Verifica los issues existentes en GitHub
3. Crea un nuevo issue con detalles del problema

## 🏥 Uso Médico

**Importante**: Este asistente es una herramienta de apoyo y no reemplaza el consejo médico profesional. Siempre consulta con profesionales de la salud para decisiones médicas importantes.