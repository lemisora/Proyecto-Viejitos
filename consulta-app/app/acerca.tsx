import { StyleSheet, Text, View } from "react-native"
import React from "react"

export default function Acerca() {
  return (
    <View style={styles.container}>
      <Text>Acerca</Text>
    </View>
  )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    }
})