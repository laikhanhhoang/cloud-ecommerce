resource "aws_s3_bucket" "this" {
  bucket = var.bucket_name
  tags = {
    Name        = var.bucket_name
    Environment = var.environment
  }
}

# Chặn mọi truy cập Public trực tiếp (An toàn tối đa)
resource "aws_s3_bucket_public_access_block" "this" {
  bucket = aws_s3_bucket.this.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Gán Policy tùy chỉnh (IAM)
resource "aws_s3_bucket_policy" "this" {
  count  = var.custom_policy_json != "" ? 1 : 0
  bucket = aws_s3_bucket.this.id
  policy = var.custom_policy_json
}

# Cấu hình CORS chung
resource "aws_s3_bucket_cors_configuration" "this" {
  bucket = aws_s3_bucket.this.id
  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT", "POST", "DELETE", "HEAD"]
    allowed_origins = ["*"]
    max_age_seconds = 3000
  }
}