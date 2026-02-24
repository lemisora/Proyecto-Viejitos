import React from 'react';
import { ImageBackground, StyleSheet, Text, View, Image} from "react-native";
import { Link, Stack } from "expo-router";


export default function Index() {
  return (
    <>
      <Stack.Screen options={{headerShown: false}}/>
      <ImageBackground
        source={require("../assets/images/17373.jpg")}
        style={styles.background}
        resizeMode='cover'
        >
          <View style = {styles.container} >
            <Image
              source={require("./../assets/images/Logo.png")}
              style={styles.header} 
            ></Image>

            <Text style={styles.texto}>Para ir a la ventana</Text>
            <Text>o a la ventana</Text>
            <Link href="/acerca">Acerca</Link>
          </View>
    </ImageBackground>

    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 24
  },
  header:{
    marginVertical: 36,
    width: 200,
    height: 200,
    borderWidth: 1,
    borderRadius: 15,
  },
  texto: {
    fontSize: 16,
    marginBottom: 5,
  },
  link: {
    marginTop: 20,
    color: '#007AFF', // Color azul estándar para enlaces
    fontWeight: 'bold',
  },
  background: {
    flex: 1,
    justifyContent: 'center',

  },
});
