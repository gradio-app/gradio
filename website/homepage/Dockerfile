FROM python:3.8

RUN apt-get update
RUN curl -fsSL https://deb.nodesource.com/setup_14.x | bash -
RUN apt-get install -y nodejs
RUN npm install -g npm@latest
RUN apt-get --assume-yes install nginx libcairo2-dev pkg-config python3-dev
RUN pip install pandas matplotlib
RUN mkdir gradio
WORKDIR /gradio
COPY ./ui ./ui
RUN mkdir gradio
COPY ./gradio/version.txt ./gradio/version.txt
RUN npm i pnpm -g
WORKDIR /gradio/ui
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN pnpm i
RUN pnpm build
WORKDIR /gradio
COPY ./gradio ./gradio
COPY ./setup.py ./setup.py
COPY ./MANIFEST.in ./MANIFEST.in
RUN python setup.py install
WORKDIR /gradio
COPY ./website ./website
WORKDIR /gradio/website/homepage
RUN pip install -r requirements.txt
WORKDIR /gradio
COPY ./guides ./guides
COPY ./demo ./demo
WORKDIR /gradio/website/homepage
ARG COLAB_NOTEBOOK_LINKS
RUN mkdir -p generated dist
RUN echo $COLAB_NOTEBOOK_LINKS > generated/colab_links.json
RUN npm install
RUN npm run build
WORKDIR /usr/share/nginx/html
RUN rm -rf ./*
RUN mkdir ./gradio_static/
RUN cp -r /gradio/gradio/templates/frontend/. ./gradio_static/
RUN cp -r /gradio/website/homepage/dist/. ./
RUN cp /gradio/website/homepage/nginx.conf /etc/nginx/conf.d/default.conf

ENTRYPOINT ["nginx", "-g", "daemon off;"]

