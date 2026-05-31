resource "google_compute_firewall" "k8s" {
  name    = "xambook-k8s-firewall"
  network = var.network_id

  allow {
    protocol = "tcp"

    ports = [
      "22",
      "80",
      "443",
      "6443",
      "10250",
      "2379-2380",
      "30000-32767"
    ]
  }

  allow {
    protocol = "icmp"
  }

  allow {
    protocol = "all"
  }

  source_ranges = [
    "10.10.0.0/24",
    "0.0.0.0/0"
  ]

  target_tags = ["k8s"]
}