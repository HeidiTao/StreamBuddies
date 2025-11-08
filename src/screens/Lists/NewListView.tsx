import { ScrollView, View, Text, TextInput, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/types";
import React from "react";

import { useList } from "../../hooks/useList";
import { createSaveHandler } from "../../utils/listFormHelpers";
import { newListStyles } from "../../styles/listStyles";

type NewListViewNavigationProp = NativeStackNavigationProp<RootStackParamList, 'NewList'>

interface Props {
  navigation: NewListViewNavigationProp;
}

const NewListView: React.FC<Props> = ({ navigation }) => {
  const { list, updateList, saveList } = useList(); 

  const handleSave = createSaveHandler(list, saveList, navigation);


  return (
    <ScrollView>
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
    </ScrollView>
  );


};

export default NewListView;