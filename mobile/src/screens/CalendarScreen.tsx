import React, { useState } from "react";
import { View, Text, FlatList, Pressable, Alert, Modal, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { useEvents, useCreateEvent, useDeleteEvent } from "../hooks/use-events";
import { colors, styles } from "../lib/styles";
import { format } from "date-fns";

export function CalendarScreen() {
  const { data: events } = useEvents();
  const createEvent = useCreateEvent();
  const deleteEvent = useDeleteEvent();
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  const sorted = [...(events || [])].sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );

  const handleCreate = async () => {
    if (!title.trim()) return;
    const now = new Date();
    const oneHour = new Date(now.getTime() + 3600000);
    try {
      await createEvent.mutateAsync({
        title: title.trim(),
        startTime: now.toISOString(),
        endTime: oneHour.toISOString(),
        location: location.trim() || undefined,
        description: description.trim() || undefined,
      });
      setTitle("");
      setLocation("");
      setDescription("");
      setShowModal(false);
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ padding: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <View>
          <Text style={{ fontSize: 24, fontWeight: "800", color: colors.foreground }}>Calendar</Text>
          <Text style={{ color: colors.mutedForeground, fontSize: 14 }}>Family events & schedule.</Text>
        </View>
        <Pressable onPress={() => setShowModal(true)} style={[styles.buttonPrimary, { paddingHorizontal: 16, paddingVertical: 10 }]}>
          <Text style={styles.buttonPrimaryText}>+ Event</Text>
        </Pressable>
      </View>

      <FlatList
        data={sorted}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Pressable
            onLongPress={() =>
              Alert.alert("Delete Event", `Remove "${item.title}"?`, [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", style: "destructive", onPress: () => deleteEvent.mutate(item.id) },
              ])
            }
            style={[styles.card, { marginHorizontal: 16, marginBottom: 8, flexDirection: "row" }]}
          >
            <View style={{
              width: 50, alignItems: "center", justifyContent: "center",
              backgroundColor: colors.primary + "15", borderRadius: 10, marginRight: 12, paddingVertical: 8,
            }}>
              <Text style={{ fontSize: 11, fontWeight: "600", color: colors.primary, textTransform: "uppercase" }}>
                {format(new Date(item.startTime), "MMM")}
              </Text>
              <Text style={{ fontSize: 22, fontWeight: "800", color: colors.primary }}>
                {format(new Date(item.startTime), "d")}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: "600", fontSize: 15, color: colors.foreground }}>{item.title}</Text>
              <Text style={{ color: colors.mutedForeground, fontSize: 13, marginTop: 2 }}>
                {format(new Date(item.startTime), "h:mm a")} - {format(new Date(item.endTime), "h:mm a")}
              </Text>
              {item.location && (
                <Text style={{ color: colors.mutedForeground, fontSize: 12, marginTop: 2 }}>📍 {item.location}</Text>
              )}
            </View>
          </Pressable>
        )}
        contentContainerStyle={{ paddingBottom: 24 }}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", color: colors.mutedForeground, marginTop: 40 }}>
            No events yet. Tap "+ Event" to add one.
          </Text>
        }
      />

      <Modal visible={showModal} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
          <Pressable onPress={() => setShowModal(false)} style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)" }} />
          <View style={{ backgroundColor: colors.background, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 }}>
            <Text style={{ fontSize: 20, fontWeight: "700", marginBottom: 16, color: colors.foreground }}>New Event</Text>
            <Text style={styles.label}>Title</Text>
            <TextInput style={styles.input} placeholder="Event title" placeholderTextColor={colors.mutedForeground} value={title} onChangeText={setTitle} />
            <Text style={styles.label}>Location</Text>
            <TextInput style={styles.input} placeholder="Optional location" placeholderTextColor={colors.mutedForeground} value={location} onChangeText={setLocation} />
            <Text style={styles.label}>Description</Text>
            <TextInput style={[styles.input, { minHeight: 60 }]} placeholder="Optional description" placeholderTextColor={colors.mutedForeground} multiline value={description} onChangeText={setDescription} />
            <View style={{ flexDirection: "row", gap: 12, marginTop: 8 }}>
              <Pressable onPress={() => setShowModal(false)} style={[styles.buttonOutline, { flex: 1 }]}>
                <Text style={styles.buttonOutlineText}>Cancel</Text>
              </Pressable>
              <Pressable onPress={handleCreate} style={[styles.buttonPrimary, { flex: 1 }]}>
                <Text style={styles.buttonPrimaryText}>Create</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
