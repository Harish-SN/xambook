terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  credentials = file(pathexpand(var.credentials_file))
  project     = var.project_id
  region      = var.region
  zone        = var.zone
}

# ── VPC Network ──────────────────────────────────────────────
resource "google_compute_network" "xambook_vpc" {
  name                    = "xambook-vpc"
  auto_create_subnetworks = false
}

resource "google_compute_subnetwork" "xambook_subnet" {
  name          = "xambook-subnet"
  ip_cidr_range = "10.0.0.0/24"
  region        = var.region
  network       = google_compute_network.xambook_vpc.id
}

# ── Firewall Rules ───────────────────────────────────────────
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

resource "google_compute_firewall" "allow_external" {
  name    = "xambook-allow-external"
  network = google_compute_network.xambook_vpc.name

  allow {
    protocol = "tcp"
    ports = ["22", "80", "443", "6443", "30080", "30443", "31061", "31050"]
  }

  source_ranges = ["0.0.0.0/0"]
}

# ── Static IPs ───────────────────────────────────────────────
resource "google_compute_address" "app_server_ip" {
  name   = "xambook-app-server-ip"
  region = var.region
}

resource "google_compute_address" "data_server_ip" {
  name   = "xambook-data-server-ip"
  region = var.region
}

# ── App Server (Control Plane + App) ─────────────────────────
resource "google_compute_instance" "app_server" {
  name         = "xambook-app-server"
  machine_type = "e2-medium"
  zone         = var.zone

  tags = ["xambook-app"]

  boot_disk {
    initialize_params {
      image = "ubuntu-os-cloud/ubuntu-2204-lts"
      size  = 15
      type  = "pd-standard"
    }
  }

  network_interface {
    subnetwork = google_compute_subnetwork.xambook_subnet.id
    access_config {
      nat_ip = google_compute_address.app_server_ip.address
    }
  }

  metadata = {
    ssh-keys = "ubuntu:${file("~/.ssh/id_rsa.pub")}"
  }

  labels = {
    role = "app"
    env  = "production"
  }
}

# ── Data Server (PostgreSQL + MinIO) ─────────────────────────
resource "google_compute_instance" "data_server" {
  name         = "xambook-data-server"
  machine_type = "e2-medium"
  zone         = var.zone

  tags = ["xambook-data"]

  boot_disk {
    initialize_params {
      image = "ubuntu-os-cloud/ubuntu-2204-lts"
      size  = 15
      type  = "pd-standard"
    }
  }

  network_interface {
    subnetwork = google_compute_subnetwork.xambook_subnet.id
    access_config {
      nat_ip = google_compute_address.data_server_ip.address
    }
  }

  metadata = {
    ssh-keys = "ubuntu:${file("~/.ssh/id_rsa.pub")}"
  }

  labels = {
    role = "data"
    env  = "production"
  }
}