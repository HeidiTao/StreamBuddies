import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/types";
import React from "react";
import { Timestamp } from "firebase/firestore";

import { WatchlistDoc, WatchlistItemDoc } from "../../sample_structs";
import { useLists } from "../../hooks/useLists";
import ListRowView from "./ListRowView";

type ListsViewNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Lists'>

interface Props {
  navigation: ListsViewNavigationProp;
}

const ListsView: React.FC<Props> = ({ navigation }) => {
  const { lists, listLoading } = useLists();

  const newListPlaceholder : WatchlistDoc = {
    name: 'New List',
    owner_user_id: '0',
    visibility: 'private',
    created_at: Timestamp.fromDate(new Date()),
    updated_at: Timestamp.fromDate(new Date()),
    item_count: 0,
    preview_covers: ['https://static.vecteezy.com/system/resources/thumbnails/000/363/962/small/1_-_1_-_Plus.jpg'],
  }

  return (
    <ScrollView>
      <View>
        <ListRowView 
          key={'new list'}
          list={newListPlaceholder}
          onPress={() => navigation.navigate('NewList')}
        />
      </View>
      <View>
        {lists.map((list) => (
          <ListRowView
            key={list.id}
            list={list}
            onPress={() => navigation.navigate('ListDetail', { list: list })}
          />
          
        ))}
        {/* <Text> Lists View placeholder </Text>
        <Text> {lists[0].name} {lists[0].visibility} </Text> */}
      </View>
    </ScrollView>
  );


};

export default ListsView;

// import React from 'react';
// import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

// const ListsView = () => {
//   const groups = [
//     { name: 'Join Group', color: '#f5d6f7' },
//     { name: 'New Group', color: '#f1e0f8' },
//     { name: 'House Group', color: '#dfd6ff' },
//   ];

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>My Groups</Text>
//       <View style={styles.grid}>
//         {groups.map((group, i) => (
//           <TouchableOpacity key={i} style={[styles.circle, { backgroundColor: group.color }]}>
//             <Text style={styles.groupText}>{group.name}</Text>
//           </TouchableOpacity>
//         ))}
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, paddingTop: 50, backgroundColor: '#fff' },
//   title: { fontSize: 28, fontWeight: '600', marginLeft: 20 },
//   grid: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     justifyContent: 'space-around',
//     marginTop: 40,
//   },
//   circle: {
//     width: 120,
//     height: 120,
//     borderRadius: 60,
//     alignItems: 'center',
//     justifyContent: 'center',
//     margin: 10,
//     shadowColor: '#000',
//     shadowOpacity: 0.1,
//     shadowOffset: { width: 0, height: 2 },
//     shadowRadius: 5,
//   },
//   groupText: {
//     textAlign: 'center',
//     fontWeight: '500',
//     color: '#735a7b',
//   },
// });

// export default ListsView;