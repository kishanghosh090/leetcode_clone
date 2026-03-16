# Judge0 Self-Hosted Setup (Docker) – Quick Reference

This document summarizes the steps required to run **Judge0 v1.13.1** on a VPS using Docker.

---

# 1. Prerequisites

Server requirements:

* Linux VPS (Ubuntu recommended)
* Docker
* Docker Compose
* Root or sudo access

Install Docker if needed:

```bash
sudo apt update
sudo apt install docker.io docker-compose -y
sudo systemctl enable docker
sudo systemctl start docker
```

---

# 2. Clone Judge0

```bash
git clone https://github.com/judge0/judge0.git
cd judge0
git checkout v1.13.1
```

Or create the folder manually if using custom files.

---

# 3. Project Structure

```
judge0-v1.13.1
│
├── docker-compose.yml
└── judge0.conf
```

---

# 4. docker-compose.yml

```yaml
x-logging:
  &default-logging
  logging:
    driver: json-file
    options:
      max-size: 100M

services:
  server:
    image: judge0/judge0:1.13.1
    env_file: judge0.conf
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    ports:
      - "2358:2358"
    privileged: true
    <<: *default-logging
    restart: always

  workers:
    image: judge0/judge0:1.13.1
    command: ["./scripts/workers"]
    env_file: judge0.conf
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    privileged: true
    <<: *default-logging
    restart: always

  db:
    image: postgres:16.2
    env_file: judge0.conf
    volumes:
      - data:/var/lib/postgresql/data/
    <<: *default-logging
    restart: always

  redis:
    image: redis:7.2.4
    command: [
      "bash","-c",
      "docker-entrypoint.sh --appendonly no --requirepass $$REDIS_PASSWORD"
    ]
    env_file: judge0.conf
    <<: *default-logging
    restart: always

volumes:
  data:
```

---

# 5. judge0.conf

```env
PORT=2358

POSTGRES_HOST=db
POSTGRES_PORT=5432
POSTGRES_DB=judge0
POSTGRES_USER=judge0
POSTGRES_PASSWORD=1234567890

REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=1234

COUNT=4
INTERVAL=0.1

CPU_TIME_LIMIT=2
CPU_EXTRA_TIME=0.5
WALL_TIME_LIMIT=5

STACK_LIMIT=64000
MAX_PROCESSES_AND_OR_THREADS=60

ENABLE_WAIT_RESULT=true
ENABLE_BATCHED_SUBMISSIONS=true
ENABLE_SUBMISSION_DELETE=true

ALLOW_ENABLE_NETWORK=true
ENABLE_NETWORK=false

ENABLE_PER_PROCESS_AND_THREAD_MEMORY_LIMIT=false

RAILS_ENV=production
RAILS_MAX_THREADS=2
RAILS_SERVER_PROCESSES=2
```

---

# 6. Fix Required for Modern Linux (cgroup v2 → v1)

Judge0's sandbox (`isolate`) requires **cgroup v1**.

Check current cgroup version:

```bash
stat -fc %T /sys/fs/cgroup
```

If output is:

```
cgroup2fs
```

Switch to cgroup v1.

Edit GRUB:

```bash
sudo nano /etc/default/grub
```

Change:

```
GRUB_CMDLINE_LINUX=""
```

to

```
GRUB_CMDLINE_LINUX="systemd.unified_cgroup_hierarchy=0"
```

Update GRUB:

```bash
sudo update-grub
```

Reboot:

```bash
sudo reboot
```

---

# 7. Start Judge0

```bash
docker compose up -d
```

Check containers:

```bash
docker ps
```

---

# 8. Test API

List supported languages:

```bash
curl http://localhost:2358/languages
```

Run a Python program:

```bash
curl -X POST "http://localhost:2358/submissions/?wait=true" \
-H "Content-Type: application/json" \
-d '{
"source_code": "print(\"Hello\")",
"language_id": 71
}'
```

Expected output:

```json
{
 "stdout": "Hello\n",
 "status": {
   "id": 3,
   "description": "Accepted"
 }
}
```

---

# 9. Judge0 Architecture

```
Client
   ↓
Judge0 API (Rails)
   ↓
Redis Queue
   ↓
Worker Containers
   ↓
Isolate Sandbox
   ↓
Language Runtime
```

Each submission runs inside an isolated sandbox for security.

---

# 10. Useful Commands

View logs:

```bash
docker logs judge0-v1131-server-1
docker logs judge0-v1131-workers-1
```

Restart stack:

```bash
docker compose restart
```

Stop stack:

```bash
docker compose down
```

---

# 11. Default API Endpoint

```
http://SERVER_IP:2358
```

Example:

```
http://YOUR_SERVER_IP:2358/languages
```

---

# Done

Your Judge0 instance is now ready to be integrated with your backend or frontend application.
