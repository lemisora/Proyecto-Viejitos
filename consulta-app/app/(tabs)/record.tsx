import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useState } from "react";
import {
  StyleSheet,
  TextInput,
  Button,
  NativeModules,
  Alert,
} from "react-native";

export default function RecordScreen() {
  const [text, setText] = useState("");
  const { MyTtsModule } = NativeModules;

  const scheduleMessage = async () => {
    if (!text) {
      Alert.alert("Error", "Please enter a message");
      return;
    }
    try {
      const result = await MyTtsModule.programarMensajeDeVoz(
        text,
        Date.now() + 10000, // 10 seconds from now
      );
      Alert.alert("Success", result);
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Failed to schedule message");
    }
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={<ThemedText>🎙️</ThemedText>}
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Record</ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Enter your message</ThemedText>
        <TextInput
          style={styles.input}
          placeholder="Hello world!"
          onChangeText={setText}
          value={text}
        />
        <Button title="Schedule Message in 10s" onPress={scheduleMessage} />
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    padding: 10,
    color: "#fff",
  },
});
