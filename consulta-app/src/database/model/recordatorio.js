/** 
 * Modelo: Recordatorio (TABLA POLIMÓRFICA)
 * Sistema unificado de alertas para medicamentos y citas.
 * 
 * DISEÑO POLIMÓRFICO:
 * - tipo_tarea: 'medicamento' -> usa horario_id para relacionarse
 * - tipo_tarea: 'cita' -> usa cita_id para relacionarse
 * 
 * Relaciones:
 * - belongs_to usuario (siempre)
 * - belongs_to horarios_medicación (cuando tipo_tarea = 'medicamento')
 * - belongs_to citas (cuando tipo_tarea = 'cita')*/

import { Model } from "@nozbe/watermelondb";
import { field, relation, text, writer } from "@nozbe/watermelondb/decorators";

// Constantes para tipos de tarea
export const TIPO_TAREA = {
    MEDICAMENTO: 'medicamento',
    CITA: 'cita',
};

// Constantes para estados
export const ESTADO_RECORDATORIO = {
    PENDIENTE: 'pendiente',
    COMPLETADO: 'completado',
    OMITIDO: 'omitido',
    POSPUESTO: 'pospuesto',
};

export default class Recordatorios extends Model {
    static table = 'recordatorios';
    static associations = {
        usuarios: { type: 'belongs_to', key: 'usuario_id' },
        horarios_medicacion: { type: 'belongs_to', key: 'horario_id' },
        citas: { type: 'belongs_to', key: 'cita_id' },
    };

    @text('usuario_id') usuarioId;
    
    // Discriminador polimórfico
    @text('tipo_tarea') tipoTarea; // 'medicamento' | 'cita'

    // FK's polimórficas (una u otra estará activa según tipo_tarea)
    @text('horario_id') horarioId; // Usado si tipo_tarea='medicamento'
    @text('cita_id') citaId;       // Usado si tipo_tarea='cita'

    
    @field('fecha_hora_alerta') fechaHoraAlerta;
    @text('estado') estado;
    @field('fecha_completado') fechaCompletado;
    @text('notas') notas;

    @relation('usuarios', 'usuario_id') usuario;
    @relation('horarios_medicacion', 'horario_id') horario;
    @relation('citas', 'cita_id') cita;

    /* PROPIEDADES CALCULADAS */
    /** Indica si es un recordatorio de medicamento */
    get esMedicamento() {
        return this.tipoTarea === TIPO_TAREA.MEDICAMENTO;
    }

    /** Inidica si es un recordatorio de cita */
    get esCita() {
        return this.tipoTarea === TIPO_TAREA.CITA;
    }

    /** Indica si esta pendiente */
    get estaPendiente() {
        return this.estado === ESTADO_RECORDATORIO.PENDIENTE;
    }

    /** Indica si esta completado */
    get estaCompletado() {
        return
    }

    /** Indica si fue omitido */
    get estaOmitido() {
        return this.estado === ESTADO_RECORDATORIO.OMITIDO
    }

    /** Indica si fue pospuesto */
    get estaPospuesto() {
        return this.estado === ESTADO_RECORDATORIO.POSPUESTO
    }

    /** Indica si la alerta ya debió sonar */
    get alertaVencida() {
        return this.fechaHoraAlerta < Date.now() && this.estaPendiente;
    }

    /** Fecha/hora de alerta formateada */
    get alertaFormateada() {
        const fecha = new Date(this.fechaHoraAlerta)
        return fecha.toLocaleString('es-MX', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        })
    }

    /** Solo hora formateada */
    get horaAlertaFormateada() {
        const fecha = new Date(this.fechaHoraAlerta)
        return fecha.toLocaleTimeString('es-MX', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        })
    }

    /** Tiempo restante hasta la alerta */
    get tiempoRestante() {
        const diff = this.fechaHoraAlerta - Date.now();
        if (diff < 0) return 'Vencido';

        const minutos = Math.floor(diff / 60000);
        if (minutos < 60) return `${minutos} min`;

        const horas = Math.floor(minutos / 60);
        if (horas < 24) return `${horas}h ${minutos % 60}min`;

        const dias = Math.floor(horas / 24);
        return `${dias}d ${horas % 24}h`;
    }

    /** Icono sugerido según el tipo */
    get icono() {
        return this.esMedicamento ? '💊' : '🏥'
    }

    /** Color sugerido según el estado */
    get colorEstado() {
        switch (this.estado) {
            case ESTADO_RECORDATORIO.PENDIENTE: return '#FFA500' // Naranja
            case ESTADO_RECORDATORIO.COMPLETADO: return '#4CAF50' // Verde
            case ESTADO_RECORDATORIO.OMITIDO: return '#9E9E9E' // Gris
            case ESTADO_RECORDATORIO.POSPUESTO: return '#2196F3' // Azul
            default: return '#000000'
        }
    }

    /* MÉTODOS PARA OBTENER INFORMACIÓN RELACIONADA (Polimorficos - dependen del tipo) */

    /** Obtiene información detallada del recordatorio segúnsu tipo
     * @returns {Promise<string>} Información del medicamento o cita
    */
    async obtenerDetalles() {
        if (this.esMedicamento && this.horarioId) {
            const horario = await this.horario.fetch()
            if (!horario) return null

            const receta = await horario.receta.fetch()
            if (!receta) return null

            const medicamento = await receta.medicamento.fetch()

            return {
                tipo: 'medicamento',
                hora: horario.horaFormateada12h,
                medicamento: medicamento?.displayName || 'Medicamento desconocido',
                dosis: receta.dosisDescripcion,
                instrucciones: receta.instruccionesAdicionales,
            }
            }

            if (this.esCita && this.citaId) {
            const citaRelacionada = await this.cita.fetch()
            if (!citaRelacionada) return null

            return {
                tipo: 'cita',
                especialidad: citaRelacionada.especialidad,
                medico: citaRelacionada.nombreMedico,
                lugar: citaRelacionada.ubicacionCompleta,
                fechaHora: citaRelacionada.fechaHoraFormateada,
                requierePreparacion: citaRelacionada.isRequierePreparacion,
                notasPreparacion: citaRelacionada.notasPreparacion,
            }
        }

        return null
    }

    /** Obtiene un titulo descriptivo para mostrar */
    async obtenerTitulo() {
        const detalles = await this.obtenerDetalles()
        if (!detalles) return 'Recordatorio'

        if (detalles.tipo === 'medicamento') {
            return `Tomar ${detalles.medicamento}`;
        }
        return `Cita: ${detalles.especialidad}`;
    }

    /* MÉTODOS WRITER */

    /** Marca el recordatorio como completado */
    @writer
    async marcarCompletado(notas = null) {
        await this.update(rec => {
            rec.estado = ESTADO_RECORDATORIO.COMPLETADO;
            rec.fechaCompletado = Date.now();
            if (notas) rec.notas = notas;
        })
    }

    /** Marca el recordatorio como omitido */
    @writer
    async marcarOmitido(razon = null) {
        await this.update(rec => {
        rec.estado = ESTADO_RECORDATORIO.OMITIDO
        rec.fechaCompletado = Date.now()
        if (razon) rec.notas = razon
        })
    }
    
    /** Posponer el recordatorio */
    @writer
    async posponer(minutos = 15) {
        const nuevaAlerta = Date.now() + (minutos * 60 * 1000);
        
        await this.update(rec => {
            rec.estado = ESTADO_RECORDATORIO.POSPUESTO;
            rec.fechaHoraAlerta = nuevaAlerta;
            rec.notas = `Pospuesto ${minutos} minutos`;
        })
    }


    /** Reactiva un recordatorio (vuelve a pendiente) */
    @writer
    async reactivar() {
        await this.update(rec => {
            rec.estado = ESTADO_RECORDATORIO.PENDIENTE;
            rec.fechaCompletado = null;
        })
    }

    /** Actualiza la hora de alerta */
    @writer
    async actualizarAlerta(nuevaFechaHora) {
        await this.update(rec => {
            rec.fechaHoraAlerta = nuevaFechaHora;
        })
    }
}   