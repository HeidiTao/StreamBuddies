import { View, Text, Image, Touchable, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/types";
import React from "react";

import { useAuth } from "../../hooks/useAuth";
import { useUserProfile } from "../../hooks/useUserProfile";
import { signOut } from "firebase/auth";
import { auth } from "../../../config/firebase";
import { usePhoneFormatter } from "../../hooks/usePhoneFormatter";
import { formatPhone } from "../../utils/phone";
import { profileStyles } from "../../styles/profileStyles";


type ProfileViewNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Profile'>

interface Props {
  navigation: ProfileViewNavigationProp;
}

const ProfileView: React.FC<Props> = ({ navigation }) => {
  const { authUser } = useAuth();
  const { profile, setProfile } = useUserProfile(authUser?.uid);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setProfile(null);
      // navigation.reset({
      //   index: 0,
      //   routes: [{ name: "LogIn" }],
      // });
      console.log("User signed out");
    } catch(err) {
      console.log("Logout error:", err);
    }
  }

  return (
    <View style={profileStyles.container}>
      {/* Profile info */}
      <View style={profileStyles.topSectionContainer}>
      <Image
        source={
          profile?.profile_pic
            ? { uri: profile.profile_pic }
            : require("../../../assets/default_profile.png")
        }
        style={profileStyles.profilePic}
      />
      {/* <Image source={{uri: profile?.profile_pic}}/> */}
      <View style={profileStyles.basicInfoContainer}>
        <Text style={profileStyles.title}>{`@${profile?.user_name}`}</Text>
        <Text style={profileStyles.contentText}>{`+1 ${formatPhone(profile?.phone_number ?? '10000000000')}`}</Text>
      </View>
      </View>


      <TouchableOpacity
        onPress={() => handleLogout()}
        style={profileStyles.logOutButton}
      >
        <Text style={profileStyles.logOutButtonText}>Log Out</Text>
      </TouchableOpacity>


      {/* According to: https://developer.themoviedb.org/docs/faq 
      You shall use the TMDB logo to identify your use of the TMDB APIs. You shall 
      place the following notice prominently on your application: "This product uses 
      the TMDB API but is not endorsed or certified by TMDB."*/}
      
      <Image
        source={require('../../../assets/tmdb_logo.png')}
        style={profileStyles.tmdbLogo}
      />
      <Text style={profileStyles.acknowledgement}> 
        This product uses the TMDB API but is not endorsed or certified by TMDB. 
      </Text>
    </View>
  );


};

export default ProfileView;