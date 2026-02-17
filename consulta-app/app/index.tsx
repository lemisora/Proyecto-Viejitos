import { Text, View } from "react-native";
import { Link } from "expo-router";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Para ir a la ventana</Text>
      <Text>o a la ventana</Text>
      <Link href="/acerca">Acerca</Link>
    </View>
  );
}
