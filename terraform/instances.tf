# Only the control-plane gets a public IP — for SSH administration.
# Workers are private (reach the internet via Cloud NAT). With Cloudflare
# Tunnel, nothing needs a public ingress IP at all.
resource "google_compute_address" "control_plane_ip" {
  name   = "xambook-control-plane-ip"
  region = var.region
}

# ---------------- Control Plane ----------------
resource "google_compute_instance" "control_plane" {
  name           = "xambook-control-plane"
  machine_type   = var.machine_type
  zone           = var.zone
  can_ip_forward = true
  tags           = ["xambook-control-plane"]

  boot_disk {
    initialize_params {
      image = "ubuntu-os-cloud/ubuntu-2204-lts"
      size  = var.disk_size
      type  = "pd-standard"
    }
  }

  network_interface {
    subnetwork = google_compute_subnetwork.xambook_subnet.id
    access_config {
      nat_ip = google_compute_address.control_plane_ip.address
    }
  }

  metadata = {
    ssh-keys = "ubuntu:${file("~/.ssh/id_rsa.pub")}"
  }

  labels = {
    role = "control-plane"
    env  = "learning"
  }
}

# ---------------- Workers (private, no external IP) ----------------
resource "google_compute_instance" "worker" {
  count          = var.worker_count
  name           = "xambook-worker-${count.index + 1}"
  machine_type   = var.machine_type
  zone           = var.zone
  can_ip_forward = true
  tags           = ["xambook-worker"]

  boot_disk {
    initialize_params {
      image = "ubuntu-os-cloud/ubuntu-2204-lts"
      size  = var.disk_size
      type  = "pd-standard"
    }
  }

  network_interface {
    subnetwork = google_compute_subnetwork.xambook_subnet.id
    # No access_config block => no external IP. Internet via Cloud NAT.
  }

  metadata = {
    ssh-keys = "ubuntu:${file("~/.ssh/id_rsa.pub")}"
  }

  labels = {
    role = "worker"
    env  = "learning"
  }
}