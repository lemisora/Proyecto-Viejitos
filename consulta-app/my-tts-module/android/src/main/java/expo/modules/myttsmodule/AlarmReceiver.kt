package expo.modules.myttsmodule

// --- DEPENDENCIAS NECESARIAS ---

// Proporciona la clase base para recibir intents de difusión del sistema, como las alarmas.
import android.content.BroadcastReceiver
// Permite acceder al contexto de la aplicación para iniciar servicios u otras operaciones.
import android.content.Context
// La clase que representa el mensaje (en este caso, la alarma) que recibe este componente.
import android.content.Intent

// --- CÓDIGO DE LA CLASE ---

/**
 * Este BroadcastReceiver se activa cuando el AlarmManager dispara una alarma programada.
 * Su única responsabilidad es recibir la ruta del archivo de audio y iniciar
 * el servicio de reproducción (AudioPlaybackService) para que lo reproduzca.
 */
class AlarmReceiver : BroadcastReceiver() {

    // El método onReceive se ejecuta cuando la alarma se dispara.
    override fun onReceive(context: Context, intent: Intent) {
        // 1. Recibe la ruta del archivo de audio desde el Intent que creó la alarma.
        // El operador elvis (?: return) asegura que si la ruta es nula, la ejecución se detiene
        // para evitar errores. "AUDIO_FILE_PATH" debe ser la misma clave usada al crear el PendingIntent.
        val filePath = intent.getStringExtra("AUDIO_FILE_PATH") ?: return

        // 2. Crea un Intent explícito para iniciar el servicio de reproducción de audio.
        // Es explícito porque especifica la clase exacta a la que se dirige (AudioPlaybackService).
        val serviceIntent = Intent(context, AudioPlaybackService::class.java)

        // 3. Pasa la ruta del archivo de audio al servicio para que sepa qué reproducir.
        // De nuevo, usamos la misma clave "AUDIO_FILE_PATH" para mantener la consistencia.
        serviceIntent.putExtra("AUDIO_FILE_PATH", filePath)

        // 4. Inicia el servicio de reproducción en segundo plano.
        // Usamos startService en lugar de startForegroundService porque la reproducción
        // puede ser corta. Si fuera una tarea larga, se necesitaría un servicio en primer plano.
        context.startService(serviceIntent)
    }
}
