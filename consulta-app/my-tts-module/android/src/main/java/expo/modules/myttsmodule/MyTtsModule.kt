package expo.modules.myttsmodule

// Importaciones para tus clases de ayuda (ahora en el mismo paquete)
import android.content.Context
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class MyTtsModule : Module() {
    private val reactContext: Context
        get() =
                requireNotNull(this.appContext.reactContext) {
                    "El contexto de la aplicación no está disponible."
                }

    override fun definition() = ModuleDefinition {
        Name("MyTtsModule")

        // Aquí está tu función, integrada en el nuevo módulo
        AsyncFunction("programarMensajeDeVoz") { texto: String, timestamp: Double, promise: Promise
            ->
            TtsGenerator.generarArchivo(reactContext, texto) { filePath ->
                if (filePath == null) {
                    promise.reject("TTS_ERROR", "No se pudo generar el archivo de audio", null)
                    return@generarArchivo
                }

                AlarmScheduler.programarAlarma(reactContext, filePath, timestamp.toLong())
                promise.resolve("¡Mensaje programado!")
            }
        }
    }
}
