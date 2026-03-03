import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useAuth } from "../../hooks/use-auth";
import { styles, colors } from "../../lib/styles";

export function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Email and password are required");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await login(email, password);
    } catch (e: any) {
      setError(e.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 24 }}>
        <Text style={{ fontSize: 32, fontWeight: "800", marginBottom: 8, color: colors.foreground }}>
          Welcome back
        </Text>
        <Text style={{ fontSize: 16, color: colors.mutedForeground, marginBottom: 32 }}>
          Sign in to your HomeHub account
        </Text>

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="you@example.com"
          placeholderTextColor={colors.mutedForeground}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="At least 6 characters"
          placeholderTextColor={colors.mutedForeground}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {error ? (
          <Text style={{ color: colors.destructive, marginBottom: 12, fontSize: 14 }}>
            {error}
          </Text>
        ) : null}

        <Pressable
          onPress={handleLogin}
          disabled={loading}
          style={[styles.buttonPrimary, loading && { opacity: 0.7 }]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonPrimaryText}>Log In</Text>
          )}
        </Pressable>

        <Pressable onPress={() => navigation.navigate("Register")} style={{ marginTop: 16 }}>
          <Text style={{ textAlign: "center", color: colors.mutedForeground }}>
            Don't have an account?{" "}
            <Text style={{ color: colors.primary, fontWeight: "600" }}>Sign up</Text>
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
