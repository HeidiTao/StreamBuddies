// src/navigation/AppNavigator.tsx
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { View, Text } from "react-native";

import { RootStackParamList } from "./types";
import ExploreView from "../screens/ExploreView";
import MovieDetailView from "../screens/Swipe/MovieDetailView";
import SearchView from "../screens/Search/SearchView";
import ListsView from "../screens/Lists/ListsView";
import ListDetailView from "../screens/Lists/ListDetailView";
import NewListView from "../screens/Lists/NewListView";
import GroupsView from "../screens/Groups/GroupsView";
import ProfileView from "../screens/Profile/ProfileView";
import LogInView from "../screens/Profile/LogInView";
import RegisterView from "../screens/Profile/RegisterView";
import ExploreGridView from "../screens/Swipe/ExploreGridView";
import LikeConfirmationView from "../screens/Swipe/LikeConfirmationView";
import EditProfileScreen from "../screens/Profile/EditProfileScreen";
import WatchStatsScreen from "../screens/Profile/WatchStatsScreen";
import MovieDetailSearchView from "../screens/Search/MovieDetailSearchView";
import ServiceResultsScreen from "../screens/Search/ServiceResultsScreen";
import { WatchStatsProvider } from "../screens/contexts/WatchStatsContext";
import { useAuth } from "../hooks/useAuth";

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
                height: 60,           // 👈 small white strip like in your "Up" mock
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
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ServiceResults"
        component={ServiceResultsScreen}
        options={{ 
          headerShown: false,
          presentation: 'card',
          gestureEnabled: true,
          gestureDirection: 'horizontal',
        }}
      />
      <Stack.Screen
        name="MovieDetailSearch"
        component={MovieDetailSearchView}
        options={{ headerShown: false }}
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
import { useUserProfile } from "../hooks/useUserProfile";
const GroupsStackScreen = () => {
  return (
    <Stack.Navigator>
  <Stack.Screen name="Groups" component={GroupsView} options={{ headerShown: false }} />
  <Stack.Screen name="GroupDetail" component={GroupDetailView} options={{ headerShown: false }} />
  <Stack.Screen name="JoinGroup" component={JoinGroupView} options={{ title: "Join Group" }} />
  <Stack.Screen name="NewGroup" component={NewGroupView} options={{ title: "Create New Group" }} />
    </Stack.Navigator>
  );
};

const ProfileStackScreen = () => {
  const { authUser } = useAuth();
  const { profile } = useUserProfile(authUser?.uid);
  
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {profile ? (<>
        {/* // signed in view: user profile */}
        <Stack.Screen name="Profile" component={ProfileView} options={{ title: "My Account" }} />

        {/* <Stack.Screen 
          name="Profile" 
          component={ProfileView} 
          options={{ headerShown: false }} 
        /> */}
        <Stack.Screen 
          name="EditProfile" 
          component={EditProfileScreen} 
          options={{ title: "Edit Profile" }} 
        />
        <Stack.Screen 
          name="WatchStats" 
          component={WatchStatsScreen} 
          options={{ title: "Watch Statistics" }} 
        />
      </>) : (<>
        {/* // guest view: log in page */}
        <Stack.Screen name="LogIn" component={LogInView} options={{ title: "Sign In", animation: "none" }} />
      
        {/* // authenticated, but hasn't been registered yet */}
        <Stack.Screen name="Register" component={RegisterView} options={{ title: "Sign Up" }} />
      </>)}
    </Stack.Navigator>
  );
};

// MARK: Tabs
const AppNavigator: React.FC = () => {
  return (
    <WatchStatsProvider>
      <NavigationContainer>
        <Tab.Navigator
          initialRouteName="ExploreTab"
          screenOptions={({ route }) => ({
            tabBarShowLabel: false,   // 👈 remove ALL labels

            tabBarIcon: ({ color, size }) => {
              let icon: keyof typeof Ionicons.glyphMap = "ellipse";

              if (route.name === "ExploreTab") icon = "home";          // 👈 changed from "balloon"
              else if (route.name === "SearchTab") icon = "search";
              else if (route.name === "ListsTab") icon = "bookmarks";
              else if (route.name === "GroupsTab") icon = "people-circle";
              else if (route.name === "ProfileTab") icon = "person";

              return <Ionicons name={icon} size={size} color={color} />;
            },

            headerShown: false,
            tabBarActiveTintColor: "black",
            tabBarInactiveTintColor: "gray",
          })}
        >
          <Tab.Screen name="ExploreTab" component={ExploreStackScreen} />
          <Tab.Screen name="SearchTab" component={SearchStackScreen} />
          <Tab.Screen name="ListsTab" component={ListsStackScreen} />
          <Tab.Screen name="GroupsTab" component={GroupsStackScreen} />
          <Tab.Screen name="ProfileTab" component={ProfileStackScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </WatchStatsProvider>
  );
};

export default AppNavigator;
