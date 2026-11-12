import React from "react";
import { Image, StyleSheet, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { LinearGradient } from "expo-linear-gradient";
import colors from "@constants/styles/color";
import { FilmArt } from "@constants/assets";
import Text from "@components/text";

// Slide 1: a fan of posters
export function PosterFan() {
  const ids = ["gema-malam", "lautan-pasir", "arus-biru"];
  return (
    <View style={styles.stage}>
      {ids.map((id, i) => (
        <Image
          key={id}
          source={FilmArt[id].poster}
          style={[
            styles.poster,
            {
              transform: [{ translateX: (i - 1) * 78 }, { translateY: i === 1 ? -14 : 8 }, { rotate: `${(i - 1) * 9}deg` }],
              zIndex: i === 1 ? 2 : 1,
            },
          ]}
        />
      ))}
    </View>
  );
}

// Slide 2: the screen seen over rows of seats, one seat lit
export function ScreenOverSeats() {
  return (
    <View style={styles.stage}>
      <View style={styles.screenFrame}>
        <Image source={FilmArt["lautan-pasir"].still} style={styles.still} />
        <LinearGradient colors={["transparent", colors.bg]} style={StyleSheet.absoluteFill} start={{ x: 0, y: 0.55 }} end={{ x: 0, y: 1 }} />
      </View>
      <View style={{ gap: 7, marginTop: 18 }}>
        {[7, 8, 9].map((n, r) => (
          <View key={r} style={styles.seatRow}>
            {Array.from({ length: n }, (_, c) => (
              <View
                key={c}
                style={[
                  styles.seat,
                  { width: 16 + r * 3, height: 13 + r * 2.5 },
                  r === 1 && c === 4 && styles.seatLit,
                ]}
              />
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

// Slide 3: a ticket with its QR code
export function TicketCard() {
  return (
    <View style={styles.stage}>
      <View style={styles.ticket}>
        <View style={styles.ticketTop}>
          <Image source={FilmArt["arus-biru"].poster} style={styles.thumb} />
          <View style={{ flex: 1, gap: 4 }}>
            <Text weight="bold" variant="h3">Arus Biru</Text>
            <Text variant="small" color={colors.muted}>Nontonin Braga · Studio 2</Text>
            <Text variant="small" color={colors.text} weight="semibold">19:30 · F7, F8</Text>
          </View>
        </View>
        <View style={styles.perforation} />
        <View style={styles.qr}>
          <QRCode value="NONTONIN-DEMO-TICKET" size={112} backgroundColor="transparent" color={colors.text} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stage: { height: 300, alignItems: "center", justifyContent: "center" },
  poster: { position: "absolute", width: 132, height: 198, borderRadius: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  screenFrame: {
    width: 290,
    height: 122,
    borderRadius: 10,
    overflow: "hidden",
    transform: [{ perspective: 600 }, { rotateX: "14deg" }],
    shadowColor: "#F2D9BB",
    shadowOpacity: 0.35,
    shadowRadius: 30,
  },
  still: { width: 290, height: 122 },
  seatRow: { flexDirection: "row", gap: 6, justifyContent: "center" },
  seat: { borderRadius: 4, borderWidth: 1.5, borderColor: colors.seatLine, backgroundColor: colors.seatFill },
  seatLit: { backgroundColor: colors.accent, borderColor: colors.accent },
  ticket: { width: 270, borderRadius: 20, backgroundColor: colors.panel2, borderWidth: 1, borderColor: colors.line, overflow: "hidden" },
  ticketTop: { flexDirection: "row", gap: 12, padding: 16, alignItems: "center" },
  thumb: { width: 48, height: 72, borderRadius: 8 },
  perforation: { borderTopWidth: 1.5, borderStyle: "dashed", borderColor: colors.line, marginHorizontal: 12 },
  qr: { alignItems: "center", padding: 18 },
});
