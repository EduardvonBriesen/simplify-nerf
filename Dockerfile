FROM dromni/nerfstudio:1.0.2

# Apply patches
COPY patches /tmp/patches
RUN sudo patch -d /home/user/nerfstudio -p1 < /tmp/patches/nerfstudio.patch

# Install essential packages and dependencies 
RUN sudo apt remove -y libnode-dev libnode72:amd64
RUN sudo apt update && \
  sudo apt install -y curl && \
  curl -fsSL https://deb.nodesource.com/setup_18.x | sudo bash - && \
  sudo apt install -y nodejs && \
  sudo npm install -g pnpm

COPY . /app

RUN sudo chown -R $USER:$USER /workspace
RUN sudo chown -R $USER:$USER /app

WORKDIR /app
RUN sudo pnpm install --frozen-lockfile
RUN sudo pnpm run build:prod

CMD ["pnpm", "run", "start:prod"]