# Проверка сборки

Дата проверки: 6 августа 2026 года.

## Автоматические проверки

| Проверка | Результат |
| --- | --- |
| Чистый `npm ci` | успешно, lockfile согласован |
| `npm run typecheck` | успешно, 0 TypeScript errors |
| `npm run expo:check` | dependencies are up to date |
| `npm run doctor` | 18/18 checks passed |
| iOS Metro export | успешно, 678 modules |
| Hermes iOS bundle | успешно, около 2.05 MB |
| Runtime assets | 3 файла, около 1.2 MB |
| `npm audit` | 0 уязвимостей |
| `npm run start:clear` | Metro запущен, `Waiting on http://localhost` |

Все проверки объединены в `npm run verify` и продублированы в GitHub Actions
workflow `.github/workflows/validate.yml`.

## Проверенные сценарии на уровне кода и bundle

- старт приложения и загрузка icon font;
- чтение onboarding-флага и локальных обращений;
- переключение пяти мобильных вкладок;
- запрос разрешений камеры, галереи и геопозиции;
- fallback координат при отказе в разрешении;
- offline AI-анализ и AI-ответы;
- SHA-256 формирование паспорта;
- сохранение обращения в AsyncStorage;
- отображение пользовательского сигнала на карте;
- cleanup таймеров и нативной анимации;
- production iOS bundle без ошибок импорта.

Финальная демонстрация камеры, системных разрешений и нативной карты должна
проводиться на физическом Android/iOS устройстве через актуальный Expo Go.
