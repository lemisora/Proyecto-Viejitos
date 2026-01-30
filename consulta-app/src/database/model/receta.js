/*
Modelo: Receta

Represnta una precripción médica: qué medicmento debe tomar un usuario.
Los horarios específicos de tomas se definen en HorariosMedicacion.

Relaciones:
- belongs_to usuario
- belongs_to catalogo_medicinas (medicamento)
- has_many horarios_medicacion
*/

import { Model, Q } from '@nozbe/watermelondb';
import { children, field, lazy, relation, text, writer } from '@nozbe/watermelondb/decorators';

export default class Receta extends Model {
    static table = 'recetas';
    static associations = {
        usuarios: { type: 'belongs_to', key: 'usuario_id' },
        catalogo_medicinas: { type: 'belongs_to', key: 'med_catalogo_id' },
        horarios_medicacion: { type: 'has_many', foreignKey: 'receta_id' },
    };
    

    // Llaves foraneas (se guardan como campos para acceso directo si es necesario)
    @text('usuario_id') usuarioId;
    @text('med_catalogo_id') medCatalogoId;

    // Datos de la dosis
    @field('dosis_cantidad') dosisCantidad    // Número: 1, 2, 0.5, etc.
    @text('dosis_unidad') dosisUnidad          // String: "tableta", "cucharada", "ml"
    @text('frecuencia') frecuencia             // String: "cada 8 horas", "2 veces al día"

    // Periodo de tratamiento
    @field('fecha_inicio') fechaInicio      // timestamp
    @field('fecha_fin') fechaFin;           // timestamp o null (indefinido)

    // Estado
    @field('is_activo') isActivo;

    // Notas
    @text('instrucciones_adicionales') instruccionesAdicionales

    /* RELACIONES */

    // @relation para belongs_to - obtiene UN registro
    // Primer param: nombre de la tabla, segundo: columna FK
    @relation('usuarios', 'usuario_id') usuario
    @relation('catalogo_medicinas', 'med_catalogo_id') medicamento
    @children('horarios_medicacion') horarios;

    /* PROPIEDADES CALCULADAS */

    /* Indica si el tratamiento tiene fecha de fin */
    get tieneFechaFin() {
        return this.fechaFin !== null && this.fechaFin !== undefined;
    }

    /* Indica si el tratamiento ya terminó */
    get estaVencida() {
        if (!this.tieneFechaFin) return false;
        return Date.now() > this.fechaFin;
    }

    /* Descripción de la dosis */
    get dosisDescripcion() {
        return `${this.dosisCantidad} ${this.dosisUnidad}`;
    }

    /* QUERIES LAZY */
    /* Obtiene los recordatorios asociados a esta receta (via horarios) */
    @lazy
    recordatoriosDeReceta = this.collections
        .get('recordatorios')
        .query(
            Q.where('tipo_tarea', 'medicamento'),
            Q.on('horarios_medicacion', 'receta_id', this.id)
        )

    
    /* MÉTODOS WRITER */
    /* Actualiza los datos de la receta */
    @writer
    async actualizarDatos({ dosisCantidad, dosisUnidad, frecuencia, fechaInicio, fechaFin, isActivo, instrucciones }) {
        await this.update(receta => {
            if (dosisCantidad !== undefined) receta.dosisCantidad = dosisCantidad;
            if (dosisUnidad !== undefined) receta.dosisUnidad = dosisUnidad;
            if (frecuencia !== undefined) receta.frecuencia = frecuencia;
            if (fechaInicio !== undefined) receta.fechaInicio = fechaInicio;
            if (fechaFin !== undefined) receta.fechaFin = fechaFin;
            if (isActivo !== undefined) receta.isActivo = isActivo;
            if (instrucciones !== undefined) receta.instruccionesAdicionales = instrucciones;
        })
    }

    /* Activa o desactiva la receta */
    @writer
    async toggleActivo() {
        await this.update(receta => {
            receta.isActivo = !receta.isActivo;
        })
    }

    /* Agrega un horario de toma a esta receta 
        @param {number} horaMinutos - Hora en minutos desde medianoche (0-1439)
        @param {string | array} diasSemana - array de dias [0-6] o "todos"
    */
    @writer
    async agregarHorario(horaMinutos, diasSemana = 'todos') {
        const horariosCollection = this.collections.get('horarios_medicacion');

        const diaString = Array.isArray(diasSemana) ? JSON.stringify(diasSemana) : diasSemana;

        const nuevoHorario = await horariosCollection.create(horario => {
            horario.receta.set(this);
            horario.horaIngesta = horaMinutos;
            horario.diasSemana = diaString;
        })

        return nuevoHorario;
   }

   /**
   * Elimina la receta y sus horarios asociados
   */
  @writer
  async eliminarConHorarios() {
    const horariosAEliminar = await this.horarios.fetch()
    
    // Eliminar recordatorios asociados primero
    for (const horario of horariosAEliminar) {
      const recordatorios = await this.collections
        .get('recordatorios')
        .query(Q.where('horario_id', horario.id))
        .fetch()
      
      await this.batch(
        ...recordatorios.map(r => r.prepareDestroyPermanently())
      )
    }

    // Eliminar horarios y la receta
    await this.batch(
      ...horariosAEliminar.map(h => h.prepareDestroyPermanently()),
      this.prepareDestroyPermanently()
    )
  }
}