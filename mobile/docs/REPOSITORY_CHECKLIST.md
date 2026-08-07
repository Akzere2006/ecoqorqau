# Repository readiness checklist

## Что находится в репозитории

- `package.json` и `package-lock.json` в корне;
- зафиксированный Expo SDK 54 и совместимые native dependencies;
- локально установленный `expo-doctor`, без плавающего `@latest`;
- GitHub Actions quality gate для каждого push и pull request;
- автономный demo-режим без секретов и обязательного backend;
- `.env.example` только с публичным URL backend, без ключей;
- MIT License и документация архитектуры/API.

## Команда полной проверки

```bash
npm ci --no-audit --no-fund
npm run verify
```

`verify` последовательно выполняет TypeScript, проверку совместимости Expo
пакетов, Expo Doctor и production export iOS bundle.

## Что намеренно не коммитится

- `node_modules`, кеши Expo/Metro и результаты export;
- `.env.local` и другие локальные переменные;
- сгенерированные папки `ios` и `android` managed-проекта;
- системные файлы редактора и временные логи.

## Перед отправкой ссылки жюри

1. Убедиться, что GitHub Actions завершился зелёным статусом.
2. На вкладке Code проверить, что `package.json` виден сразу в корне.
3. Выполнить запуск на физическом iPhone по `JURY_QUICK_START.md`.
4. Не выполнять `npm audit fix --force`: он меняет major-версию Expo.
