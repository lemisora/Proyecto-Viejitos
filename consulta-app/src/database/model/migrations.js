/**
 * Migraciones de WatermelonDB
 * 
 * IMPORTANTE - CÓMO FUNCIONAN LAS MIGRACIONES:
 * 
 * 1. Para la PRIMERA versión (version: 1 en schema.js):
 *    - El array 'migrations' puede estar VACÍO
 *    - WatermelonDB creará las tablas automáticamente
 *    - NO necesitas toVersion: 1
 * 
 * 2. Para VERSIONES POSTERIORES:
 *    - Agrega una migración con toVersion: N (donde N es la nueva versión)
 *    - La migración define los CAMBIOS entre la versión anterior y la nueva
 *    - Actualiza también el schema.js con version: N
 * 
 * EJEMPLO DE MIGRACIÓN FUTURA (cuando necesites agregar una columna):
 * 
 * import { schemaMigrations, addColumns, createTable } from '@nozbe/watermelondb/Schema/migrations'
 * 
 * export default schemaMigrations({
 *   migrations: [
 *     {
 *       toVersion: 2,
 *       steps: [
 *         addColumns({
 *           table: 'usuarios',
 *           columns: [
 *             { name: 'email', type: 'string', isOptional: true },
 *           ],
 *         }),
 *       ],
 *     },
 *   ],
 * })
 * 
 * TIPOS DE MIGRACIONES DISPONIBLES:
 * - createTable({ name: 'tabla', columns: [...] })
 * - addColumns({ table: 'tabla', columns: [...] })
 * - (Futuras: destroyTable, destroyColumn, renameColumn)
 */

import { schemaMigrations } from '@nozbe/watermelondb/Schema/migrations'

export default schemaMigrations({
  migrations: [
    // Vacío para version 1 - las tablas se crean desde el schema
    // 
    // Cuando necesites migrar a version 2, agrega aquí:
    // {
    //   toVersion: 2,
    //   steps: [
    //     // tus cambios aquí
    //   ],
    // },
  ],
})