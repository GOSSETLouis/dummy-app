# Utilisation d'une image Node.js 20
FROM node:20

ARG USERNAME=user
ARG USER_UID=1010
ARG USER_GID=$USER_UID

RUN apt-get update \ 
  && apt-get install -y sudo


# Create the user
RUN groupadd --gid $USER_GID $USERNAME \
    && useradd --uid $USER_UID --gid $USER_GID -m $USERNAME \
    #
    # [Optional] Add sudo support. Omit if you don't need to install software after connecting.
    && apt-get update \
    && apt-get install -y sudo \
    && echo $USERNAME ALL=\(root\) NOPASSWD:ALL > /etc/sudoers.d/$USERNAME \
    && chmod 0440 /etc/sudoers.d/$USERNAME

USER $USERNAME
# Création du répertoire de travail dans l'image
WORKDIR /app

# Copie des fichiers package.json et package-lock.json
COPY package*.json ./

# Installation des dépendances
RUN sudo -S npm install

# Copie du reste des fichiers de l'application
COPY . .

ENV PORT=1337
EXPOSE $PORT

# Commande pour démarrer l'application
CMD ["npm", "run", "start"]

