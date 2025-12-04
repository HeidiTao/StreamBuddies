import { LinearGradient } from "expo-linear-gradient";
import React, { ReactNode } from "react";
import { View, Dimensions } from "react-native";

type FullGradientBackgroundProps = {
  children: ReactNode;
};

export const FullGradientBackground = ({ children }: FullGradientBackgroundProps) => {
  return (
    <View style={{ flex: 1 }}>
      {/* Horizontal color gradient at top */}
      <LinearGradient
        colors={['#ff9a9d50', '#f3c8d350', '#a18cd150', '#c4d1fa50', '#c6efde50']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }} // horizontal
        style={{ position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          height: Dimensions.get('window').height,
        }} // only top part
      />

      <View style={{ flex: 1}}>
        {children}      
      </View>
    </View>
  )
}