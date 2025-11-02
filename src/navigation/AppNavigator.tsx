import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon from 'react-native-vector-icons/Ionicons';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

import { RootStackParamList } from "./types";
import ExploreView from "../screens/ExploreView";
import SearchView from "../screens/SearchView";
import ListsView from "../screens/ListsView";
import ListView from "../screens/ListView";
import GroupsView from "../screens/GroupsView";
import ProfileView from "../screens/ProfileView";

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
          title: 'Popular this week!'
        }}
      />
    </Stack.Navigator>
  )
}

const SearchStackScreen = () => {
  return ( 
    <Stack.Navigator>
      <Stack.Screen
        name="Search"
        component={SearchView}
        options={{
          title: 'What do you want to watch?'
        }}
      />
    </Stack.Navigator>
  )
}

const ListsStackScreen = () => {
  return ( 
    <Stack.Navigator>
      <Stack.Screen
        name="Lists"
        component={ListsView}
        options={{
          title: 'My Lists'
        }}
      />
      <Stack.Screen
        name="ListDetail"
        component={ListView}
        options={{
          title: 'List Detail'
        }}
      />
    </Stack.Navigator>
  )
}

const GroupsStackScreen = () => {
  return ( 
    <Stack.Navigator>
      <Stack.Screen
        name="Groups"
        component={GroupsView}
        options={{
          title: 'My Groups'
        }}
      />
    </Stack.Navigator>
  )
}

const ProfileStackScreen = () => {
  return ( 
    <Stack.Navigator>
      <Stack.Screen
        name="Profile"
        component={ProfileView}
        options={{
          title: 'My Profile'
        }}
      />
    </Stack.Navigator>
  )
}

// MARK: Tabs
const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName="ExploreTab"
        screenOptions= {({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName;
            if (route.name === 'ExploreTab') {
              iconName = 'balloon';
            } else if (route.name === 'SearchTab') {
              iconName = 'search';
            } else if (route.name === 'ListsTab') {
              iconName = 'bookmarks';
            } else if (route.name === 'GroupsTab') {
              iconName = 'people-circle';
            } else if (route.name === 'ProfileTab') {
              iconName = 'person';
            }
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          headerShown: false,
          tabBarActiveTintColor: 'black',
          tabBarInactiveTintColor: 'gray',
        })}>
          <Tab.Screen name='ExploreTab' component={ExploreStackScreen} />
          <Tab.Screen name='SearchTab' component={SearchStackScreen}/>
          <Tab.Screen name='ListsTab' component={ListsStackScreen} />
          <Tab.Screen name='GroupsTab' component={GroupsStackScreen} />
          <Tab.Screen name='ProfileTab' component={ProfileStackScreen} />
        </Tab.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;