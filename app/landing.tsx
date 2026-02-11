import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

export default function landing() {
  const router = useRouter();

useEffect(() => {
  const redirect = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");

      await new Promise((resolve) => setTimeout(resolve, 300));

      if (!token) {
        router.replace("/login");
      } else {
        router.replace("/(tabs)");
      }
    } catch (err) {
      console.error("Failed to read token:", err);
      router.replace("/login"); 
    }
  };

  redirect();
}, []);


  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#39FF14" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
});
