variable "project_id" {
  description = "GCP project ID"
  type        = string
}

variable "region" {
  description = "GCP region"
  type        = string
  default     = "asia-south1"
}

variable "zone" {
  description = "GCP zone"
  type        = string
  default     = "asia-south1-a"
}

variable "credentials_file" {
  description = "Path to GCP service account key"
  type        = string
  default     = "~/terraform-key.json"
}

variable "machine_type" {
  description = "Machine type for all nodes"
  type        = string
  default     = "e2-medium"
}

variable "disk_size" {
  description = "Boot disk size in GB (also holds local-path PVC data)"
  type        = number
  default     = 20
}

variable "worker_count" {
  description = "Number of workers. With the control-plane this is (worker_count + 1) nodes total."
  type        = number
  default     = 2
}

variable "ssh_source_ranges" {
  description = "CIDRs allowed to SSH to the control-plane. Lock this to your IP for safety."
  type        = list(string)
  default     = ["0.0.0.0/0"] # CHANGE to ["YOUR.IP.ADDR.ESS/32"] for real security
}
