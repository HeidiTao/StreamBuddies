import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
} from "react-native";

import {
  query,
  collection,
  getDocs,
  setDoc,
  doc,
  Timestamp,
} from "firebase/firestore";

// ⚠️ Adjust this relative path if your config is elsewhere
import { db } from "../../../../config/firebase";

type AddToListButtonProps = {
  itemId: number;                // TMDB id of the movie/show
  style?: any;                   // optional external style for positioning
  label?: string;                // override button label if needed
};

const AddToListButton: React.FC<AddToListButtonProps> = ({
  itemId,
  style,
  label = "Add to Watchlist",
}) => {
  const [showListModal, setShowListModal] = useState(false);
  const [userWatchLists, setUserWatchLists] = useState<any[]>([]);
  const [addListNotes, setAddListNotes] = useState("");

  // Fetch user watchlists when modal opens
  useEffect(() => {
    if (showListModal) {
      const q = query(collection(db, "watchLists"));
      getDocs(q).then((snap) => {
        const lists = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setUserWatchLists(lists);
      });
    }
  }, [showListModal]);

  const handleAddToListConfirm = (listId: string, note: string) => {
    const itemRef = doc(db, `watchLists/${listId}/items/${itemId}`);
    setDoc(itemRef, {
      added_by: 0, // TODO: replace with current user id once auth is wired
      added_at: Timestamp.fromDate(new Date()),
      notes: note,
    });

    setShowListModal(false);
    setAddListNotes("");
  };

  return (
    <>
      {/* Trigger button */}
      <TouchableOpacity
        onPress={() => setShowListModal(true)}
        style={[styles.addToListButton, style]}
      >
        <Text style={styles.addToListText}>{label}</Text>
      </TouchableOpacity>

      {/* Modal */}
      <Modal visible={showListModal} transparent animationType="slide">
        <View style={styles.modalRoot} pointerEvents="box-none">
          <View style={styles.modalContent} pointerEvents="auto">
            <Text style={styles.modalTitle}>Add to Watchlist</Text>

            <TextInput
              style={styles.modalNotes}
              placeholder="notes for adding to list"
              placeholderTextColor="#e0e0ff"
              value={addListNotes}
              onChangeText={setAddListNotes}
            />

            {userWatchLists.map((list) => (
              <TouchableOpacity
                key={list.id}
                onPress={() => handleAddToListConfirm(list.id, addListNotes)}
                style={styles.modalListOptions}
              >
                <Text style={styles.modalListOptionText}>{list.name}</Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              onPress={() => {
                setShowListModal(false);
                setAddListNotes("");
              }}
              style={styles.modalCancelButton}
            >
              <Text style={styles.addToListText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  // Button styling (pulled from your MovieDetailView)
  addToListButton: {
    alignSelf: "center",
    backgroundColor: "#474d9cff",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 6,
  },
  addToListText: {
    color: "#ddd",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.4,
  },

  // Modal styling (based on MovieDetailView)
  modalRoot: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#787dc6f4",
    padding: 30,
    borderRadius: 8,
    minWidth: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    margin: 10,
    color: "#fff",
  },
  modalNotes: {
    backgroundColor: "#9296c9ff",
    padding: 5,
    marginBottom: 15,
    borderRadius: 2,
    color: "#fff",
  },
  modalListOptions: {
    backgroundColor: "#959adbff",
    margin: 3,
    borderRadius: 5,
  },
  modalListOptionText: {
    margin: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    fontSize: 14,
    color: "#000",
  },
  modalCancelButton: {
    marginTop: 15,
    alignItems: "center",
    borderRadius: 8,
    padding: 8,
    backgroundColor: "#9296c9ff",
  },
});

export default AddToListButton;
