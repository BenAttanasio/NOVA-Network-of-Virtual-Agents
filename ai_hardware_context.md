# 🚀 Hardware & Environment Specs: RPi 5 Touch Node

## 1. The Build (Hardware Profile)
* **Core Unit:** Raspberry Pi 5
    * **SoC:** Broadcom BCM2712 (2.4GHz Quad-Core ARM Cortex-A76).
    * **GPU:** VideoCore VII (OpenGL ES 3.1, Vulkan 1.2).
    * **I/O Controller:** RP1 (Dedicated silicon for USB, Ethernet, Camera, Display).
    * **Power Management:** Renesas DA9091 PMIC (Real-time clock + physical power button support).
* **Storage:** 128GB Amazon Basics MicroSDXC (Class A2, U3)
    * *Performance:* High IOPS (A2) for fast application loading; 100 MB/s read.

## 2. Visual Interface
* **Hardware:** DSI Touchscreen Display.
* **Resolution:** 1280x800 (Native Landscape).
* **Connection Logic:**
    * Video: DSI Ribbon Cable (Port: `DSI-2`).
    * Touch: GPIO Jumper Wires.

## 3. Access Protocol
* **Hostname:** `raspberrypi.local`
* **Default User:** `pi`
* **App Deployment:** Port 3000 (`http://raspberrypi.local:3000`)

## 4. Command Center (CLI)

### Resetting Connection (If you re-imaged the SD card)
Run this on your main computer to clear old host keys and avoid security warnings:
```bash
ssh-keygen -R raspberrypi.local