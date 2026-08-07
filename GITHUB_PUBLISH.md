# Публикация на GitHub

Создайте пустой репозиторий без автоматически добавленного README, затем выполните из этой папки:

```bash
git init
git add .
git commit -m "Caspian Hackathon MVP"
git branch -M main
git remote add origin https://github.com/USERNAME/REPOSITORY.git
git push -u origin main
```

После push откройте вкладку **Actions**. Должны успешно завершиться две проверки: `Web` и `iOS`.

Не добавляйте в репозиторий `node_modules`, `.expo`, `dist` или `.verify` — они уже исключены через `.gitignore` и воспроизводятся из lock-файлов.
