import os
import json
import asyncio
import numpy as np
import sounddevice as sd
from queue import Queue
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import torch
from scipy.signal import savgol_filter, find_peaks
import librosa
from collections import deque
import time
import tempfile
import wave
import threading


try:
    import eventlet
    eventlet.monkey_patch()
    async_mode = 'eventlet'
except ImportError:
    try:
        import gevent
        import gevent.monkey
        gevent.monkey.patch_all()
        async_mode = 'gevent'
    except ImportError:
        async_mode = 'threading'

app = Flask(__name__, static_folder='../dist')
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*", async_mode=async_mode)

model_vad, utils = torch.hub.load(repo_or_dir='snakers4/silero-vad', model='silero_vad', force_reload=False)
(get_speech_timestamps, _, read_audio, _, _) = utils

sample_rate = 16000
frame_duration = 0.5
frame_samples = int(sample_rate * frame_duration)
audio_buffer = Queue()

window_size = 20
pitch_window = deque([0.001]*5, maxlen=window_size)
energy_window = deque([0.001]*5, maxlen=window_size)
rate_window = deque([0.001]*5, maxlen=window_size)

global_stream = None
running = False
x_counter = 0  # ✅ Fixed: Initialize x_counter

# Whisper + Emotion setup
import whisper
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch.nn.functional as F

# --- GPU/CPU selection ---
device = 'cuda' if torch.cuda.is_available() else 'cpu'
print(f"[INFO] Using device: {device}")

# Ensure all models and tensors use the selected device
def to_device(tensor):
    if isinstance(tensor, torch.Tensor):
        return tensor.to(device)
    return tensor
       
stt_model = whisper.load_model("base", device=device)
emotion_tokenizer = AutoTokenizer.from_pretrained("SamLowe/roberta-base-go_emotions")
emotion_model = AutoModelForSequenceClassification.from_pretrained("SamLowe/roberta-base-go_emotions").to(device)
emotion_model.eval()

whisper_emotion = {"emotion": "neutral", "prob": 0.0}
whisper_running = False
whisper_thread = None

BUFFER = Queue()
SAMPLE_RATE = 16000
BLOCK_SECONDS = 2


def recognize_emotion(text):
    if not text.strip():
        return "neutral", 0.0
    try:
        inputs = emotion_tokenizer(text, return_tensors="pt", truncation=True, padding=True)
        inputs = {k: v.to(device) for k, v in inputs.items()}
        with torch.no_grad():
            logits = emotion_model(**inputs).logits
            probs = F.softmax(logits, dim=1)
        top_prob, top_idx = torch.max(probs, dim=1)
        label = emotion_model.config.id2label[top_idx.item()]
        if top_prob.item() < 0.6:
            return "neutral", top_prob.item()
        return label, top_prob.item()
    except Exception as e:
        print(f"⚠️ Emotion detection error: {e}")
        return "error", 0.0


def whisper_audio_callback(indata, frames, time_info, status):
    if status:
        print("⚠️", status)
    BUFFER.put(indata.copy())


def whisper_emotion_loop():
    global whisper_emotion, whisper_running
    with sd.InputStream(samplerate=sample_rate, channels=1, dtype='int16', callback=whisper_audio_callback):
        while whisper_running:
            audio_frames = []
            start_time = time.time()
            while time.time() - start_time < 2 and whisper_running:
                try:
                    chunk = BUFFER.get(timeout=2)
                    audio_frames.append(chunk)
                except Exception:
                    break
            if not audio_frames or not whisper_running:
                continue
            audio_data = np.concatenate(audio_frames)
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmpfile:
                with wave.open(tmpfile, 'wb') as wf:
                    wf.setnchannels(1)
                    wf.setsampwidth(2)
                    wf.setframerate(sample_rate)
                    wf.writeframes(audio_data.tobytes())
                temp_path = tmpfile.name
            try:
                result = stt_model.transcribe(temp_path, language="en")
                transcript = result["text"].strip()
                if transcript:
                    emotion, prob = recognize_emotion(transcript)
                    whisper_emotion = {"emotion": emotion, "prob": prob}
                    print(f"[Whisper] Transcript: {transcript}\n[Whisper] Emotion: {emotion} ({prob:.2f})")
            except Exception as e:
                print("❌ Whisper/Emotion error:", e)
            finally:
                os.remove(temp_path)


def start_whisper_emotion():
    global whisper_running, whisper_thread
    if not whisper_running:
        whisper_running = True
        whisper_thread = threading.Thread(target=whisper_emotion_loop, daemon=True)
        whisper_thread.start()
        print("[Whisper] Emotion analysis started.")


def stop_whisper_emotion():
    global whisper_running
    whisper_running = False
    print("[Whisper] Emotion analysis stopped.")


def compute_pitch(audio):
    return float(np.mean(np.abs(np.fft.rfft(audio))))

def compute_energy(audio):
    return float(np.sqrt(np.mean(audio**2)))

def compute_speaking_rate(audio):
    if np.max(np.abs(audio)) > 0:
        audio = audio / np.max(np.abs(audio))
    energy = librosa.feature.rms(y=audio, frame_length=512, hop_length=256)[0]
    threshold = np.percentile(energy, 75) * 0.8
    peaks, _ = find_peaks(energy, height=threshold, distance=3)
    syllables = len(peaks)
    wpm = (syllables / 4) / (frame_duration / 60)
    return float(wpm)

def normalize(val, min_val, max_val):
    return min(max(0, ((val - min_val) / (max_val - min_val) * 100) if max_val > min_val else 0), 100)

def get_latest_whisper_emotion():
    return whisper_emotion["emotion"], whisper_emotion["prob"]

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

@app.route('/api/status')
def status():
    return jsonify({"status": "running"})

@socketio.on('connect')
def on_connect():
    global pitch_window, energy_window, rate_window, x_counter, audio_buffer
    print('Client connected')
    pitch_window.clear()
    energy_window.clear()
    rate_window.clear()
    pitch_window.extend([0.001] * 5)
    energy_window.extend([0.001] * 5)
    rate_window.extend([0.001] * 5)
    while not audio_buffer.empty():
        audio_buffer.get()
    x_counter = 0  # <-- ensure x_counter is reset on connect
    emit('connected', {'data': 'Connected and reset'})

@socketio.on('start_recording')
def on_start_recording():
    print('Starting voice analysis')
    start_voice_analysis()
    start_whisper_emotion()

@socketio.on('stop_recording')
def on_stop_recording():
    print('Stopping voice analysis')
    stop_voice_analysis()
    stop_whisper_emotion()

def audio_callback(indata, frames, time, status):
    if status:
        print(status)
    audio_buffer.put(indata[:, 0].copy())

def process_audio_graphs():
    global running, x_counter
    print("Started audio processing thread (graphs)")
    while running:
        try:
            if audio_buffer.empty():
                socketio.sleep(0.1)
                continue
            audio_chunk = audio_buffer.get()
            if len(audio_chunk) < frame_samples:
                continue
            audio_np = audio_chunk[:frame_samples]
            torch_audio = torch.from_numpy(audio_np).float()
            if torch.max(torch.abs(torch_audio)) > 1:
                torch_audio = torch_audio / torch.max(torch.abs(torch_audio))
            is_speech = len(get_speech_timestamps(torch_audio, model_vad, sampling_rate=sample_rate)) > 0
            if is_speech:
                pitch = compute_pitch(audio_np)
                energy = compute_energy(audio_np)
                speaking_rate = compute_speaking_rate(audio_np)
                pitch = np.log1p(pitch) * 40
                pitch = min(pitch, 100)
            else:
                pitch = energy = speaking_rate = 0.001
            pitch_window.append(pitch)
            energy_window.append(energy)
            rate_window.append(speaking_rate)
            p_score = normalize(pitch, min(pitch_window), max(pitch_window))
            e_score = normalize(energy, min(energy_window), max(energy_window))
            r_score = normalize(speaking_rate, min(rate_window), max(rate_window))
            data = {
                'time': str(x_counter),
                'pitch': {'value': p_score, 'raw': pitch},
                'energy': {'value': e_score, 'raw': energy},
                'speakingRate': {'value': r_score, 'raw': speaking_rate},
                'emotion': None,
                'is_speech': is_speech
            }
            socketio.emit('graph_data', data)
            x_counter += 1
            socketio.sleep(0.1)
        except Exception as e:
            print(f"Error in graph processing: {e}")
            socketio.sleep(0.5)

def process_audio_emotion():
    global running
    print("Started audio processing thread (emotion)")
    while running:
        try:
            whisper_emotion, whisper_prob = get_latest_whisper_emotion()
            data = {'emotion': whisper_emotion, 'prob': whisper_prob}
            socketio.emit('emotion_data', data)
            socketio.sleep(0.2)
        except Exception as e:
            print(f"Error in emotion processing: {e}")
            socketio.sleep(0.5)

def start_voice_analysis():
    global global_stream, running
    running = True
    try:
        global_stream = sd.InputStream(callback=audio_callback, channels=1, samplerate=sample_rate, blocksize=frame_samples)
        global_stream.start()
        print("Audio stream started successfully")
        socketio.start_background_task(process_audio_graphs)
        socketio.start_background_task(process_audio_emotion)
    except Exception as e:
        print(f"Error starting audio stream: {e}")
        running = False

def stop_voice_analysis():
    global global_stream, running
    running = False
    if global_stream is not None:
        try:
            global_stream.stop()
            global_stream.close()
            print("Audio stream stopped successfully")
        except Exception as e:
            print(f"Error stopping audio stream: {e}")
        global_stream = None

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)