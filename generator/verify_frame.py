"""Проверка совпадения размера кадра Python и Go (136 байт)."""
import struct

FRAME_FMT = "<d I 4B 27f 3I"
assert struct.calcsize(FRAME_FMT) == 136
print("OK: frame size 136 bytes")
