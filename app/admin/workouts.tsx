import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
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
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

const { width } = Dimensions.get("window");

// Define types
type Plan = {
  _id: string;
  title: string;
  description: string;
  bodyType: 'Ectomorph' | 'Mesomorph' | 'Endomorph';
  focus: string;
  days: string[];
  tips: string;
  icon: string;
  createdAt: string;
};

type PlansResponse = {
  success: boolean;
  data: Plan[];
  error?: string;
};

type SinglePlanResponse = {
  success: boolean;
  data: Plan;
  error?: string;
};

type DeleteResponse = {
  success: boolean;
  message?: string;
  error?: string;
};

const bodyTypes = ['Ectomorph', 'Mesomorph', 'Endomorph'];
const iconOptions = [
  { value: 'leaf', label: 'Leaf' },
  { value: 'arm-flex', label: 'Arm Flex' },
  { value: 'run', label: 'Run' },
  { value: 'barbell', label: 'Barbell' },
  { value: 'fitness', label: 'Fitness' },
  { value: 'flash', label: 'Flash' },
  { value: 'run-fast', label: 'Run Fast' },
];

export default function AdminWorkouts() {
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [filteredPlans, setFilteredPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedBodyType, setSelectedBodyType] = useState<string>("All");

  // Form state
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    bodyType: 'Ectomorph' as 'Ectomorph' | 'Mesomorph' | 'Endomorph',
    focus: '',
    days: [''],
    tips: '',
    icon: 'fitness',
  });

  const primaryColor = "#39FF14";

  useEffect(() => {
    fetchPlans();
  }, []);

  useEffect(() => {
    let filtered = plans;
    
    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (plan) =>
          plan.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          plan.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          plan.bodyType.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Filter by body type
    if (selectedBodyType !== "All") {
      filtered = filtered.filter(plan => plan.bodyType === selectedBodyType);
    }
    
    setFilteredPlans(filtered);
  }, [searchQuery, plans, selectedBodyType]);

  const fetchPlans = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      
      const response = await fetch("http://192.168.100.143:3000/api/plans", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = (await response.json()) as PlansResponse;

      if (response.ok && data.success) {
        setPlans(data.data);
      } else {
        Alert.alert("Error", data.error || "Failed to fetch plans");
      }
    } catch (error) {
      console.error("Error fetching plans:", error);
      Alert.alert("Error", "Network error occurred");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchPlans();
  };

  const handleAddPlan = () => {
    setFormMode('add');
    setFormData({
      title: '',
      description: '',
      bodyType: 'Ectomorph',
      focus: '',
      days: [''],
      tips: '',
      icon: 'fitness',
    });
    setModalVisible(true);
  };

  const handleEditPlan = (plan: Plan) => {
    setFormMode('edit');
    setSelectedPlan(plan);
    setFormData({
      title: plan.title,
      description: plan.description,
      bodyType: plan.bodyType,
      focus: plan.focus,
      days: plan.days.length ? plan.days : [''],
      tips: plan.tips,
      icon: plan.icon || 'fitness',
    });
    setModalVisible(true);
  };

  const handleDeletePlan = (plan: Plan) => {
    setSelectedPlan(plan);
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (!selectedPlan) return;

    try {
      const token = await AsyncStorage.getItem("userToken");
      
      const response = await fetch(`http://192.168.100.143:3000/api/plans/${selectedPlan._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = (await response.json()) as DeleteResponse;

      if (response.ok && data.success) {
        setPlans(plans.filter(p => p._id !== selectedPlan._id));
        Alert.alert("Success", "Plan deleted successfully");
      } else {
        Alert.alert("Error", data.error || "Failed to delete plan");
      }
    } catch (error) {
      console.error("Error deleting plan:", error);
      Alert.alert("Error", "Network error occurred");
    } finally {
      setDeleteModalVisible(false);
      setSelectedPlan(null);
    }
  };

  const handleDayChange = (text: string, index: number) => {
    const newDays = [...formData.days];
    newDays[index] = text;
    setFormData({ ...formData, days: newDays });
  };

  const addDay = () => {
    setFormData({ ...formData, days: [...formData.days, ''] });
  };

  const removeDay = (index: number) => {
    if (formData.days.length > 1) {
      const newDays = formData.days.filter((_, i) => i !== index);
      setFormData({ ...formData, days: newDays });
    }
  };

  const savePlan = async () => {
    // Validation
    if (!formData.title || !formData.description || !formData.focus || !formData.tips) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    // Filter out empty days
    const validDays = formData.days.filter(day => day.trim() !== '');
    if (validDays.length === 0) {
      Alert.alert("Error", "Please add at least one workout day");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("userToken");
      const url = formMode === 'add' 
        ? "http://192.168.100.143:3000/api/plans"
        : `http://192.168.100.143:3000/api/plans/${selectedPlan?._id}`;
      
      const method = formMode === 'add' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          days: validDays,
        }),
      });

      const data = (await response.json()) as SinglePlanResponse;

      if (response.ok && data.success) {
        if (formMode === 'add') {
          setPlans([...plans, data.data]);
        } else {
          setPlans(plans.map(p => 
            p._id === selectedPlan?._id ? data.data : p
          ));
        }
        Alert.alert("Success", `Plan ${formMode === 'add' ? 'created' : 'updated'} successfully`);
        setModalVisible(false);
      } else {
        Alert.alert("Error", data.error || `Failed to ${formMode} plan`);
      }
    } catch (error) {
      console.error(`Error ${formMode}ing plan:`, error);
      Alert.alert("Error", "Network error occurred");
    }
  };

  const getBodyTypeColor = (type: string) => {
    switch(type) {
      case 'Ectomorph': return '#39FF14';
      case 'Mesomorph': return '#00F0FF';
      case 'Endomorph': return '#FF10F0';
      default: return '#39FF14';
    }
  };

  if (loading) {
    return (
      <LinearGradient colors={["#000000", "#0a0a0a"]} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={primaryColor} />
        <Text style={styles.loadingText}>Loading workout plans...</Text>
      </LinearGradient>
    );
  }

  const renderPlanCard = ({ item }: { item: Plan }) => (
    <Animated.View entering={FadeInDown.duration(400)} style={styles.planCard}>
      <View style={[styles.planHeader, { borderBottomColor: getBodyTypeColor(item.bodyType) + '40' }]}>
        <View style={styles.planTitleContainer}>
          <View style={[styles.planIcon, { backgroundColor: getBodyTypeColor(item.bodyType) + '20' }]}>
            <MaterialCommunityIcons name={item.icon as any} size={24} color={getBodyTypeColor(item.bodyType)} />
          </View>
          <View style={styles.planTitleInfo}>
            <Text style={styles.planTitle}>{item.title}</Text>
            <Text style={styles.planBodyType}>{item.bodyType}</Text>
          </View>
        </View>
        <View style={[styles.bodyTypeBadge, { backgroundColor: getBodyTypeColor(item.bodyType) + '20' }]}>
          <Text style={[styles.bodyTypeText, { color: getBodyTypeColor(item.bodyType) }]}>
            {item.bodyType}
          </Text>
        </View>
      </View>

      <Text style={styles.planFocus}>{item.focus}</Text>
      <Text style={styles.planDescription} numberOfLines={2}>{item.description}</Text>
      
      <View style={styles.planStats}>
        <View style={styles.statItem}>
          <Ionicons name="calendar-outline" size={14} color="#888" />
          <Text style={styles.statText}>{item.days.length} days</Text>
        </View>
      </View>

      <View style={styles.planActions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: primaryColor + "20" }]}
          onPress={() => handleEditPlan(item)}
        >
          <Feather name="edit-2" size={16} color={primaryColor} />
          <Text style={[styles.actionText, { color: primaryColor }]}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: "#ff444420" }]}
          onPress={() => handleDeletePlan(item)}
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
        <Text style={styles.headerTitle}>Workout Plans</Text>
        <TouchableOpacity onPress={handleAddPlan} style={styles.addButton}>
          <Ionicons name="add" size={24} color={primaryColor} />
        </TouchableOpacity>
      </View>

      {/* Search and Filter */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { borderColor: primaryColor + "40" }]}>
          <Ionicons name="search" size={20} color={primaryColor} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search plans..."
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

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
        >
          <TouchableOpacity
            style={[
              styles.filterChip,
              selectedBodyType === "All" && { backgroundColor: primaryColor + "20", borderColor: primaryColor }
            ]}
            onPress={() => setSelectedBodyType("All")}
          >
            <Text style={[
              styles.filterText,
              selectedBodyType === "All" && { color: primaryColor }
            ]}>All</Text>
          </TouchableOpacity>
          
          {bodyTypes.map(type => (
            <TouchableOpacity
              key={type}
              style={[
                styles.filterChip,
                selectedBodyType === type && { backgroundColor: getBodyTypeColor(type) + "20", borderColor: getBodyTypeColor(type) }
              ]}
              onPress={() => setSelectedBodyType(type)}
            >
              <Text style={[
                styles.filterText,
                selectedBodyType === type && { color: getBodyTypeColor(type) }
              ]}>{type}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { borderColor: primaryColor + "30" }]}>
          <Text style={styles.statNumber}>{plans.length}</Text>
          <Text style={styles.statLabel}>Total Plans</Text>
        </View>
        {bodyTypes.map(type => {
          const count = plans.filter(p => p.bodyType === type).length;
          return (
            <View key={type} style={[styles.statCard, { borderColor: getBodyTypeColor(type) + "30" }]}>
              <Text style={[styles.statNumber, { color: getBodyTypeColor(type) }]}>{count}</Text>
              <Text style={styles.statLabel}>{type}</Text>
            </View>
          );
        })}
      </View>

      {/* Plans List */}
      <FlatList
        data={filteredPlans}
        renderItem={renderPlanCard}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={primaryColor} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="fitness-outline" size={48} color="#888" />
            <Text style={styles.emptyText}>No workout plans found</Text>
          </View>
        }
      />

      {/* Add/Edit Plan Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <ScrollView style={styles.modalOverlay} contentContainerStyle={styles.modalContentContainer}>
          <View style={[styles.modalContent, { borderColor: primaryColor + "40" }]}>
            <Text style={styles.modalTitle}>{formMode === 'add' ? 'Add New Plan' : 'Edit Plan'}</Text>
            
            <TextInput
              style={[styles.input, { borderColor: primaryColor + "40" }]}
              placeholder="Plan Title *"
              placeholderTextColor="#888"
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
            />

            <TextInput
              style={[styles.input, { borderColor: primaryColor + "40" }]}
              placeholder="Short Description *"
              placeholderTextColor="#888"
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
            />

            <TextInput
              style={[styles.input, { borderColor: primaryColor + "40" }]}
              placeholder="Focus/Goal *"
              placeholderTextColor="#888"
              value={formData.focus}
              onChangeText={(text) => setFormData({ ...formData, focus: text })}
            />

            <Text style={styles.label}>Body Type *</Text>
            <View style={styles.bodyTypeSelector}>
              {bodyTypes.map(type => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.bodyTypeOption,
                    { borderColor: getBodyTypeColor(type) + '40' },
                    formData.bodyType === type && { backgroundColor: getBodyTypeColor(type) + '20', borderColor: getBodyTypeColor(type) }
                  ]}
                  onPress={() => setFormData({ ...formData, bodyType: type as any })}
                >
                  <Text style={[
                    styles.bodyTypeOptionText,
                    formData.bodyType === type && { color: getBodyTypeColor(type) }
                  ]}>{type}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Icon</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.iconSelector}>
              {iconOptions.map(icon => (
                <TouchableOpacity
                  key={icon.value}
                  style={[
                    styles.iconOption,
                    { borderColor: primaryColor + '40' },
                    formData.icon === icon.value && { backgroundColor: primaryColor + '20', borderColor: primaryColor }
                  ]}
                  onPress={() => setFormData({ ...formData, icon: icon.value })}
                >
                  <MaterialCommunityIcons name={icon.value as any} size={24} color={formData.icon === icon.value ? primaryColor : '#888'} />
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.label}>Workout Days *</Text>
            {formData.days.map((day, index) => (
              <View key={index} style={styles.dayInputContainer}>
                <TextInput
                  style={[styles.dayInput, { borderColor: primaryColor + "40" }]}
                  placeholder={`Day ${index + 1}`}
                  placeholderTextColor="#888"
                  value={day}
                  onChangeText={(text) => handleDayChange(text, index)}
                  multiline
                />
                {formData.days.length > 1 && (
                  <TouchableOpacity onPress={() => removeDay(index)} style={styles.removeDayButton}>
                    <Ionicons name="close-circle" size={24} color="#ff4444" />
                  </TouchableOpacity>
                )}
              </View>
            ))}
            
            <TouchableOpacity onPress={addDay} style={styles.addDayButton}>
              <Ionicons name="add-circle" size={24} color={primaryColor} />
              <Text style={[styles.addDayText, { color: primaryColor }]}>Add Another Day</Text>
            </TouchableOpacity>

            <TextInput
              style={[styles.input, styles.tipsInput, { borderColor: primaryColor + "40" }]}
              placeholder="Pro Tips *"
              placeholderTextColor="#888"
              value={formData.tips}
              onChangeText={(text) => setFormData({ ...formData, tips: text })}
              multiline
              numberOfLines={3}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton, { backgroundColor: primaryColor }]}
                onPress={savePlan}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal visible={deleteModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.deleteModalContent, { borderColor: primaryColor + "40" }]}>
            <Ionicons name="warning" size={48} color="#ff4444" />
            <Text style={styles.modalTitle}>Delete Plan</Text>
            <Text style={styles.modalText}>
              Are you sure you want to delete "{selectedPlan?.title}"? This action cannot be undone.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setDeleteModalVisible(false)}
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
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 12,
    gap: 10,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 16,
  },
  filterContainer: {
    flexDirection: "row",
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#333",
    marginRight: 8,
  },
  filterText: {
    color: "#888",
    fontSize: 14,
    fontWeight: "500",
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 8,
    flexWrap: "wrap",
  },
  statCard: {
    flex: 1,
    minWidth: (width - 48) / 3,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    backgroundColor: "rgba(15, 23, 42, 0.5)",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: "#39FF14",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: "#888",
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  planCard: {
    backgroundColor: "rgba(15, 23, 42, 0.7)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(57, 255, 20, 0.2)",
  },
  planHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  planTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  planIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  planTitleInfo: {
    flex: 1,
  },
  planTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  planBodyType: {
    fontSize: 12,
    color: "#888",
  },
  bodyTypeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  bodyTypeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  planFocus: {
    fontSize: 14,
    fontWeight: "600",
    color: "#39FF14",
    marginBottom: 8,
  },
  planDescription: {
    fontSize: 14,
    color: "#CCC",
    marginBottom: 12,
    lineHeight: 20,
  },
  planStats: {
    flexDirection: "row",
    marginBottom: 16,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginRight: 16,
  },
  statText: {
    fontSize: 12,
    color: "#888",
  },
  planActions: {
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
    backgroundColor: "rgba(0, 0, 0, 0.95)",
  },
  modalContentContainer: {
    padding: 20,
    minHeight: "100%",
  },
  modalContent: {
    backgroundColor: "#0a0a0a",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    borderWidth: 1,
  },
  deleteModalContent: {
    backgroundColor: "#0a0a0a",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    width: "100%",
    maxWidth: 400,
    borderWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 16,
  },
  modalText: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    color: "#FFFFFF",
    fontSize: 16,
  },
  tipsInput: {
    height: 80,
    textAlignVertical: "top",
  },
  label: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  bodyTypeSelector: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  bodyTypeOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
  },
  bodyTypeOptionText: {
    color: "#888",
    fontSize: 14,
    fontWeight: "600",
  },
  iconSelector: {
    flexDirection: "row",
    marginBottom: 16,
  },
  iconOption: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  dayInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  dayInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    color: "#FFFFFF",
    fontSize: 14,
  },
  removeDayButton: {
    padding: 4,
  },
  addDayButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  addDayText: {
    fontSize: 14,
    fontWeight: "600",
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
    marginTop: 8,
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
});