# Nova - Network of Virtual Agents

Includes a beautiful 3D visualization of your AI agents as stars orbiting a central point. Click on any agent star to zoom in and view their current status, thoughts, and focus areas.

![Cosmic UI Preview](assets/gif_nova.gif)
![ChatGPT UI Preview](preview_3.png)
![n8n Flow Preview](preview_4.png)

---

# 🚀 Hardware & Environment Specs: RPi 5 Touch Node

### 1. The Build (Hardware Profile)
* **Core Unit:** Raspberry Pi 5
    * **SoC:** Broadcom BCM2712 (2.4GHz Quad-Core ARM Cortex-A76).
    * **GPU:** VideoCore VII (OpenGL ES 3.1, Vulkan 1.2).
    * **I/O Controller:** RP1 (Dedicated silicon for USB, Ethernet, Camera, Display).
    * **Power Management:** Renesas DA9091 PMIC (Real-time clock + physical power button support).
* **Storage:** 128GB Amazon Basics MicroSDXC (Class A2, U3)
    * *Performance:* High IOPS (A2) for fast application loading; 100 MB/s read.

### 2. Visual Interface
* **Hardware:** DSI Touchscreen Display (ED-HMI3010-101C-0032).
* **Resolution:** 1280x800 (Native Landscape).
* **Connection Logic:**
    * Video: DSI Ribbon Cable (Port: `DSI-2`).
    * Touch: GPIO Jumper Wires.

---

# 🚀 NOVA Hardware: Complete Deployment Protocol

**Objective:** Zero-touch kiosk mode on Raspberry Pi 5.
**Target Directory:** `~/nova`

## 1. System Provisioning
Update core and install dependencies.

```bash
sudo apt update
sudo apt install chromium git -y
```

## 2. Deploy Codebase
Clone private repo using PAT token.

```bash
git clone [https://github.com/BenAttanasio/NOVA-Network-of-Virtual-Agents.git](https://github.com/BenAttanasio/NOVA-Network-of-Virtual-Agents.git) ~/nova
cd ~/nova
```

## 3. Configuration

**Rename Folder (If cloned as 'opus'):**
```bash
mv ~/opus ~/nova
```

**Add Webhook URL:**
```bash
nano ~/nova/config.js
# Paste real n8n URL over the placeholder
```

## 4. The "Self-Healing" Launch Script

**Path:** `~/nova/start_kiosk.sh`

```bash
#!/bin/bash
exec > /home/pi/nova/kiosk.log 2>&1
echo "--- Boot Run: $(date) ---"

cd /home/pi/nova

# Auto-Fix Case Sensitivity
if [ -f "Index.html" ]; then mv Index.html index.html; fi
if [ -f "Opus_Index.html" ]; then mv Opus_Index.html index.html; fi

# Auto-Generate Config
if [ ! -f "config.js" ]; then
    if [ -f "Config.template.js" ]; then cp Config.template.js config.js; fi
fi

# Start Server & Browser
echo "Starting System..."
python3 -m http.server 3000 &
sleep 5

chromium \
  --kiosk \
  --noerrdialogs \
  --enable-gpu-rasterization \
  --ignore-gpu-blocklist \
  http://localhost:3000/index.html
```

**Make executable:**
```bash
chmod +x ~/nova/start_kiosk.sh
```

## 5. Enable Autostart

**Create:** `~/.config/autostart/nova.desktop`

```ini
[Desktop Entry]
Type=Application
Name=NOVA Kiosk
Exec=/bin/bash /home/pi/nova/start_kiosk.sh
StartupNotify=false
Terminal=false
```

## 6. Maintenance Commands

* **Manual Kill:** `pkill chromium; pkill python`
* **Check Logs:** `cat ~/nova/kiosk.log`
* **Manual Run:** `DISPLAY=:0 bash ~/nova/start_kiosk.sh`

# How it was made
Solar UI with Opus 4.5
Everything else with Gemini 3.0 Pro