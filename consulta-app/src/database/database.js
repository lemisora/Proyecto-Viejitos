/**
 * Configuración de la Base de Datos WatermelonDB
 * 
 * Este archivo configura:
 * 1. El adaptador SQLite
 * 2. La instancia de Database con todos los modelos
 * 3. Exporta la database para uso en toda la app
 */

import { Database } from '@nozbe/watermelondb'
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite'

// Importar schema y migraciones
import schema from '../model/schema'
import migrations from '../model/migrations'

// Importar todos los modelos
import Usuario from '../model/Usuario'
import CatalogoMedicinas from '../model/CatalogoMedicinas'
import Receta from '../model/Receta'
import HorarioMedicacion from '../model/HorarioMedicacion'
import Cita from '../model/Cita'
import Recordatorio from '../model/Recordatorio'

// ═══════════════════════════════════════════════════════════════
// CONFIGURACIÓN DEL ADAPTADOR SQLite
// ═══════════════════════════════════════════════════════════════
const adapter = new SQLiteAdapter({
  schema,
  migrations,
  // Nombre de la base de datos (opcional)
  dbName: 'viejitos_app',
  // JSI para mejor rendimiento (recomendado en iOS, verificar en Android)
  jsi: true, /* Platform.OS === 'ios' */
  // Manejo de errores de inicialización
  onSetUpError: (error) => {
    // La base de datos falló al cargar
    // Aquí puedes mostrar un alert, reiniciar la app, o hacer logout
    console.error('Error al inicializar la base de datos:', error)
    
    // Ejemplo de manejo:
    // Alert.alert(
    //   'Error de Base de Datos',
    //   'Hubo un problema al cargar tus datos. ¿Deseas reiniciar la aplicación?',
    //   [
    //     { text: 'Reiniciar', onPress: () => RNRestart.Restart() },
    //     { text: 'Cancelar' }
    //   ]
    // )
  }
})

// ═══════════════════════════════════════════════════════════════
// INSTANCIA DE LA BASE DE DATOS
// ═══════════════════════════════════════════════════════════════
const database = new Database({
  adapter,
  modelClasses: [
    Usuario,
    CatalogoMedicinas,
    Receta,
    HorarioMedicacion,
    Cita,
    Recordatorio,
  ],
})

// ═══════════════════════════════════════════════════════════════
// HELPERS PARA ACCEDER A LAS COLECCIONES
// ═══════════════════════════════════════════════════════════════

/** Colección de usuarios */
export const usuariosCollection = database.get('usuarios')

/** Colección del catálogo de medicinas */
export const catalogoMedicinasCollection = database.get('catalogo_medicinas')

/** Colección de recetas */
export const recetasCollection = database.get('recetas')

/** Colección de horarios de medicación */
export const horariosMedicacionCollection = database.get('horarios_medicacion')

/** Colección de citas */
export const citasCollection = database.get('citas')

/** Colección de recordatorios */
export const recordatoriosCollection = database.get('recordatorios')

// ═══════════════════════════════════════════════════════════════
// EXPORTACIONES
// ═══════════════════════════════════════════════════════════════

export { database }
export default database












