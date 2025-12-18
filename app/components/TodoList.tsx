import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import {
  Todo,
  addTodo,
  deleteTodo,
  getTodos,
  getTodosByStatus,
  initDB,
  updateTodo,
} from "../services/todoService";

export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [text, setText] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [filter, setFilter] = useState<"all" | "done" | "undone">("all");

  useEffect(() => {
    (async () => {
      await initDB();
      await reload();
    })();
  }, []);

  async function reload() {
    if (filter === "all") {
      setTodos(await getTodos());
    } else {
      setTodos(await getTodosByStatus(filter));
    }
  }

  async function handleAddOrUpdate() {
    if (!text.trim()) return;

    if (editingId) {
      await updateTodo(editingId, { text: text.trim() });
      setEditingId(null);
    } else {
      await addTodo(text.trim());
    }

    setText("");
    reload();
  }

  async function handleToggle(item: Todo) {
    await updateTodo(item.id!, { done: item.done === 1 ? 0 : 1 });
    reload();
  }

  function startEdit(item: Todo) {
    setEditingId(item.id ?? null);
    setText(item.text);
  }

  function confirmDelete(item: Todo) {
    Alert.alert("Hapus Todo", "Yakin ingin menghapus?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: async () => {
          await deleteTodo(item.id!);
          reload();
        },
      },
    ]);
  }

  function renderItem({ item }: { item: Todo }) {
    return (
      <View style={styles.itemRow}>
        <TouchableOpacity style={{ flex: 1 }} onPress={() => handleToggle(item)}>
          <Text style={[styles.itemText, item.done === 1 && styles.doneText]}>
            {item.text}
          </Text>

          {item.done === 1 && item.finished_at && (
            <Text style={styles.timeText}>
              Selesai: {item.finished_at}
            </Text>
          )}
        </TouchableOpacity>

        <Button title="Edit" onPress={() => startEdit(item)} />
        <View style={{ width: 6 }} />
        <Button title="Del" color="#d9534f" onPress={() => confirmDelete(item)} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Todo SQLite</Text>

      {/* FILTER */}
      <View style={styles.filterRow}>
        <Button title="All" onPress={() => { setFilter("all"); reload(); }} />
        <Button title="Done" onPress={() => { setFilter("done"); reload(); }} />
        <Button title="Undone" onPress={() => { setFilter("undone"); reload(); }} />
      </View>

      {/* INPUT */}
      <View style={styles.inputRow}>
        <TextInput
          placeholder="Tulis todo..."
          value={text}
          onChangeText={setText}
          style={styles.input}
        />
        <Button
          title={editingId ? "Simpan" : "Tambah"}
          onPress={handleAddOrUpdate}
        />
      </View>

      <FlatList
        data={todos}
        keyExtractor={(i) => String(i.id)}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={{ textAlign: "center" }}>Belum ada todo</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: "600", marginBottom: 12 },
  filterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  inputRow: { flexDirection: "row", marginBottom: 12 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    marginRight: 8,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  itemText: { fontSize: 16 },
  doneText: { textDecorationLine: "line-through", color: "#888" },
  timeText: { fontSize: 12, color: "#666" },
});
