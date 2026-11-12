import React from "react";
import { StyleSheet, View } from "react-native";
import Animated, { FadeInDown, FadeOutDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import colors from "@constants/styles/color";
import { radius } from "@constants/styles/size";
import Text from "@components/text";

type Toast = { id: number; message: string };
const ToastContext = React.createContext<(message: string) => void>(() => {});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = React.useState<Toast | null>(null);
  const insets = useSafeAreaInsets();
  const timer = React.useRef<ReturnType<typeof setTimeout>>(undefined);

  const show = React.useCallback((message: string) => {
    clearTimeout(timer.current);
    setToast({ id: Date.now(), message });
    timer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <View pointerEvents="none" style={[styles.host, { bottom: insets.bottom + 96 }]}>
        {toast && (
          <Animated.View
            key={toast.id}
            entering={FadeInDown.duration(220)}
            exiting={FadeOutDown.duration(180)}
            style={styles.toast}
            accessibilityLiveRegion="polite"
            accessibilityRole="alert"
          >
            <Text variant="small" weight="medium">{toast.message}</Text>
          </Animated.View>
        )}
      </View>
    </ToastContext.Provider>
  );
}

export const useToast = () => React.useContext(ToastContext);

const styles = StyleSheet.create({
  host: { position: "absolute", left: 16, right: 16, alignItems: "center" },
  toast: {
    backgroundColor: colors.panel2,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingHorizontal: 16,
    paddingVertical: 11,
    maxWidth: 420,
  },
});
