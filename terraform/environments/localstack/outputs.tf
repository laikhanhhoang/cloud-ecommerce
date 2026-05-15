# --------------------------------------------
# FRONTEND Outputs
# ---------------------------------------------

output "frontend_s3_bucket_name" {
  value = module.dev_frontend_s3.bucket_id
}

output "frontend_s3_url" {
  value = "http://localhost:4566/${module.dev_frontend_s3.bucket_id}"
}

output "frontend_s3_website_url" {
  value = "http://${module.dev_frontend_s3.bucket_id}.s3-website.localhost.localstack.cloud:4566"
}

output "frontend_s3_regional_domain_name" {
  value = module.dev_frontend_s3.bucket_regional_domain_name
}

output "frontend_s3_access_key" {
  value     = aws_iam_access_key.frontend_s3_key.id
}

output "frontend_s3_secret_key" {
  value     = aws_iam_access_key.frontend_s3_key.secret
  sensitive = true
}

# --------------------------------------------
# BACKEND Outputs
# ---------------------------------------------

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