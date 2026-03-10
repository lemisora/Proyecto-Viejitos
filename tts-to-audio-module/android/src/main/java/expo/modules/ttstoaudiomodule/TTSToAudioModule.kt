package expo.modules.ttstoaudiomodule

import android.speech.tts.TextToSpeech
import android.speech.tts.UtteranceProgressListener
import android.os.Bundle
import android.content.Context
import android.util.Log
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.Promise
import java.io.File
import java.util.Locale
import java.util.UUID
import android.os.Environment
import androidx.work.Data
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.WorkManager
import java.util.concurrent.TimeUnit
import android.app.NotificationChannel
import android.app.NotificationManager
import android.os.Build

// 1. Implementa TextToSpeech.OnInitListener
class TTSToAudioModule : Module(), TextToSpeech.OnInitListener {

  private var tts: TextToSpeech? = null
  private var isTtsInitialized = false

  // Obtenemos el contexto de la aplicación
  private val context: Context
    get() = appContext.reactContext ?: throw IllegalStateException("React context is null")

  private fun createNotificationChannel() {
    // Solo crea el canal en Android 8.0 (API 26) o superior
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      val channelId = "audio-playback-channel" // Un ID para tu canal
      val name = "Reproducción de Audio"
      val descriptionText = "Canal para notificaciones de recordatorios de audio"
      val importance = NotificationManager.IMPORTANCE_HIGH // Importancia alta

      val channel = NotificationChannel(channelId, name, importance).apply {
        description = descriptionText
      }

      // Registra el canal con el sistema
      val notificationManager: NotificationManager =
        context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

      notificationManager.createNotificationChannel(channel)
      Log.i("TTSToAudioModule", "Notification Channel Created.")
    }
  }

  // 3. Callback de OnInitListener: Se llama cuando TTS está listo
  override fun onInit(status: Int) {
    if (status == TextToSpeech.SUCCESS) {
      // Configura el idioma. Puedes cambiar Locale.getDefault() por uno específico
      // como Locale("es", "MX")
      val result = tts?.setLanguage(Locale.getDefault())

      if (result == TextToSpeech.LANG_MISSING_DATA || result == TextToSpeech.LANG_NOT_SUPPORTED) {
        Log.e("TTSToAudioModule", "Language not supported")
      } else {
        isTtsInitialized = true
        Log.i("TTSToAudioModule", "TTS Initialized successfully")
      }
    } else {
      Log.e("TTSToAudioModule", "TTS Initialization failed")
    }
  }

  override fun definition() = ModuleDefinition {
    Name("TTSToAudioModule")

    OnCreate {
      // Inicializamos TTS
      tts = TextToSpeech(context, this@TTSToAudioModule)
      Log.i("TTSToAudioModule", "TTS Initialization requested")
      createNotificationChannel()
    }

    OnDestroy {
      tts?.stop()
      tts?.shutdown()
    }

    // Función de prueba
    Function("hello") {
      "Hello world! 👋"
    }

    // 5. Función ASÍNCRONA para generar el audio
    AsyncFunction("generateAudioFromTTS") { textToSpeak: String, promise: Promise ->
      if (!isTtsInitialized || tts == null) {
        promise.reject("E_TTS_NOT_READY", "TextToSpeech engine is not initialized.", null)
        return@AsyncFunction
      }

      // 1. Crear un archivo de destino en el directorio caché de la app
      val fileName = "tts_audio_${UUID.randomUUID()}.wav"

      // Obtiene el directorio de música específico de tu app (p.ej. Android/data/.../files/Music)
      val storageDir = context.getExternalFilesDir(Environment.DIRECTORY_MUSIC)

      // (Opcional pero recomendado) Asegúrate de que el directorio exista
      storageDir?.mkdirs()

      // Usamos cacheDir (almacenamiento interno, no requiere permisos)
      val file = File(storageDir, fileName)
      val filePath = file.absolutePath

      // 2. Configurar un listener para saber CUÁNDO TERMINA la síntesis
      val listener = object : UtteranceProgressListener() {
        override fun onStart(utteranceId: String?) {
          Log.i("TTSToAudioModule", "TTS Synthesis started for $utteranceId")
        }

        override fun onDone(utteranceId: String?) {
          Log.i("TTSToAudioModule", "TTS Synthesis done for $utteranceId")
          // ¡Éxito! Resolvemos la promesa con la ruta del archivo
          promise.resolve(filePath)
        }

        override fun onError(utteranceId: String?, errorCode: Int) {
          Log.e("TTSToAudioModule", "TTS Synthesis error for $utteranceId: $errorCode")
          promise.reject("E_TTS_SYNTHESIS_FAILED", "Failed to synthesize audio. Error code: $errorCode", null)
        }

        // Método deprecado pero requerido para compatibilidad
        @Deprecated("Deprecated in API 21")
        override fun onError(utteranceId: String?) {
          onError(utteranceId, -1)
        }
      }
      tts?.setOnUtteranceProgressListener(listener)

      // 3. Iniciar la síntesis a archivo
      val utteranceId = "expo_tts_generation"
      val params = Bundle()
      params.putString(TextToSpeech.Engine.KEY_PARAM_UTTERANCE_ID, utteranceId)

      val result = tts?.synthesizeToFile(textToSpeak, params, file, utteranceId)

      if (result == TextToSpeech.ERROR) {
        promise.reject("E_TTS_SYNTHESIS_FAILED", "synthesizeToFile returned ERROR", null)
      }
    }

    /**
     * Programa la reproducción de un archivo de audio después de un retraso.
     * @param filePath La ruta al archivo .wav a reproducir.
     * @param delayInSeconds El número de segundos a esperar antes de reproducir.
     */
    AsyncFunction("scheduleAudioPlayback") { filePath: String, delayInSeconds: Long, promise: Promise ->
      try {
        // 1. Prepara los datos de entrada para el Worker
        val inputData = Data.Builder()
          .putString(AudioPlaybackWorker.KEY_FILE_PATH, filePath)
          .build()

        // 2. Crea la solicitud de trabajo (WorkRequest)
        val playbackWorkRequest = OneTimeWorkRequestBuilder<AudioPlaybackWorker>()
          .setInitialDelay(delayInSeconds, TimeUnit.SECONDS)
          .setInputData(inputData)
          .addTag("audio-playback") // Un tag para identificar el trabajo
          .build()

        // 3. Envía la solicitud al sistema
        WorkManager.getInstance(context).enqueue(playbackWorkRequest)

        Log.i("TTSToAudioModule", "Audio playback scheduled in $delayInSeconds seconds.")
        promise.resolve("Audio playback scheduled successfully for file: $filePath")

      } catch (e: Exception) {
        Log.e("TTSToAudioModule", "Failed to schedule audio playback", e)
        promise.reject("E_SCHEDULE_FAILED", "Failed to schedule audio playback", e)
      }
    }

    /**
     * Programa la reproducción de un audio en una fecha y hora específicas.
     * @param filePath La ruta al archivo .wav a reproducir.
     * @param timestampInMillis La fecha/hora de ejecución, en milisegundos desde la época Unix (UTC).
     */
    AsyncFunction("scheduleAudioPlaybackAtTimestamp") { filePath: String, timestampInMillis: Long, promise: Promise ->
      try {
        // 1. Calcular el retraso
        val currentTimeMillis = System.currentTimeMillis()
        val delayInMillis = timestampInMillis - currentTimeMillis
        val delayInSeconds = delayInMillis / 1000

        // 2. Validación CRÍTICA
        if (delayInSeconds <= 0) {
          Log.w("TTSToAudioModule", "Timestamp provided is in the past ($timestampInMillis). Will not schedule.")
          promise.reject("E_SCHEDULE_FAILED", "La fecha y hora proporcionadas están en el pasado.", null)
          return@AsyncFunction
        }

        // 3. Reutilizar la lógica de WorkManager (esto es idéntico a la otra función)
        val inputData = Data.Builder()
          .putString(AudioPlaybackWorker.KEY_FILE_PATH, filePath)
          .build()

        val playbackWorkRequest = OneTimeWorkRequestBuilder<AudioPlaybackWorker>()
          .setInitialDelay(delayInSeconds, TimeUnit.SECONDS) // Usamos el retraso calculado
          .setInputData(inputData)
          .addTag("audio-playback-timestamp") // Un tag diferente
          .build()

        WorkManager.getInstance(context).enqueue(playbackWorkRequest)

        Log.i("TTSToAudioModule", "Audio playback scheduled for timestamp $timestampInMillis (in $delayInSeconds seconds).")
        promise.resolve("Audio playback scheduled successfully for $filePath")

      } catch (e: Exception) {
        Log.e("TTSToAudioModule", "Failed to schedule audio playback at timestamp", e)
        promise.reject("E_SCHEDULE_FAILED", "Failed to schedule audio playback at timestamp", e)
      }
    }

    // --- OTRAS FUNCIONES (Sugerencia) ---
    // Estas funciones probablemente deberían ser asíncronas también
    // si van a interactuar con bases de datos o archivos.
    // Por ahora, las dejo como están.

    Function("saveAudioToStorage"){
      // Esta función ahora parece redundante si generateAudioFromTTS ya guarda el archivo.
      // Quizás quieras usarla para *mover* el archivo del caché a un lugar permanente.
      return@Function "¡Audio guardado exitosamente!"
    }

    AsyncFunction("addReminder"){ text: String, promise: Promise ->
      // Aquí iría tu lógica para guardar el recordatorio (e.g., en SQLite o SharedPreferences)
      Log.i("TTSToAudioModule", "Reminder added: $text")
      promise.resolve("¡Recordatorio añadido!")
    }
  }
}
