import { Text as RNText, type TextProps } from "react-native";
import { type, type TypeVariant } from "@/theme";

/** Text with the Lasan type scale. Font scaling stays on for accessibility, capped so layouts hold. */
export function Text({ variant = "body", style, maxFontSizeMultiplier = 1.6, ...rest }: TextProps & { variant?: TypeVariant }) {
  return <RNText {...rest} maxFontSizeMultiplier={maxFontSizeMultiplier} style={[type[variant], style]} />;
}
