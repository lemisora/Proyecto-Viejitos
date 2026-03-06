/*
Modelo: Cita

Representa una cita médica programada.

Relaciones:
- belongs_to usuario
- has_many recordatorios (via tipo_tarea = 'cita')
*/

import { Model, Q } from "@nozbe/watermelondb";
import { field, lazy, relation, text, writer } from "@nozbe/watermelondb/decorators";

export default class Citas extends Model {
    static table = 'citas';
    static associations = {
        usuarios: { type: 'belongs_to', key: 'usuario_id' },
        recordatorios: { type: 'has_many', foreignKey: 'cita_id' },
    };

    @text('usuario_id') usuarioId;
    @field('fecha_hora') fechaHora;     // timestamp completo
    @text('especialidad') especialidad;
    @text('nombre_medico') nombreMedico;
    @text('lugar_cita') lugarCita;
    @text('direccion_completa') direccionCompleta;
    @text('motivo_cita') motivoCita;
    @field('is_requiere_preparacion') isRequierePreparacion;
    @text('notas_preparacion') notasPreparacion;
    @text('notas_adicionales') notasAdicionales;

    @relation('usuarios', 'usuario_id') usuario;

    /* QUERIES LAZY */
    /* Para recordatorios (tabla polimorfica) */

    @lazy
    recordatorios = this.collections
        .get('recordatorios')
        .query(
            Q.where('tipo_tarea', 'cita'),
            Q.where('cita_id', this.id)
        );


    /* PROPIEDADES CALCULADAS */
    /** Hora formateada */
    get horaFormateada() {
        const fecha = new Date(this.fechaHora)
        return fecha.toLocaleTimeString('es-MX', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
        })
    }

    /** Fecha y hora completa formateada */
    get fechaHoraFormateada() {
        return `${this.fechaFormateada} a las ${this.horaFormateada}`
    }

    /** Indica si la cita es hoy */
    get esHoy() {
        const hoy = new Date();
        const citaDate = new Date(this.fechaHora);
        return (
        hoy.getDate() === citaDate.getDate() &&
        hoy.getMonth() === citaDate.getMonth() &&
        hoy.getFullYear() === citaDate.getFullYear()
        );
    }

    /** Indica si la cita ya pasó */
    get yaPaso() {
        return this.fechaHora < Date.now();
    }

    /** Indica si la cita es en el futuro */
    get esFutura() {
        return this.fechaHora >= Date.now();
    }

    /** Días hasta la cita (negativo si ya pasó) */
    get diasRestantes() {
        const diff = this.fechaHora - Date.now();
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    }

    /** Descripción corta para listas */
    get descripcionCorta() {
        return `${this.especialidad} -Dr(a). ${this.nombreMedico}`;
    }

    /** Ubicación completa */
    get ubicacionCompleta() {
        if (this.direccionCompleta) {
            return `${this.lugarCita}, ${this.direccionCompleta}`;
        }
        return this.lugarCita;
    }

    /* MÉTODOS WRITER */
    /** Actualiza los datos de la cita */
    @writer
    async actualizarDatos({
        fechaHora,
        especialidad,
        nombreMedico,
        lugarCita,
        direccion,
        motivo,
        requierePreparacion,
        notasPreparacion,
        notas
    }) {
        await this.update(cita => {
            if (fechaHora !== undefined) cita.fechaHora = fechaHora
            if (especialidad !== undefined) cita.especialidad = especialidad
            if (nombreMedico !== undefined) cita.nombreMedico = nombreMedico
            if (lugarCita !== undefined) cita.lugarCita = lugarCita
            if (direccion !== undefined) cita.direccionCompleta = direccion
            if (motivo !== undefined) cita.motivoCita = motivo
            if (requierePreparacion !== undefined) cita.isRequierePreparacion = requierePreparacion
            if (notasPreparacion !== undefined) cita.notasPreparacion = notasPreparacion
            if (notas !== undefined) cita.notasAdicionales = notas
        })
    }

    /* Crea un recordatorio para esta cita 
    @param {number} minutosAntes - Minutos antes de la cita para la alerta
    */
    @writer
    async crearRecordatorio(minutosAntes = 60) {
        const RecordatoriosCollection = this.collections.get('recordatorios');
        const fechaAlerta = this.fechaHora - (minutosAntes * 60 * 1000);

        const nuevoRecordatorio = await RecordatoriosCollection.create(rec => {
            rec.usuarioId = this.usuarioId;
            rec.tipoTarea = 'cita'
            rec.horarioId = null
            rec.citaId = this.id
            rec.fechaHoraAlerta = fechaAlerta
            rec.estado = 'pendiente'
            rec.fechaCompletado = null
            rec.notas = null
        })

        return nuevoRecordatorio;
    }

    /** Crea múltiples recordatorios antes de la cita 
     * Ej: 1 dia antes, 2 horas antes, 30 minutos antes
    */
   @writer
    async crearRecordatoriosMultiples(tiemposAntes = [1440, 120, 30]) {
        const recordatoriosCollection = this.collections.get('recordatorios')
        const recordatoriosACrear = []

        for (const minutosAntes of tiemposAntes) {
        const fechaAlerta = this.fechaHora - (minutosAntes * 60 * 1000)
        
        // Solo crear si la alerta es en el futuro
        if (fechaAlerta <= Date.now()) continue

        recordatoriosACrear.push(
            recordatoriosCollection.prepareCreate(rec => {
            rec.usuarioId = this.usuarioId
            rec.tipoTarea = 'cita'
            rec.horarioId = null
            rec.citaId = this.id
            rec.fechaHoraAlerta = fechaAlerta
            rec.estado = 'pendiente'
            rec.fechaCompletado = null
            rec.notas = `Recordatorio: ${this._tiempoRestanteTexto(minutosAntes)}`
            })
        )
        }

        if (recordatoriosACrear.length > 0) {
        await this.batch(...recordatoriosACrear)
        }

        return recordatoriosACrear.length
    }

    /**
     * Helper para texto de tiempo restante
     */
    _tiempoRestanteTexto(minutos) {
        if (minutos >= 1440) {
        const dias = Math.floor(minutos / 1440)
        return `${dias} día${dias > 1 ? 's' : ''} antes`
        } else if (minutos >= 60) {
        const horas = Math.floor(minutos / 60)
        return `${horas} hora${horas > 1 ? 's' : ''} antes`
        } else {
        return `${minutos} minutos antes`
        }
    }

    /**
     * Elimina la cita y sus recordatorios
     */
    @writer
    async eliminarConRecordatorios() {
        const recordatoriosAEliminar = await this.recordatorios.fetch()

        await this.batch(
        ...recordatoriosAEliminar.map(r => r.prepareDestroyPermanently()),
        this.prepareDestroyPermanently()
        )
    }
}