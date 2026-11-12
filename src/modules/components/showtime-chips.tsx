import React from "react";
import { StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import colors from "@constants/styles/color";
import Text from "@components/text";
import Chip from "@components/chip";
import type { Showtime } from "@api-hooks/showtimes/model";

// Times for one film at one cinema; past times are shown but disabled
export default function ShowtimeChips({ showtimes }: { showtimes: Showtime[] }) {
  const navigation = useNavigation();
  return (
    <View style={styles.wrap}>
      {showtimes.map((s) => (
        <Chip
          key={s.id}
          disabled={s.isPast}
          onPress={() => navigation.navigate("SeatSelect", { showtimeId: s.id })}
          label={s.time}
          style={{ minWidth: 72 }}
        >
          <Text weight="semibold" color={s.isPast ? colors.dim : colors.text}>{s.time}</Text>
        </Chip>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
});
