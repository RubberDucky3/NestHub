import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from "../hooks/use-tasks";
import { colors, styles } from "../lib/styles";

export function TasksScreen() {
  const { data: tasks, isLoading } = useTasks();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [points, setPoints] = useState("");

  const pending = tasks?.filter((t) => !t.completed) || [];
  const completed = tasks?.filter((t) => t.completed) || [];

  const handleCreate = async () => {
    if (!title.trim()) return;
    try {
      await createTask.mutateAsync({
        title: title.trim(),
        description: description.trim() || undefined,
        points: points ? parseInt(points, 10) : undefined,
      });
      setTitle("");
      setDescription("");
      setPoints("");
      setShowModal(false);
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
  };

  const handleDelete = (id: number) => {
    Alert.alert("Delete Task", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteTask.mutate(id) },
    ]);
  };

  const renderTask = ({ item }: { item: any }) => (
    <Pressable
      onPress={() => updateTask.mutate({ id: item.id, completed: !item.completed })}
      onLongPress={() => handleDelete(item.id)}
      style={[styles.card, { marginHorizontal: 16, marginBottom: 8, flexDirection: "row", alignItems: "center" }]}
    >
      <View
        style={{
          width: 24, height: 24, borderRadius: 12,
          borderWidth: 2, borderColor: item.completed ? colors.secondary : colors.border,
          backgroundColor: item.completed ? colors.secondary : "transparent",
          marginRight: 12, alignItems: "center", justifyContent: "center",
        }}
      >
        {item.completed && <Text style={{ color: "#fff", fontSize: 14, fontWeight: "700" }}>✓</Text>}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{
          fontWeight: "600", color: colors.foreground, fontSize: 15,
          textDecorationLine: item.completed ? "line-through" : "none",
          opacity: item.completed ? 0.5 : 1,
        }}>
          {item.title}
        </Text>
        {item.assignedTo?.firstName && (
          <Text style={{ color: colors.mutedForeground, fontSize: 12, marginTop: 2 }}>
            Assigned to {item.assignedTo.firstName}
          </Text>
        )}
      </View>
      {item.points ? (
        <View style={{ backgroundColor: colors.accent + "20", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }}>
          <Text style={{ color: colors.accent, fontWeight: "700", fontSize: 12 }}>
            {item.points} pts
          </Text>
        </View>
      ) : null}
    </Pressable>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ padding: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <View>
          <Text style={{ fontSize: 24, fontWeight: "800", color: colors.foreground }}>Tasks & Chores</Text>
          <Text style={{ color: colors.mutedForeground, fontSize: 14 }}>Keep the house running smoothly.</Text>
        </View>
        <Pressable onPress={() => setShowModal(true)} style={[styles.buttonPrimary, { paddingHorizontal: 16, paddingVertical: 10 }]}>
          <Text style={styles.buttonPrimaryText}>+ Add</Text>
        </Pressable>
      </View>

      <FlatList
        data={[...pending, ...completed]}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderTask}
        contentContainerStyle={{ paddingBottom: 24 }}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", color: colors.mutedForeground, marginTop: 40 }}>
            No tasks yet. Tap "+ Add" to create one.
          </Text>
        }
      />

      {/* Create Task Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
          <Pressable onPress={() => setShowModal(false)} style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)" }} />
          <View style={{ backgroundColor: colors.background, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 }}>
            <Text style={{ fontSize: 20, fontWeight: "700", marginBottom: 16, color: colors.foreground }}>New Task</Text>
            <Text style={styles.label}>Title</Text>
            <TextInput style={styles.input} placeholder="Task title" placeholderTextColor={colors.mutedForeground} value={title} onChangeText={setTitle} />
            <Text style={styles.label}>Description</Text>
            <TextInput style={[styles.input, { minHeight: 60 }]} placeholder="Optional description" placeholderTextColor={colors.mutedForeground} multiline value={description} onChangeText={setDescription} />
            <Text style={styles.label}>Points</Text>
            <TextInput style={styles.input} placeholder="0" placeholderTextColor={colors.mutedForeground} keyboardType="number-pad" value={points} onChangeText={setPoints} />
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
