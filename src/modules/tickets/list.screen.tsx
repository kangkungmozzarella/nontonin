import React from "react";
import { FlatList, Image, StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { TicketIcon } from "phosphor-react-native";
import colors from "@constants/styles/color";
import { GUTTER, radius } from "@constants/styles/size";
import { formatDate } from "@helpers/format";
import { useLang } from "@hooks/use-lang";
import { useBookings } from "@hooks/use-bookings";
import Screen from "@components/screen";
import Text from "@components/text";
import Chip from "@components/chip";
import StateView from "@components/state-view";
import PressableScale from "@components/pressable-scale";
import type { Booking } from "@api-hooks/bookings/model";
import { byShowTime, isUpcoming } from "./utils";

export default function TicketsScreen() {
  const { t } = useTranslation(["account", "common"]);
  const navigation = useNavigation();
  const { bookings } = useBookings();
  const [tab, setTab] = React.useState<"upcoming" | "past">("upcoming");

  const list = React.useMemo(() => {
    const up = bookings.filter((b) => isUpcoming(b)).sort(byShowTime);
    const past = bookings.filter((b) => !isUpcoming(b)).sort(byShowTime).reverse();
    return tab === "upcoming" ? up : past;
  }, [bookings, tab]);

  return (
    <Screen>
      <Text variant="h1" weight="bold" style={styles.title}>{t("tickets.title")}</Text>
      <View style={styles.tabs}>
        {(["upcoming", "past"] as const).map((k) => (
          <Chip key={k} active={tab === k} onPress={() => setTab(k)} style={{ paddingVertical: 7 }}>
            <Text variant="small" weight="semibold" color={tab === k ? colors.selInk : colors.text}>{t(`tickets.${k}`)}</Text>
          </Chip>
        ))}
      </View>
      <FlatList
        data={list}
        keyExtractor={(b) => b.id}
        contentContainerStyle={{ paddingHorizontal: GUTTER, gap: 12, paddingBottom: 24, flexGrow: 1 }}
        ListEmptyComponent={
          <StateView
            empty={{
              icon: <TicketIcon size={40} color={colors.dim} />,
              title: t("tickets.empty"),
              desc: t("tickets.emptyDesc"),
              action: tab === "upcoming" ? { label: t("tickets.browse"), onPress: () => navigation.navigate("Tabs", { screen: "Home" }) } : undefined,
            }}
          />
        }
        renderItem={({ item }) => <TicketRow booking={item} dim={tab === "past"} />}
      />
    </Screen>
  );
}

function TicketRow({ booking, dim }: { booking: Booking; dim?: boolean }) {
  const navigation = useNavigation();
  const lang = useLang();
  const { t } = useTranslation("common");
  return (
    <PressableScale
      scaleTo={0.98}
      onPress={() => navigation.navigate("TicketDetail", { bookingId: booking.id })}
      style={[styles.ticket, dim && { opacity: 0.6 }]}
      accessibilityRole="button"
    >
      <Image source={booking.poster} style={styles.thumb} />
      <View style={{ flex: 1, gap: 4 }}>
        <Text weight="bold" variant="h3" numberOfLines={1}>{booking.filmTitle}</Text>
        <Text variant="small" color={colors.muted} numberOfLines={1}>
          {booking.cinemaName} · {t("studio", { n: booking.studio })}
        </Text>
        <Text variant="small">{formatDate(booking.date, "EEE, d MMM", lang)} · {booking.time}</Text>
        <Text variant="small" weight="semibold" color={colors.sel}>{booking.seats.join(", ")}</Text>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  title: { paddingHorizontal: GUTTER, paddingTop: 8 },
  tabs: { flexDirection: "row", gap: 8, paddingHorizontal: GUTTER, paddingVertical: 16 },
  ticket: {
    flexDirection: "row",
    gap: 14,
    padding: 12,
    borderRadius: radius.lg,
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.line,
  },
  thumb: { width: 60, height: 90, borderRadius: 10 },
});
