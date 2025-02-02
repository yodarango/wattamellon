# Usa Node.js come immagine di base
FROM node:18

# Imposta la working directory nel container
WORKDIR /app

# Copia solo package.json e package-lock.json per sfruttare la cache Docker
COPY package*.json ./

# Installa le dipendenze, ma permetti all'utente di gestirle manualmente
RUN npm install || true  # Se vuoi che l'installazione fallita non interrompa la build

# Copia il resto del codice sorgente
COPY . .

# Espone la porta del server (cambia se necessario)
EXPOSE 3000

CMD ["sh", "-c", "npm run start"]


