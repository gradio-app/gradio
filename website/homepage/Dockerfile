FROM python:3.8

RUN apt-get update
RUN apt-get --assume-yes install npm nginx
RUN pip install pandas matplotlib
RUN mkdir gradio
WORKDIR /gradio
COPY ./frontend ./frontend
RUN mkdir gradio
COPY ./gradio/version.txt ./gradio/version.txt
WORKDIR /gradio/frontend
RUN npm install
RUN npm run build
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
