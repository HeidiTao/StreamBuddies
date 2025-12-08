import { LinearGradient } from "expo-linear-gradient";
import React, { ReactNode } from "react";
import { View } from "react-native";
import { colors } from "./styles";

type TopGradientBackgroundProps = {
  children: ReactNode;
};

export const TopGradientBackground = ({ children }: TopGradientBackgroundProps) => {
  return (
    <View style={{ flex: 1 }}>
      {/* Horizontal color gradient at top */}
      <LinearGradient
        colors={['#FF9A9E', '#f3c8d3ff', '#A18CD1', '#c4d1faff', '#c6efdeff']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }} // horizontal
        style={{ position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          height: 200 
        }} // only top part
      />

      {/* Vertical fade overlay */}
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.3)', colors.off_white]} // transparent -> white
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }} // vertical
        style={{ position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          height: 200,
        }}
      />

      <View style={{ flex: 1}}>
        {children}      
      </View>
    </View>
  )
}