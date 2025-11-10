import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';

type JoinGroupNavigationProp = NativeStackNavigationProp<RootStackParamList, 'JoinGroup'>;

interface Props {
  navigation: JoinGroupNavigationProp;
}

const mockMembers = [
  { id: 'A', name: 'jo_vanni67' },
  { id: 'B', name: 'neptunelunal' },
  { id: 'C', name: 'arini_yayy' },
  { id: 'D', name: 'anui_cats' },
  { id: 'E', name: 'bobbi_buggy' },
  { id: 'F', name: 'ella_sarr' },
];

export default function JoinGroupView({ navigation }: Props) {
  const [code, setCode] = useState('');
  const [opt1, setOpt1] = useState(false);
  const [opt2, setOpt2] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const handleEnterCode = () => {
    if (code.trim() !== '') {
      setShowDetails(true);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.headerGradient}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={20} color="#6e7bb7" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Join group</Text>
        </View>
      </View>

      <View style={styles.inner}>
        <TextInput
          value={code}
          onChangeText={(text) => {
            setCode(text);
            setShowDetails(false); // Hide details when code changes
          }}
          placeholder="Enter invitation code"
          placeholderTextColor="#cfcfd6"
          style={styles.codeInput}
        />
        
        <TouchableOpacity 
          style={[styles.enterBtn, !code.trim() && styles.enterBtnDisabled]} 
          onPress={handleEnterCode}
          disabled={!code.trim()}
        >
          <Text style={[styles.enterBtnText, !code.trim() && styles.enterBtnTextDisabled]}>Enter</Text>
        </TouchableOpacity>

        {showDetails && (
          <>
            <View style={{ marginTop: 12 }}>
              <Text style={{ color: '#444', marginBottom: 6 }}>Riya invited you to the group <Text style={{ fontWeight: '700' }}>Besties!</Text></Text>
              <Text style={{ color: '#ff89b8', marginTop: 6, marginBottom: 2 }}>Description</Text>
              <Text style={{ color: '#c66', marginBottom: 8 }}>Coolest group for the coolest people ;)</Text>
            </View>

            <View style={{ marginTop: 8 }}>
              <Text style={{ fontWeight: '600', marginBottom: 8 }}>Members</Text>
              <View style={styles.membersRow}>
                {mockMembers.map((m) => (
                  <View key={m.id} style={styles.memberBlock}>
                    <View style={styles.memberCircle}>
                      <Text style={styles.memberInitial}>{m.id}</Text>
                    </View>
                    <Text style={styles.memberName}>{m.name}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={{ marginTop: 14 }}>
              <Text style={{ fontWeight: '600', marginBottom: 6 }}>Options</Text>
              <TouchableOpacity style={styles.optionRow} onPress={() => setOpt1(!opt1)}>
                <View style={[styles.checkbox, opt1 ? styles.checkboxOn : null]} />
                <Text style={{ marginLeft: 12 }}>Share subscription info with group</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.optionRow} onPress={() => setOpt2(!opt2)}>
                <View style={[styles.checkbox, opt2 ? styles.checkboxOn : null]} />
                <Text style={{ marginLeft: 12 }}>Share subscription info with group</Text>
              </TouchableOpacity>
            </View>

            <View style={{ alignItems: 'flex-end', marginTop: 18 }}>
              <TouchableOpacity style={styles.joinBtn}>
                <Text style={{ color: '#2b8b5a', fontWeight: '600' }}>Join →</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  headerGradient: { backgroundColor: '#f7f4ff', paddingTop: 18, paddingBottom: 12, paddingHorizontal: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  backBtn: { backgroundColor: '#e3f6ff', borderRadius: 10, padding: 6, marginRight: 8 },
  headerTitle: { fontSize: 26, fontWeight: '600' },
  inner: { padding: 18 },
  codeInput: { borderWidth: 1, borderColor: '#eee', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#fafafa' },
  membersRow: { flexDirection: 'row', flexWrap: 'wrap' },
  memberBlock: { width: 64, alignItems: 'center', marginRight: 10, marginBottom: 12 },
  memberCircle: { width: 54, height: 54, borderRadius: 27, backgroundColor: '#f5d6f7', alignItems: 'center', justifyContent: 'center' },
  memberInitial: { fontSize: 24, fontWeight: '600', color: '#bcbcff' },
  memberName: { fontSize: 11, color: '#aaa', marginTop: 6, textAlign: 'center' },
  optionRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  checkbox: { width: 18, height: 18, borderRadius: 4, borderWidth: 1, borderColor: '#ddd', backgroundColor: '#fff' },
  checkboxOn: { backgroundColor: '#eae6ff', borderColor: '#bcbcff' },
  enterBtn: { 
    backgroundColor: '#e3f6ff', 
    paddingHorizontal: 18, 
    paddingVertical: 10, 
    borderRadius: 8, 
    borderWidth: 1, 
    borderColor: '#e3f6ea',
    alignSelf: 'flex-end',
    marginTop: 12,
    marginBottom: 12
  },
  enterBtnDisabled: {
    backgroundColor: '#f5f5f5',
    borderColor: '#eee'
  },
  enterBtnText: {
    color: '#6e7bb7',
    fontWeight: '600'
  },
  enterBtnTextDisabled: {
    color: '#aaa'
  },
  joinBtn: { backgroundColor: '#e6fff0', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#e6f6ea' },
});
