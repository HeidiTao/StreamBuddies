import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const EditProfileScreen = () => {
  const [email, setEmail] = useState('abc@gmail.com');
  const [phone, setPhone] = useState('123-456-7890');
  const [services, setServices] = useState(['Netflix', 'Hulu']);

  const availableServices = [
    'Netflix',
    'Hulu',
    'Disney+',
    'HBO Max',
    'Prime Video',
    'Apple TV+',
    'Paramount+',
    'Peacock',
  ];

  const toggleService = (service: string) => {
    if (services.includes(service)) {
      setServices(services.filter((s) => s !== service));
    } else {
      setServices([...services, service]);
    }
  };

  return (
    <ScrollView style={styles.container}>

      {/* Gradient Header */}
      <LinearGradient
        colors={['#E8D5F0', '#D5E8F8']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <Text style={styles.headerTitle}>Profile Page</Text>
      </LinearGradient>

      {/* User Info */}
      <View style={styles.userSection}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={40} color="#999" />
          </View>
        </View>

        <Text style={styles.userName}>Isabelle Aris</Text>

        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="ellipsis-horizontal" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Email Field */}
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>Email</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TouchableOpacity style={styles.editIcon}>
            <Ionicons name="create-outline" size={20} color="#007AFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Phone Field */}
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>Phone number</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
          <TouchableOpacity style={styles.editIcon}>
            <Ionicons name="create-outline" size={20} color="#007AFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Services Section */}
      <View style={styles.servicesSection}>
        <View style={styles.serviceHeader}>
          <Text style={styles.servicesTitle}>Your Services</Text>
          <TouchableOpacity style={styles.addButton}>
            <Ionicons name="add-circle-outline" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.servicesGrid}>
          {availableServices.map((service) => (
            <TouchableOpacity
              key={service}
              style={[
                styles.serviceTag,
                services.includes(service) && styles.serviceTagActive,
              ]}
              onPress={() => toggleService(service)}
            >
              <Text
                style={[
                  styles.serviceTagText,
                  services.includes(service) && styles.serviceTagTextActive,
                ]}
              >
                {service}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  /* NEW Gradient Header */
  headerGradient: {
    paddingVertical: 50,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 22,
    paddingTop: 10,
    fontWeight: '700',
    textAlign: 'center',
    color: '#000',
  },

  userSection: {
    alignItems: 'center',
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    position: 'relative',
  },
  avatarContainer: {
    marginBottom: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
  },
  menuButton: {
    position: 'absolute',
    right: 16,
    top: 24,
  },

  fieldContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  fieldLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    paddingVertical: 4,
  },
  editIcon: {
    padding: 4,
  },

  servicesSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  servicesTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  addButton: {
    padding: 4,
  },

  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  serviceTag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
    marginBottom: 8,
  },
  serviceTagActive: {
    backgroundColor: '#D4E4FF',
  },
  serviceTagText: {
    fontSize: 14,
    color: '#666',
  },
  serviceTagTextActive: {
    color: '#007AFF',
    fontWeight: '500',
  },
});

export default EditProfileScreen;
