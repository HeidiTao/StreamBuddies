import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ScrollView, Text, TextInput, Button, View, TouchableOpacity } from "react-native";
import { useState } from "react";
import CheckBox from 'expo-checkbox';

import { RootStackParamList } from "../../navigation/types";
import { useUserProfile } from "../../hooks/useUserProfile";
import { useAuth } from "../../hooks/useAuth";
import { newProfileStyles } from "../../styles/profileStyles";
import { usePhoneFormatter } from "../../hooks/usePhoneFormatter";
// import { useRegistration } from "../../context/RegistrationContext";
import { FullGradientBackground } from "../../styles/fullGradientBackground";
import { StreamingServiceKey } from "../../sample_structs";
import { formatPhone } from "../../utils/phone";


type RegisterViewNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Register'>

type RegisterViewRouteProp = RouteProp<RootStackParamList, 'Register'>;

interface Props {
  navigation: RegisterViewNavigationProp;
}

const topStreamingServices: { key: StreamingServiceKey; label: string }[] = [
  { key: "netflix", label: "Netflix" },
  { key: "hulu", label: "Hulu" },
  { key: "prime", label: "Prime Video" },
  { key: "disney", label: "Disney+" },
  { key: "max", label: "HBO Max" },
  { key: "apple_tv", label: "Apple TV" },
  { key: "peacock", label: "Peacock" },
  { key: "paramount", label: "Paramount+" },
];

const RegisterView: React.FC<Props> = ({ navigation }) => {
  const route = useRoute<RegisterViewRouteProp>();
  const { authUser, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading, updateUser, createUser } = useUserProfile(authUser?.uid);
  // const { rawNumber, formattedNumber, setPhoneFromInput } = usePhoneFormatter();
  // const { authRawPhone } = useAuth();
  // const { rawNumber, formattedPhone } = useRegistration();
  // const { formattedNumber, setPhoneFromInput } = usePhoneFormatter();
  const [selectedServices, setSelectedServices] = useState<StreamingServiceKey[]>([]);

  const [userName, setUserName] = useState("");
  const [validateUserName, setValidateUserName] = useState(true);

  const toggleService = (service: StreamingServiceKey) => {
    setSelectedServices((prev) =>
      prev.includes(service) ? prev.filter(s => s != service) : [...prev, service]
    )
  }
  const handleCreateAccount = () => {
    if (!userName) {
      setValidateUserName(false);
      return;
    }
    try {
      createUser({
        user_name: userName,
        phone_number: route.params.phone,//rawNumber,//authRawPhone, // route.params.phone,
        streaming_services: selectedServices,
      });
      console.log("Creating user with profile: ", profile);
    } catch (err) {
      console.log(err);
    }
  }

  return (<>
  <ScrollView>
    <FullGradientBackground>
    <View style={newProfileStyles.container}>
    <Text style={newProfileStyles.title}>Create a new account </Text>
    <Text style={newProfileStyles.label}>Username</Text>
    <TextInput
      style={newProfileStyles.shortInput}
      value={userName}
      onChangeText={setUserName}
    />
    <Text style={newProfileStyles.label}> for mobile number   +1 {formatPhone(route.params.phone)}</Text>

    {!validateUserName ? (<>
      <Text style={newProfileStyles.warningText}>Please enter a valid username.</Text>
    </>) : (<></>)}

    {/* <input type="date"></input> */}

    <Text style={newProfileStyles.label}>Streaming service subscriptions</Text>
    <Text>so that we can recommend more suitable movies and shows for you!</Text>
    <View style={newProfileStyles.optionsWrapper}>
      {topStreamingServices.map(service => (
        <View key={service.key} style={newProfileStyles.serviceOption}>
          <CheckBox
            value={selectedServices.includes(service.key)}
            onValueChange={() => toggleService(service.key)}
            style={newProfileStyles.checkBox}
            color={selectedServices.includes(service.key)?'#513afcff' : undefined}
          />
          <Text style={newProfileStyles.checkBoxText}>{service.label}</Text>
        </View>
      ))}
    </View>

    {/* the Create button! */}
    <TouchableOpacity
      style={newProfileStyles.saveButton}
      onPress={() => handleCreateAccount()}
    >
      <Text style={newProfileStyles.saveButtonText}>Create Account</Text>
    </TouchableOpacity>

    </View>
    </FullGradientBackground>
   </ScrollView>
  </>);
}

export default RegisterView; 