import { Feather, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Modal,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

const { width } = Dimensions.get("window");

// Define types
type User = {
  _id: string;
  username?: string;
  email: string;
  role?: string;
  createdAt?: string;
  lastLogin?: string;
};

type UsersResponse = {
  success: boolean;
  users: User[];
  error?: string;
};

type DeleteResponse = {
  success: boolean;
  message?: string;
  error?: string;
};

type UpdateResponse = {
  success: boolean;
  user?: User;
  error?: string;
};

export default function AdminUsers() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editForm, setEditForm] = useState({ username: "", email: "" });

  const primaryColor = "#39FF14";
  const backgroundColor = "#000000";

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = users.filter(
        (user) =>
          user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchQuery, users]);

  const fetchUsers = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      
      const response = await fetch("http://192.168.100.143:3000/api/admin/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = (await response.json()) as UsersResponse;

      if (response.ok && data.success) {
        setUsers(data.users);
      } else {
        Alert.alert("Error", data.error || "Failed to fetch users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      Alert.alert("Error", "Network error occurred");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setModalVisible(true);
  };

  const confirmDelete = async () => {
    if (!selectedUser) return;

    try {
      const token = await AsyncStorage.getItem("userToken");
      
      const response = await fetch(`http://192.168.100.143:3000/api/admin/users/${selectedUser._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = (await response.json()) as DeleteResponse;

      if (response.ok && data.success) {
        setUsers(users.filter(u => u._id !== selectedUser._id));
        Alert.alert("Success", "User deleted successfully");
      } else {
        Alert.alert("Error", data.error || "Failed to delete user");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      Alert.alert("Error", "Network error occurred");
    } finally {
      setModalVisible(false);
      setSelectedUser(null);
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditForm({ username: user.username || "", email: user.email });
    setEditModalVisible(true);
  };

  const saveEdit = async () => {
    if (!selectedUser) return;

    try {
      const token = await AsyncStorage.getItem("userToken");
      
      const response = await fetch(`http://192.168.100.143:3000/api/admin/users/${selectedUser._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });

      const data = (await response.json()) as UpdateResponse;

      if (response.ok && data.success && data.user) {
        setUsers(users.map(u => 
          u._id === selectedUser._id ? data.user! : u
        ));
        Alert.alert("Success", "User updated successfully");
        setEditModalVisible(false);
      } else {
        Alert.alert("Error", data.error || "Failed to update user");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      Alert.alert("Error", "Network error occurred");
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <LinearGradient colors={["#000000", "#0a0a0a"]} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={primaryColor} />
        <Text style={styles.loadingText}>Loading users...</Text>
      </LinearGradient>
    );
  }

  const renderUserCard = ({ item }: { item: User }) => (
    <Animated.View entering={FadeInDown.duration(400)} style={styles.userCard}>
      <View style={styles.userHeader}>
        <View style={[styles.userAvatar, { backgroundColor: primaryColor + "20" }]}>
          <Text style={[styles.userAvatarText, { color: primaryColor }]}>
            {item.username?.charAt(0).toUpperCase() || "U"}
          </Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.username || "No username"}</Text>
          <Text style={styles.userEmail}>{item.email}</Text>
        </View>
        <View style={[styles.userRole, { backgroundColor: primaryColor + "20" }]}>
          <Text style={[styles.userRoleText, { color: primaryColor }]}>
            {item.role || "user"}
          </Text>
        </View>
      </View>

      <View style={styles.userDetails}>
        <View style={styles.detailItem}>
          <Ionicons name="calendar-outline" size={14} color="#888" />
          <Text style={styles.detailText}>Joined: {formatDate(item.createdAt)}</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="time-outline" size={14} color="#888" />
          <Text style={styles.detailText}>Last login: {formatDate(item.lastLogin)}</Text>
        </View>
      </View>

      <View style={styles.userActions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: primaryColor + "20" }]}
          onPress={() => handleEditUser(item)}
        >
          <Feather name="edit-2" size={16} color={primaryColor} />
          <Text style={[styles.actionText, { color: primaryColor }]}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: "#ff444420" }]}
          onPress={() => handleDeleteUser(item)}
        >
          <Feather name="trash-2" size={16} color="#ff4444" />
          <Text style={[styles.actionText, { color: "#ff4444" }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  return (
    <LinearGradient colors={["#000000", "#0a0a0a"]} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={primaryColor} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>User Management</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { borderColor: primaryColor + "40" }]}>
        <Ionicons name="search" size={20} color={primaryColor} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search users..."
          placeholderTextColor="#888"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={20} color="#888" />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { borderColor: primaryColor + "30" }]}>
          <Text style={styles.statNumber}>{users.length}</Text>
          <Text style={styles.statLabel}>Total Users</Text>
        </View>
        <View style={[styles.statCard, { borderColor: primaryColor + "30" }]}>
          <Text style={styles.statNumber}>
            {users.filter(u => u.role === "admin").length}
          </Text>
          <Text style={styles.statLabel}>Admins</Text>
        </View>
      </View>

      {/* Users List */}
      <FlatList
        data={filteredUsers}
        renderItem={renderUserCard}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={primaryColor} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={48} color="#888" />
            <Text style={styles.emptyText}>No users found</Text>
          </View>
        }
      />

      {/* Delete Confirmation Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { borderColor: primaryColor + "40" }]}>
            <Ionicons name="warning" size={48} color="#ff4444" />
            <Text style={styles.modalTitle}>Delete User</Text>
            <Text style={styles.modalText}>
              Are you sure you want to delete {selectedUser?.username}? This action cannot be undone.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.deleteButton]}
                onPress={confirmDelete}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit User Modal */}
      <Modal visible={editModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.editModal, { borderColor: primaryColor + "40" }]}>
            <Text style={styles.modalTitle}>Edit User</Text>
            
            <TextInput
              style={[styles.input, { borderColor: primaryColor + "40" }]}
              placeholder="Username"
              placeholderTextColor="#888"
              value={editForm.username}
              onChangeText={(text) => setEditForm({ ...editForm, username: text })}
            />
            
            <TextInput
              style={[styles.input, { borderColor: primaryColor + "40" }]}
              placeholder="Email"
              placeholderTextColor="#888"
              value={editForm.email}
              onChangeText={(text) => setEditForm({ ...editForm, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton, { backgroundColor: primaryColor }]}
                onPress={saveEdit}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#39FF14",
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 12,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 16,
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    backgroundColor: "rgba(15, 23, 42, 0.5)",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "700",
    color: "#39FF14",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#888",
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  userCard: {
    backgroundColor: "rgba(15, 23, 42, 0.7)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(57, 255, 20, 0.2)",
  },
  userHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  userAvatarText: {
    fontSize: 20,
    fontWeight: "600",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: "#888",
  },
  userRole: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  userRoleText: {
    fontSize: 12,
    fontWeight: "600",
  },
  userDetails: {
    flexDirection: "row",
    marginBottom: 16,
    gap: 16,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  detailText: {
    fontSize: 12,
    color: "#888",
  },
  userActions: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: "600",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
  },
  emptyText: {
    color: "#888",
    marginTop: 12,
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#0a0a0a",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    width: "100%",
    maxWidth: 400,
    borderWidth: 1,
  },
  editModal: {
    backgroundColor: "#0a0a0a",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    borderWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    marginTop: 12,
    marginBottom: 8,
  },
  modalText: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#333",
  },
  deleteButton: {
    backgroundColor: "#ff4444",
  },
  saveButton: {
    backgroundColor: "#39FF14",
  },
  cancelButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  deleteButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  saveButtonText: {
    color: "#000000",
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    color: "#FFFFFF",
    fontSize: 16,
  },
});