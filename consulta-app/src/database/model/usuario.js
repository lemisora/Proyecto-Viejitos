/* Modelo: Usuario (Paciente) 

Relaciones:
- has_many recetas
- has_many citas
- has_many recordatorios
*/

import { Model } from "@nozbe/watermelondb";
import { children, field, text, writer } from "@nozbe/watermelondb/decorators";
import { lazy } from "react";


export default class Usuario extends Model {
    static table = 'usuarios';

    static associations = {
        recetas: { type: 'has_many', foreignKey: 'usuario_id'},
        citas: { type: 'has_many', foreignKey: 'usuario_id'},
        recordatorios: { type: 'has_many', foreignKey: 'usuario_id'}
    }

    @text('nombre') nombre;
    @text('apellido_p') apellidoP;
    @text('apellido_m') apellidoM;
    @field('fecha_nacimiento') fechaNacimiento;
    @text('telefono') telefono;
    
    
    @children('recetas') recetas;
    @children('citas') citas;
    @children('recordatorios') recordatorios;



    /* Calcula la edad basándose en fecha_nacimiento */
    get edad() {
        if (!this.fechaNacimiento) return null;
        const hoy = new Date();
        const nacimiento = new Date(this.fechaNacimiento);
        let edad = hoy.getFullYear() - nacimiento.getFullYear();
        const mes = hoy.getMonth() - nacimiento.getMonth();

        if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
            edad--;
        }

        return edad;
    }

    /* Nombre completo formateado */
    get nombreCompleto() {
        const partes = [this.nombre, this.apellidoP];
        if (this.apellidoM) partes.push(this.apellidoM);
        return partes.join(' ');
    }


    /* QUERIES */
    /* Solo recetas activas */
    @lazy
    recetasActivas = this.recetas.extend(Q.where('is_activo', true));

    @lazy
    citsFuturas = this.citas.extend(
        Q.where('fecha_hora', Q.gt(Date.now())),
        Q.sortBy('fecha_hora', Q.asc)
    )

    /* MÉTODOS WRITER (modifican la base de datos) */

    /*
        Actualiza los datos del usuario
    */

    @writer
    async actualizarDatos({ nombre, apellidoP, apellidoM, fechaNacimiento, telefono }) {
        await this.update(usuario => {
            if (nombre !== undefined) usuario.nombre = nombre;
            if (apellidoP !== undefined) usuario.apellidoP = apellidoP;
            if (apellidoM !== undefined) usuario.apellidoM = apellidoM;
            if (fechaNacimiento !== undefined) usuario.fechaNacimiento = fechaNacimiento;
            if (telefono !== undefined) usuario.telefono = telefono;
        });
    }


    /*
        Crea una nueva receta para este usuario
    */
    @writer
    async agregarReceta({ medCatalogoId, dosisCantidad, dosisUnidad, frecuencia, fechaInicio, fechaFin, instrucciones }) {
        const recetasCollection = this.collections.get('recetas');

        const nuevaReceta = await recetasCollection.create(receta => {
            receta.usuario.set(this); // Establece la relación
            receta.medCatalogoId = medCatalogoId;
            receta.dosisCantidad = dosisCantidad;
            receta.dosisUnidad = dosisUnidad;
            receta.frecuencia = frecuencia;
            receta.fechaInicio = fechaInicio;
            receta.fechaFin = fechaFin || null;
            receta.isActivo = true;
            receta.instruccionesAdicionales = instrucciones || null;
        });

        return nuevaReceta;
    }


    /*
        Crea una nueva cita para este usuario
    */
   @writer
  async agregarCita({ fechaHora, especialidad, nombreMedico, lugarCita, direccion, motivo, requierePreparacion, notasPreparacion, notas }) {
    const citasCollection = this.collections.get('citas')

    const nuevaCita = await citasCollection.create(cita => {
      cita.usuario.set(this)
      cita.fechaHora = fechaHora
      cita.especialidad = especialidad
      cita.nombreMedico = nombreMedico
      cita.lugarCita = lugarCita
      cita.direccionCompleta = direccion || null
      cita.motivoCita = motivo || null
      cita.isRequierePreparacion = requierePreparacion || false
      cita.notasPreparacion = notasPreparacion || null
      cita.notasAdicionales = notas || null
    })

    return nuevaCita
  }

  /*
    Elimina el usuario y todoso sus datos relacionados
    (cascada delete manual)
  */

    @writer
    async eliminarConDatos() {
    // Primero eliminar datos relacionados
    const recetas = await this.recetas.fetch()
    const citas = await this.citas.fetch()
    const recordatorios = await this.recordatorios.fetch()

    // Eliminar horarios de cada receta
    for (const receta of recetas) {
      const horarios = await receta.horarios.fetch()
      await this.batch(
        ...horarios.map(h => h.prepareDestroyPermanently())
      )
    }

    // Eliminar todo en batch
    await this.batch(
      ...recetas.map(r => r.prepareDestroyPermanently()),
      ...citas.map(c => c.prepareDestroyPermanently()),
      ...recordatorios.map(r => r.prepareDestroyPermanently()),
      this.prepareDestroyPermanently()
    )
  }
}