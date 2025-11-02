import { View, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import React from "react";

type ExploreViewNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Explore'>

const ExploreView: React.FC = () => {

  return (
    <View>
      <Text> Explore View placeholder </Text>
    </View>
  );


};

export default ExploreView;