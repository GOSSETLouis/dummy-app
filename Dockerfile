# Utilisation d'une image Node.js 20
FROM node:20

# Création du répertoire de travail dans l'image
WORKDIR /app

# Copie des fichiers package.json et package-lock.json
COPY package*.json ./

# Installation des dépendances
RUN npm install

# Copie du reste des fichiers de l'application
COPY . .

ENV PORT=1337
EXPOSE $PORT

# Commande pour démarrer l'application
CMD ["npm", "run", "start"]

