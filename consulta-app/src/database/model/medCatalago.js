/**
Modelo: CatalogoMedicinas

Catálogo de medicinas disponibles.
Es una tabla de referencia que puede ser compartida entre usuarios.

Relaciones:
- has_many recetas (mucahs recetas pueden usar el mismo medicamemto)
*/

import { Model, Q } from "@nozbe/watermelondb";
import { children, lazy, text, writer } from "@nozbe/watermelondb/decorators";

export default class CatalogoMedicinas extends Model {
    static table = 'catalogo_medicinas';
    static associations = {
        recetas: { type: 'has_many', foreignKey: 'med_catalogo_id' }
    };

    @text('nombre_comercial') nombreComercial;
    @text('principio_activo') principioActivo;
    @text('presentacion') presentacion           // Tabletas, Cápsulas, Jarabe, etc.
    @text('unidad_medida') unidadMedida          // mg, ml, g, etc.
    @text('concentracion') concentracion         // 500mg, 10mg/5ml, etc.
    @text('instrucciones_generales') instruccionesGenerales;

    @children('recetas') recetas;

    /* PROPIEDADES CALCULADAS */

    /* Descripción completa del medicamento */
    get descripcionCompleta() {
        return `${this.nombreComercial} (${this.principioActivo}) - ${this.presentacion} en ${this.concentracion}`;
    }

    /* Nombre para mostrar en listas */
    get displayName() {
        return `${this.nombreComercial} - ${this.concentracion}`;
    }
    
    /* QUERIES LAZY */
    /* Recetas activas que usan este medicamento */
    @lazy recetasActivas = this.recetas.extend(Q.where('is_activo', true));

    /* MÉTODOS WRITER */
    /* Actualiza los datos del medicamento */
    @writer
    async actualizarDatos({ nombreComercial, principioActivo, presentacion, unidadMedida, concentracion, instrucciones }) {
        await this.update(med => {
        if (nombreComercial !== undefined) med.nombreComercial = nombreComercial
        if (principioActivo !== undefined) med.principioActivo = principioActivo
        if (presentacion !== undefined) med.presentacion = presentacion
        if (unidadMedida !== undefined) med.unidadMedida = unidadMedida
        if (concentracion !== undefined) med.concentracion = concentracion
        if (instrucciones !== undefined) med.instruccionesGenerales = instrucciones
        })
    }

    /* Verifica si el medicamento está siendo usado antes de eliminar */
    @writer
    async eliminarSiNoUsado() {
        const recetasUsando = await this.recetas.fetchCount()
        
        if (recetasUsando > 0) {
        throw new Error(`No se puede eliminar: ${recetasUsando} receta(s) usan este medicamento`)
        }

        await this.destroyPermanently()
    }


}