import React from "react";
import { Image, ScrollView, StyleSheet, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";
import { ArmchairIcon } from "phosphor-react-native";
import colors from "@constants/styles/color";
import { GUTTER, radius } from "@constants/styles/size";
import { formatDate, formatIDR } from "@helpers/format";
import { useLang } from "@hooks/use-lang";
import { useBookings } from "@hooks/use-bookings";
import Screen from "@components/screen";
import Header from "@components/header";
import Text from "@components/text";
import Button from "@components/button";
import StateView from "@components/state-view";
import type { RootScreenProps } from "@app-types/navigation";

export default function TicketDetailScreen({ route, navigation }: RootScreenProps<"TicketDetail">) {
  const { t } = useTranslation(["account", "booking", "common"]);
  const lang = useLang();
  const { bookings } = useBookings();
  const b = bookings.find((x) => x.id === route.params.bookingId);
  if (!b) {
    return (
      <Screen>
        <Header />
        <StateView empty={{ title: t("tickets.empty") }} />
      </Screen>
    );
  }

  return (
    <Screen>
      <Header title={b.filmTitle} />
      <ScrollView contentContainerStyle={{ padding: GUTTER, paddingBottom: 40, gap: 16 }}>
        <View style={styles.ticket}>
          <View style={styles.hero}>
            <Image source={b.backdrop} style={{ width: "100%", height: 120 }} resizeMode="cover" />
            <LinearGradient colors={["rgba(28,28,32,0)", colors.panel2]} style={StyleSheet.absoluteFill} />
          </View>
          <View style={styles.body}>
            <Text variant="h1" weight="bold">{b.filmTitle}</Text>
            <Text color={colors.muted}>{b.cinemaName}</Text>
            <View style={styles.grid}>
              <Field label={t("tickets.date")} value={formatDate(b.date, "EEE, d MMM yyyy", lang)} />
              <Field label={t("tickets.time")} value={b.time} />
              <Field label="Studio" value={String(b.studio)} />
              <Field label={t("booking:checkout.seats")} value={b.seats.join(", ")} accent />
            </View>
          </View>

          <View style={styles.cut}>
            <View style={[styles.notch, { left: -12 }]} />
            <View style={styles.dash} />
            <View style={[styles.notch, { right: -12 }]} />
          </View>

          <View style={styles.qrBox}>
            <View style={styles.qrBg}>
              <QRCode value={`NONTONIN:${b.code}:${b.showtimeId}:${b.seats.join(",")}`} size={176} />
            </View>
            <Text variant="small" color={colors.muted}>{t("tickets.showQr")}</Text>
            <Text variant="tiny" color={colors.dim} style={{ marginTop: 8 }}>{t("tickets.code")}</Text>
            <Text variant="h2" weight="bold" style={{ letterSpacing: 1 }}>{b.code}</Text>
          </View>
        </View>

        <Button
          variant="secondary"
          size="lg"
          icon={<ArmchairIcon size={18} color={colors.text} weight="fill" />}
          label={t("tickets.previewSeat")}
          onPress={() => navigation.navigate("SeatSelect", { showtimeId: b.showtimeId, focusSeat: b.seats[0], readOnly: true })}
        />

        <View style={styles.paid}>
          <Text variant="small" color={colors.muted}>
            {t("tickets.paidWith", { method: t(`booking:checkout.method.${b.payment}`) })}
          </Text>
          <Text weight="semibold">{formatIDR(b.total)}</Text>
        </View>
      </ScrollView>
    </Screen>
  );
}

function Field({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <View style={{ width: "50%", paddingVertical: 8 }}>
      <Text variant="tiny" color={colors.dim}>{label}</Text>
      <Text weight="semibold" color={colors.text} style={{ marginTop: 2 }}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  ticket: { borderRadius: radius.xl, backgroundColor: colors.panel2, borderWidth: 1, borderColor: colors.line, overflow: "hidden" },
  hero: { height: 120, overflow: "hidden" },
  body: { paddingHorizontal: 18, marginTop: -24, gap: 4 },
  grid: { flexDirection: "row", flexWrap: "wrap", marginTop: 12 },
  cut: { height: 24, justifyContent: "center", marginTop: 8 },
  notch: { position: "absolute", width: 24, height: 24, borderRadius: 12, backgroundColor: colors.bg },
  dash: { marginHorizontal: 20, borderTopWidth: 1.5, borderStyle: "dashed", borderColor: colors.line },
  qrBox: { alignItems: "center", padding: 20, gap: 8 },
  qrBg: { padding: 12, borderRadius: radius.md, backgroundColor: colors.white },
  paid: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 4 },
});
