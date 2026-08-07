# Проверка репозитория

Дата проверки: 7 августа 2026 года.

| Проверка | Результат |
| --- | --- |
| Чистый `npm ci` | успешно |
| ESLint | 0 ошибок |
| TypeScript | 0 ошибок |
| Production build | успешно |
| Worker artifact | `default.fetch` присутствует |
| Rendered HTML test | 1/1 passed |
| `npm audit` | 0 уязвимостей |
| Browser QA | карта, форма, роли, журнал и аналитика работают |
| Console приложения | 0 ошибок |

Полная команда проверки:

```bash
npm ci --no-audit --no-fund
npm run verify
```

GitHub Actions выполняет тот же набор проверок на Node.js 22 LTS.
