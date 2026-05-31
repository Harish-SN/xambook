# Static external IPs
resource "google_compute_address" "control_plane_ip" {
  name   = "xambook-control-plane-ip"
  region = var.region
}

resource "google_compute_address" "worker_ip" {
  count  = var.worker_count
  name   = "xambook-worker-${count.index + 1}-ip"
  region = var.region
}

# Ceph data disks  (one raw, empty disk per node — consumed by Rook as an OSD)
# Index 0 belongs to the control-plane; 1..N belong to the workers.
resource "google_compute_disk" "ceph_data" {
  count = var.worker_count + 1
  name  = "xambook-ceph-data-${count.index}"
  type  = var.ceph_data_disk_type
  zone  = var.zone
  size  = var.ceph_data_disk_size
}

# Control Plane  (untainted by your kubeadm setup so it ALSO runs workloads
# and a Ceph OSD — this is node #1 of the 3-node Ceph cluster)
resource "google_compute_instance" "control_plane" {
  name           = "xambook-control-plane"
  machine_type   = var.machine_type
  zone           = var.zone
  can_ip_forward = true

  tags = ["xambook-control-plane"]

  boot_disk {
    initialize_params {
      image = "ubuntu-os-cloud/ubuntu-2204-lts"
      size  = var.disk_size
      type  = "pd-standard"
    }
  }
  # Raw disk for Ceph. Appears in-guest as /dev/disk/by-id/google-ceph-data
  attached_disk {
    source      = google_compute_disk.ceph_data[0].id
    device_name = "ceph-data"
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
    env  = "production"
  }
}

# Worker Nodes  (nodes #2..#N of the Ceph cluster)
resource "google_compute_instance" "worker" {
  count          = var.worker_count
  name           = "xambook-worker-${count.index + 1}"
  machine_type   = var.machine_type
  zone           = var.zone
  can_ip_forward = true

  tags = ["xambook-worker"]

  boot_disk {
    initialize_params {
      image = "ubuntu-os-cloud/ubuntu-2204-lts"
      size  = var.disk_size
      type  = "pd-standard"
    }
  }

  attached_disk {
    source      = google_compute_disk.ceph_data[count.index + 1].id
    device_name = "ceph-data"
  }

  network_interface {
    subnetwork = google_compute_subnetwork.xambook_subnet.id
    access_config {
      nat_ip = google_compute_address.worker_ip[count.index].address
    }
  }

  metadata = {
    ssh-keys = "ubuntu:${file("~/.ssh/id_rsa.pub")}"
  }

  labels = {
    role = "worker"
    env  = "production"
  }
}
