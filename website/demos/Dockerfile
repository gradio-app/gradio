FROM python:3.8

RUN apt-get update
RUN apt-get --assume-yes install nginx
RUN mkdir gradio
WORKDIR /gradio
COPY ./ ./
WORKDIR /gradio/website/demos
RUN pip install -r requirements.txt
RUN pip install numpy matplotlib
RUN pip install gradio
RUN python map_demos.py
RUN cp nginx.conf /etc/nginx/conf.d/default.conf

ENTRYPOINT nginx && python run_demos.py
