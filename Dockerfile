FROM dromni/nerfstudio:0.3.4

# Install essential packages and dependencies 
RUN sudo apt remove -y libnode-dev libnode72:amd64
RUN sudo apt update && \
  sudo apt install -y curl && \
  curl -fsSL https://deb.nodesource.com/setup_18.x | sudo bash - && \
  sudo apt install -y nodejs && \
  sudo npm install -g pnpm

COPY . /app
WORKDIR /app
RUN sudo pnpm install --frozen-lockfile

WORKDIR /workspace

RUN sudo chown -R $USER:$USER /workspace
RUN sudo chown -R $USER:$USER /app

CMD /bin/bash -l
