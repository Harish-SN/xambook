output "control_plane_ip" {
  value       = google_compute_address.control_plane_ip.address
  description = "Control plane public IP (SSH here to administer)"
}

output "worker_internal_ips" {
  value       = [for w in google_compute_instance.worker : w.network_interface[0].network_ip]
  description = "Worker private IPs (no public IP; reach via control-plane or internal network)"
}

output "ssh_command" {
  value       = "ssh ubuntu@${google_compute_address.control_plane_ip.address}"
  description = "How to reach the control-plane"
}