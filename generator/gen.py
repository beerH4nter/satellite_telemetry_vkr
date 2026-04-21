import socket
import struct
import time
import math
import random

HOST = "127.0.0.1"
PORT = 9000

sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
sock.connect((HOST, PORT))

angle = 0.0

velocity = 7.67  # км/с (примерно орбитальная)
altitude = 400.0

roll = 0.0
pitch = 0.0
yaw = 0.0

temp_avg = 20.0
temp_sun = 40.0
temp_shadow = -10.0

while True:
    onboard_time = time.time()

    # ===== ОРБИТА =====
    angle += 0.01
    latitude = math.sin(angle) * 51.6
    longitude = (angle * 180 / math.pi) % 360 - 180

    # ===== ОРИЕНТАЦИЯ (ПЛАВНО) =====
    roll += random.uniform(-0.05, 0.05)
    pitch += random.uniform(-0.05, 0.05)
    yaw += 0.2  # вращение вокруг оси
    yaw = yaw % 360

   # ===== ТЕМПЕРАТУРА (СТАБИЛЬНАЯ МОДЕЛЬ) =====

    BASE_TEMP = 20.0        # равновесие
    THERMAL_INERTIA = 0.02 # насколько быстро возвращаемся
    SUN_AMPLITUDE = 25

    sun_factor = abs(math.cos(math.radians(yaw)))

    # возврат к базовой температуре
    temp_avg += (BASE_TEMP - temp_avg) * THERMAL_INERTIA

    # небольшие шумы
    temp_avg += random.uniform(-0.05, 0.05)

    temp_sun = temp_avg + sun_factor * SUN_AMPLITUDE
    temp_shadow = temp_avg - sun_factor * (SUN_AMPLITUDE * 0.8)


    payload = struct.pack(
        "<d f f f f f f f f f f",
        onboard_time,
        velocity,
        roll, pitch, yaw,
        temp_avg, temp_sun, temp_shadow,
        latitude, longitude, altitude
    )

    sock.sendall(payload)
    time.sleep(2)
