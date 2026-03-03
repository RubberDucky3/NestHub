import React from "react";
import { View, Text, ScrollView, Pressable, Alert } from "react-native";
import * as Clipboard from "expo-clipboard";
import { useAuth } from "../hooks/use-auth";
import { useHousehold } from "../hooks/use-households";
import { colors, styles } from "../lib/styles";

export function SettingsScreen() {
  const { user, logout } = useAuth();
  const { data: household } = useHousehold();

  const copyCode = async () => {
    if (household?.joinCode) {
      await Clipboard.setStringAsync(household.joinCode);
      Alert.alert("Copied!", "Join code copied to clipboard.");
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ padding: 24 }}>
        <Text style={{ fontSize: 24, fontWeight: "800", color: colors.foreground, marginBottom: 24 }}>
          Settings
        </Text>

        {/* Household info */}
        <View style={[styles.card, { marginBottom: 16 }]}>
          <Text style={{ fontSize: 13, fontWeight: "600", color: colors.mutedForeground, textTransform: "uppercase", marginBottom: 8 }}>
            Household
          </Text>
          <Text style={{ fontSize: 18, fontWeight: "700", color: colors.foreground, marginBottom: 12 }}>
            {household?.name}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Text style={{ fontSize: 14, color: colors.mutedForeground }}>Join Code:</Text>
            <Text style={{ fontSize: 16, fontWeight: "700", color: colors.primary, letterSpacing: 2 }}>
              {household?.joinCode}
            </Text>
            <Pressable onPress={copyCode} style={{ backgroundColor: colors.primary + "15", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 }}>
              <Text style={{ color: colors.primary, fontSize: 12, fontWeight: "600" }}>Copy</Text>
            </Pressable>
          </View>
        </View>

        {/* Members */}
        <View style={[styles.card, { marginBottom: 16 }]}>
          <Text style={{ fontSize: 13, fontWeight: "600", color: colors.mutedForeground, textTransform: "uppercase", marginBottom: 12 }}>
            Members
          </Text>
          {household?.members?.map((m: any) => (
            <View key={m.id} style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
              <View style={{
                width: 36, height: 36, borderRadius: 18,
                backgroundColor: colors.primary + "20",
                alignItems: "center", justifyContent: "center", marginRight: 12,
              }}>
                <Text style={{ color: colors.primary, fontWeight: "700", fontSize: 14 }}>
                  {(m.firstName || m.email || "?")[0].toUpperCase()}
                </Text>
              </View>
              <View>
                <Text style={{ fontWeight: "600", color: colors.foreground }}>
                  {m.firstName} {m.lastName}
                </Text>
                {m.email && (
                  <Text style={{ fontSize: 12, color: colors.mutedForeground }}>{m.email}</Text>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Account */}
        <View style={[styles.card, { marginBottom: 16 }]}>
          <Text style={{ fontSize: 13, fontWeight: "600", color: colors.mutedForeground, textTransform: "uppercase", marginBottom: 12 }}>
            Account
          </Text>
          <Text style={{ color: colors.foreground, marginBottom: 4 }}>
            {user?.firstName} {user?.lastName}
          </Text>
          <Text style={{ color: colors.mutedForeground, fontSize: 13, marginBottom: 16 }}>
            {user?.email}
          </Text>
          <Pressable
            onPress={() => {
              Alert.alert("Log Out", "Are you sure?", [
                { text: "Cancel", style: "cancel" },
                { text: "Log Out", style: "destructive", onPress: logout },
              ]);
            }}
            style={[styles.buttonOutline, { borderColor: colors.destructive }]}
          >
            <Text style={[styles.buttonOutlineText, { color: colors.destructive }]}>Log Out</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}
