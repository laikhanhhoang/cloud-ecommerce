output "backend_s3_endpoint_url" {
  value = "http://localhost:4566"
}

output "backend_s3_url" {
  # Link trực tiếp đến thư mục gốc của bucket
  value = "http://localhost:4566/${module.dev_backend_s3.bucket_id}"
}

output "backend_s3_bucket_name" {
  value = module.dev_backend_s3.bucket_id
}

output "backend_s3_access_key" {
  value     = aws_iam_access_key.backend_s3_key.id
}

output "backend_s3_secret_key" {
  value     = aws_iam_access_key.backend_s3_key.secret
  sensitive = true
}