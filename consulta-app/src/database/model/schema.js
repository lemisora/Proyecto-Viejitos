import { appSchema, tableSchema } from '@nozbe/watermelondb'

// isOptional indica que el campo puede ser nulo o no existir al crear el registro
// Sin isOptional, el campo es obligatorio
// Las fechas se guardan como 'number' (timestamp)

export default appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'usuarios',
      columns: [
        { name: 'nombre', type: 'string' },
        { name: 'apellido_p', type: 'string' },
        { name: 'apellido_m', type: 'string', isOptional: true },
        { name: 'fecha_nacimiento', type: 'number' },
        { name: 'telefono', type: 'string', isOptional: true},
      ],
    }),
    tableSchema({
      name: 'recetas',
      columns: [
        // Llaves foraneas
        { name: 'usuario_id', type: 'string', isIndexed: true },
        { name: 'med_catalogo_id', type: 'string', isIndexed: true },

        { name: 'dosis_cantidad', type: 'number' },
        { name: 'dosis_unidad', type: 'string' },
        { name: 'frecuencia', type: 'string' },
        
        // Periodo de tratamiento
        { name: 'fecha_inicio', type: 'number' },
        { name: 'fecha_fin', type: 'number', isOptional: true },
        
        // Estado
        { name: 'is_activo', type: 'boolean' },

        // Notas adicionales del médico
        { name: 'instrucciones_adicionales', type: 'string', isOptional: true },
      ]
    }),
    tableSchema({
      name: 'horarios_medicacion',
      columns: [
        { name: 'receta_id', type: 'string', isIndexed: true },
        { name: 'hora_ingesta', type: 'number' },
        { name: 'dias_semana', type: 'string' },
        {/* 
          Minutos desde medianoche (0-1439) 
          Ej. 8:00am = 480, 2:30pm = 870
          JSON array: "[1, 2, 3, 4, 5]" (L-V)
          0=Dom, 1=Lun, ..., 6=Sab
          "todos" para diario  
        */}
      ]
    }),
    tableSchema({
      name: 'catalogo_medicinas',
      columns: [
        { name: 'nombre_comercial', type: 'string' },
        { name: 'principio_activo', type: 'string' },
        { name: 'presentacion', type: 'string' },
        { name: 'unidad_medida', type: 'string' },
        { name: 'concentracion', type: 'string' },
        //Revisar si este campo puede ser nulo o que sea obligatorio
        { name: 'instrucciones_generales', type: 'string', isOptional: true },
      ]
    }),
    tableSchema({
      name: 'citas',
      columns: [
        { name: 'usuario_id', type: 'string', isIndexed: true },
        { name: 'fecha_hora', type: 'number' },
        { name: 'especialidad', type: 'string' },
        { name: 'nombre_medico', type: 'string' },
        { name: 'lugar_cita', type: 'string' },
        // campo que puede ser opcional para la dirección del lugar de la cita, (clinica, hospital, etc.)
        { name: 'direccion_completa', type: 'string', isOptional: true },
        // revisar si es opcional
        { name: 'motivo_cita', type: 'string', isOptional: true },
        // Campo para indicar Si requiere ayuno u otra preparación especial.
        { name: 'is_requiere_preparacion', type: 'boolean' },
        { name: 'notas_preparacion', type: 'string', isOptional: true },
        { name: 'notas_adicionales', type: 'string', isOptional: true },
      ]
    }),
    tableSchema({
      name: 'recordatorios',
      columns: [
        { name: 'usuario_id', type: 'string', isIndexed: true },

        // Tipo de recordatorio (discriminador polimórfico)
        { name: 'tipo_tarea', type: 'string' },

        // Referencias polimórficas (solo una estará activa según "tipo_tarea")
        { name: 'horario_id', type: 'string', isIndexed: true, isOptional: true },
        { name: 'cita_id', type: 'string', isIndexed: true, isOptional: true },
        
        // Datos del recordatorio
        { name: 'fecha_hora_alerta', type: 'number' },

        // Estado del recordatorio/toma
        { name: 'estado', type: 'string' },
        { name: 'fecha_completado', type: 'number', isOptional: true },

        // Notas opcionales
        { name: 'notas', type: 'string', isOptional: true },
      ]
    })
  ]
})
