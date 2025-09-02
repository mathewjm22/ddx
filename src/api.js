export async function callGenerativeAI(prompt, wantsImages = false) {
    // This is a mock function that simulates a call to a generative AI.
    // It will return pre-defined data based on keywords in the prompt.
    // In a real application, this would make a network request to an AI service.

    console.log("Calling Generative AI with prompt:", prompt);

    // Simulate network latency
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (prompt.includes("Provide a detailed case debrief")) {
        return getDebriefContent(prompt);
    }

    if (prompt.includes("Provide realistic results for these orders")) {
        return getOrderResults(prompt);
    }

    // Default case generation
    return getCaseGeneration(prompt);
}

// --- MOCK DATA GENERATORS ---

function getCaseGeneration(prompt) {
    let diagnosis = "Myocardial Infarction";
    if (prompt.includes("final diagnosis is")) {
        try {
            diagnosis = prompt.match(/final diagnosis is (.*?)\./)[1];
        } catch (e) {
            // fallback
        }
    } else if (prompt.includes("Respiratory System")) {
        diagnosis = "Pulmonary Embolism";
    } else if (prompt.includes("Nutritional & Digestive")) {
        diagnosis = "Acute Pancreatitis";
    }

    const caseData = {
        "Myocardial Infarction": {
            parts: [
                { text: "A 65-year-old male with a history of hypertension and hyperlipidemia presents to the emergency department with a chief complaint of chest pain. The pain started one hour ago, is substernal, and he describes it as a crushing sensation radiating to his left arm and jaw. He rates the pain as 9/10 in severity. He also reports diaphoresis and shortness of breath." },
                // Mock image data
                { inlineData: { mimeType: 'image/jpeg', data: '... (mock base64 image data)' } },
                { text: "[PAUSE]" },
                { text: "Vital Signs:\n- Blood Pressure: 160/95 mmHg\n- Heart Rate: 110 bpm\n- Respiratory Rate: 22 breaths/min\n- Oxygen Saturation: 94% on room air\n- Temperature: 37.0°C (98.6°F)" },
                { text: "[PAUSE]" },
                { text: "Physical Examination:\n- General: The patient is anxious and in visible distress.\n- Cardiovascular: Tachycardic rhythm, S4 gallop heard. No murmurs, rubs, or clicks.\n- Respiratory: Lungs are clear to auscultation bilaterally.\n- Extremities: Cool and clammy." },
                // Mock image data
                { inlineData: { mimeType: 'image/jpeg', data: '... (mock base64 image data)' } },
                { text: "[PAUSE]" },
                { text: "An initial ECG is obtained." },
                { text: "[PAUSE]" },
                { text: "The ECG shows ST-segment elevation in the anterior leads (V1-V4)." },
                { text: "FINAL_DIAGNOSIS: Myocardial Infarction" }
            ]
        },
        "Pulmonary Embolism": {
            parts: [
                { text: "A 55-year-old female presents with sudden onset of shortness of breath and pleuritic chest pain. She recently traveled on a long-haul flight. She has a history of recent knee surgery." },
                { inlineData: { mimeType: 'image/jpeg', data: '... (mock base64 image data)' } },
                { text: "[PAUSE]" },
                { text: "Vital Signs:\n- BP: 110/70\n- HR: 120 bpm\n- RR: 28\n- SpO2: 91% on room air" },
                { text: "[PAUSE]" },
                { text: "Physical Exam:\n- Lungs: Clear to auscultation.\n- Heart: Tachycardic, but regular rhythm.\n- Extremities: Mild unilateral leg swelling." },
                { text: "[PAUSE]" },
                { text: "A CTPA is ordered." },
                { text: "[PAUSE]" },
                { text: "The CTPA reveals a large saddle embolus." },
                { text: "FINAL_DIAGNOSIS: Pulmonary Embolism" }
            ]
        },
        "Acute Pancreatitis": {
             parts: [
                { text: "A 45-year-old male with a history of alcohol abuse presents with severe epigastric pain radiating to the back. The pain is constant and worsened by eating." },
                 { inlineData: { mimeType: 'image/jpeg', data: '... (mock base64 image data)' } },
                { text: "[PAUSE]" },
                { text: "Vital Signs:\n- BP: 100/60\n- HR: 130 bpm\n- RR: 24\n- Temp: 38.5°C" },
                { text: "[PAUSE]" },
                { text: "Physical Exam:\n- Abdomen: Epigastric tenderness, guarding, and decreased bowel sounds." },
                { text: "[PAUSE]" },
                { text: "Labs are drawn." },
                { text: "[PAUSE]" },
                { text: "Lipase is markedly elevated at 3000 U/L." },
                { text: "FINAL_DIAGNOSIS: Acute Pancreatitis" }
            ]
        }
    };

    const selectedCase = caseData[diagnosis] || caseData["Myocardial Infarction"];

    // The real API returns text and images mixed. We simulate that structure.
    const combinedText = selectedCase.parts.map(p => p.text || '').join('');
    const [caseText, finalDiagnosis] = combinedText.split('FINAL_DIAGNOSIS:');

    // Reconstruct the parts array, splitting text by [PAUSE]
    const responseParts = [];
    let imageIndex = 0;
    const textSegments = caseText.split('[PAUSE]');

    textSegments.forEach((segment, index) => {
        if (segment.trim()) {
            responseParts.push({ text: segment });
        }
        // Intersperse mock images
        if (index === 0 || index === 2) {
             const mockImagePart = selectedCase.parts.find(p => p.inlineData);
             if(mockImagePart) responseParts.push(mockImagePart);
        }
        if (index < textSegments.length - 1) {
            responseParts.push({ text: "[PAUSE]" });
        }
    });

    responseParts.push({ text: `FINAL_DIAGNOSIS: ${finalDiagnosis}`});

    // The real API returns parts, not a single string. We'll just return the parts of the selected case.
    return selectedCase.parts;
}

function getOrderResults(prompt) {
    let results = "Results are pending.";
    if (prompt.includes("CBC")) {
        results = "WBC: 15.2 (High), Hgb: 14.0, Plt: 250";
    } else if (prompt.includes("CMP")) {
        results = "Na: 138, K: 4.1, Cl: 102, CO2: 25, BUN: 20, Cr: 1.1, Glucose: 110";
    } else if (prompt.includes("Troponin")) {
        results = "Troponin I: 5.8 ng/mL (Elevated)";
    } else if (prompt.includes("CXR")) {
        results = "Portable chest X-ray shows no acute cardiopulmonary process. Cardiomediastinal silhouette is top-normal.";
    } else if (prompt.includes("CT chest") || prompt.includes("CTPA")) {
        results = "CT angiography of the chest reveals large bilateral pulmonary emboli. No evidence of aortic dissection.";
    } else if (prompt.includes("Medication: Aspirin")) {
        results = "Aspirin 324mg chewed and swallowed by the patient.";
    } else {
        results = "The requested order was processed. No significant findings to report at this time."
    }
    return results;
}

function getDebriefContent(prompt) {
    const diagnosisMatch = prompt.match(/Final Diagnosis: (.*?)\n/);
    const finalDiagnosis = diagnosisMatch ? diagnosisMatch[1] : "Not specified";

    return `<h4 class="text-2xl font-bold text-cyan-300 mb-2">Final Diagnosis</h4>
        <p class="text-xl text-white bg-gray-900/50 p-3 rounded-lg">${finalDiagnosis}</p>
        <h5 class="text-xl font-bold text-cyan-300 mt-4 mb-2">Performance Score</h5>
        <div class="space-y-2 p-3 bg-gray-900/50 rounded-lg text-gray-300">
            <p><strong class="text-white">Differential Accuracy (40%):</strong> 35/40. The primary diagnosis was correctly identified early.</p>
            <p><strong class="text-white">Diagnostic Efficiency (25%):</strong> 20/25. Appropriate initial tests were ordered.</p>
            <p><strong class="text-white">Management Appropriateness (20%):</strong> 18/20. Initial management was timely and correct.</p>
            <p><strong class="text-white">Safety Considerations (15%):</strong> 15/15. No safety issues identified.</p>
        </div>
        <h5 class="text-xl font-bold text-cyan-300 mt-4 mb-2">Discussion</h5>
        <div class="p-3 bg-gray-900/50 rounded-lg">
            <p class="text-gray-300 mb-2">Based on the presentation, other differentials to consider included:</p>
            <ul class="list-disc list-inside space-y-2 text-gray-300">
                <li><strong>Aortic Dissection:</strong> Chest pain radiating to the back is a classic sign.</li>
                <li><strong>Pericarditis:</strong> Pleuritic chest pain, though the ECG findings were not typical.</li>
            </ul>
        </div>
        <h5 class="text-xl font-bold text-cyan-300 mt-4 mb-2">Key Learning Points</h5>
        <div class="space-y-3 text-gray-300 p-3 bg-gray-900/50 rounded-lg">
            <p>This case is a classic presentation of ${finalDiagnosis}. Key features include the nature of the chest pain, ECG changes, and elevated cardiac biomarkers.</p>
            <p>Early recognition and intervention are critical to improving outcomes in these patients. This includes prompt administration of antiplatelet therapy and preparation for reperfusion therapy.</p>
        </div>
        <h5 class="text-xl font-bold text-cyan-300 mt-4 mb-2">Shelf-Style Question</h5>
        <div class="space-y-2 text-gray-300 p-3 bg-gray-900/50 rounded-lg">
           <p>A 65-year-old male with chest pain has an ECG showing ST elevation in leads II, III, and aVF. Which coronary artery is most likely occluded?</p>
           <p>A) Left Anterior Descending (LAD)</p>
           <p>B) Left Circumflex (LCX)</p>
           <p>C) Right Coronary Artery (RCA)</p>
           <p>D) Obtuse Marginal (OM)</p>
           <br>
           <p><strong class="text-white">Correct Answer:</strong> C) Right Coronary Artery (RCA)</p>
           <p><strong class="text-white">Rationale:</strong> ST elevation in the inferior leads (II, III, aVF) typically indicates an inferior wall myocardial infarction, which is most commonly caused by occlusion of the Right Coronary Artery.</p>
        </div>`;
}
