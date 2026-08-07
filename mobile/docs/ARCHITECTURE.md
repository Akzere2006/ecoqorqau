# Архитектура SAQSHY AI

## MVP

```text
Expo Go app
├── Camera / Gallery
├── Location
├── Local AI fallback
├── SHA-256 evidence metadata
├── AsyncStorage report queue
├── Native MapView
└── AI assistant knowledge base
```

В MVP все критические функции имеют локальный fallback. Поэтому отсутствие сети,
backend или AI-ключа не блокирует защиту проекта.

## Production target

```text
Mobile app
   │ HTTPS + device attestation
API Gateway
   ├── Auth and rate limits
   ├── Evidence service ── Object Storage
   ├── AI orchestration ── Vision / LLM / deduplication
   ├── Geo service ─────── PostGIS
   ├── Workflow service ── Government integrations
   └── Notification service
            │
       Audit log + analytics warehouse
```

## Жизненный цикл сигнала

1. Пользователь создаёт фото и разрешает геопозицию.
2. On-device слой выполняет предварительную оценку и предупреждает об опасности.
3. Пакет получает время, координаты и локальный идентификатор целостности.
4. При наличии сети файл загружается через signed upload.
5. Backend хеширует исходные байты, выполняет vision-анализ и ищет дубликаты.
6. Сигнал маршрутизируется специалисту по территории и категории.
7. Решение и статус возвращаются пользователю и попадают в агрегированную карту.

## Почему архитектура масштабируется

- мобильный клиент не зависит от конкретного AI-провайдера;
- тип источника заложен в модели данных: community, sensor, satellite;
- геоданные естественно переносятся в PostgreSQL/PostGIS;
- offline queue позволяет работать на удалённых участках побережья;
- AI используется для triage, но финальная верификация остаётся у человека;
- сервисы можно внедрять поэтапно без переписывания мобильного интерфейса.

