# Internal node-to-node: everything within the subnet is trusted.
# Cilium's VXLAN/Geneve (UDP) is covered by the all-UDP rule.
resource "google_compute_firewall" "allow_internal" {
  name    = "xambook-allow-internal"
  network = google_compute_network.xambook_vpc.name

  allow {
    protocol = "tcp"
    ports    = ["0-65535"]
  }
  allow {
    protocol = "udp"
    ports    = ["0-65535"]
  }
  allow {
    protocol = "icmp"
  }

  source_ranges = ["10.0.0.0/24"]
}

# SSH ONLY to the control-plane, and only from your allowed range.
# With Cloudflare Tunnel there are NO public 80/443/6443 rules — nothing
# connects inbound from the internet; cloudflared dials out instead.
resource "google_compute_firewall" "allow_ssh_control_plane" {
  name    = "xambook-allow-ssh-cp"
  network = google_compute_network.xambook_vpc.name

  allow {
    protocol = "tcp"
    ports    = ["22"]
  }

  source_ranges = var.ssh_source_ranges
  target_tags   = ["xambook-control-plane"]
}
