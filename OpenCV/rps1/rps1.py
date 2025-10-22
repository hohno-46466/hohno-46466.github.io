import cv2
import mediapipe as mp
import numpy as np
import sys

# Mediapipe のセットアップ
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(static_image_mode=False, max_num_hands=1, min_detection_confidence=0.7)
mp_drawing = mp.solutions.drawing_utils

# 直前の出力と、手がカメラ内にあるかどうかの管理変数
previous_hand_shape = None
in_frame = False  # カメラ内に手があるかどうかを追跡

def judge_hand_shape(landmarks):
    """手の形を G, C, P のいずれかに分類する"""
    FINGERS_TIP_IDS = [4, 8, 12, 16, 20]
    FINGERS_ROOT_IDS = [3, 6, 10, 14, 18]
    fingers = []
    
    for tip_id, root_id in zip(FINGERS_TIP_IDS, FINGERS_ROOT_IDS):
        if tip_id == 4:  # 親指の特殊処理
            is_extended = landmarks[tip_id].x < landmarks[root_id].x
        else:
            is_extended = landmarks[tip_id].y < landmarks[root_id].y
        fingers.append(is_extended)

    if fingers.count(True) == 0:
        return "G"  # グー
    elif fingers.count(True) == 2 and fingers[1] and fingers[2]:
        return "C"  # チョキ
    elif fingers.count(True) == 5:
        return "P"  # パー
    else:
        return None  # 判定不能（Unknown の出力は不要）

# カメラのキャプチャ
cap = cv2.VideoCapture(0)

if not cap.isOpened():
    sys.stderr.write("カメラを開けませんでした。\n")
    sys.exit(1)

sys.stderr.write("カメラを起動中...\n")

try:
    while True:
        ret, frame = cap.read()
        if not ret:
            sys.stderr.write("カメラのフレームを読み取れませんでした。\n")
            break

        frame = cv2.flip(frame, 1)
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        result = hands.process(rgb_frame)

        if result.multi_hand_landmarks:
            in_frame = True  # 手がカメラ内にある
            for hand_landmarks in result.multi_hand_landmarks:
                landmarks = hand_landmarks.landmark
                hand_shape = judge_hand_shape(landmarks)

                if hand_shape and hand_shape != previous_hand_shape:
                    sys.stdout.write(f"{hand_shape}\n")
                    sys.stdout.flush()
                    previous_hand_shape = hand_shape

                mp_drawing.draw_landmarks(frame, hand_landmarks, mp_hands.HAND_CONNECTIONS)
        else:
            if in_frame:  # フレームアウト検出
                previous_hand_shape = None
                in_frame = False

        cv2.imshow("Rock-Paper-Scissors", frame)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

finally:
    cap.release()
    cv2.destroyAllWindows()
    hands.close()
