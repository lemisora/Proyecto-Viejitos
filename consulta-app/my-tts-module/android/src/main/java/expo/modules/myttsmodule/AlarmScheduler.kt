package expo.modules.myttsmodule

// --- DEPENDENCIAS NECESARIAS ---

// Proporciona acceso al servicio de alarmas del sistema Android.
import android.app.AlarmManager

// Un contenedor para un Intent que permite a otra aplicación (en este caso, el sistema Android)
// ejecutar una acción en nombre de tu app con tus permisos. Es fundamental para las alarmas.
import android.app.PendingIntent

// Permite acceder al contexto de la aplicación, necesario para obtener servicios del sistema
// y crear Intents.
import android.content.Context

// La clase que representa la acción a realizar (en este caso, activar el AlarmReceiver).
import android.content.Intent

// Proporciona funcionalidades para interactuar con la versión del SDK de Android,
// necesario para comprobaciones de compatibilidad (aunque no se use directamente aquí, es buena práctica).
import android.os.Build
import androidx.core.content.getSystemService

// --- CÓDIGO DEL OBJETO ---

/**
 * Un objeto singleton para manejar la lógica de programación de alarmas.
 * Al ser un 'object', solo existe una instancia de esta clase en toda la aplicación.
 */
object AlarmScheduler {

    /**
     * Programa una alarma única y exacta que se activará incluso si el dispositivo
     * está en modo de bajo consumo (Doze).
     *
     * @param context El contexto de la aplicación, necesario para obtener el AlarmManager.
     * @param filePath La ruta al archivo de audio que se debe reproducir cuando la alarma se dispare.
     * @param timestamp El momento exacto (en milisegundos desde la época UTC) en que la alarma debe sonar.
     */
    fun programarAlarma(context: Context, filePath: String, timestamp: Long) {
        // Obtiene una instancia del servicio AlarmManager del sistema.
        val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager

        // 1. Crea un Intent dirigido a nuestro AlarmReceiver.
        // Este Intent es el mensaje que se enviará cuando la alarma se dispare.
        val intent = Intent(context, AlarmReceiver::class.java)

        // 2. ¡MUY IMPORTANTE! Añade la ruta del archivo de audio como un "extra" al Intent.
        // El AlarmReceiver leerá este dato para saber qué archivo de audio reproducir.
        // La clave "AUDIO_FILE_PATH" debe ser consistente en ambos lados.
        intent.putExtra("AUDIO_FILE_PATH", filePath)

        // 3. Envuelve el Intent en un PendingIntent.
        // Esto le da permiso al sistema Android para ejecutar nuestro BroadcastReceiver en el futuro.
        val pendingIntent = PendingIntent.getBroadcast(
            context,
            0, // requestCode: un identificador para este PendingIntent. 0 es suficiente si solo hay uno.
            intent,
            // Flags:
            // FLAG_UPDATE_CURRENT: Si se crea una nueva alarma con el mismo requestCode, se actualiza la anterior.
            // FLAG_IMMUTABLE: Es obligatorio para apps dirigidas a Android 12 (API 31) y superior.
            //                   Indica que el Intent dentro del PendingIntent no puede ser modificado.
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        // 4. Programa la alarma.
        // setExactAndAllowWhileIdle es la mejor opción para alarmas críticas que deben
        // sonar a una hora exacta, incluso si el teléfono está inactivo.
        // - RTC_WAKEUP: Usa el reloj estándar (UTC) y despierta el dispositivo si está dormido.
        alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, timestamp, pendingIntent)
    }
}
