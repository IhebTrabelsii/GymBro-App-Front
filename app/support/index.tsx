import { Feather, FontAwesome, MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

/**
 * Represents the valid FontAwesome icon names that can be used within the application.
 * 
 * @remarks
 * This type restricts icon names to a specific set of FontAwesome icons
 * to ensure type safety and consistency across the codebase.
 * 
 * @example
 * ```tsx
 * const iconName: FontAwesomeIconName = "rocket";
 * ```
 */
type FontAwesomeIconName =
  | "rocket"
  | "user"
  | "wrench"
  | "credit-card"
  | "question-circle"
  | "headphones";

interface HelpTopic {
  id: number;
  title: string;
  icon: FontAwesomeIconName;
  description: string;
}

const SupportScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const helpTopics: HelpTopic[] = [
    {
      id: 1,
      title: 'Getting Started',
      icon: 'rocket',
      description: 'New to our app? Learn the basics',
    },
    {
      id: 2,
      title: 'Account Settings',
      icon: 'user',
      description: 'Manage your profile and preferences',
    },
    {
      id: 3,
      title: 'Troubleshooting',
      icon: 'wrench',
      description: 'Fix common issues and errors',
    },
    {
      id: 4,
      title: 'Billing & Payments',
      icon: 'credit-card',
      description: 'Payment methods and subscriptions',
    },
    {
      id: 5,
      title: 'FAQs',
      icon: 'question-circle',
      description: 'Frequently asked questions',
    },
    {
      id: 6,
      title: 'Contact Us',
      icon: 'headphones',
      description: 'Reach our support team directly',
    },
  ];

  const handleContact = (method: 'email' | 'phone' | 'chat') => {
    switch(method) {
      case 'email':
        Linking.openURL('mailto:support@yourcompany.com');
        break;
      case 'phone':
        Linking.openURL('tel:+18005551234');
        break;
      case 'chat':
        // Implement your chat functionality here
        alert('Chat support would open here');
        break;
    }
  };

  function alert(arg0: string) {
    throw new Error('Function not implemented.');
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.header}>How can we help?</Text>
      
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Feather name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search help articles..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
      </View>

      {/* Help Topics Grid */}
      <View style={styles.gridContainer}>
        {helpTopics.map((topic) => (
          <TouchableOpacity 
            key={topic.id} 
            style={styles.topicCard}
            onPress={() => {
              if (topic.title === 'Contact Us') {
                handleContact('chat');
              } else {
                // Navigate to appropriate help section
                alert(`Would navigate to ${topic.title} section`);
              }
            }}
          >
            <FontAwesome name={FontAwesome.hasOwnProperty(topic.icon) ? topic.icon : "question-circle"} size={24} color="#4a90e2" />
            <Text style={styles.topicTitle}>{topic.title}</Text>
            <Text style={styles.topicDescription}>{topic.description}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Contact Options */}
      <View style={styles.contactContainer}>
        <Text style={styles.sectionTitle}>Still need help?</Text>
        <Text style={styles.sectionSubtitle}>Our team is available to assist you</Text>
        
        <TouchableOpacity 
          style={styles.contactOption} 
          onPress={() => handleContact('email')}
        >
          <MaterialIcons name="email" size={24} color="#4a90e2" />
          <View style={styles.contactText}>
            <Text style={styles.contactMethod}>Email Support</Text>
            <Text style={styles.contactDetail}>support@yourcompany.com</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.contactOption} 
          onPress={() => handleContact('phone')}
        >
          <MaterialIcons name="phone" size={24} color="#4a90e2" />
          <View style={styles.contactText}>
            <Text style={styles.contactMethod}>Call Us</Text>
            <Text style={styles.contactDetail}>+1 (800) 555-1234</Text>
          </View>
        </TouchableOpacity>

        <Text style={styles.hoursText}>Available Monday-Friday, 9am-5pm EST</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    padding: 16,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#333',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#333',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  topicCard: {
    width: '48%',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  topicTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
    color: '#333',
  },
  topicDescription: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
  },
  contactContainer: {
    backgroundColor: '#f5f9ff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  contactOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  contactText: {
    marginLeft: 16,
  },
  contactMethod: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  contactDetail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  hoursText: {
    fontSize: 12,
    color: '#999',
    marginTop: 12,
    textAlign: 'center',
  },
});

export default SupportScreen;

function alert(arg0: string) {
  throw new Error('Function not implemented.');
}
