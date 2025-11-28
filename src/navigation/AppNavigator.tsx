// src/navigation/AppNavigator.tsx
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { View, Text } from "react-native";  // 👈 add this

import { RootStackParamList } from "./types";
import ExploreView from "../screens/ExploreView";
import MovieDetailView from "../screens/Swipe/MovieDetailView";
import SearchView from "../screens/SearchView";
import ListsView from "../screens/Lists/ListsView";
import ListDetailView from "../screens/Lists/ListDetailView";
import NewListView from "../screens/Lists/NewListView";
import GroupsView from "../screens/Groups/GroupsView";
import ProfileView from "../screens/ProfileView";
import ExploreGridView from "../screens/Swipe/ExploreGridView";
import LikeConfirmationView from "../screens/Swipe/LikeConfirmationView";

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

// MARK: Stacks+Screens
const ExploreStackScreen = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
              name="Explore"
        component={ExploreView}
        options={{
          // no title text at all
          headerTitle: () => null,

          // default header background (still white)
          headerStyle: { backgroundColor: "#ffffff" },
          headerShadowVisible: false,

          // custom tiny header: just a white spacer bar of height 8
          header: () => (
            <View
              style={{
                height: 60,           
                backgroundColor: "#ffffff",
              }}
            />
          ),
        }}
      />
      <Stack.Screen
        name="Trending"                 
        component={ExploreGridView}     
        options={{
          // no title text at all
          headerTitle: () => null,

          // default header background (still white)
          headerStyle: { backgroundColor: "#ffffff" },
          headerShadowVisible: false,

          // custom tiny header: just a white spacer bar of height 8
          header: () => (
            <View
              style={{
                height: 60,           // 👈 small white strip like in your “Up” mock
                backgroundColor: "#ffffff",
              }}
            />
          ),
        }}
      />
      <Stack.Screen
        name="MovieDetail"
        component={MovieDetailView}
        options={{ title: "Details" }}
      />
      <Stack.Screen
        name="LikeConfirmation"
        component={LikeConfirmationView}
      />
    </Stack.Navigator>
  );
};

const SearchStackScreen = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Search"
        component={SearchView}
        options={{ title: "What do you want to watch?" }}
      />
    </Stack.Navigator>
  );
};

const ListsStackScreen = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Lists" component={ListsView} options={{ title: "My Lists" }} />
      <Stack.Screen name="ListDetail" component={ListDetailView} options={{ title: "List Detail" }} />
      <Stack.Screen name="NewList" component={NewListView} options={{ title: "New List" }} />
    </Stack.Navigator>
  );
};

import GroupDetailView from "../screens/Groups/GroupDetailView";
import NewGroupView from "../screens/Groups/NewGroupView";
import JoinGroupView from "../screens/Groups/JoinGroupView";
const GroupsStackScreen = () => {
  return (
    <Stack.Navigator>
  <Stack.Screen name="Groups" component={GroupsView} options={{ title: "My Groups" }} />
  <Stack.Screen name="GroupDetail" component={GroupDetailView} options={{ title: "Group Details" }} />
  <Stack.Screen name="JoinGroup" component={JoinGroupView} options={{ title: "Join Group" }} />
  <Stack.Screen name="NewGroup" component={NewGroupView} options={{ title: "Create New Group" }} />
    </Stack.Navigator>
  );
};

const ProfileStackScreen = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Profile" component={ProfileView} options={{ title: "My Profile" }} />
    </Stack.Navigator>
  );
};

// MARK: Tabs
const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName="ExploreTab"
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap = "ellipse";
            if (route.name === "ExploreTab") iconName = "balloon";
            else if (route.name === "SearchTab") iconName = "search";
            else if (route.name === "ListsTab") iconName = "bookmarks";
            else if (route.name === "GroupsTab") iconName = "people-circle";
            else if (route.name === "ProfileTab") iconName = "person";
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          headerShown: false,
          tabBarActiveTintColor: "black",
          tabBarInactiveTintColor: "gray",
        })}
      >
        <Tab.Screen name="ExploreTab" component={ExploreStackScreen} options={{ title: "Explore" }} />
        <Tab.Screen name="SearchTab" component={SearchStackScreen} options={{ title: "Search" }} />
        <Tab.Screen name="ListsTab" component={ListsStackScreen} options={{ title: "Lists" }} />
        <Tab.Screen name="GroupsTab" component={GroupsStackScreen} options={{ title: "Groups" }} />
        <Tab.Screen name="ProfileTab" component={ProfileStackScreen} options={{ title: "Profile" }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
