# EcoQorgau + SAQSHY AI

Готовый к загрузке на GitHub репозиторий для Caspian Hackathon. Внутри находятся два самостоятельных продукта:

| Папка | Продукт | Запуск |
| --- | --- | --- |
| [`web/`](web/) | EcoQorgau — адаптивная PWA-платформа экологического контроля с картой, реестром, ролями и аналитикой | `npm run start:web` |
| [`mobile/`](mobile/) | SAQSHY AI — отдельное мобильное приложение для iPhone на Expo SDK 54 с ИИ-помощником | `npm run start:mobile` |

## Быстрый старт из корня

Требуется Node.js 22 LTS или установленный у вас Node.js 24 и npm 10+.

```bash
npm ci --no-audit --no-fund
npm run verify
```

Первая команда устанавливает зафиксированные зависимости обоих проектов. Вторая повторяет полную проверку GitHub Actions: линтер, TypeScript, web production build, HTML-тест, Expo compatibility, Expo Doctor и production iOS bundle.

### Запуск сайта

```bash
npm run start:web
```

Откройте адрес из терминала, обычно `http://localhost:5173`.

### Запуск приложения на iPhone через Expo Go

```bash
npm run start:mobile
```

1. Установите или обновите **Expo Go** из App Store.
2. iPhone и компьютер подключите к одной Wi-Fi сети.
3. Отсканируйте QR-код камерой iPhone.
4. Если локальная сеть блокирует подключение, остановите сервер и выполните `npm run start:mobile:tunnel`.

## Проверка через GitHub

После загрузки репозитория workflow [`.github/workflows/validate.yml`](.github/workflows/validate.yml) запускает два независимых job:

- **Web** — ESLint, TypeScript, production build, проверка artifact и HTML-тест;
- **Mobile** — TypeScript, совместимость Expo-пакетов, Expo Doctor и экспорт iOS bundle.

Красная ошибка в одном продукте не скрывается проверкой другого. Lock-файлы находятся внутри `web/` и `mobile/`, поэтому установка воспроизводима.

## Полезные команды

```bash
npm run verify          # проверить оба проекта
npm run verify:web      # проверить только сайт
npm run verify:mobile   # проверить только приложение
npm run audit           # проверить зависимости обоих проектов
npm run build           # production-сборка сайта
npm start               # собрать и запустить production-сайт
```

Подробная документация, архитектура и сценарии защиты находятся в README и папке `docs` каждого проекта.

## Перед отправкой жюри

1. Загрузите **содержимое этой папки** в корень GitHub-репозитория.
2. Убедитесь, что в Actions появились зелёные job `Web` и `iOS`.
3. Для демонстрации откройте сайт и Expo-приложение в двух терминалах.
4. Карта использует интернет-подложки; остальные ключевые MVP-сценарии имеют локальные демонстрационные данные.

Подробный маршрут проверки: [`JURY_QUICK_START.md`](JURY_QUICK_START.md).
