import React, { useState } from "react";
import { View, TextInput, Button, Text, Alert, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

const API_URL = "http://127.0.0.1:8000/api/";

const AuthScreen = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [loggedInMessage, setLoggedInMessage] = useState("");
  const router = useRouter(); // Move inside component

  const handleAuth = async () => {
    if (!username || !password || (!isLogin && !email)) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    const endpoint = isLogin ? "login/" : "register/";
    const payload = isLogin ? { username, password } : { username, email, password };

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || (isLogin ? "Login failed" : "Registration failed"));
      }

      if (isLogin) {
        await AsyncStorage.setItem("accessToken", data.access);
        await AsyncStorage.setItem("refreshToken", data.refresh);
        setLoggedInMessage("You are logged in!");
        router.replace("/profile");  
      } else {
        Alert.alert("Success", "User registered successfully!");
      }
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isLogin ? "Login" : "Sign Up"}</Text>

      {loggedInMessage ? (
        <Text style={styles.successMessage}>{loggedInMessage}</Text>
      ) : (
        <>
          <TextInput
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
            style={styles.input}
          />
          {!isLogin && (
            <TextInput
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
            />
          )}
          <TextInput
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            style={styles.input}
          />
          <Button title={isLogin ? "Login" : "Sign Up"} onPress={handleAuth} color="#007bff" />
          <Text style={styles.switchText} onPress={() => setIsLogin(!isLogin)}>
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Login"}
          </Text>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#ffffff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#f9f9f9",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    fontSize: 16,
  },
  switchText: {
    textAlign: "center",
    marginTop: 15,
    color: "#007bff",
    fontWeight: "bold",
  },
  successMessage: {
    textAlign: "center",
    fontSize: 18,
    color: "green",
    fontWeight: "bold",
    marginBottom: 20,
  },
});

export default AuthScreen;
