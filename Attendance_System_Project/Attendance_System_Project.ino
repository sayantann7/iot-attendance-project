#include <WiFi.h>
#include <HTTPClient.h>
#include <SPI.h>
#include <MFRC522.h>

const char* WIFI_SSID     = "shashank-one-plus";
const char* WIFI_PASSWORD = "shashank181";
const char* SERVER_URL    = "http://iot-attendance.sayantan.space/attendance";

const char* DEVICE_ID = "esp32-01";

#define SS_PIN  5
#define RST_PIN 4

#define BUZZER_PIN 25
#define BUZZER_IS_ACTIVE 1
#define BUZZER_TONE_FREQ 2000
#define BUZZER_BEEP_MS    120

MFRC522 mfrc522(SS_PIN, RST_PIN);

String lastSentUid = "";
unsigned long lastSentMillis = 0;
const unsigned long SEND_COOLDOWN_MS = 5000;

void byteArray_to_string(byte array[], unsigned int len, char buffer[]) {
  for (unsigned int i = 0; i < len; i++) {
    byte nib1 = (array[i] >> 4) & 0x0F;
    byte nib2 = (array[i] >> 0) & 0x0F;
    buffer[i*2+0] = nib1  < 0xA ? '0' + nib1  : 'A' + nib1  - 0xA;
    buffer[i*2+1] = nib2  < 0xA ? '0' + nib2  : 'A' + nib2  - 0xA;
  }
  buffer[len*2] = '\0';
}

// Read UID helper
int getUID(char outBuffer[], unsigned int bufLen) {
  if (!mfrc522.PICC_IsNewCardPresent()) return 0;
  if (!mfrc522.PICC_ReadCardSerial()) return 0;

  byteArray_to_string(mfrc522.uid.uidByte, mfrc522.uid.size, outBuffer);

  mfrc522.PICC_HaltA();
  mfrc522.PCD_StopCrypto1();

  return 1;
}

// Short beep -- handles active vs passive buzzer
void beepOnce() {
#if BUZZER_IS_ACTIVE
  digitalWrite(BUZZER_PIN, HIGH);
  delay(BUZZER_BEEP_MS);
  digitalWrite(BUZZER_PIN, LOW);
#else
  tone(BUZZER_PIN, BUZZER_TONE_FREQ, BUZZER_BEEP_MS);
  delay(BUZZER_BEEP_MS);
  noTone(BUZZER_PIN);
#endif
}

// Distinct beep for success
void beepSuccess() {
  // two short beeps
  beepOnce();
  delay(80);
  beepOnce();
}

// Distinct beep for failure
void beepFail() {
#if BUZZER_IS_ACTIVE
  digitalWrite(BUZZER_PIN, HIGH);
  delay(350);
  digitalWrite(BUZZER_PIN, LOW);
#else
  tone(BUZZER_PIN, 1000, 350);
  delay(350);
  noTone(BUZZER_PIN);
#endif
}

// Connect to Wi-Fi with simple retries
void connectWiFi() {
  if (WiFi.status() == WL_CONNECTED) return;
  Serial.printf("Connecting to WiFi '%s' ...\n", WIFI_SSID);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  unsigned long start = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - start < 15000) {
    Serial.print('.');
    delay(500);
  }
  Serial.println();
  if (WiFi.status() == WL_CONNECTED) {
    Serial.print("WiFi connected, IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("WiFi connect failed (will retry in loop).");
  }
}

// Send attendance POST, returns HTTP code or 0 on network error
int sendAttendance(const String &uid) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi not connected, attempting reconnect...");
    connectWiFi();
    if (WiFi.status() != WL_CONNECTED) {
      Serial.println("Still offline; abort send.");
      return 0;
    }
  }

  HTTPClient http;
  http.begin(SERVER_URL); // HTTP
  http.addHeader("Content-Type", "application/json");

  String payload = "{\"uid\":\"" + uid + "\",\"device_id\":\"" + String(DEVICE_ID) + "\"}";
  Serial.print("POST payload: ");
  Serial.println(payload);

  int httpCode = http.POST(payload);
  String resp = http.getString();
  Serial.printf("HTTP %d, resp: %s\n", httpCode, resp.c_str());
  http.end();
  return httpCode;
}

void setup(){
  Serial.begin(115200);
  delay(200);

  // Init SPI + RFID
  SPI.begin();
  mfrc522.PCD_Init();

  // buzzer pin init
#if BUZZER_IS_ACTIVE
  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, LOW);
#else
  pinMode(BUZZER_PIN, OUTPUT);
#endif

  // Connect WiFi initially
  connectWiFi();

  Serial.println();
  Serial.println("Ready. Tap your card to the RFID-RC522 module.");
}

void loop(){
  char uidBuf[32] = {0};
  int got = getUID(uidBuf, sizeof(uidBuf));
  if (got) {
    String uid = String(uidBuf);
    Serial.println();
    Serial.print("UID detected: ");
    Serial.println(uid);

    // beep immediate acknowledge
    beepOnce();

    unsigned long now = millis();

    // Cooldown: avoid sending same UID repeatedly
    if (uid == lastSentUid && (now - lastSentMillis) < SEND_COOLDOWN_MS) {
      Serial.println("Duplicate UID within cooldown, ignoring.");
    } else {
      int code = sendAttendance(uid);
      if (code >= 200 && code < 300) {
        Serial.println("Attendance POST successful.");
        beepSuccess();
        lastSentUid = uid;
        lastSentMillis = now;
      } else if (code == 0) {
        Serial.println("Network error sending attendance.");
        beepFail();
        // Optionally: queue for retry (not implemented here)
      } else {
        Serial.printf("Server returned error code %d\n", code);
        beepFail();
      }
    }

    // Small debounce to avoid immediate re-read
    delay(300);
  }
  delay(10);
}
