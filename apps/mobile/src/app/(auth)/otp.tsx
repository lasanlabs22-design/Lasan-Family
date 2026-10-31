import { useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, TextInput, View, type TextInputInstance } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { BackButton, Button, Notice, Screen, Text } from "@/components";
import { errorMessage } from "@/lib/api";
import { verifyCode, type AppRole } from "@/lib/auth";
import { formatPhone } from "@/lib/format";
import { haptic } from "@/lib/haptics";
import { useSession } from "@/lib/session";
import { useAuthConfig } from "@/lib/useAuthConfig";
import { colors, fonts, radii, space } from "@/theme";

const LENGTH = 6;

export default function OtpStep() {
  const params = useLocalSearchParams<{ role?: string; phone?: string }>();
  const role: AppRole = params.role === "provider" ? "provider" : "customer";
  const phone = params.phone ?? "";
  const config = useAuthConfig();
  const { signIn } = useSession();
  const input = useRef<TextInputInstance>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const showDemoHint = !!config.data && (config.data.devMode || config.data.demo) && !config.data.firebase;

  const submit = async (value = code) => {
    if (value.length !== LENGTH || busy) return;
    setBusy(true);
    setError(null);
    try {
      const cfg = config.data ?? (await config.refetch()).data;
      if (!cfg) throw config.error;
      const session = await verifyCode({ phone, role, code: value, config: cfg });
      haptic.success();
      // The root navigator routes to the customer or provider tabs as soon as the session is stored.
      await signIn(session);
    } catch (err) {
      haptic.error();
      setError(errorMessage(err));
      setCode("");
      input.current?.focus();
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <Screen edges={["top", "bottom"]} contentStyle={{ gap: space.lg }}>
        <BackButton />
        <View style={{ gap: space.xs }}>
          <Text variant="overline">Verify your number</Text>
          <Text variant="title">Enter the 6-digit code</Text>
          <Text style={{ color: colors.textMuted }}>Sent to {formatPhone(phone)}</Text>
        </View>

        <Pressable onPress={() => input.current?.focus()} accessibilityLabel="One-time code" accessibilityHint="Double tap to type the code">
          <View style={styles.boxes}>
            {Array.from({ length: LENGTH }, (_, i) => {
              const filled = i < code.length;
              const active = i === code.length;
              return (
                <View key={i} style={[styles.box, active && styles.boxActive, filled && styles.boxFilled]}>
                  <Text style={styles.digit}>{code[i] ?? ""}</Text>
                </View>
              );
            })}
          </View>
          <TextInput
            ref={input}
            autoFocus
            value={code}
            onChangeText={(t) => {
              const v = t.replace(/\D/g, "").slice(0, LENGTH);
              setCode(v);
              setError(null);
              if (v.length === LENGTH) submit(v);
            }}
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            autoComplete="sms-otp"
            maxLength={LENGTH}
            style={styles.hidden}
            caretHidden
          />
        </Pressable>

        {showDemoHint ? <Text variant="caption" style={{ textAlign: "center" }}>Demo: use 123456</Text> : null}
        {error ? <Notice text={error} /> : null}
        <Button label="Verify and continue" size="lg" onPress={() => submit()} loading={busy} disabled={code.length !== LENGTH} />
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  boxes: { flexDirection: "row", justifyContent: "space-between", gap: space.xs },
  box: { flex: 1, aspectRatio: 0.82, maxWidth: 58, borderRadius: radii.sm, borderWidth: 1, borderColor: colors.ring, backgroundColor: colors.white, alignItems: "center", justifyContent: "center" },
  boxActive: { borderColor: colors.plum500, borderWidth: 2 },
  boxFilled: { backgroundColor: colors.blush50 },
  digit: { fontFamily: fonts.display, fontSize: 28, lineHeight: 34, color: colors.plum900 },
  hidden: { position: "absolute", opacity: 0, width: 1, height: 1 },
});
