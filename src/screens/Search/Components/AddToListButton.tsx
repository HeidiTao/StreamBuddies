// src/screens/Swipe/Components/AddToListButton.tsx
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
  where,
} from "firebase/firestore";

import { db } from "../../../../config/firebase";
import { useAuth } from "../../../hooks/useAuth";
import { useNavigation } from "@react-navigation/native";

type AddToListButtonProps = {
  itemId: number;
  style?: any;
  label?: string;
};

const AddToListButton: React.FC<AddToListButtonProps> = ({
  itemId,
  style,
  label = "Add to Watchlist",
}) => {
  const { authUser } = useAuth();
  const navigation = useNavigation<any>();

  const [showListModal, setShowListModal] = useState(false);
  const [userWatchLists, setUserWatchLists] = useState<any[]>([]);
  const [addListNotes, setAddListNotes] = useState("");

  // Fetch user watchlists when modal opens
  useEffect(() => {
    if (showListModal) {
      const q = query(
        collection(db, "watchLists"),
        where("owner_user_id", "==", authUser?.uid)
      );

      getDocs(q).then((snap) => {
        const lists = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter(
            (list) =>
              typeof list.name === "string" &&
              list.name.trim().length > 0
          )
          .sort((a, b) =>
            a.name.toLowerCase().localeCompare(b.name.toLowerCase())
          );

        setUserWatchLists(lists);
      });
    }
  }, [showListModal]);

  const handleAddToListConfirm = (listId: string, note: string) => {
    const itemRef = doc(db, `watchLists/${listId}/items/${itemId}`);

    setDoc(itemRef, {
      added_by: authUser?.uid || "unknown",
      added_at: Timestamp.fromDate(new Date()),
      notes: note,
    });

    setShowListModal(false);
    setAddListNotes("");
  };

  return (
    <>
      {/* Trigger Button */}
      <TouchableOpacity
        onPress={() => setShowListModal(true)}
        style={[styles.addToListButton, style]}
      >
        <Text style={styles.addToListText}>{label}</Text>
      </TouchableOpacity>

      {/* Modal */}
      <Modal visible={showListModal} transparent={false} animationType="slide">
        <View style={styles.modalRoot}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add to Watchlist</Text>

            {/* TEXT INPUT FOR NOTES */}
            {userWatchLists.length > 0 && (
              <TextInput
                style={styles.modalNotes}
                placeholder="notes for adding to list"
                placeholderTextColor="#999999"
                value={addListNotes}
                onChangeText={setAddListNotes}
              />
            )}

            {/* CASE: NO WATCHLISTS CREATED */}
            {userWatchLists.length === 0 ? (
              <>
                <Text style={styles.noListsText}>
                  You don’t have any watchlists yet.
                </Text>

                <TouchableOpacity
                  style={styles.goToListsButton}
                  onPress={() => {
                    setShowListModal(false);
                    setAddListNotes("");
                    setTimeout(() => {
                      (navigation as any).navigate('ListsTab');
                    });
                  }}
                >
                  <Text style={styles.goToListsButtonText}>Go to Lists</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                {/* CASE: WATCHLISTS EXIST */}
                {userWatchLists.map((list) => (
                  <TouchableOpacity
                    key={list.id}
                    onPress={() => handleAddToListConfirm(list.id, addListNotes)}
                    style={styles.modalListOptions}
                  >
                    <Text style={styles.modalListOptionText}>{list.name}</Text>
                  </TouchableOpacity>
                ))}
              </>
            )}

            {/* CANCEL BUTTON */}
            <TouchableOpacity
              onPress={() => {
                setShowListModal(false);
                setAddListNotes("");
              }}
              style={styles.modalCancelButton}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  addToListButton: {
    alignSelf: "center",
    backgroundColor: "#eac4d5",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addToListText: {
    color: "#000",
    fontSize: 14,
    fontWeight: "700",
  },

  modalRoot: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    padding: 30,
    borderRadius: 12,
    minWidth: "80%",
    elevation: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
    color: "#000",
    textAlign: "center",
  },
  modalNotes: {
    backgroundColor: "#f2f2f2",
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 16,
    borderRadius: 6,
    color: "#000",
    fontSize: 14,
  },
  modalListOptions: {
    backgroundColor: "#809BCE",
    marginVertical: 4,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  modalListOptionText: {
    fontSize: 14,
    color: "#000",
    textAlign: "center",
    fontWeight: "600",
  },

  noListsText: {
    fontSize: 16,
    color: "#000",
    textAlign: "center",
    marginBottom: 20,
    fontWeight: "600",
  },

  goToListsButton: {
    backgroundColor: "#C8BEF0",
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 10,
  },

  goToListsButtonText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },

  modalCancelButton: {
    marginTop: 20,
    alignItems: "center",
    borderRadius: 8,
    paddingVertical: 10,
    backgroundColor: "#ffb3b3",
  },
  modalCancelText: {
    color: "#000000",
    fontWeight: "700",
    fontSize: 14,
  },
});

export default AddToListButton;
