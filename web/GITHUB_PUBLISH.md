# Публикация EcoQorgau в GitHub

Создайте пустой GitHub-репозиторий без автоматического README и откройте
терминал в папке проекта.

```bash
git init
git add .
git commit -m "feat: EcoQorgau Caspian Hackathon MVP"
git branch -M main
git remote add origin https://github.com/OWNER/REPOSITORY.git
git push -u origin main
```

После push дождитесь зелёного workflow `Validate EcoQorgau` во вкладке Actions.
Затем проверьте новый clone:

```bash
git clone https://github.com/OWNER/REPOSITORY.git
cd REPOSITORY
npm ci --no-audit --no-fund
npm run verify
```
