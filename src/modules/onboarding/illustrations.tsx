import React from "react";
import { Image, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import colors from "@constants/styles/color";
import { FilmArt } from "@constants/assets";

// The screen seen over rows of seats, one seat picked
export function ScreenOverSeats() {
  return (
    <View style={styles.stage}>
      <View style={styles.screenFrame}>
        <Image source={FilmArt["lautan-pasir"].still} style={styles.still} />
        <LinearGradient
          colors={["transparent", colors.bg]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0.55 }}
          end={{ x: 0, y: 1 }}
        />
      </View>
      <View style={{ gap: 7, marginTop: 20 }}>
        {[7, 8, 9, 10].map((n, r) => (
          <View key={r} style={styles.seatRow}>
            {Array.from({ length: n }, (_, c) => (
              <View key={c} style={[styles.seat, { width: 15 + r * 3, height: 12 + r * 2.5 }, r === 2 && c === 4 && styles.seatPicked]} />
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stage: { height: 300, alignItems: "center", justifyContent: "center" },
  screenFrame: {
    width: 300,
    height: 126,
    borderRadius: 10,
    overflow: "hidden",
    transform: [{ perspective: 600 }, { rotateX: "14deg" }],
    shadowColor: "#F2D9BB",
    shadowOpacity: 0.35,
    shadowRadius: 30,
  },
  still: { width: 300, height: 126 },
  seatRow: { flexDirection: "row", gap: 6, justifyContent: "center" },
  seat: { borderRadius: 4, borderWidth: 1.5, borderColor: colors.seatLine, backgroundColor: colors.seatFill },
  seatPicked: { backgroundColor: colors.accent, borderColor: colors.accent },
});
