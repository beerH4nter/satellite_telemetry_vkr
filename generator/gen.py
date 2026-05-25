"""
Генератор полной телеметрии (136 байт/кадр) в духе учебных CubeSat (SWSU-55 / OrbiCraft).
Упрощённый режим на сайте получает подмножество полей на сервере.
"""
import socket
import struct
import time
import math
import random

HOST = "127.0.0.1"
PORT = 9000

# <d I 4B 27f 3I — должен совпадать с back/internal/processor/full.go
FRAME_FMT = "<d I 4B 27f 3I"
FRAME_SIZE = struct.calcsize(FRAME_FMT)

sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
sock.connect((HOST, PORT))

angle = 0.0
packet_counter = 0
uptime = 0
command_count = 0

velocity = 7.67
altitude = 491.0

roll = 0.0
pitch = 0.0
yaw = 0.0

temp_avg = 20.0
temp_sun = 40.0
temp_shadow = -10.0

battery_soc = 88.0
battery_voltage = 7.8
battery_current = -120.0

print(f"Connected. Frame size: {FRAME_SIZE} bytes")

while True:
    onboard_time = time.time()
    packet_counter += 1
    uptime += 2
    if random.random() < 0.02:
        command_count += 1

    frame_type = 0x01  # TM housekeeping
    mode = 0x02 if abs(math.sin(angle)) > 0.3 else 0x01  # 1=safe, 2=nominal
    crc_ok = 1

    # Орбита (НОО ~500 км, как у SAKHACUBE-CHOLBON)
    angle += 0.012
    latitude = math.sin(angle) * 51.6
    longitude = (angle * 180 / math.pi) % 360 - 180

    roll += random.uniform(-0.08, 0.08)
    pitch += random.uniform(-0.08, 0.08)
    yaw = (yaw + 0.25) % 360

    BASE_TEMP = 22.0
    THERMAL_INERTIA = 0.03
    SUN_AMPLITUDE = 28
    sun_factor = abs(math.cos(math.radians(yaw)))
    temp_avg += (BASE_TEMP - temp_avg) * THERMAL_INERTIA
    temp_avg += random.uniform(-0.08, 0.08)
    temp_sun = temp_avg + sun_factor * SUN_AMPLITUDE
    temp_shadow = temp_avg - sun_factor * (SUN_AMPLITUDE * 0.75)

    in_sun = sun_factor > 0.35
    solar_voltage = 4.9 if in_sun else 0.2
    solar_current = 280.0 * sun_factor if in_sun else 5.0
    battery_current = -150.0 + solar_current * 0.4
    battery_voltage = 7.2 + (battery_soc / 100.0) * 1.0
    battery_soc = max(5.0, min(100.0, battery_soc - 0.002 + solar_current * 0.00005))

    gyro_x = math.sin(angle * 2) * 2.5 + random.uniform(-0.1, 0.1)
    gyro_y = math.cos(angle * 1.5) * 1.8 + random.uniform(-0.1, 0.1)
    gyro_z = 0.15 + random.uniform(-0.05, 0.05)

    # Магнитометр (полезная нагрузка, µT)
    mag_x = 22.0 * math.cos(math.radians(yaw)) + random.uniform(-0.5, 0.5)
    mag_y = 22.0 * math.sin(math.radians(yaw)) + random.uniform(-0.5, 0.5)
    mag_z = 42.0 + random.uniform(-0.5, 0.5)

    accel_x = random.uniform(-0.02, 0.02)
    accel_y = random.uniform(-0.02, 0.02)
    accel_z = -9.78 + random.uniform(-0.03, 0.03)

    cpu_temp = temp_avg + 8.0 + random.uniform(-0.5, 0.5)
    radio_rssi = -95.0 + random.uniform(-3, 3) + (10 if in_sun else 0)
    radio_tx_power = 27.0 if in_sun else 23.0

    status_flags = (1 if in_sun else 0) | (2 if mode == 0x02 else 0) | (4 if battery_soc < 20 else 0)

    payload = struct.pack(
        FRAME_FMT,
        onboard_time,
        packet_counter,
        frame_type,
        mode,
        crc_ok,
        0,  # reserved
        velocity,
        roll,
        pitch,
        yaw,
        temp_avg,
        temp_sun,
        temp_shadow,
        latitude,
        longitude,
        altitude,
        battery_voltage,
        battery_current,
        battery_soc,
        solar_current,
        solar_voltage,
        gyro_x,
        gyro_y,
        gyro_z,
        mag_x,
        mag_y,
        mag_z,
        accel_x,
        accel_y,
        accel_z,
        cpu_temp,
        radio_rssi,
        radio_tx_power,
        uptime,
        command_count,
        status_flags,
    )
    assert len(payload) == FRAME_SIZE

    sock.sendall(payload)
    time.sleep(2)
