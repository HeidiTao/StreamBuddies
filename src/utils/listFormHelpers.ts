import { Alert, Platform } from "react-native";
import { WatchlistDoc } from "../sample_structs";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";

class ListValidator {
    static isValid(name: string, assignedTo: string): boolean {
        return name.trim().length > 0 && assignedTo.trim().length > 0;
    }
}

export const createSaveHandler = (
    list: WatchlistDoc,
    saveList: () => Promise<void>,
    navigation: NativeStackNavigationProp<RootStackParamList, 'NewList'>
) => {
    return async () => {
        // TODO later: can add validator later (e.g., need to have a list name)
        try {
            await saveList();
            // navigation.navigate('Lists');
            navigation.goBack();
        } catch (err) {
            Alert.alert('Error', 'Failed to save list');
            console.error('Error saving list:', err);
        }
    }
};
