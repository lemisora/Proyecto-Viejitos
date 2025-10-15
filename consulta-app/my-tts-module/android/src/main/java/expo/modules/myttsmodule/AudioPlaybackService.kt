package expo.modules.myttsmodule

// --- DEPENDENCIAS NECESARIAS ---

// Proporciona la clase base para los servicios de Android, que realizan tareas en segundo plano.
// La clase principal para reproducir archivos de audio y video.
// La clase que representa el mensaje que inicia este servicio.
// Una interfaz para que los componentes puedan vincularse a este servicio (no la usamos, por lo que
// devolvemos null).
// Proporciona acceso a las notificaciones y al sistema de canales de notificación.
// La clase para construir las notificaciones que se mostrarán al usuario.
// Necesario para las comprobaciones de versión del SDK de Android.
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Intent
import android.media.MediaPlayer
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat
import androidx.core.content.getSystemService

// --- CÓDIGO DEL SERVICIO ---

/**
 * Un servicio que se encarga exclusivamente de reproducir un archivo de audio en segundo plano. Se
 * inicia cuando el AlarmReceiver se activa.
 */
class AudioPlaybackService : Service() {

    private var mediaPlayer: MediaPlayer? = null
    // Constantes para la notificación en primer plano.
    private val CHANNEL_ID = "AudioPlaybackChannel"
    private val NOTIFICATION_ID = 123

    // Este método se llama cuando se crea el servicio por primera vez.
    override fun onCreate() {
        super.onCreate()
        startForegroundServiceWithNotification()
    }

    // Este método es el corazón del servicio. Se ejecuta cada vez que se llama a startService().
    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        // Obtenemos la ruta del archivo de audio del Intent que inició el servicio.
        val filePath = intent?.getStringExtra("AUDIO_FILE_PATH")

        // Si la ruta es nula, no hay nada que hacer. Detenemos el servicio.
        if (filePath == null) {
            stopSelf() // Detiene el servicio porque no hay audio para reproducir.
            return START_NOT_STICKY // No re-crear el servicio si el sistema lo mata.
        }

        // Preparamos el MediaPlayer para la reproducción.
        mediaPlayer =
                MediaPlayer().apply {
                    try {
                        setDataSource(filePath) // Establece la fuente de datos (nuestro archivo).
                        prepare() // Carga y prepara el archivo de forma síncrona.
                        start() // ¡Inicia la reproducción!

                        // Configura un listener que se activará cuando la reproducción termine.
                        setOnCompletionListener {
                            // La tarea ha terminado, es hora de limpiar los recursos.
                            it.release() // Libera los recursos del MediaPlayer.
                            stopSelf() // Detiene el servicio.
                        }

                        // Configura un listener para manejar errores durante la reproducción.
                        setOnErrorListener { _, _, _ ->
                            // Si ocurre un error, libera los recursos y detiene el servicio.
                            release()
                            stopSelf()
                            true // Indica que el error ha sido manejado.
                        }
                    } catch (e: Exception) {
                        // Si hay un error durante la configuración (ej. el archivo no existe),
                        // nos aseguramos de detener el servicio.
                        e.printStackTrace()
                        stopSelf()
                    }
                }

        // START_STICKY indica al sistema que, si mata el servicio por falta de memoria,
        // debe intentar recrearlo, pero el Intent original no se volverá a entregar.
        return START_STICKY
    }

    /**
     * Inicia el servicio en modo "primer plano" para evitar que el sistema lo termine. Es
     * obligatorio para servicios que realizan tareas visibles por el usuario (como reproducir
     * audio) en versiones modernas de Android (Oreo 8.0+).
     */
    private fun startForegroundServiceWithNotification() {
        // Solo es necesario en Android Oreo (API 26) y superior.
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channelName = "Servicio de Reproducción de Audio"
            val channel =
                    NotificationChannel(CHANNEL_ID, channelName, NotificationManager.IMPORTANCE_LOW)
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(channel)
        }

        val notification =
                NotificationCompat.Builder(this, CHANNEL_ID)
                        .setContentTitle("Reproduciendo Mensaje")
                        .setContentText("El mensaje de voz programado está sonando.")
                        // Aquí deberías poner un icono pequeño para tu app (obligatorio).
                        // R.drawable.ic_notification es un ejemplo, debes crear este recurso.
                        // .setSmallIcon(R.drawable.ic_notification)
                        .build()

        // Inicia el servicio en primer plano.
        startForeground(NOTIFICATION_ID, notification)
    }

    // Este método se llama cuando el servicio está siendo destruido.
    override fun onDestroy() {
        // Es crucial liberar el MediaPlayer para evitar fugas de memoria.
        mediaPlayer?.release()
        mediaPlayer = null
        super.onDestroy()
    }

    // No permitimos que otros componentes se "vinculen" a este servicio,
    // por lo que devolvemos null.
    override fun onBind(intent: Intent): IBinder? = null
}
