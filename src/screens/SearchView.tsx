import { View, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import React from "react";

type SearchViewNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Search'>

const SearchView: React.FC = () => {

  return (
    <View>
      <Text> Search View placeholder </Text>
    </View>
  );


};

export default SearchView;