import { ScrollView, View, Text, TextInput, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/types";
import React from "react";

import { useList } from "../../hooks/useList";
import { createSaveHandler } from "../../utils/listFormHelpers";
import { newListStyles } from "../../styles/listStyles";
import { useAuth } from "../../hooks/useAuth";
import { TopGradientBackground } from "../../styles/topGradientBackground";

type NewListViewNavigationProp = NativeStackNavigationProp<RootStackParamList, 'NewList'>

interface Props {
  navigation: NewListViewNavigationProp;
}

const NewListView: React.FC<Props> = ({ navigation }) => {
  const { authUser } = useAuth();
  console.log("NewListView authUser:", authUser?.uid); // Add this debug line
  const { list, updateList, saveList } = useList(authUser?.uid || '0'); 
  console.log("NewListView list owner_user_id:", list.owner_user_id); // And this one


  const handleSave = createSaveHandler(list, saveList, navigation);

  return (
    <ScrollView style={{backgroundColor: 'rgba(255, 248, 251, 1)'}}>
      <TopGradientBackground>
      <View style={newListStyles.container}>
        <Text style={newListStyles.title}>Create new list </Text>
        <Text style={newListStyles.label}>List name</Text>
        <TextInput
          style={newListStyles.shortInput}
          value={list.name}
          onChangeText={(text) => updateList({ name: text})}
        />

        <Text style={newListStyles.label}>Description</Text>
        <TextInput
          style={newListStyles.longInput}
          value={list.description}
          onChangeText={(text) => updateList({ description: text})}
          multiline={true}
        />

        {/* private/shared toggle */}
        {/* group selection */}
        {/* save button */}

        <TouchableOpacity
          onPress={handleSave}
          style={newListStyles.saveButton}
        >
          <Text style={newListStyles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>
      </TopGradientBackground>
    </ScrollView>
  );


};

export default NewListView;