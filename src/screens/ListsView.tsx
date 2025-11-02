import { View, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import React from "react";

type ListsViewNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Lists'>

const ListsView: React.FC = () => {

  return (
    <View>
      <Text> Lists View placeholder </Text>
    </View>
  );


};

export default ListsView;