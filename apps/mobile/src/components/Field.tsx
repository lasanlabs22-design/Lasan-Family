import { useState, type Ref } from "react";
import { StyleSheet, TextInput, View, type TextInputInstance, type TextInputProps } from "react-native";
import { colors, fonts, radii, touch } from "@/theme";
import { Text } from "./Text";

type Props = Omit<TextInputProps, "ref"> & { label: string; hint?: string; error?: string | null; ref?: Ref<TextInputInstance> };

export function Field({ label, hint, error, style, multiline, ref, onFocus, onBlur, ...rest }: Props) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={{ gap: 6 }}>
      <Text variant="label">{label}</Text>
      <TextInput
        ref={ref}
        accessibilityLabel={label}
        placeholderTextColor={colors.textSubtle}
        {...rest}
        multiline={multiline}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        style={[
          styles.input,
          multiline && { minHeight: 104, paddingTop: 14, textAlignVertical: "top" },
          focused && { borderColor: colors.plum500 },
          !!error && { borderColor: colors.blush500 },
          style,
        ]}
      />
      {error ? <Text style={{ color: colors.danger, fontSize: 14 }}>{error}</Text> : hint ? <Text variant="caption">{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    minHeight: touch,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.blush100,
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    fontFamily: fonts.medium,
    fontSize: 17,
    color: colors.plum900,
  },
});
