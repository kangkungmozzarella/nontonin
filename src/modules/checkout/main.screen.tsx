import React from "react";
import { Image, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { BankIcon, CheckCircleIcon, CircleIcon, CreditCardIcon, QrCodeIcon, WalletIcon, type Icon } from "phosphor-react-native";
import colors from "@constants/styles/color";
import { GUTTER, radius } from "@constants/styles/size";
import { FilmArt } from "@constants/assets";
import { formatDate, formatIDR } from "@helpers/format";
import { orderTotals } from "@helpers/pricing";
import { useLang } from "@hooks/use-lang";
import { useBookings } from "@hooks/use-bookings";
import { useGetShowtime } from "@api-hooks/showtimes";
import { useGetFilm } from "@api-hooks/films";
import { useGetCinema } from "@api-hooks/cinemas";
import { useGetSeatMap } from "@api-hooks/seats";
import { useCreateBooking, type PaymentMethod } from "@api-hooks/bookings";
import { ApiError } from "@common/api/mock/server";
import Screen from "@components/screen";
import Header from "@components/header";
import Text from "@components/text";
import Button from "@components/button";
import StateView from "@components/state-view";
import PressableScale from "@components/pressable-scale";
import { useToast } from "@components/toast";
import type { RootScreenProps } from "@app-types/navigation";

const METHODS: { id: PaymentMethod; icon: Icon }[] = [
  { id: "ewallet", icon: WalletIcon },
  { id: "qris", icon: QrCodeIcon },
  { id: "va", icon: BankIcon },
  { id: "card", icon: CreditCardIcon },
];

export default function CheckoutScreen({ route, navigation }: RootScreenProps<"Checkout">) {
  const { showtimeId, seats } = route.params;
  const { t } = useTranslation(["booking", "common"]);
  const lang = useLang();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const { add } = useBookings();
  const [method, setMethod] = React.useState<PaymentMethod>("ewallet");

  const showtime = useGetShowtime(showtimeId);
  const film = useGetFilm(showtime.data?.filmId);
  const cinema = useGetCinema(showtime.data?.cinemaId);
  const seatMap = useGetSeatMap(showtimeId);
  const create = useCreateBooking();

  if (!showtime.data || !film.data || !cinema.data || !seatMap.data) {
    const error = showtime.error || film.error || cinema.error || seatMap.error;
    return (
      <Screen>
        <Header title={t("checkout.title")} />
        <StateView loading={!error} error={error} onRetry={() => showtime.refetch()} />
      </Screen>
    );
  }

  const st = showtime.data;
  const totals = orderTotals(seats, seatMap.data);

  const pay = () =>
    create.mutate(
      { showtimeId, seats, payment: method },
      {
        onSuccess: (booking) => {
          add(booking);
          navigation.reset({
            index: 1,
            routes: [{ name: "Tabs", params: { screen: "Tickets" } }, { name: "PaymentSuccess", params: { bookingId: booking.id } }],
          });
        },
        onError: (e) => {
          if (e instanceof ApiError && e.code === "seat_taken") {
            toast(t("seat.taken", { seats: seats.join(", ") }));
            navigation.goBack();
          } else toast(t("common:errorTitle"));
        },
      },
    );

  return (
    <Screen edges={["top"]}>
      <Header title={t("checkout.title")} />
      <ScrollView contentContainerStyle={{ padding: GUTTER, gap: 16, paddingBottom: 140 }}>
        <View style={[styles.card, styles.filmRow]}>
          <Image source={FilmArt[film.data.id].poster} style={styles.thumb} />
          <View style={{ flex: 1, gap: 4 }}>
            <Text variant="h3" weight="bold">{film.data.title}</Text>
            <Text variant="small" color={colors.muted}>{cinema.data.name} · {t("common:studio", { n: st.studio })}</Text>
            <Text variant="small" color={colors.text}>{formatDate(st.date, "EEEE, d MMMM yyyy", lang)} · {st.time}</Text>
            <Text variant="small" weight="semibold" color={colors.sel}>
              {t("checkout.seats")}: {seats.join(", ")}
            </Text>
          </View>
        </View>

        <View style={[styles.card, { gap: 10 }]}>
          <Row label={t("checkout.tickets", { count: seats.length })} value={formatIDR(totals.subtotal)} />
          {totals.discount > 0 && (
            <Row label={t("checkout.discount", { pct: seatMap.data.discountPercent })} value={`−${formatIDR(totals.discount)}`} accent />
          )}
          <Row label={t("checkout.fee")} value={formatIDR(totals.fee)} />
          <View style={styles.divider} />
          <Row label={t("checkout.total")} value={formatIDR(totals.total)} bold />
        </View>

        <Text variant="h3" weight="semibold" style={{ marginTop: 4 }}>{t("checkout.payment")}</Text>
        <View style={{ gap: 8 }}>
          {METHODS.map(({ id, icon: I }) => {
            const active = id === method;
            return (
              <PressableScale
                key={id}
                scaleTo={0.98}
                onPress={() => setMethod(id)}
                accessibilityRole="radio"
                accessibilityState={{ checked: active }}
                style={[styles.method, active && styles.methodOn]}
              >
                <I size={20} color={active ? colors.sel : colors.muted} />
                <Text weight="medium" style={{ flex: 1 }}>{t(`checkout.method.${id}`)}</Text>
                {active ? (
                  <CheckCircleIcon size={20} color={colors.sel} weight="fill" />
                ) : (
                  <CircleIcon size={20} color={colors.dim} />
                )}
              </PressableScale>
            );
          })}
        </View>
        <Text variant="small" color={colors.dim} align="center">{t("checkout.demo")}</Text>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <Button
          size="lg"
          label={create.isPending ? t("checkout.processing") : t("checkout.pay", { amount: formatIDR(totals.total) })}
          loading={create.isPending}
          onPress={pay}
        />
      </View>
    </Screen>
  );
}

function Row({ label, value, bold, accent }: { label: string; value: string; bold?: boolean; accent?: boolean }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
      <Text color={bold ? colors.text : colors.muted} weight={bold ? "semibold" : "regular"}>{label}</Text>
      <Text weight={bold ? "bold" : "medium"} variant={bold ? "h3" : "body"} color={accent ? colors.sel : colors.text}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 14, borderRadius: radius.lg, backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.line },
  filmRow: { flexDirection: "row", gap: 14 },
  thumb: { width: 64, height: 96, borderRadius: 10 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.line, marginVertical: 2 },
  method: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: radius.md,
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.line,
  },
  methodOn: { borderColor: colors.sel, backgroundColor: "rgba(124,242,180,0.06)" },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: GUTTER,
    paddingTop: 12,
    backgroundColor: colors.bg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
  },
});
