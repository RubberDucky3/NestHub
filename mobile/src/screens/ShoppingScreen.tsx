import React, { useState } from "react";
import { View, Text, FlatList, TextInput, Pressable, Alert } from "react-native";
import { useShoppingList, useCreateShoppingItem, useUpdateShoppingItem, useDeleteShoppingItem } from "../hooks/use-shopping";
import { colors, styles } from "../lib/styles";

export function ShoppingScreen() {
  const { data: items } = useShoppingList();
  const createItem = useCreateShoppingItem();
  const updateItem = useUpdateShoppingItem();
  const deleteItem = useDeleteShoppingItem();
  const [newName, setNewName] = useState("");

  const handleAdd = async () => {
    if (!newName.trim()) return;
    await createItem.mutateAsync({ name: newName.trim() });
    setNewName("");
  };

  const unchecked = items?.filter((i) => !i.completed) || [];
  const checked = items?.filter((i) => i.completed) || [];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: "800", color: colors.foreground, marginBottom: 4 }}>
          Shopping List
        </Text>
        <Text style={{ color: colors.mutedForeground, fontSize: 14, marginBottom: 16 }}>
          Never forget milk again.
        </Text>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <TextInput
            style={[styles.input, { flex: 1, marginBottom: 0 }]}
            placeholder="Add item..."
            placeholderTextColor={colors.mutedForeground}
            value={newName}
            onChangeText={setNewName}
            onSubmitEditing={handleAdd}
            returnKeyType="done"
          />
          <Pressable onPress={handleAdd} style={[styles.buttonPrimary, { paddingHorizontal: 20, paddingVertical: 12 }]}>
            <Text style={styles.buttonPrimaryText}>Add</Text>
          </Pressable>
        </View>
      </View>

      <FlatList
        data={[...unchecked, ...checked]}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => updateItem.mutate({ id: item.id, completed: !item.completed })}
            onLongPress={() =>
              Alert.alert("Delete", `Remove "${item.name}"?`, [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", style: "destructive", onPress: () => deleteItem.mutate(item.id) },
              ])
            }
            style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border }}
          >
            <View
              style={{
                width: 22, height: 22, borderRadius: 6,
                borderWidth: 2, borderColor: item.completed ? colors.secondary : colors.border,
                backgroundColor: item.completed ? colors.secondary : "transparent",
                marginRight: 12, alignItems: "center", justifyContent: "center",
              }}
            >
              {item.completed && <Text style={{ color: "#fff", fontSize: 12, fontWeight: "700" }}>✓</Text>}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{
                fontSize: 15, color: colors.foreground,
                textDecorationLine: item.completed ? "line-through" : "none",
                opacity: item.completed ? 0.5 : 1,
              }}>
                {item.name}
              </Text>
              {item.addedBy?.firstName && (
                <Text style={{ fontSize: 12, color: colors.mutedForeground, marginTop: 2 }}>
                  Added by {item.addedBy.firstName}
                </Text>
              )}
            </View>
          </Pressable>
        )}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", color: colors.mutedForeground, marginTop: 40 }}>
            Your list is empty. Add some items!
          </Text>
        }
      />
    </View>
  );
}
