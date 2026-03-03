import React, { useState } from "react";
import { View, Text, FlatList, Pressable, Alert, Modal, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { useStickyNotes, useCreateStickyNote, useDeleteStickyNote } from "../hooks/use-notes";
import { colors, styles } from "../lib/styles";

const NOTE_COLORS: Record<string, { bg: string; border: string }> = {
  yellow: { bg: "#fef9c3", border: "#fde047" },
  blue: { bg: "#dbeafe", border: "#93c5fd" },
  pink: { bg: "#fce7f3", border: "#f9a8d4" },
  green: { bg: "#dcfce7", border: "#86efac" },
};

export function NotesScreen() {
  const { data: notes } = useStickyNotes();
  const createNote = useCreateStickyNote();
  const deleteNote = useDeleteStickyNote();
  const [showModal, setShowModal] = useState(false);
  const [content, setContent] = useState("");
  const [selectedColor, setSelectedColor] = useState("yellow");

  const handleCreate = async () => {
    if (!content.trim()) return;
    try {
      await createNote.mutateAsync({ content: content.trim(), color: selectedColor });
      setContent("");
      setSelectedColor("yellow");
      setShowModal(false);
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ padding: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <View>
          <Text style={{ fontSize: 24, fontWeight: "800", color: colors.foreground }}>Sticky Notes</Text>
          <Text style={{ color: colors.mutedForeground, fontSize: 14 }}>Quick notes for the family.</Text>
        </View>
        <Pressable onPress={() => setShowModal(true)} style={[styles.buttonPrimary, { paddingHorizontal: 16, paddingVertical: 10 }]}>
          <Text style={styles.buttonPrimaryText}>+ Note</Text>
        </Pressable>
      </View>

      <FlatList
        data={notes}
        numColumns={2}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 24 }}
        renderItem={({ item }) => {
          const c = NOTE_COLORS[item.color || "yellow"] || NOTE_COLORS.yellow;
          return (
            <Pressable
              onLongPress={() =>
                Alert.alert("Delete Note", "Remove this note?", [
                  { text: "Cancel", style: "cancel" },
                  { text: "Delete", style: "destructive", onPress: () => deleteNote.mutate(item.id) },
                ])
              }
              style={{
                flex: 1, margin: 4, aspectRatio: 1,
                backgroundColor: c.bg, borderColor: c.border, borderWidth: 1,
                borderRadius: 12, padding: 14,
              }}
            >
              <Text style={{ flex: 1, fontSize: 14, color: "#1a1a1a" }} numberOfLines={8}>
                {item.content}
              </Text>
              {item.author?.firstName && (
                <Text style={{ fontSize: 11, color: "#666", marginTop: 4 }}>
                  — {item.author.firstName}
                </Text>
              )}
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", color: colors.mutedForeground, marginTop: 40 }}>
            No notes yet. Tap "+ Note" to create one.
          </Text>
        }
      />

      <Modal visible={showModal} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
          <Pressable onPress={() => setShowModal(false)} style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)" }} />
          <View style={{ backgroundColor: colors.background, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 }}>
            <Text style={{ fontSize: 20, fontWeight: "700", marginBottom: 16, color: colors.foreground }}>New Note</Text>
            <Text style={styles.label}>Content</Text>
            <TextInput
              style={[styles.input, { minHeight: 100, textAlignVertical: "top" }]}
              placeholder="Write your note..."
              placeholderTextColor={colors.mutedForeground}
              multiline
              value={content}
              onChangeText={setContent}
            />
            <Text style={styles.label}>Color</Text>
            <View style={{ flexDirection: "row", gap: 10, marginBottom: 16 }}>
              {Object.entries(NOTE_COLORS).map(([key, c]) => (
                <Pressable
                  key={key}
                  onPress={() => setSelectedColor(key)}
                  style={{
                    width: 40, height: 40, borderRadius: 20,
                    backgroundColor: c.bg, borderWidth: 3,
                    borderColor: selectedColor === key ? colors.primary : c.border,
                  }}
                />
              ))}
            </View>
            <View style={{ flexDirection: "row", gap: 12 }}>
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
