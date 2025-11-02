import { View, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import React from "react";

type ListViewNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ListDetail'>

const ListView: React.FC = () => {

  return (
    <View>
      <Text> List Detail View placeholder </Text>
    </View>
  );


};

export default ListView;