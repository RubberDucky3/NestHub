import React from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useAuth } from "../hooks/use-auth";
import { useHousehold } from "../hooks/use-households";
import { useTasks } from "../hooks/use-tasks";
import { useEvents } from "../hooks/use-events";
import { colors, styles } from "../lib/styles";
import { format, isToday } from "date-fns";

export function DashboardScreen() {
  const { user } = useAuth();
  const { data: household } = useHousehold();
  const { data: tasks } = useTasks();
  const { data: events } = useEvents();

  const pendingTasks = tasks?.filter((t) => !t.completed) || [];
  const todayEvents =
    events?.filter((e) => isToday(new Date(e.startTime))) || [];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ padding: 24 }}>
        <Text style={{ fontSize: 28, fontWeight: "800", color: colors.foreground, marginBottom: 4 }}>
          Hey, {user?.firstName || "there"}!
        </Text>
        <Text style={{ fontSize: 16, color: colors.mutedForeground, marginBottom: 24 }}>
          Here's what's happening in {household?.name || "your home"}.
        </Text>

        {/* Stat cards */}
        <View style={{ flexDirection: "row", gap: 12, marginBottom: 24 }}>
          <View style={[styles.card, { flex: 1 }]}>
            <Text style={{ fontSize: 32, fontWeight: "800", color: colors.primary }}>
              {pendingTasks.length}
            </Text>
            <Text style={{ color: colors.mutedForeground, fontSize: 13 }}>Pending Tasks</Text>
          </View>
          <View style={[styles.card, { flex: 1 }]}>
            <Text style={{ fontSize: 32, fontWeight: "800", color: colors.secondary }}>
              {todayEvents.length}
            </Text>
            <Text style={{ color: colors.mutedForeground, fontSize: 13 }}>Events Today</Text>
          </View>
        </View>

        {/* Today's events */}
        <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 12, color: colors.foreground }}>
          Today's Schedule
        </Text>
        {todayEvents.length === 0 ? (
          <Text style={{ color: colors.mutedForeground, marginBottom: 24 }}>
            No events scheduled for today.
          </Text>
        ) : (
          todayEvents.map((e) => (
            <View key={e.id} style={[styles.card, { marginBottom: 8 }]}>
              <Text style={{ fontWeight: "600", fontSize: 15, color: colors.foreground }}>
                {e.title}
              </Text>
              <Text style={{ color: colors.mutedForeground, fontSize: 13, marginTop: 2 }}>
                {format(new Date(e.startTime), "h:mm a")} -{" "}
                {format(new Date(e.endTime), "h:mm a")}
              </Text>
            </View>
          ))
        )}

        {/* Pending tasks */}
        <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 12, marginTop: 16, color: colors.foreground }}>
          My Tasks
        </Text>
        {pendingTasks.slice(0, 5).map((t) => (
          <View key={t.id} style={[styles.card, { marginBottom: 8, flexDirection: "row", alignItems: "center" }]}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: "600", color: colors.foreground }}>{t.title}</Text>
              {t.description ? (
                <Text style={{ color: colors.mutedForeground, fontSize: 13, marginTop: 2 }}>
                  {t.description}
                </Text>
              ) : null}
            </View>
            {t.points ? (
              <View style={{ backgroundColor: colors.accent + "20", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }}>
                <Text style={{ color: colors.accent, fontWeight: "700", fontSize: 12 }}>
                  {t.points} pts
                </Text>
              </View>
            ) : null}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
