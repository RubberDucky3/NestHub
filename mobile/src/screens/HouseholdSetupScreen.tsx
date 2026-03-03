import React, { useState } from "react";
import { View, Text, TextInput, Pressable, Alert, ActivityIndicator } from "react-native";
import { useCreateHousehold, useJoinHousehold } from "../hooks/use-households";
import { colors, styles } from "../lib/styles";

export function HouseholdSetupScreen() {
  const [mode, setMode] = useState<"choose" | "create" | "join">("choose");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const createHousehold = useCreateHousehold();
  const joinHousehold = useJoinHousehold();

  if (mode === "choose") {
    return (
      <View style={{ flex: 1, justifyContent: "center", padding: 24, backgroundColor: colors.background }}>
        <Text style={{ fontSize: 28, fontWeight: "800", textAlign: "center", marginBottom: 8, color: colors.foreground }}>
          Welcome to HomeHub!
        </Text>
        <Text style={{ fontSize: 16, textAlign: "center", color: colors.mutedForeground, marginBottom: 32 }}>
          Create a new household or join an existing one.
        </Text>
        <Pressable onPress={() => setMode("create")} style={[styles.buttonPrimary, { marginBottom: 12 }]}>
          <Text style={styles.buttonPrimaryText}>Create Household</Text>
        </Pressable>
        <Pressable onPress={() => setMode("join")} style={styles.buttonOutline}>
          <Text style={styles.buttonOutlineText}>Join with Code</Text>
        </Pressable>
      </View>
    );
  }

  if (mode === "create") {
    return (
      <View style={{ flex: 1, justifyContent: "center", padding: 24, backgroundColor: colors.background }}>
        <Pressable onPress={() => setMode("choose")} style={{ marginBottom: 24 }}>
          <Text style={{ color: colors.primary, fontWeight: "600" }}>← Back</Text>
        </Pressable>
        <Text style={{ fontSize: 24, fontWeight: "800", marginBottom: 16, color: colors.foreground }}>
          Create Household
        </Text>
        <Text style={styles.label}>Household Name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Smith Family"
          placeholderTextColor={colors.mutedForeground}
          value={name}
          onChangeText={setName}
        />
        <Pressable
          onPress={async () => {
            if (!name.trim()) return;
            try {
              await createHousehold.mutateAsync({ name: name.trim() });
            } catch (e: any) {
              Alert.alert("Error", e.message);
            }
          }}
          disabled={createHousehold.isPending}
          style={[styles.buttonPrimary, createHousehold.isPending && { opacity: 0.7 }]}
        >
          {createHousehold.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonPrimaryText}>Create</Text>
          )}
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 24, backgroundColor: colors.background }}>
      <Pressable onPress={() => setMode("choose")} style={{ marginBottom: 24 }}>
        <Text style={{ color: colors.primary, fontWeight: "600" }}>← Back</Text>
      </Pressable>
      <Text style={{ fontSize: 24, fontWeight: "800", marginBottom: 16, color: colors.foreground }}>
        Join Household
      </Text>
      <Text style={styles.label}>6-Character Code</Text>
      <TextInput
        style={[styles.input, { textAlign: "center", letterSpacing: 6, fontSize: 22, fontWeight: "700" }]}
        placeholder="ABC123"
        placeholderTextColor={colors.mutedForeground}
        autoCapitalize="characters"
        maxLength={6}
        value={code}
        onChangeText={setCode}
      />
      <Pressable
        onPress={async () => {
          if (code.length !== 6) {
            Alert.alert("Invalid Code", "Please enter a 6-character code.");
            return;
          }
          try {
            await joinHousehold.mutateAsync(code);
          } catch (e: any) {
            Alert.alert("Error", e.message);
          }
        }}
        disabled={joinHousehold.isPending}
        style={[styles.buttonPrimary, joinHousehold.isPending && { opacity: 0.7 }]}
      >
        {joinHousehold.isPending ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonPrimaryText}>Join</Text>
        )}
      </Pressable>
    </View>
  );
}
