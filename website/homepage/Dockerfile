FROM python:3.8

RUN apt-get update
RUN curl -fsSL https://deb.nodesource.com/setup_14.x | bash -
RUN apt-get install -y nodejs jq
RUN npm install -g npm@latest
RUN apt-get --assume-yes install nginx
RUN mkdir gradio
WORKDIR /gradio
COPY ./ui ./ui
RUN mkdir gradio
COPY ./gradio/version.txt ./gradio/version.txt
RUN npm i pnpm@6 -g
WORKDIR /gradio/ui
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN pnpm i
RUN pnpm build
RUN pnpm build:website
WORKDIR /gradio
COPY ./gradio ./gradio
COPY ./requirements.txt ./requirements.txt
COPY ./pyproject.toml ./pyproject.toml
COPY ./README.md ./README.md
COPY ./test ./test
RUN pip install .
WORKDIR /gradio
COPY ./website ./website
WORKDIR /gradio/website/homepage
RUN pip install -r requirements.txt
WORKDIR /gradio
COPY ./guides ./guides
COPY ./demo ./demo
WORKDIR /gradio/website/homepage
RUN npm install
RUN npm run build
ARG AUTH_TOKEN
ENV AUTH_TOKEN $AUTH_TOKEN
RUN python upload_demos.py
WORKDIR /usr/share/nginx/html
RUN rm -rf ./*
RUN cp -r /gradio/gradio/templates/cdn/assets/. ./assets/
RUN cp -r /gradio/website/homepage/build/. ./
RUN ASSETS_FILE=$(grep -oE index.[a-z0-9]+.js /gradio/gradio/templates/cdn/index.html) && find ./ -type f -exec sed -i -e "s/index.js/${ASSETS_FILE}/g" {} \;
RUN cp /gradio/website/homepage/nginx.conf /etc/nginx/conf.d/default.conf

ENTRYPOINT ["nginx", "-g", "daemon off;"]
