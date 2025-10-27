package expo.modules.ttstoaudiomodule

import android.content.Context
import android.media.MediaPlayer
import android.util.Log
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import androidx.work.workDataOf
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlin.coroutines.resume

class AudioPlaybackWorker(
    appContext: Context, workerParams: WorkerParameters) :
    CoroutineWorker(appContext, workerParams
)
{
    override suspend fun doWork(): Result {
        // Obtenemos la ruta del archivo que pasamos desde JavaScript
        val filePath = inputData.getString(KEY_FILE_PATH)

        if (filePath.isNullOrEmpty()) {
            Log.e("AudioPlaybackWorker", "File path is missing!")
            return Result.failure()
        }

        Log.i("AudioPlaybackWorker", "Worker started. Playing file: $filePath")

        // Usamos una corutina para esperar a que el MediaPlayer termine
        return try {
            playAudio(filePath)
        } catch (e: Exception) {
            Log.e("AudioPlaybackWorker", "Error during playback", e)
            Result.failure()
        }
    }

    /**
     * Reproduce un archivo de audio y suspende la corutina hasta que termine.
     */
    private suspend fun playAudio(filePath: String): Result = suspendCancellableCoroutine { continuation ->
        var mediaPlayer: MediaPlayer? = null

        try {
            mediaPlayer = MediaPlayer().apply {
                setDataSource(filePath)

                // Listener para cuando la reproducción se completa
                setOnCompletionListener {
                    Log.i("AudioPlaybackWorker", "Playback completed.")
                    it.release() // Libera los recursos
                    if (continuation.isActive) {
                        continuation.resume(Result.success())
                    }
                }

                // Listener para errores
                setOnErrorListener { mp, what, extra ->
                    Log.e("AudioPlaybackWorker", "MediaPlayer error: $what, $extra")
                    mp.release()
                    if (continuation.isActive) {
                        continuation.resume(Result.failure(workDataOf("error" to "MediaPlayer error $what")))
                    }
                    true // Indica que manejamos el error
                }

                // Prepara y comienza la reproducción
                prepareAsync() // Prepara de forma asíncrona
                setOnPreparedListener {
                    Log.i("AudioPlaybackWorker", "MediaPlayer prepared, starting playback.")
                    it.start()
                }
            }
        } catch (e: Exception) {
            Log.e("AudioPlaybackWorker", "Failed to set up MediaPlayer", e)
            mediaPlayer?.release()
            if (continuation.isActive) {
                continuation.resume(Result.failure(workDataOf("error" to e.message)))
            }
        }

        // Si la corutina/worker se cancela, liberamos el MediaPlayer
        continuation.invokeOnCancellation {
            Log.i("AudioPlaybackWorker", "Worker cancelled. Releasing MediaPlayer.")
            mediaPlayer?.release()
        }
    }

    companion object {
        // Una clave para pasar la ruta del archivo
        const val KEY_FILE_PATH = "filePath"
    }
}