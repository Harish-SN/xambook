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
  description = "GCP machine type for all nodes"
  type        = string
  default     = "e2-medium"
}

variable "disk_size" {
  description = "Boot disk size in GB"
  type        = number
  default     = 20
}

variable "worker_count" {
  description = "Number of worker nodes. With the control-plane this gives (worker_count + 1) nodes total."
  type        = number
  default     = 2 # control-plane + 2 workers = 3 nodes that all run Ceph OSDs
}

variable "ceph_data_disk_size" {
  description = "Size (GB) of the raw, empty data disk attached to each node for Ceph OSDs. Must NOT be the boot disk."
  type        = number
  default     = 50
}

variable "ceph_data_disk_type" {
  description = "Disk type for the Ceph data disks. pd-balanced is a good price/perf default; pd-standard is cheapest but slow."
  type        = string
  default     = "pd-balanced"
}