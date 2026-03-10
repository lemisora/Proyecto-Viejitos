import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import withObservables from '@nozbe/with-observables';

// Importamos la instancia de la base de datos y la colección que definiste
import { database, usuariosCollection } from '../../src/database/database';

// ═══════════════════════════════════════════════════════════════
// 1. COMPONENTE DE LA LISTA (Observador)
// ═══════════════════════════════════════════════════════════════
// Este componente recibe la prop 'usuarios' que le inyectará WatermelonDB
const ListaUsuarios = ({ usuarios }) => {
  return (
    <FlatList
      data={usuarios}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.nombre}>{item.nombre} {item.apellidoP}</Text>
          <Text style={styles.edad}>Edad aprox: {item.edad} años</Text>
        </View>
      )}
      ListEmptyComponent={<Text style={styles.empty}>No hay usuarios todavía. ¡Agrega uno!</Text>}
    />
  );
};

// Conectamos el componente a la colección de forma reactiva
const ListaUsuariosReactiva = withObservables([], () => ({
  usuarios: usuariosCollection.query() // Observa todos los usuarios
}))(ListaUsuarios);


// ═══════════════════════════════════════════════════════════════
// 2. PANTALLA PRINCIPAL
// ═══════════════════════════════════════════════════════════════
export default function HomeScreen() {

  // Función para agregar un usuario de prueba a la BD
  const agregarUsuarioPrueba = async () => {
    try {
      // TODA escritura en WatermelonDB debe ir dentro de database.write()
      await database.write(async () => {
        await usuariosCollection.create(usuario => {
          usuario.nombre = 'Juan';
          usuario.apellidoP = 'Pérez';
          usuario.apellidoM = 'Gómez';
          // Generamos una fecha de nacimiento de hace unos 70 años aprox (timestamp)
          usuario.fechaNacimiento = Date.now() - (70 * 365 * 24 * 60 * 60 * 1000); 
          usuario.telefono = '555-1234';
        });
      });
      console.log("¡Usuario agregado con éxito!");
    } catch (error) {
      console.error("Error al agregar usuario:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Base de Datos Local</Text>
      
      {/* Usamos el componente reactivo que creamos arriba */}
      <View style={styles.listaContainer}>
        <ListaUsuariosReactiva />
      </View>

      <TouchableOpacity style={styles.boton} onPress={agregarUsuarioPrueba}>
        <Text style={styles.textoBoton}>+ Agregar Paciente de Prueba</Text>
      </TouchableOpacity>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════
// ESTILOS BÁSICOS
// ═══════════════════════════════════════════════════════════════
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5', marginTop: 40 },
  titulo: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  listaContainer: { flex: 1, marginBottom: 20 },
  card: { backgroundColor: 'white', padding: 15, borderRadius: 10, marginBottom: 10, elevation: 2 },
  nombre: { fontSize: 18, fontWeight: 'bold' },
  edad: { color: '#666', marginTop: 5 },
  empty: { textAlign: 'center', color: '#999', marginTop: 50, fontSize: 16 },
  boton: { backgroundColor: '#007AFF', padding: 15, borderRadius: 10, alignItems: 'center' },
  textoBoton: { color: 'white', fontSize: 16, fontWeight: 'bold' }
});