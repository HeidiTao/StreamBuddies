import { View, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import React from "react";

type GroupsViewNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Groups'>

const GroupsView: React.FC = () => {

  return (
    <View>
      <Text> Groups View placeholder </Text>
    </View>
  );


};

export default GroupsView;