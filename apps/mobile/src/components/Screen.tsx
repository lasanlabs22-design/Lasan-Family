import type { ReactNode } from "react";
import { RefreshControl, ScrollView, StyleSheet, View, type ViewStyle } from "react-native";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";
import { colors, space } from "@/theme";
import { Text } from "./Text";

type Props = {
  children: ReactNode;
  title?: string;
  overline?: string;
  subtitle?: string;
  right?: ReactNode;
  /** Set to false for screens that manage their own scrolling (FlatList). */
  scroll?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  edges?: Edge[];
  contentStyle?: ViewStyle;
  footer?: ReactNode;
};

export function Screen({ children, title, overline, subtitle, right, scroll = true, refreshing, onRefresh, edges = ["top"], contentStyle, footer }: Props) {
  const header =
    title || overline ? (
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          {overline ? <Text variant="overline">{overline}</Text> : null}
          {title ? (
            <Text variant="title" accessibilityRole="header" style={{ marginTop: overline ? 6 : 0 }}>
              {title}
            </Text>
          ) : null}
          {subtitle ? (
            <Text variant="body" style={{ color: colors.textMuted, marginTop: 6 }}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        {right}
      </View>
    ) : null;

  return (
    <SafeAreaView style={styles.root} edges={edges}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={[styles.content, contentStyle]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          refreshControl={onRefresh ? <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={colors.blush500} colors={[colors.blush500]} /> : undefined}
        >
          {header}
          {children}
        </ScrollView>
      ) : (
        <View style={[{ flex: 1 }, contentStyle]}>
          {header ? <View style={{ paddingHorizontal: space.lg, paddingTop: space.md }}>{header}</View> : null}
          {children}
        </View>
      )}
      {footer}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.cream },
  content: { paddingHorizontal: space.lg, paddingTop: space.md, paddingBottom: space.xxxl, gap: space.md },
  header: { flexDirection: "row", alignItems: "flex-start", gap: space.sm, marginBottom: space.xs },
});
