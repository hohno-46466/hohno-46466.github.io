# ==============================
# rps.py - カメラで手の形を認識して
#          グー(G), チョキ(C), パー(P) を判定する python スクリプト
#
# Prev update: 2025-10-22(Wed) 12:19 JST / 2025-10-22(Wed) 03:19 UTC by hohno_at_kuimc
# Prev update: 2025-10-22(Wed) 23:46 JST / 2025-10-22(Wed) 14:46 UTC by hohno_at_kuimc
# Last update: 2026-01-22(Thu) 08:09 JST / 2026-01-21(Wed) 23:09 UTC by hohno_at_kuimc

# ==============================

# (1) 使用するライブラリを読み込む
# OpenCV は画像処理、MediaPipe は手の検出に使う
import cv2
import mediapipe as mp
import numpy as np
import sys

# (2) Mediapipe Hands モデルの準備
#    これにより手の位置(21個のランドマーク)を検出できるようになる
mp_hands = mp.solutions.hands  # Hands機能への参照
hands = mp_hands.Hands(
    static_image_mode=False,       # 動画向けに連続認識を行うモード
    max_num_hands=1,               # 1本の手だけを検出（2本にしたい場合は2に変更）
    min_detection_confidence=0.7   # 検出の信頼度（0〜1）。大きいほど誤検出が減る
)
mp_drawing = mp.solutions.drawing_utils  # 手の骨格を描画するユーティリティ

# (3) 前回の手の形を保存する変数（同じ形を何度も表示しない工夫）
previous_hand_shape = None

# (4) カメラに手が映っているかを覚えておくフラグ
in_frame = False

# =====================================
# 手の形（G, C, P）を判断する関数
# =====================================
def judge_hand_shape(landmarks):
    """
    landmarks: 21個の手の関節（x,y,z座標）のリスト
    返り値: "G", "C", "P" または None（不明の場合）
    """

    # 指先と指の付け根のランドマークID
    FINGERS_TIP_IDS = [4, 8, 12, 16, 20]    # 親指〜小指の先端
    FINGERS_ROOT_IDS = [3, 6, 10, 14, 18]  # それぞれの指の1つ手前の関節

    fingers = []  # True = 伸びている, False = 曲がっている

    for tip_id, root_id in zip(FINGERS_TIP_IDS, FINGERS_ROOT_IDS):
        # 親指は横方向の動きなのでx座標で判定
        if tip_id == 4:
            is_extended = landmarks[tip_id].x < landmarks[root_id].x
        else:
            # 他の指は縦方向の動きなのでy座標で判定
            is_extended = landmarks[tip_id].y < landmarks[root_id].y

        fingers.append(is_extended)

    # 指の本数でグーチョキパーを判定
    if fingers.count(True) == 0:
        return "G"  # グー（全部曲げてる）
    elif fingers.count(True) == 2 and fingers[1] and fingers[2]:
        return "C"  # チョキ（人差し指と中指だけ伸びてる）
    elif fingers.count(True) == 5:
        return "P"  # パー（全部伸びてる）
    else:
        return "X"  # None  # 判定できない形は無視

# ==============================
# カメラを起動
# ==============================

cap = cv2.VideoCapture(0)  # 0はPCの標準カメラを意味する
# cap = cv2.VideoCapture("/dev/video0", cv2.CAP_V4L2)

# WSL2 + usbipd ではデフォルト交渉でタイムアウトしやすいので固定する
cap.set(cv2.CAP_PROP_FOURCC, cv2.VideoWriter_fourcc(*"MJPG"))
cap.set(cv2.CAP_PROP_FRAME_WIDTH, 800)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 600)
cap.set(cv2.CAP_PROP_FPS, 30)

if not cap.isOpened():
    sys.stderr.write("カメラを開けませんでした。\n")
    sys.exit(1)

sys.stderr.write("カメラを起動中...\n")

# ==============================
# メインループ（1フレームずつ処理）
# ==============================
try:
    while True:
        # カメラから映像を1枚読み込む
        ret, frame = cap.read()
        if not ret:
            sys.stderr.write("カメラのフレームを読み取れませんでした。\n")
            break

        # 左右反転（鏡のように見せるため）
        frame = cv2.flip(frame, 1)

        # OpenCV(BGR) → MediaPipe(RGB)へ変換
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

        # MediaPipeで手を検出する
        result = hands.process(rgb_frame)

        if result.multi_hand_landmarks:
            # 手を検出した
            in_frame = True
            for hand_landmarks in result.multi_hand_landmarks:
                # 手の形を判定
                hand_shape = judge_hand_shape(hand_landmarks.landmark)

                # 前回と違う形の時だけ出力
                if hand_shape and hand_shape != previous_hand_shape:
                    sys.stdout.write(f"{hand_shape}\n")
                    sys.stdout.flush()
                    previous_hand_shape = hand_shape

                # 画面にランドマークを描く
                mp_drawing.draw_landmarks(frame, hand_landmarks, mp_hands.HAND_CONNECTIONS)
        else:
            # 手を検出していない
            if in_frame:
                # しかしフレームの中にいる（== 手がフレームアウトした）なら手の形をリセット
                previous_hand_shape = None
                in_frame = False

        # 画像をウィンドウに表示
        cv2.imshow("Rock-Paper-Scissors", frame)

        # 'q' キーで終了
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

# ==============================
# 終了処理
# ==============================
finally:
    cap.release()              # カメラを解放
    cv2.destroyAllWindows()    # ウィンドウを閉じる
    hands.close()              # MediaPipeの終了処理

