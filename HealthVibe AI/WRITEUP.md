# HealthVibe AI: Bridging the 2025 Healthcare Gap with Gemini 3 Pro

## 🏆 Project Overview
**HealthVibe AI** is a next-generation multimodal medical triage platform designed to address the critical healthcare access disparities predicted for 2025. By leveraging the advanced reasoning capabilities of **Gemini 3 Pro**, the application acts as a "First-Contact AI Unit," analyzing complex clinical data through video, audio, and text to provide immediate, structured, and empathetic medical assessment.

## 🏥 The Challenge
Global healthcare systems are facing a crisis of accessibility. Patients often endure long wait times or lack access to initial professional evaluation. The challenge is not just availability, but the ability to interpret unstructured, complex patient symptoms (visual signs, verbal descriptions, pain chronology) quickly and accurately to prioritize care effectively.

## 💡 The Solution
HealthVibe AI is a web-based diagnostic tool that removes technical barriers for patients. Users do not need to know medical terminology; they simply show their symptoms and speak naturally. The system ingests this unstructured multimodal data and transforms it into a professional clinical report, including differential diagnoses, home care protocols, and a drafted referral letter for human doctors.

## 🚀 How We Built It with Gemini

The core of HealthVibe AI relies entirely on the `@google/genai` SDK, utilizing a multi-model orchestration strategy:

### 1. Multimodal Clinical Reasoning (`gemini-3-pro-preview`)
We selected **Gemini 3 Pro** for the diagnostic engine due to its superior context handling and reasoning across modalities. It is not merely a chatbot; it functions as a diagnostic processor.

*   **Visual Analysis:** The model analyzes uploaded images/videos to detect physical signs (inflammation, dermatological issues, swelling).
*   **Audio Semantics:** It processes raw audio input to understand the patient's tone and verbal description of symptoms.
*   **Temporal Reasoning:** It correlates the visual and audio data with the text timeline to determine urgency.

**Deterministic Output via JSON Schema:**
To make the AI usable in a real clinical setting, we enforced a strict `responseSchema`. This forces Gemini 3 Pro to output a structured JSON object containing specific data types (Urgency Enum, Diagnosis Arrays, Confidence Scores), rather than unstructured text.

```typescript
// Architectural Highlight: Enforcing Clinical Structure
const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    urgency: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
    diagnoses: {
      type: Type.ARRAY,
      items: {
        properties: {
            condition: { type: Type.STRING },
            confidence: { type: Type.NUMBER }, // 0-100%
        }
      }
    },
    referralLetter: { type: Type.STRING } // Auto-generated for doctors
  }
};
```

### 2. Synthetic Empathy (`gemini-2.5-flash-preview-tts`)
Medical anxiety is a major barrier to effective triage. We implemented a "Virtual Doctor" feature using Gemini's text-to-speech capabilities.
*   **Implementation:** We utilize the `responseModalities: [Modality.AUDIO]` configuration to generate a calming, human-like welcome message before the diagnosis begins.
*   **Technical Challenge:** We implemented a custom PCM audio decoder to handle the raw byte stream from the API and play it natively in the browser using the Web Audio API.

### 3. Context-Aware Post-Diagnosis Assistant
After the initial report, users can chat with the AI. We inject the *entire* JSON analysis result as context into a new chat session. This ensures the model answers follow-up questions based strictly on the generated diagnosis, reducing hallucinations and maintaining clinical consistency.

## 🛠️ Tech Stack
*   **Frontend:** React 19, TypeScript, Vite.
*   **AI Integration:** Google GenAI SDK (`@google/genai`).
*   **Styling:** Tailwind CSS (Clean, medical-grade UI).
*   **Data Visualization:** Recharts (For visualizing diagnostic confidence).
*   **Audio Processing:** Native Web Audio API for PCM encoding/decoding.

## 🌟 Key Features & UX Design
*   **Accessibility First:** The interface is designed for users who may be in pain or have limited literacy. The prominent "Audio Input" mode allows for a completely hands-free description of symptoms.
*   **Bilingual Architecture:** The app seamlessly toggles between English and Spanish. This is not just UI translation; the language parameter is passed to the Gemini prompt to ensure the *medical analysis and generated letters* are culturally and linguistically appropriate.
*   **Privacy-Centric:** All processing happens in real-time. No biometric data is stored on our servers; it flows directly from the client to the Gemini API and back.

## 🔮 Future Roadmap
We aim to integrate the **Gemini Live API** to transform the static form into a real-time, bidirectional video interview, where the AI Doctor can ask the patient to "move the camera closer" or "show where it hurts," mimicking a real telehealth consultation.

---
*Submitted for the Gemini 3 Competition.*