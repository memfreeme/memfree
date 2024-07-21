FROM searxng/searxng:latest

RUN mkdir -p /etc/searxng

COPY settings.yml /etc/searxng/settings.yml
COPY uwsgi.ini /etc/searxng/uwsgi.ini

ENV INSTANCE_NAME=searxng \
    SEARXNG_SETTINGS_PATH=/etc/searxng/settings.yml \
    UWSGI_SETTINGS_PATH=/etc/searxng/uwsgi.ini

CMD ["python3", "-m", "searxng"]
