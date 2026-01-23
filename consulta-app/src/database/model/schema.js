import { appSchema, tableSchema } from '@nozbe/watermelondb'

// isOptional indica que el campo puede ser nulo o no existir al crear el registro
// Sin isOptional, el campo es obligatorio

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
        /* Se puede eliminar el campo de edad ya que es redundante, se puede calcular en UI */
        { name: 'edad', type: 'number' },
        { name: 'telefono', type: 'string' },
      ],
    }),
    tableSchema({
      name: 'recetas',
      columns: [
        { name: 'usuario_id', type: 'string', isIndexed: true },
        { name: 'med_catalogo_id', type: 'string', isIndexed: true },

        { name: 'dosis_cantidad', type: 'number' },
        { name: 'dosis_unidad', type: 'string' },
        { name: 'frecuencia', type: 'string' },
        
        { name: 'fecha_inicio', type: 'number' },
        { name: 'fecha_fin', type: 'number', isOptional: true },
        
        { name: 'is_activo', type: 'boolean' },

        { name: 'instrucciones_adicionales', type: 'string', isOptional: true },
        { name: 'hora_ingesta', type: 'string', isOptional: true },
        { name: 'dias_semana', type: 'string', isOptional: true },

        { name: 'estado_toma', type: 'string', isOptional: true },
        { name: 'fecha_registro_toma', type: 'number', isOptional: true },
      ]
    }),
    tableSchema({
      name: 'horarios_medicacion',
      columns: [
        { name: 'receta_id', type: 'string', isIndexed: true },
        { name: 'hora_ingesta', type: 'number' },
        { name: 'dias_semana', type: 'string' },
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
      ]
    }),
    tableSchema({
      name: 'recordatorios',
      columns: [
        { name: 'usuario_id', type: 'string', isIndexed: true },
        // Revisar si el horario puede ser opcional cuando se crea
        { name: 'horario_id', type: 'string', isIndexed: true },
        { name: 'tipo_tarea', type: 'string' },
        { name: 'entidad_externa_id', type: 'string', isOptional: true, isOptional: true },
        { name: 'fecha_hora_alerta', type: 'number' },
        { name: 'estado_toma', type: 'string' },
        { name: 'fecha_registro_toma', type: 'number' },
      ]
    })
  ]
})
