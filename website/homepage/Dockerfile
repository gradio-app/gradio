FROM python:latest

ARG COLAB_NOTEBOOK_LINKS
RUN apt-get update
RUN apt-get --assume-yes install npm nginx
RUN mkdir gradio
WORKDIR /gradio
COPY ./ ./
WORKDIR /gradio/frontend
RUN npm install
RUN npm run build
WORKDIR /gradio
RUN pip install pandas matplotlib
RUN python setup.py install
WORKDIR /gradio/website/homepage
RUN pip install -r requirements.txt
RUN echo $COLAB_NOTEBOOK_LINKS > generated/colab_links.json
RUN npm install
RUN npm run build
WORKDIR /usr/share/nginx/html
RUN rm -rf ./*
RUN cp -r /gradio/gradio/templates/frontend/static ./gradio_static
RUN cp -r /gradio/website/homepage/dist/. ./
RUN cp /gradio/website/homepage/nginx.conf /etc/nginx/conf.d/default.conf

ENTRYPOINT ["nginx", "-g", "daemon off;"]
