import { AnalysisResult, Coordinates, SignalCategory } from "../types";

const REMOTE_AI_URL = process.env.EXPO_PUBLIC_AI_API_URL?.trim();

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const classification: Record<
  SignalCategory,
  Omit<AnalysisResult, "category" | "confidence" | "model">
> = {
  plastic: {
    title: "Вероятное пластиковое загрязнение",
    summary:
      "В кадре обнаружены контрастные объекты, похожие на бытовой пластик у линии воды.",
    risk: "medium",
    detected: ["пластиковые фрагменты", "прибрежная зона", "скопление отходов"],
    nextStep: "Не заходите в воду. Добавьте общий план и отправьте сигнал на проверку.",
  },
  oil: {
    title: "Признаки нефтепродуктов",
    summary:
      "Поверхность похожа на тонкую радужную плёнку. Нужна срочная экспертная верификация.",
    risk: "critical",
    detected: ["радужный спектр", "плёнка на воде", "зона распространения"],
    nextStep: "Не прикасайтесь к воде и не используйте открытый огонь. Отправьте сигнал.",
  },
  wildlife: {
    title: "Животное требует наблюдения",
    summary:
      "В кадре возможен представитель морской фауны в неестественном положении у берега.",
    risk: "high",
    detected: ["морское животное", "береговая линия", "ограниченная активность"],
    nextStep: "Сохраняйте дистанцию не менее 20 метров и не пытайтесь перемещать животное.",
  },
  illegal_fishing: {
    title: "Возможное орудие незаконного лова",
    summary:
      "Обнаружены линейные структуры, похожие на оставленные сети или снасти.",
    risk: "high",
    detected: ["сетчатая структура", "прибрежная вода", "рыболовные снасти"],
    nextStep: "Не трогайте снасти. Зафиксируйте ориентиры и отправьте конфиденциальный сигнал.",
  },
  water: {
    title: "Аномальное состояние воды",
    summary:
      "Цвет и прозрачность воды отличаются от ожидаемого фонового состояния участка.",
    risk: "medium",
    detected: ["изменение цвета", "повышенная мутность", "локальная зона"],
    nextStep: "Снимите границу аномалии и не используйте воду до экспертной проверки.",
  },
};

function stableIndex(value: string, length: number): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash % length;
}

function inferCategory(uri: string): SignalCategory {
  const normalized = uri.toLowerCase();
  if (normalized.includes("oil")) return "oil";
  if (normalized.includes("seal") || normalized.includes("fish")) return "wildlife";
  if (normalized.includes("net")) return "illegal_fishing";
  if (normalized.includes("water")) return "water";

  const candidates: SignalCategory[] = ["plastic", "oil", "water", "wildlife"];
  return candidates[stableIndex(uri, candidates.length)];
}

export async function analyzeEvidence(
  imageUri: string,
  _coordinates: Coordinates,
): Promise<AnalysisResult> {
  if (REMOTE_AI_URL) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8_000);
      const response = await fetch(`${REMOTE_AI_URL}/vision/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUri }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (response.ok) {
        return (await response.json()) as AnalysisResult;
      }
    } catch {
      // The local demonstrator keeps the MVP usable when a backend is unavailable.
    }
  }

  await wait(1_050);
  const category = inferCategory(imageUri);
  const base = classification[category];
  const confidence = 0.82 + stableIndex(imageUri, 13) / 100;

  return {
    category,
    ...base,
    confidence: Math.min(confidence, 0.94),
    model: "local-demo",
  };
}

function localAssistantReply(question: string): string {
  const text = question.toLowerCase();

  if (text.includes("нефт") || text.includes("плён") || text.includes("плен")) {
    return "Не приближайтесь к пятну и не трогайте воду. Сделайте общий план, крупный план границы плёнки и кадр с ориентиром. В SAQSHY нажмите «Сканировать», включите геопозицию и отправьте сигнал. При резком запахе или угрозе людям отойдите на безопасное расстояние и звоните 112.";
  }
  if (text.includes("тюлен") || text.includes("живот") || text.includes("рыб")) {
    return "Сохраняйте дистанцию минимум 20 метров, уберите собак и не пытайтесь кормить или возвращать животное в воду. Снимайте без вспышки и зума ногами. Отметьте, движется ли оно и есть ли видимые травмы — это ускорит работу специалистов.";
  }
  if (text.includes("цветен") || text.includes("мутн") || text.includes("вод")) {
    return "Снимите воду при дневном свете с трёх ракурсов: общий план, граница аномалии и поверхность крупно. Цветение обычно образует зелёные или бурые скопления, но по фотографии нельзя подтвердить безопасность воды — нужна проба и лабораторный анализ.";
  }
  if (text.includes("фото") || text.includes("обращ") || text.includes("доказ")) {
    return "Хороший пакет содержит 3 вещи: общий план места, крупный план признака нарушения и ориентир, по которому можно найти точку. Не редактируйте оригинал. SAQSHY добавит координаты, время и SHA‑256 паспорт пакета.";
  }
  if (text.includes("пласт") || text.includes("мусор")) {
    return "Сначала оцените безопасность участка. Зафиксируйте масштаб и тип отходов, затем отправьте сигнал. Если нет стекла, химикатов и острых предметов, можно присоединиться к подтверждённой уборке из раздела «Вклад».";
  }

  return "Опишите, что вы видите, где это произошло и есть ли опасность людям или животным. Я помогу определить безопасные действия и собрать доказательства для экологического сигнала.";
}

export async function askAssistant(question: string): Promise<string> {
  if (REMOTE_AI_URL) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8_000);
      const response = await fetch(`${REMOTE_AI_URL}/assistant`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, locale: "ru-KZ" }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (response.ok) {
        const payload = (await response.json()) as { answer: string };
        if (payload.answer) return payload.answer;
      }
    } catch {
      // Continue with the offline knowledge base.
    }
  }

  await wait(520);
  return localAssistantReply(question);
}

