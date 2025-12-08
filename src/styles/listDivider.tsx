import React from "react";
import { LinearGradient } from "expo-linear-gradient";
import { listStyles } from "./listStyles";

export const ListDivider = () => {

    return (
        <LinearGradient
            colors={['#d0ecd600', '#d0ecd68d', '#d0ecd6ff', '#d0ecd68d', '#d0ecd60d']} // fade on edges
            locations={[0.0, 0.15, 0.5, 0.85, 1]} 
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={listStyles.listDivider}
        />
    );
};

