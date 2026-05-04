# use a standard python image
FROM python:3.13

# keep logs visible in the terminal so we can debug
ENV PYTHONUNBUFFERED=1

WORKDIR /app

COPY requirements.txt .

# install dependencies
RUN pip install -r requirements.txt

# dump the rest of the django code in
COPY . .

# run the server on 0.0.0.0 so docker actually exposes it
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]