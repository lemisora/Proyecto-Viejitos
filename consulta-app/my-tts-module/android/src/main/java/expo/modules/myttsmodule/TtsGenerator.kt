package expo.modules.myttsmodule

// --- DEPENDENCIAS NECESARIAS ---

// Proporciona el acceso al contexto de la aplicación, necesario para inicializar el motor TTS
// y para obtener la ruta del directorio de archivos de la app.
import android.content.Context
// La clase principal del motor de Texto a Voz de Android.
import android.speech.tts.TextToSpeech
// El listener que nos notifica sobre el progreso de la síntesis de voz,
// especialmente cuando ha terminado o ha fallado.
import android.speech.tts.UtteranceProgressListener
// Proporciona acceso a las constantes de la versión del SDK (no se usa directamente,
// pero es bueno para la conciencia del entorno).
import android.os.Build
// La clase para manejar archivos y rutas en el sistema de archivos.
import java.io.File
// Necesario para establecer el idioma del motor TTS.
import java.util.Locale

// --- CÓDIGO DEL OBJETO ---

/**
 * Un objeto singleton que encapsula la lógica para generar un archivo de audio
 * a partir de una cadena de texto usando el motor TTS de Android.
 */
object TtsGenerator {

    /**
     * Genera un archivo de audio .wav a partir de un texto y llama a un callback
     * con la ruta del archivo cuando se completa.
     *
     * @param context El contexto de la aplicación.
     * @param texto El texto que se convertirá en audio.
     * @param onComplete Un callback de orden superior que se ejecutará al finalizar.
     *                 Recibirá la ruta absoluta del archivo como un String, o null si falla.
     */
    fun generarArchivo(context: Context, texto: String, onComplete: (String?) -> Unit) {

        // Variable para mantener la instancia del motor TTS. Se declara aquí para que sea accesible
        // en todos los bloques internos.
        lateinit var tts: TextToSpeech

        // El constructor de TextToSpeech es asíncrono. El segundo parámetro es un listener que se
        // invoca cuando la inicialización del motor ha terminado.
        tts = TextToSpeech(context) { status ->
            // Comprueba si el motor TTS se inicializó correctamente.
            if (status == TextToSpeech.SUCCESS) {
                // Establece el idioma. Es una buena práctica hacerlo explícitamente.
                // Si el idioma no está disponible, usará el predeterminado del dispositivo.
                tts.language = Locale("es", "ES")

                // 1. Define la ruta de destino del archivo de audio.
                // context.filesDir es el directorio de almacenamiento interno privado de la app.
                // Nadie más puede acceder a estos archivos, lo que es bueno para la seguridad.
                val file = File(context.filesDir, "audio_${System.currentTimeMillis()}.wav")
                val filePath = file.absolutePath

                // 2. Configura un listener para saber cuándo se ha completado la escritura del archivo.
                tts.setOnUtteranceProgressListener(object : UtteranceProgressListener() {
                    // Se llama cuando la síntesis de voz y la escritura del archivo han terminado.
                    override fun onDone(utteranceId: String?) {
                        // ¡Éxito! El archivo está listo. Llama al callback con la ruta.
                        onComplete(filePath)
                        // Es crucial apagar el motor TTS para liberar recursos.
                        tts.shutdown()
                    }

                    // Se llama si ocurre un error durante la síntesis.
                    override fun onError(utteranceId: String?) {
                        // Fallo. Llama al callback con null.
                        onComplete(null)
                        // Apaga el motor TTS para liberar recursos.
                        tts.shutdown()
                    }

                    // Necesario implementarlo, aunque no lo usemos.
                    override fun onStart(utteranceId: String?) { /* No-op */ }
                })

                // 3. ¡La acción principal! Inicia el proceso de síntesis.
                // - texto: El texto a convertir.
                // - null: Los parámetros de la petición (Bundle), no los necesitamos aquí.
                // - file: El archivo de destino donde se escribirá el audio.
                // - "UniqueID": Un ID único para esta petición de síntesis, que se pasa a onDone/onError.
                tts.synthesizeToFile(texto, null, file, "UniqueID")
            } else {
                // Si la inicialización del motor TTS falla, llama al callback con null.
                onComplete(null)
            }
        }
    }
}
