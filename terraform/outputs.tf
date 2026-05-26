output "control_plane_ip" {
  value       = google_compute_address.control_plane_ip.address
  description = "Control plane public IP"
}

output "worker_ip" {
  value       = google_compute_address.worker_ip.address
  description = "Worker node public IP"
}