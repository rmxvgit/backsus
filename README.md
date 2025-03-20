# Back SUS:

```
  Esse README tem por objetivo descrever as decisões de projeto
```

# Clonando e rodando o repositório:

```
  git clone <url do repositório>
```

dentro do repositório clonado, instale as dependências:
```
  npm install
```

crie um arquivo .env com a seguinte linha:
```
  DATABASE_URL="file:./dbs/dev.db"
```

realize a migração de database
```
  npx prisma migrate dev
```

por via das dúvidas, atualize o prisma client também
```
  npx prisma generate
```
