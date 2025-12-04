import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { FirebaseRecaptchaVerifierModal } from "expo-firebase-recaptcha";
import { signInWithPhoneNumber } from "firebase/auth";
import { Text, View, TextInput, Button, TouchableWithoutFeedback, Keyboard, TouchableOpacity } from "react-native";
import { db, auth } from "../../../config/firebase";
import { useState, useRef, useEffect } from "react";
// import { doc, getDoc } from "firebase/firestore";
import type { ApplicationVerifier, ConfirmationResult } from "firebase/auth";
import { RootStackParamList } from "../../navigation/types";
import { useAuth } from "../../hooks/useAuth";
import { useUserProfile } from "../../hooks/useUserProfile";
import { usePhoneFormatter } from "../../hooks/usePhoneFormatter";
import { logInStyles } from "../../styles/profileStyles";

type LogInViewNavigationProp = NativeStackNavigationProp<RootStackParamList, 'LogIn'>

type LogInViewRouteProp = RouteProp<RootStackParamList, 'LogIn'>;

interface Props {
  navigation: LogInViewNavigationProp;
}

const LogInView: React.FC<Props> = ({ navigation }) => {
  // const route = useRoute<LogInViewRouteProp>();
  // const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [confirmation, setConfirmation] = useState<ConfirmationResult|null>(null);
  const { authUser, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useUserProfile(authUser?.uid);
  const [profileInitialized, setProfileInitialized] = useState(false);
  const { rawNumber, formattedNumber, setPhoneFromInput } = usePhoneFormatter();

  const recaptchaVerifier = useRef<FirebaseRecaptchaVerifierModal | null>(null);

  const sendCode = async () => {
    try {
      console.log("phone: ", rawNumber);
      const confirmationResult = await signInWithPhoneNumber(
        auth, rawNumber, 
        recaptchaVerifier.current! as unknown as ApplicationVerifier
        // undefined//recaptchaVerifier.current??undefined
      );
      console.log("confirmationResult: ", confirmationResult);
      setConfirmation(confirmationResult);
    } catch (err) {
      console.log(err);
    }
  }

  const confirmCode = async () => {
    if (!confirmation) {
      console.warn("Tried to confirm code before starting sign-in process.")
      return;
    }

    try {
      console.log("Confirming...... number", rawNumber, " code=", code);
      await confirmation.confirm(code);
        // .confirm is internally connected 
      // console.log("confirmed");
      
      console.log("(confirmed) profileLoading-", profileLoading);
    } catch (err) {
      console.log(err);
    }
  };

  const returnFromCode = async () => {
    setConfirmation(null);
  }

  useEffect(() => {
    console.log("🍼AuthUser:", authUser);
    console.log("🍼Profile:", profile);
    
    console.log("profileLoading-", profileLoading);
    if (!authUser) return; 
    if (!profileInitialized && authUser?.uid) {
      // we know the hook has now started fetching for this uid
      console.log("initialize profile uhh");
      setProfileInitialized(true);
    }

    if (!profileInitialized || profileLoading) return; // wait

    if (!profile) {
      console.log("profile is null, naving to register");
      navigation.navigate("Register", {phone: rawNumber});
    } //else {
    //   console.log("yes profile");
    //   navigation.navigate("Profile");
    // }
  }, [authUser, profile, profileLoading])//[authUser, profile])

  return (<TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
    <View style={logInStyles.container}>
      <FirebaseRecaptchaVerifierModal
        ref={recaptchaVerifier}
        firebaseConfig={auth.app.options}
      />
      
      {!confirmation ? (<>
        <Text style={logInStyles.instructionText}>Sign up or log in: </Text>
        
        <TextInput
          value={`+1   ${formattedNumber}`}//{phone}
          // placeholder="(234) 567-8900"
          onChangeText={setPhoneFromInput}//{setPhone}
          keyboardType="phone-pad"
          style={logInStyles.inputBlock}
        />
        {/* <Text>{rawNumber}</Text> */} {/* just for testing purposes */}
        <TouchableOpacity
          style={logInStyles.button}
          // title="Send Code"
          onPress={() => sendCode()}
        >
          <Text style={logInStyles.buttonText}>Send Code</Text>
        </TouchableOpacity>

      </>) : (<>
        <TouchableOpacity
          style={logInStyles.backButton}
          onPress={() => returnFromCode()}
        >
          <Text>Back</Text>
        </TouchableOpacity>
        {/* {confirmation ? (<> */}
        <Text style={logInStyles.instructionText}>Enter the 6 digit verification code:</Text>
        <TextInput
          value={code}
          placeholder=""
          placeholderTextColor="#d5d5d6ff"
          onChangeText={setCode}
          keyboardType="phone-pad"
          // editable={!!confirmation}
          style={logInStyles.inputBlock}  
        />
        <TouchableOpacity
          style={logInStyles.button}//{confirmation? logInStyles.button : logInStyles.disabledButton}
          // title="Next >"
          // disabled={!confirmation}
          onPress={() => confirmCode()}
        >
          <Text style={logInStyles.buttonText}>Verify</Text>
        </TouchableOpacity></>
      )}
    </View></TouchableWithoutFeedback>
  );

  // return (
  //   <>
  //   <Text>hi</Text></>
  // );
}

export default LogInView;