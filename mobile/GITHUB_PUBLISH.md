# Публикация SAQSHY AI в GitHub

Архив подготовлен так, что `package.json` находится прямо в корне. Создайте на
GitHub пустой репозиторий **без** автоматического README, `.gitignore` и License,
затем откройте терминал в распакованной папке проекта.

```bash
git init
git add .
git commit -m "feat: SAQSHY AI hackathon MVP"
git branch -M main
git remote add origin https://github.com/OWNER/REPOSITORY.git
git push -u origin main
```

Замените `OWNER/REPOSITORY` на адрес вашей команды.

После push:

1. Откройте вкладку **Actions** и дождитесь зелёного `Validate Expo MVP`.
2. На вкладке **Code** убедитесь, что `package.json` виден в корне.
3. Откройте репозиторий в новой папке и повторите проверку:

```bash
git clone https://github.com/OWNER/REPOSITORY.git
cd REPOSITORY
npm ci --no-audit --no-fund
npm run verify
```

Не добавляйте в GitHub `node_modules`, `.env.local`, `.expo`, `.verify`, `ios`
или `android`: они уже исключены через `.gitignore`.
