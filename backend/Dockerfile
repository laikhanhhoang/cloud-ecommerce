FROM python:3.11-slim

# BƯỚC 1: OS & BIẾN MÔI TRƯỜNG (Cố định nhất)
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1
    
WORKDIR /app

# BƯỚC 2: CÀI GÓI HỆ THỐNG (Rất ít khi đổi)
RUN apt-get update \ 
    && apt-get install -y --no-install-recommends build-essential libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# BƯỚC 3: TẠO USER/GROUP (Đưa lên đây là chuẩn bài!)
# Bước này nằm trên pip install vì nó hầu như không bao giờ thay đổi 
RUN addgroup --system django-user-group && \
    adduser --system --disabled-password --no-create-home --ingroup django-user-group django-user

# BƯỚC 4: DEPENDENCIES (Ít đổi)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# BƯỚC 5: SOURCE CODE (Đổi liên tục - Đặt cuối cùng)
COPY . .
RUN chown -R django-user:django-user-group /app

USER django-user

EXPOSE 8000

# 8. Lệnh chạy Gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "3", "--access-logfile", "-", "core.wsgi:application"]