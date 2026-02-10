# ==============================
# rps2.py - カメラで両手の形を認識して
#           グー(G), チョキ(C), パー(P) を判定する python スクリプト
#
# Last update: 2026-02-09 JST
# ==============================

# (1) 使用するライブラリを読み込む
import cv2
import mediapipe as mp
import numpy as np
import sys

# (2) Mediapipe Hands モデルの準備
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(
    static_image_mode=False,
    max_num_hands=2,              # ★ 両手対応
    min_detection_confidence=0.7
)
mp_drawing = mp.solutions.drawing_utils

# (3) 前回の手の形（左右別）
previous_hand_shape = {"Left": None, "Right": None}

# =====================================
# 手の形（G, C, P）を判断する関数
# =====================================
def judge_hand_shape(landmarks, handedness_label):
    """
    landmarks: 21個の手の関節
    handedness_label: "Left" or "Right"
    """

    FINGERS_TIP_IDS  = [4, 8, 12, 16, 20]
    FINGERS_ROOT_IDS = [3, 6, 10, 14, 18]

    fingers = []

    for tip_id, root_id in zip(FINGERS_TIP_IDS, FINGERS_ROOT_IDS):
        # 親指（左右で x の判定が逆）
        if tip_id == 4:
            if handedness_label == "Right":
                is_extended = landmarks[tip_id].x < landmarks[root_id].x
            else:  # Left
                is_extended = landmarks[tip_id].x > landmarks[root_id].x
        else:
            is_extended = landmarks[tip_id].y < landmarks[root_id].y

        fingers.append(is_extended)

    if fingers.count(True) == 0:
        return "G"
    elif fingers.count(True) == 2 and fingers[1] and fingers[2]:
        return "C"
    elif fingers.count(True) == 5:
        return "P"
    else:
        return "X"

# ==============================
# カメラを起動
# ==============================

cap = cv2.VideoCapture(0)

cap.set(cv2.CAP_PROP_FOURCC, cv2.VideoWriter_fourcc(*"MJPG"))
cap.set(cv2.CAP_PROP_FRAME_WIDTH, 800)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 600)
cap.set(cv2.CAP_PROP_FPS, 30)

if not cap.isOpened():
    sys.stderr.write("カメラを開けませんでした。\n")
    sys.exit(1)

sys.stderr.write("カメラを起動中...\n")

# ==============================
# メインループ
# ==============================
try:
    while True:
        ret, frame = cap.read()
        if not ret:
            sys.stderr.write("フレームを読み取れませんでした。\n")
            break

        # 鏡表示
        frame = cv2.flip(frame, 1)

        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        result = hands.process(rgb_frame)

        if result.multi_hand_landmarks:
            current = {"Left": None, "Right": None}

            for i, hand_landmarks in enumerate(result.multi_hand_landmarks):
                handedness_label = result.multi_handedness[i].classification[0].label

                # 鏡表示による左右補正（必要なら）
                #if handedness_label == "Left":
                #    handedness_label = "Right"
                #else:
                #    handedness_label = "Left"

                hand_shape = judge_hand_shape(
                    hand_landmarks.landmark,
                    handedness_label
                )
                current[handedness_label] = hand_shape

                mp_drawing.draw_landmarks(
                    frame,
                    hand_landmarks,
                    mp_hands.HAND_CONNECTIONS
                )

            left_shape  = current["Left"]  if current["Left"]  else "-"
            right_shape = current["Right"] if current["Right"] else "-"

            if (current["Left"]  != previous_hand_shape["Left"] or
                current["Right"] != previous_hand_shape["Right"]):

                sys.stdout.write(f"{left_shape} {right_shape}\n")
                sys.stdout.flush()

                previous_hand_shape["Left"]  = current["Left"]
                previous_hand_shape["Right"] = current["Right"]

        else:
            previous_hand_shape["Left"]  = None
            previous_hand_shape["Right"] = None

        cv2.imshow("Rock-Paper-Scissors (Both Hands)", frame)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

# ==============================
# 終了処理
# ==============================
finally:
    cap.release()
    cv2.destroyAllWindows()
    hands.close()
