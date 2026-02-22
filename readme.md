# 🩺 CaseDx – Medical Case Simulator

A standalone web application for medical case-based learning, inspired by [HumanDx](https://www.humandx.org). Load a medical case PDF and work through it systematically — building your differential, ordering tests, and planning management — then score yourself against the answer key.

## 🚀 Live Demo

Deploy to GitHub Pages or simply open `index.html` in your browser.

## Features

### 📋 PDF Viewer
- Load any medical case PDF (drag & drop or file picker)
- Page navigation, zoom controls
- Side-by-side view with your workspace

### 🎯 Differential Diagnoses
- Add diagnoses to your ranked differential list
- **Drag and drop** to reorder by confidence
- **Rule out** diagnoses as you gather more information
- Move up/down with arrow buttons

### 🧪 Diagnostic Testing
- Order labs, imaging, procedures
- Categorize each test
- Add rationale for your reasoning

### 💊 Management
- Plan medications, interventions, consults
- Categorize and document rationale

### 📝 Clinical Notes
- HPI / Key Findings section
- Physical Exam notes
- General notes / reasoning

### 📊 Scoring
- **AI-powered extraction**: Use an LLM to automatically extract the answer key from the PDF
- **Manual entry**: Enter the answer key yourself
- Compares your differential, testing, and management against the correct answers
- Visual score breakdown with match details

### 🤖 LLM Integration (All Optional & Swappable)

| Provider | Cost | Setup |
|----------|------|-------|
| **None (Manual)** | Free | No setup needed |
| **Ollama** | Free | Install [Ollama](https://ollama.ai), run `ollama pull llama3.2` |
| **OpenRouter** | Free tier available | Get key at [openrouter.ai](https://openrouter.ai), use `:free` models |
| **Google Gemini** | Free tier | Get key at [aistudio.google.com](https://aistudio.google.com) |
| **OpenAI** | Paid | Get key at [platform.openai.com](https://platform.openai.com) |
| **Anthropic** | Paid | Get key at [console.anthropic.com](https://console.anthropic.com) |

## Quick Start

### Option 1: Just Open It
```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/casedx.git

# Open in browser
open index.html