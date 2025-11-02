import { View, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import React from "react";

type ProfileViewNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Profile'>

const ProfileView: React.FC = () => {

  return (
    <View>
      <Text> Profile View placeholder </Text>
    </View>
  );


};

export default ProfileView;