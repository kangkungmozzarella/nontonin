import React from "react";
import { Image, Pressable, StyleSheet, useWindowDimensions, View } from "react-native";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { NavigationArrowIcon, XIcon } from "phosphor-react-native";
import colors from "@constants/styles/color";
import { FilmArt } from "@constants/assets";
import { localStorage, StorageKeys } from "@helpers/local-storage";
import { useAppReady } from "@hooks/use-app-ready";
import { useCity } from "@hooks/use-city";
import { useLang } from "@hooks/use-lang";
import { nearestCity, useUserLocation } from "@hooks/use-user-location";
import { useGetPromos } from "@api-hooks/promos";
import { todayKey } from "@common/api/mock/server";
import Popup from "@components/popup";
import Text from "@components/text";
import Button from "@components/button";
import IconButton from "@components/icon-button";
import { useToast } from "@components/toast";

let promoClosedThisSession = false;

// Popups shown when the home screen opens, one at a time:
// 1. location prompt, until a city is known
// 2. the featured promo, at most once per session and never on a day the user dismissed it
export default function EntryPopups() {
  const ready = useAppReady();
  const focused = useIsFocused();
  const { city } = useCity();
  const [promoOpen, setPromoOpen] = React.useState(false);
  const { data: promos } = useGetPromos();

  const { coords, status } = useUserLocation();
  const { setCityId } = useCity();

  // Permission granted in an earlier session: pick the nearest city silently
  React.useEffect(() => {
    if (!city && coords) setCityId(nearestCity(coords).id);
  }, [city, coords, setCityId]);

  const showLocation = ready && focused && !city && !(status === "granted" && !coords);

  React.useEffect(() => {
    if (!ready || !focused || !city || !promos?.length || promoClosedThisSession) return;
    if (localStorage.getItem(StorageKeys.promoSeen) === todayKey()) return;
    const id = setTimeout(() => setPromoOpen(true), 450);
    return () => clearTimeout(id);
  }, [ready, focused, city, promos]);

  const closePromo = (forToday: boolean) => {
    promoClosedThisSession = true;
    if (forToday) localStorage.setItem(StorageKeys.promoSeen, todayKey());
    setPromoOpen(false);
  };

  return (
    <>
      <LocationPopup visible={showLocation} />
      {promos?.[0] && <PromoPopup visible={promoOpen && !!city && focused} promo={promos[0]} onClose={closePromo} />}
    </>
  );
}

function LocationPopup({ visible }: { visible: boolean }) {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { request } = useUserLocation();
  const { setCityId } = useCity();
  const toast = useToast();
  const [busy, setBusy] = React.useState(false);

  const allow = async () => {
    setBusy(true);
    const coords = await request();
    setBusy(false);
    if (coords) {
      const c = nearestCity(coords);
      setCityId(c.id);
      toast(t("location.detected", { city: c.name }));
    } else {
      toast(t("location.denied"));
      navigation.navigate("CityPicker");
    }
  };

  return (
    <Popup visible={visible} onRequestClose={() => {}} dismissOnBackdrop={false}>
      <View style={styles.locBody}>
        <View style={styles.locIcon}>
          <NavigationArrowIcon size={28} color={colors.sel} weight="fill" />
        </View>
        <Text variant="h2" weight="bold" align="center">{t("location.title")}</Text>
        <Text color={colors.muted} align="center">{t("location.desc")}</Text>
        <View style={styles.actions}>
          <Button size="lg" label={t("location.allow")} onPress={allow} loading={busy} />
          <Button size="lg" variant="ghost" label={t("location.manual")} onPress={() => navigation.navigate("CityPicker")} />
        </View>
      </View>
    </Popup>
  );
}

function PromoPopup({
  visible,
  promo,
  onClose,
}: {
  visible: boolean;
  promo: NonNullable<ReturnType<typeof useGetPromos>["data"]>[number];
  onClose: (forToday: boolean) => void;
}) {
  const { t } = useTranslation();
  const lang = useLang();
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const artW = Math.min(width - 48, 380); // matches the Popup card width
  return (
    <Popup visible={visible} onRequestClose={() => onClose(false)}>
      <View>
        <Image source={FilmArt[promo.filmId].still} style={{ width: artW, height: artW / 1.6 }} resizeMode="cover" />
        <IconButton label={t("close")} glass size={34} style={styles.close} onPress={() => onClose(false)}>
          <XIcon size={16} color={colors.text} weight="bold" />
        </IconButton>
      </View>
      <View style={styles.promoBody}>
        <Text variant="h2" weight="bold">{promo.title[lang]}</Text>
        <Text color={colors.muted}>{promo.subtitle[lang]}</Text>
        <Button
          size="lg"
          style={{ marginTop: 10 }}
          label={t(`promo.cta.${promo.kind}`)}
          onPress={() => {
            onClose(false);
            navigation.navigate("FilmDetail", { filmId: promo.filmId });
          }}
        />
        <Pressable onPress={() => onClose(true)} hitSlop={8} style={{ alignSelf: "center", paddingVertical: 6 }}>
          <Text variant="small" color={colors.muted}>{t("promo.dismissToday")}</Text>
        </Pressable>
      </View>
    </Popup>
  );
}

const styles = StyleSheet.create({
  locBody: { padding: 22, gap: 10, alignItems: "stretch" },
  locIcon: {
    alignSelf: "center",
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: colors.selSoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  actions: { gap: 8, marginTop: 10 },
  close: { position: "absolute", top: 12, right: 12 },
  promoBody: { padding: 20, gap: 6 },
});
