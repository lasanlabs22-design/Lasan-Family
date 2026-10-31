import { useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, TextInput, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { normalizePhone } from "@lasan/shared";
import { BackButton, Button, Notice, Screen, Text } from "@/components";
import { errorMessage } from "@/lib/api";
import { sendCode, type AppRole } from "@/lib/auth";
import { haptic } from "@/lib/haptics";
import { useAuthConfig } from "@/lib/useAuthConfig";
import { colors, fonts, radii, space, touch } from "@/theme";

export default function PhoneStep() {
  const { role: rawRole } = useLocalSearchParams<{ role?: string }>();
  const role: AppRole = rawRole === "provider" ? "provider" : "customer";
  const config = useAuthConfig();
  const [digits, setDigits] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const phone = normalizePhone(digits);

  const next = async () => {
    if (!phone) {
      setError("Enter your 10-digit mobile number.");
      haptic.warning();
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const cfg = config.data ?? (await config.refetch()).data;
      if (!cfg) throw config.error;
      await sendCode(phone, cfg);
      router.push({ pathname: "/otp", params: { role, phone } });
    } catch (err) {
      haptic.error();
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <Screen edges={["top", "bottom"]} contentStyle={{ gap: space.lg }}>
        <BackButton />
        <View style={{ gap: space.xs }}>
          <Text variant="overline">{role === "provider" ? "Service provider sign in" : "Customer sign in"}</Text>
          <Text variant="title">What's your mobile number?</Text>
          <Text style={{ color: colors.textMuted }}>
            {role === "provider" ? "Use the number you registered with your Lasan Family coordinator." : "We'll send a 6-digit code to confirm it's you."}
          </Text>
        </View>

        <View style={styles.phoneRow}>
          <View style={styles.prefix}>
            <Text style={styles.prefixText}>+91</Text>
          </View>
          <TextInput
            autoFocus
            value={digits}
            onChangeText={(t) => {
              setDigits(t.replace(/\D/g, "").slice(0, 10));
              setError(null);
            }}
            keyboardType="phone-pad"
            textContentType="telephoneNumber"
            autoComplete="tel"
            placeholder="98765 43210"
            placeholderTextColor={colors.textSubtle}
            maxLength={10}
            accessibilityLabel="Mobile number"
            style={styles.input}
            returnKeyType="next"
            onSubmitEditing={next}
          />
        </View>

        {error ? <Notice text={error} /> : null}
        <Button label="Send code" size="lg" onPress={next} loading={busy} disabled={digits.length < 10} />
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  phoneRow: { flexDirection: "row", gap: space.xs },
  prefix: { minHeight: touch + 8, paddingHorizontal: 18, borderRadius: radii.md, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.ring, justifyContent: "center" },
  prefixText: { fontFamily: fonts.semibold, fontSize: 20, color: colors.plum900 },
  input: {
    flex: 1,
    minHeight: touch + 8,
    borderRadius: radii.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.ring,
    paddingHorizontal: 18,
    fontFamily: fonts.semibold,
    fontSize: 22,
    letterSpacing: 1,
    color: colors.plum900,
  },
});
