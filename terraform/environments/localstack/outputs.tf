output "s3_endpoint_url" {
  value = "http://localhost:4566"
}

output "s3_bucket_url" {
  # Link trực tiếp đến thư mục gốc của bucket
  value = "http://localhost:4566/${module.dev_backend_s3.bucket_id}"
}