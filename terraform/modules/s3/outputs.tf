# Trả về ID của bucket (thường trùng với tên bucket)
output "bucket_id" {
  description = "The name of the bucket"
  value       = aws_s3_bucket.this.id
}

# Trả về ARN (Amazon Resource Name) - Rất quan trọng để viết IAM Policy cho các resource khác
output "bucket_arn" {
  description = "The ARN of the bucket"
  value       = aws_s3_bucket.this.arn
}

# Trả về Domain Name mặc định của S3
output "bucket_domain_name" {
  description = "The bucket domain name (e.g. my-bucket.s3.amazonaws.com)"
  value       = aws_s3_bucket.this.bucket_domain_name
}

# Trả về Regional Domain Name (Thường dùng cho CloudFront Origin)
output "bucket_regional_domain_name" {
  description = "The regional domain name of the bucket"
  value       = aws_s3_bucket.this.bucket_regional_domain_name
}