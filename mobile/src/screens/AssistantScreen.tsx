import { memo, useCallback, useEffect, useRef, useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { QUICK_QUESTIONS } from "../data/demo";
import { askAssistant } from "../services/ai";
import { colors, radius, spacing } from "../theme";
import { ChatMessage } from "../types";

const welcomeMessage: ChatMessage = {
  id: "welcome",
  role: "assistant",
  text: "Я экологический ассистент SAQSHY. Опишите ситуацию у воды или на берегу — помогу действовать безопасно и собрать доказательства.",
  createdAt: Date.now(),
};

function MessageBubbleComponent({ message }: { message: ChatMessage }) {
  const assistant = message.role === "assistant";
  return (
    <View style={[styles.messageRow, !assistant && styles.userMessageRow]}>
      {assistant ? (
        <View style={styles.botAvatar}>
          <Ionicons name="sparkles" size={16} color={colors.sea} />
        </View>
      ) : null}
      <View style={[styles.bubble, assistant ? styles.botBubble : styles.userBubble]}>
        {assistant ? <Text style={styles.botLabel}>SAQSHY AI</Text> : null}
        <Text style={[styles.messageText, !assistant && styles.userMessageText]}>{message.text}</Text>
        <Text style={[styles.messageTime, !assistant && styles.userMessageTime]}>
          {new Date(message.createdAt).toLocaleTimeString("ru-RU", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>
    </View>
  );
}

const MessageBubble = memo(MessageBubbleComponent);

export function AssistantScreen() {
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([welcomeMessage]);
  const [input, setInput] = useState("");
  const [responding, setResponding] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [messages, responding]);

  const send = useCallback(
    async (preset?: string) => {
      const question = (preset ?? input).trim();
      if (!question || responding) return;

      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        text: question,
        createdAt: Date.now(),
      };
      setInput("");
      setMessages((current) => [...current, userMessage]);
      setResponding(true);
      void Haptics.selectionAsync();

      const answer = await askAssistant(question);
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        text: answer,
        createdAt: Date.now(),
      };
      setMessages((current) => [...current, assistantMessage]);
      setResponding(false);
    },
    [input, responding],
  );

  const reset = () => {
    setMessages([{ ...welcomeMessage, createdAt: Date.now() }]);
    setInput("");
    setResponding(false);
  };

  const renderMessage = useCallback(
    ({ item }: { item: ChatMessage }) => <MessageBubble message={item} />,
    [],
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={0}
      style={styles.root}
    >
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 12) }]}>
        <View style={styles.headerTop}>
          <View style={styles.assistantIdentity}>
            <View style={styles.assistantIcon}>
              <Ionicons name="sparkles" size={23} color={colors.sea} />
              <View style={styles.onlineDot} />
            </View>
            <View>
              <Text style={styles.eyebrow}>ЭКОЛОГИЧЕСКИЙ ПОМОЩНИК</Text>
              <Text style={styles.title}>SAQSHY AI</Text>
            </View>
          </View>
          <Pressable onPress={reset} style={({ pressed }) => [styles.clearButton, pressed && styles.pressed]}>
            <Ionicons name="refresh-outline" size={20} color={colors.text} />
          </Pressable>
        </View>

        <View style={styles.modeCard}>
          <View style={styles.modeIcon}>
            <Ionicons name="shield-checkmark-outline" size={17} color={colors.green} />
          </View>
          <View style={styles.modeCopy}>
            <Text style={styles.modeTitle}>Безопасный демо-режим</Text>
            <Text style={styles.modeText}>База знаний работает без ключа; внешний AI подключается через backend.</Text>
          </View>
        </View>
      </View>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messages}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        initialNumToRender={10}
        maxToRenderPerBatch={8}
        windowSize={7}
        ListFooterComponent={
          responding ? (
            <View style={styles.messageRow}>
              <View style={styles.botAvatar}>
                <Ionicons name="sparkles" size={16} color={colors.sea} />
              </View>
              <View style={[styles.bubble, styles.botBubble, styles.typingBubble]}>
                <Text style={styles.typingText}>Анализирую ситуацию…</Text>
              </View>
            </View>
          ) : null
        }
      />

      {messages.length <= 2 ? (
        <View style={styles.quickSection}>
          <Text style={styles.quickLabel}>БЫСТРЫЕ ВОПРОСЫ</Text>
          <ScrollView
            horizontal
            contentContainerStyle={styles.quickList}
            keyboardShouldPersistTaps="handled"
            showsHorizontalScrollIndicator={false}
          >
            {QUICK_QUESTIONS.map((question) => (
              <Pressable
                key={question}
                onPress={() => void send(question)}
                style={({ pressed }) => [styles.quickChip, pressed && styles.pressed]}
              >
                <Ionicons name="sparkles-outline" size={14} color={colors.sea} />
                <Text style={styles.quickText}>{question}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      ) : null}

      <View style={[styles.composer, { paddingBottom: Math.max(insets.bottom, 10) }]}>
        <View style={styles.inputShell}>
          <TextInput
            value={input}
            onChangeText={setInput}
            onSubmitEditing={() => void send()}
            placeholder="Опишите, что вы видите…"
            placeholderTextColor={colors.muted}
            returnKeyType="send"
            maxLength={600}
            multiline
            style={styles.input}
          />
          <Pressable
            accessibilityLabel="Отправить вопрос"
            disabled={!input.trim() || responding}
            onPress={() => void send()}
            style={({ pressed }) => [
              styles.sendButton,
              (!input.trim() || responding) && styles.sendButtonDisabled,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons name="arrow-up" size={21} color={colors.ink} />
          </Pressable>
        </View>
        <Text style={styles.aiNotice}>AI может ошибаться · при прямой угрозе звоните 112</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.ink,
    flex: 1,
  },
  header: {
    borderBottomColor: colors.line,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingBottom: 12,
    paddingHorizontal: spacing.md,
  },
  headerTop: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  assistantIdentity: {
    alignItems: "center",
    flexDirection: "row",
    gap: 11,
  },
  assistantIcon: {
    alignItems: "center",
    backgroundColor: "rgba(16,215,196,0.1)",
    borderColor: "rgba(16,215,196,0.22)",
    borderRadius: 16,
    borderWidth: 1,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  onlineDot: {
    backgroundColor: colors.green,
    borderColor: colors.ink,
    borderRadius: 5,
    borderWidth: 2,
    bottom: 2,
    height: 10,
    position: "absolute",
    right: 2,
    width: 10,
  },
  eyebrow: {
    color: colors.sea,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1,
  },
  title: {
    color: colors.white,
    fontSize: 23,
    fontWeight: "900",
    letterSpacing: -0.5,
    marginTop: 2,
  },
  clearButton: {
    alignItems: "center",
    backgroundColor: colors.panel,
    borderColor: colors.line,
    borderRadius: radius.md,
    borderWidth: 1,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  modeCard: {
    alignItems: "center",
    backgroundColor: "rgba(85,214,158,0.07)",
    borderColor: "rgba(85,214,158,0.16)",
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: "row",
    marginTop: 12,
    padding: 10,
  },
  modeIcon: {
    alignItems: "center",
    backgroundColor: "rgba(85,214,158,0.1)",
    borderRadius: 11,
    height: 34,
    justifyContent: "center",
    width: 34,
  },
  modeCopy: {
    flex: 1,
    paddingLeft: 9,
  },
  modeTitle: {
    color: colors.green,
    fontSize: 10,
    fontWeight: "800",
  },
  modeText: {
    color: colors.muted,
    fontSize: 8,
    lineHeight: 12,
    marginTop: 2,
  },
  messages: {
    gap: 13,
    paddingBottom: 16,
    paddingHorizontal: spacing.md,
    paddingTop: 18,
  },
  messageRow: {
    alignItems: "flex-end",
    flexDirection: "row",
    gap: 8,
  },
  userMessageRow: {
    justifyContent: "flex-end",
  },
  botAvatar: {
    alignItems: "center",
    backgroundColor: "rgba(16,215,196,0.1)",
    borderRadius: 13,
    height: 34,
    justifyContent: "center",
    width: 34,
  },
  bubble: {
    borderRadius: 19,
    maxWidth: "82%",
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  botBubble: {
    backgroundColor: colors.panel,
    borderBottomLeftRadius: 6,
    borderColor: colors.line,
    borderWidth: 1,
  },
  userBubble: {
    backgroundColor: colors.sea,
    borderBottomRightRadius: 6,
  },
  botLabel: {
    color: colors.sea,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.7,
    marginBottom: 5,
  },
  messageText: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 19,
  },
  userMessageText: {
    color: colors.ink,
    fontWeight: "600",
  },
  messageTime: {
    color: colors.muted,
    fontSize: 7,
    marginTop: 6,
    textAlign: "right",
  },
  userMessageTime: {
    color: "rgba(6,21,43,0.55)",
  },
  typingBubble: {
    paddingVertical: 12,
  },
  typingText: {
    color: colors.seaSoft,
    fontSize: 11,
    fontWeight: "700",
  },
  quickSection: {
    paddingBottom: 10,
  },
  quickLabel: {
    color: colors.muted,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1,
    paddingHorizontal: spacing.md,
  },
  quickList: {
    gap: 7,
    paddingHorizontal: spacing.md,
    paddingTop: 8,
  },
  quickChip: {
    alignItems: "center",
    backgroundColor: colors.panel,
    borderColor: colors.line,
    borderRadius: radius.pill,
    borderWidth: 1,
    flexDirection: "row",
    gap: 6,
    maxWidth: 250,
    paddingHorizontal: 11,
    paddingVertical: 9,
  },
  quickText: {
    color: colors.text,
    fontSize: 10,
    fontWeight: "600",
  },
  composer: {
    backgroundColor: colors.inkSoft,
    borderTopColor: colors.line,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.md,
    paddingTop: 10,
  },
  inputShell: {
    alignItems: "flex-end",
    backgroundColor: colors.panel,
    borderColor: colors.line,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: "row",
    minHeight: 50,
    padding: 5,
  },
  input: {
    color: colors.text,
    flex: 1,
    fontSize: 13,
    maxHeight: 100,
    minHeight: 40,
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  sendButton: {
    alignItems: "center",
    backgroundColor: colors.sea,
    borderRadius: 16,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  sendButtonDisabled: {
    opacity: 0.35,
  },
  aiNotice: {
    color: colors.muted,
    fontSize: 8,
    marginTop: 7,
    textAlign: "center",
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.97 }],
  },
});

