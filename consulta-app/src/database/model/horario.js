/*
Modelo: Horario

Define cuándo se debe tomar un medicamento de una receta.
Una receta puede tener múltiples horarios (ej: 8am, 2pm, 8pm)

Relaciones:
- belongs_to receta
- has_many recordatorios (los recordatorios apuntan aquí para medicamentos)
*/

import { Model, Q } from "@nozbe/watermelondb";
import { children, field, lazy, relation, text, writer } from "@nozbe/watermelondb/decorators";

export default class Horario extends Model {
    static table = 'horarios_medicacion';
    static associations = {
        recetas: { type: 'belongs_to', key: 'receta_id' },
        recordatorios: { type: 'has_many', foreignKey: 'horario_id' },
    };

    @text('receta_id') recetaId;
    @field('hora_ingesta') horaIngesta;
    @text('dias_semana') diasSemana;

    @relation('recetas', 'receta_id') receta;
    @children('recordatorios') recordatorios;

    /* PROPIEDADES CALCULADAS */

    /* Convierte minutos a formato HH:MM */
    get horaFormateada() {
        const horas = Math.floor(this.horaIngesta / 60);
        const minutos = this.horaIngesta % 60;
        return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`;
    }

    /* Convierte minutos a formato 12H (AM/PM) */
    get horaFormateada12h() {
        const horas24 = Math.floor(this.horaIngesta / 60);
        const minutos = this.horaIngesta % 60;
        const periodo = horas24 >= 12 ? 'PM' : 'AM';
        const horas12 = horas24 % 12 || 12;
        return `${horas12}:${minutos.toString().padStart(2, '0')} ${periodo}`;
    }

    /* Obtiene array de dias (parseando el JSON) */
    get diasSemanaArray() {
        if (this.diasSemana === 'todos') {
            return [0, 1, 2, 3, 4, 5, 6];
        }

        try {
            return JSON.parse(this.diasSemana);
        } catch {
            return [];
        }
    }

    /* Verifica si hoy es un dia activo */
    get esHoyActivo() {
        const hoy = new Date().getDay(); // 0=Dom, 1=Lun, ..., etc.
        return this.diasSemanaArray.includes(hoy);
    }

    /* QUERIES LAZY */
    /* Recordatorios pendientes para este horario */
    @lazy
    recordatoriosPendientes = this.recordatorios.extend(
        Q.where('estado', 'pendiente')
    );

    /* MÉTODOS WRITER */
    /* Actualiza el horario */
    @writer
    async actualizarHorario({ horaMinutos, diasSemana }) {
        await this.update(horario => {
            if (horaMinutos !== undefined) horario.horaIngesta = horaMinutos;
            if (diasSemana !== undefined) {
                horario.diasSemana = Array.isArray(diasSemana) ? JSON.stringify(diasSemana) : diasSemana;
            }
        });
    }

    /*
    Crea un recordatorio para este horario
    @param {string} usuarioId - ID del usuario
    @param {number} fechaHoraAlerta - Timestamp de cuándo alertar
   */
    @writer
    async crearRecordatorio({ usuarioId, fechaHoraAlerta }) {
        const recordatorioCollection = this.collections.get('recordatorios');

        const nuevoRecordatorio = await recordatorioCollection.create(rec => {
            rec.usuarioId = usuarioId;
            rec.tipoTarea = 'medicamento';
            rec.horarioId = this.id;
            rec.citaId = null;
            rec.fechaHoraAlerta = fechaHoraAlerta;
            rec.estado = 'pendiente';
            rec.fechaCompletado = null;
            rec.notas = null;
        })

        return nuevoRecordatorio;
        
    }

    /*
    Genera recordatorios para los próximos N días
    @param {string} usuarioId - ID del usuario
    @param {number} días - Número de días a generar (default: 7)
    */
    @writer
    async generarRecordatoriosSemanalaes(usuarioId, dias = 7) {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        const recordatoriosACrear = [];
        const recordatoriosCollection = this.collections.get('recordatorios');

        for (let i = 0; i < dias; i++) {
            const fecha = new Date(hoy);
            fecha.setDate(fecha.getDate() + i);

            const diaSemana = fecha.getDay();

            // Verifica si este día está incluido
            if (!this.diasSemanaArray.includes(diaSemana)) continue;

            // Solo crear si la alerta es en el futuro
            const fechaAlerta = new Date(fecha);
            fechaAlerta.setMinutes(this.horaIngesta);

            // Solo crear si la alerta es en el futuro
            if (fechaAlerta.getTime() <= Date.now()) continue;

            recordatoriosACrear.push(
                recordatoriosCollection.prepareCreate(rec => {
                    rec.usuarioId = usuarioId
                    rec.tipoTarea = 'medicamento'
                    rec.horarioId = this.id
                    rec.citaId = null
                    rec.fechaHoraAlerta = fechaAlerta.getTime()
                    rec.estado = 'pendiente'
                    rec.fechaCompletado = null
                    rec.notas = null
                })
            )

        }

        if (recordatoriosACrear.length > 0) {
            await this.batch(...recordatoriosACrear);
        }

        return recordatoriosACrear.length;
    }

    /* Elimnina este horario y sus recordatorios */
    @writer
    async eliminarConRecordatorios() {
        const recordatoriosAEliminar = await this.recordatorios.fetch();

        await this.batch(
            ...recordatoriosAEliminar.map(rec => rec.prepareDestroyPermanently()),
            this.prepareDestroyPermanently()
        );
    }

}

/* FUNCIONES EXTRAS */

/*
    Convierte hora HH:MM a minutos desde medianoche
    @param {string} horaString - Hora en formato "HH:MM"
    @returns {number} Minutos desde medianoche
*/

export function horaAMinutos(horaString) {
    const [horas, minutos] = horaString.split(':').map(Number);
    return horas * 60 + minutos;
}

/*
    Convierte minutos desde medianoche a hora HH:MM
    @param {number} minutos - Minutos desde medianoche
    @returns {string} Hora en formato "HH:MM"
*/
export function minutosAHora(minutos) {
    const h = Math.floor(minutos / 60);
    const m = minutos % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}