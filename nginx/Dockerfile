FROM nginx:1.25-alpine

# Xóa cấu hình mặc định và copy cấu hình của mình vào
RUN rm /etc/nginx/conf.d/default.conf
COPY default.conf /etc/nginx/conf.d/