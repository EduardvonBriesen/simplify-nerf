FROM node:18-slim as builder
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
COPY . /app
WORKDIR /app

# Install Python alongside Node.js
RUN apt-get update && apt-get install -y python3 python3-pip

FROM builder AS prod-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

EXPOSE 5173
EXPOSE 3000

CMD ["pnpm", "dev"]


