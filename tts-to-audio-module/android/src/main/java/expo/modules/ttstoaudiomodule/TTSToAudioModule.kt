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

// 1. Implementa TextToSpeech.OnInitListener
class TTSToAudioModule : Module(), TextToSpeech.OnInitListener {

  private var tts: TextToSpeech? = null
  private var isTtsInitialized = false

  // Obtenemos el contexto de la aplicación
  private val context: Context
    get() = appContext.reactContext ?: throw IllegalStateException("React context is null")

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
    Name("TTSToAudio")

    OnCreate {
      // Inicializamos TTS
      tts = TextToSpeech(context, this@TTSToAudioModule)
      Log.i("TTSToAudioModule", "TTS Initialization requested")
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
      // Usamos cacheDir (almacenamiento interno, no requiere permisos)
      val file = File(context.cacheDir, fileName)
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
