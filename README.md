# Technical_Test_SysAdmin

Dokumentasi technical test SysAdmin meliputi:
- hardening server
- konfigurasi Nginx reverse proxy
- Docker
- CI/CD sederhana

> OS yang digunakan: **Ubuntu Server 24.04**

---



---
---

## TUGAS 1 – Hardening & Basic Server Setup

### 1. Login ke Server
```
ssh test01@103.171.*.* -p 2*
```

---

### 2. Membuat User Baru
Membuat user baru sebagai admin operasional dan memberikan akses sudo untuk administrasi sistem
```
sudo adduser devopsuser
sudo usermod -aG sudo devopsuser
```

---

### 3. Konfigurasi disable root login SSH
masuk ke file ssh config
```
sudo nano /etc/ssh/sshd_config
```

Ubah bagian dibawah menjadi no
```
# Authentication:

PermitRootLogin no
```

Lalu validasi dan reload SSH
```
sudo sshd -t
sudo systemctl reload ssh
```

Cek user yang sudah terdaftar/dibuat
```
grep -E "/bin/(bash|sh|zsh)$" /etc/passwd
```

---

### 4. Aktifkan Firewall
izinkan port ssh, http, dan https
```
sudo ufw allow 2*/tcp
sudo ufw allow 80
sudo ufw allow 443
```

Enable firewall
```
sudo ufw enable
```

Cek status firewall
```
sudo ufw status
```

---

### 5. Test Login User
lakukan di terminal baru
```
ssh devopsuser@103.171.*.* -p 2*
```

---


---
---

## TUGAS 2 - Web Server & Nginx Reverse Proxy

### 1. Install Nginx
```
sudo apt update
sudo apt install nginx -y
```

Enable dan membuat autostart service nginx
```
sudo systemctl enable nginx
sudo systemctl start nginx
```

Cek status nginx
```
sudo systemctl status nginx
```

Tes manual http nginx
```
curl http://127.0.0.1:80
```

---

### 2. Buat App Dummy
Copy Paste isi App Dummy ke /var/www/html/
```
sudo nano /var/www/html/index.html
```
```
sudo nano /var/www/html/style.css
```
```
sudo nano /var/www/html/script.js
```

---

## 3. Jalankan http.server + autostart
Buat automasi menggunakan systemd
```
sudo nano /etc/systemd/system/http-server.service
```

Isi dengan script berikut:
```
[Unit]
Description=Python HTTP Server Port 9000
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/html
ExecStart=/usr/bin/python3 -m http.server 9000 --bind 127.0.0.1
Restart=always

[Install]
WantedBy=multi-user.target

```

Reload systemd & mengaktifkan service
```
sudo systemctl daemon-reexec
```
```
sudo systemctl daemon-reload
```
```
sudo systemctl enable http-server.service
```
```
sudo systemctl start http-server.service
```

Cek status service
```
sudo systemctl status http-server.service
```

Tes manual http port 9000
```
curl http://127.0.0.1:9000
```

---

### 4. Konfigurasi Domain Lokal
Edit file hosts
```
sudo nano /etc/hosts
```

Menambahkan domain berikut:
```
10.242.19.200  devops.local
```

---

### 5. Konfigurasi Reverse Proxy Nginx
Buat file confignya
```
sudo nano /etc/nginx/sites-available/devops.local
```

isi dengan script berikut:
```
server {
    listen 80 default_server;
    server_name _;

    return 444;
}

server {
    listen 80;
    server_name devops.local;

    location / {
        proxy_pass http://127.0.0.1:9000;
        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

hapus file default config
```
sudo rm /etc/nginx/sites-enabled/default
```

Aktifkan configurasi
```
sudo ln -s /etc/nginx/sites-available/devops.local /etc/nginx/sites-enabled/
```
```
sudo nginx -t
```

Reload nginx
```
sudo systemctl reload nginx
```

---

### 6. Tes Manual Web service menggunakan IP, Localhost, dan Domain
Menggunakan IP Server
```
curl http://10.242.19.200:9000
```

Menggunakan localhost
```
curl http://localhost:9000
```

Menggunakan domain
```
curl http://devops.local
```



**Author:** Muhammad Ho’il Firmansyah  
**Project:** SysAdmin Technical Test  
**Version:** 1.0.0  
