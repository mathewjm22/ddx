import React, { useState, useEffect } from 'react';
import { callGenerativeAI } from './api';
import { CORE_DIAGNOSES } from './data';
import DashboardScreen from './components/DashboardScreen';
import CaseScreen from './components/CaseScreen';
import LoadingSpinner from './components/LoadingSpinner';

function App() {
  // Overall state management
  const [screen, setScreen] = useState('dashboard'); // 'dashboard' or 'case'
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');

  // Modal states
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showDebriefModal, setShowDebriefModal] = useState(false);
  const [debriefContent, setDebriefContent] = useState('');

  // Case-specific state
  const [currentSpecialty, setCurrentSpecialty] = useState(null);
  const [caseParts, setCaseParts] = useState([]);
  const [currentPartIndex, setCurrentPartIndex] = useState(0);
  const [differentialList, setDifferentialList] = useState([]);
  const [submittedOrders, setSubmittedOrders] = useState({ labs: [], imaging: [], management: [] });
  const [submittedResultsCache, setSubmittedResultsCache] = useState({});
  const [finalDiagnosis, setFinalDiagnosis] = useState('');
  const [caseContent, setCaseContent] = useState([]);


  const handleSpecialtyClick = (specialtyName) => {
    setCurrentSpecialty(specialtyName);
    setShowConfirmationModal(true);
  };

  const resetCaseState = () => {
    setCaseParts([]);
    setCurrentPartIndex(0);
    setDifferentialList([]);
    setSubmittedOrders({ labs: [], imaging: [], management: [] });
    setSubmittedResultsCache({});
    setFinalDiagnosis('');
    setCaseContent([]);
  };

  const startCase = async () => {
      setShowConfirmationModal(false);
      setScreen('case');
      resetCaseState();
      setIsLoading(true);
      setLoadingText('Generating Case...');

      let finalPrompt;
      const coreTopics = CORE_DIAGNOSES[currentSpecialty];

      if (coreTopics && coreTopics.length > 0 && Math.random() < 0.7) {
          const randomTopic = coreTopics[Math.floor(Math.random() * coreTopics.length)];
          finalPrompt = `Generate a medically complex, in-depth OSCE-style internal medicine case where the **final diagnosis is ${randomTopic}**. The case should be challenging and unfold in 15-20 parts. The specialty is ${currentSpecialty}. As you write the case, also generate and intersperse 3-4 illustrations.

          **CRITICAL Instructions:**
          1.  **Depth and Detail:** The case should be complex. Each part of the narrative (HPI, ROS, exam, labs) should be detailed and nuanced, creating a rich, realistic patient story. Avoid simple, one-line updates. The diagnostic pathway should often require multiple steps.

          **CRITICAL ILLUSTRATION DIRECTIVES:**
          * **Patient Consistency (Most Important Rule):** A single, consistent patient MUST be depicted in all images for this case. It is a critical failure if the patient's appearance (age, hair, facial features, race, gender) changes at all between illustrations. The person in image #1 must be identical to the person in image #2, #3, etc.
          * **Image Uniqueness:** DO NOT generate duplicate or visually similar images. Each illustration must be completely unique in its composition, camera angle, and the scene depicted. Repetitive imagery is a failure. For example, do not show the patient sitting on an exam bed in the same pose twice.
          * **Art Style:** Generate ONLY authentic watercolor paintings with a muted, pastel palette. ABSOLUTELY NO other styles (sketches, cartoons, photorealism).
          * **Content Restrictions:** Illustrations must ONLY depict the patient or clinical scenes. DO NOT generate radiological scans (X-rays, CTs) or internal procedures (endoscopies).
          * **Guaranteed Illustrations:** The first illustration must appear before the first "[PAUSE]". When the physical exam is presented, an appropriate and unique illustration of the exam MUST be generated.

          3.  **Vital Signs & Exam Content:** The patient's vital signs and the entire physical examination section MUST each be presented as a single, uninterrupted block of text. Do not place a '[PAUSE]' marker within the vital signs list or the physical exam description.
          4.  **Patient Presentation:** Start the case by describing the patient's age and relevant demographics, for example, "A 68-year-old male presents..." Do NOT give the patient a name.
          5.  **Objective Findings Only:** Do NOT use the name of the diagnosis or obvious buzzwords.
          6.  **Progressive Disclosure:** Separate case parts with the marker: "[PAUSE]".
          7.  **Prompt for Actions:** Before revealing results, indicate that tests were ordered. For example: "Labs were ordered...[PAUSE]The results showed...".
          8.  **Final Diagnosis Marker:** At the very end, on a new line, write "FINAL_DIAGNOSIS:" followed ONLY by the correct diagnosis (${randomTopic}).
          9.  **Cache Buster:** ID: ${new Date().getTime()}.

          Begin the case now.`;
      } else {
           finalPrompt = `Generate a medically complex, in-depth OSCE-style internal medicine case. The case should be challenging and unfold in 15-20 parts. The specialty is ${currentSpecialty}. If 'Random Case', pick any internal medicine specialty. As you write the case, also generate and intersperse 3-4 illustrations.

          **Instructions:**
          1.  **Depth and Detail:** The case should be complex. Each part of the narrative (HPI, ROS, exam, labs) should be detailed and nuanced, creating a rich, realistic patient story. Avoid simple, one-line updates. The diagnostic pathway should often require multiple steps.

          **CRITICAL ILLUSTRATION DIRECTIVES:**
          * **Patient Consistency (Most Important Rule):** A single, consistent patient MUST be depicted in all images for this case. It is a critical failure if the patient's appearance (age, hair, facial features, race, gender) changes at all between illustrations. The person in image #1 must be identical to the person in image #2, #3, etc.
          * **Image Uniqueness:** DO NOT generate duplicate or visually similar images. Each illustration must be completely unique in its composition, camera angle, and the scene depicted. Repetitive imagery is a failure. For example, do not show the patient sitting on an exam bed in the same pose twice.
          * **Art Style:** Generate ONLY authentic watercolor paintings with a muted, pastel palette. ABSOLUTELY NO other styles (sketches, cartoons, photorealism).
          * **Content Restrictions:** Illustrations must ONLY depict the patient or clinical scenes. DO NOT generate radiological scans (X-rays, CTs) or internal procedures (endoscopies).
          * **Guaranteed Illustrations:** The first illustration must appear before the first "[PAUSE]". When the physical exam is presented, an appropriate and unique illustration of the exam MUST be generated.

          3.  **Vital Signs & Exam Content:** The patient's vital signs and the entire physical examination section MUST each be presented as a single, uninterrupted block of text. Do not place a '[PAUSE]' marker within the vital signs list or the physical exam description.
          4.  **Patient Presentation:** Start the case by describing the's age and relevant demographics, for example, "A 68-year-old male presents..." Do NOT give the patient a name.
          5.  **Objective Findings Only:** Describe all findings objectively, avoiding buzzwords or eponyms.
          6.  **Progressive Disclosure:** Separate case parts with the marker: "[PAUSE]".
          7.  **Prompt for Actions:** Before revealing results, indicate that tests were ordered. For example: "Labs were ordered...[PAUSE]The results showed...".
          8.  **Final Diagnosis:** At the very end, on a new line, write "FINAL_DIAGNOSIS:" followed by the correct diagnosis.
          9.  **Cache Buster:** ID: ${new Date().getTime()}.

          Begin the case now.`;
      }

      const responseParts = await callGenerativeAI(finalPrompt, true);
      setIsLoading(false);

      const fullText = responseParts.filter(p => p.text).map(p => p.text).join('');
      const [caseText, diagnosisText] = fullText.split('FINAL_DIAGNOSIS:');
      setFinalDiagnosis(diagnosisText ? diagnosisText.trim() : 'Not provided');

      let processedParts = [];
      let currentPhase = [];
      responseParts.forEach(part => {
          if (part.text) {
              const cleanText = part.text.split('FINAL_DIAGNOSIS:')[0];
              const textSegments = cleanText.split('[PAUSE]');

              textSegments.forEach((segment, index) => {
                  if (segment.trim()) {
                      currentPhase.push({ type: 'text', content: segment });
                  }
                  if (index < textSegments.length - 1) {
                      processedParts.push(currentPhase);
                      currentPhase = [];
                  }
              });
          } else if (part.inlineData) {
              currentPhase.push({ type: 'image', content: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}` });
          }
      });
      if (currentPhase.length > 0) {
          processedParts.push(currentPhase);
      }

      setCaseParts(processedParts);
  };

  const advanceCase = () => {
    if (currentPartIndex < caseParts.length) {
        const newContent = caseParts[currentPartIndex];
        setCaseContent(prev => [...prev, newContent]);
        setCurrentPartIndex(prev => prev + 1);
    }
  };

  useEffect(() => {
    if (caseParts.length > 0 && currentPartIndex === 0) {
      advanceCase();
    }
  }, [caseParts, currentPartIndex]);

  const submitOrders = async (orderType, orderContent) => {
      if (!orderContent.trim()) return;

      const orderKey = `${orderType}:${orderContent}`;
      if (submittedResultsCache[orderKey]) {
          const cachedResult = { type: 'result', resultType: orderType, content: submittedResultsCache[orderKey] };
          setCaseContent(prev => [...prev, [cachedResult]]);
          return;
      }

      setIsLoading(true);
      setLoadingText('Fetching Results...');

      const caseHistory = caseContent.flat().map(p => p.content).join(' ');
      const prompt = `Based on the following medical case: "${caseHistory}". The student has ordered the following ${orderType}: "${orderContent}".

      **Instructions:**
      1.  Provide realistic results for these orders.
      2.  Format lab results line-by-line (e.g., "HGB 11 g/dl (ref: 13-15 g/dL)").
      3.  For imaging, provide a concise radiologist-style read.
      4.  For management/consults, provide a brief, simulated note or action.
      5.  If a test is not indicated or results would not be available, state that clearly.
      6.  Be consistent. If the same test is ordered later, provide the same results.

      Provide the results now.`;

      const results = await callGenerativeAI(prompt);
      setIsLoading(false);

      setSubmittedResultsCache(prev => ({ ...prev, [orderKey]: results }));
      setSubmittedOrders(prev => ({ ...prev, [orderType]: [...prev[orderType], orderContent]}));

      const newResult = { type: 'result', resultType: orderType, content: results };
      setCaseContent(prev => [...prev, [newResult]]);
  };

  const revealDiagnosis = async () => {
      setIsLoading(true);
      setLoadingText('Generating Case Debrief...');

      const caseHistory = caseContent.flat().map(p => p.content).join(' ');
      const userDifferential = differentialList;

      const prompt = `An AI medical case has concluded.

      **Case Summary:** ${caseHistory}
      **Final Diagnosis:** ${finalDiagnosis}
      **Student's Final Top 3 Differential Diagnoses:** 1. ${userDifferential[0] || 'N/A'}, 2. ${userDifferential[1] || 'N/A'}, 3. ${userDifferential[2] || 'N/A'}
      **Student's Lab Orders:** ${submittedOrders.labs.join(', ') || 'None'}
      **Student's Imaging Orders:** ${submittedOrders.imaging.join(', ') || 'None'}
      **Student's Management Plan:** ${submittedOrders.management.join('. ') || 'None'}

      **Your Task: Provide a detailed case debrief using specific HTML and Tailwind CSS classes.** Ensure all text is light-colored and easily readable on a dark background.

      1.  **Final Diagnosis:**
          <h4 class="text-2xl font-bold text-cyan-300 mb-2">Final Diagnosis</h4>
          <p class="text-xl text-white bg-gray-900/50 p-3 rounded-lg">${finalDiagnosis}</p>

      2.  **Performance Score:**
          <h5 class="text-xl font-bold text-cyan-300 mt-4 mb-2">Performance Score</h5>
          <div class="space-y-2 p-3 bg-gray-900/50 rounded-lg text-gray-300">
              <!-- For each of the following, provide a score (e.g., 35/40) and rationale -->
              <p><strong class="text-white">Differential Accuracy (40%):</strong> [Your score here]. [Your brief rationale here].</p>
              <p><strong class="text-white">Diagnostic Efficiency (25%):</strong> [Your score here]. [Your brief rationale here].</p>
              <p><strong class="text-white">Management Appropriateness (20%):</strong> [Your score here]. [Your brief rationale here].</p>
              <p><strong class="text-white">Safety Considerations (15%):</strong> [Your score here]. [Your brief rationale here].</p>
          </div>

      3.  **Discussion:**
          <h5 class="text-xl font-bold text-cyan-300 mt-4 mb-2">Discussion</h5>
          <div class="p-3 bg-gray-900/50 rounded-lg">
              <p class="text-gray-300 mb-2">Based on the presentation, other differentials to consider included:</p>
              <ul class="list-disc list-inside space-y-2 text-gray-300">
                  <!-- Provide 2-3 other differentials with brief rationales in <li> tags -->
              </ul>
          </div>

      4.  **Learning Points:**
          <h5 class="text-xl font-bold text-cyan-300 mt-4 mb-2">Key Learning Points</h5>
          <div class="space-y-3 text-gray-300 p-3 bg-gray-900/50 rounded-lg">
              <!-- Provide three detailed paragraphs on the final diagnosis covering pathophysiology, diagnosis, and treatment. Use <p> tags. -->
          </div>

      5.  **Shelf Exam Question:**
           <h5 class="text-xl font-bold text-cyan-300 mt-4 mb-2">Shelf-Style Question</h5>
           <div class="space-y-2 text-gray-300 p-3 bg-gray-900/50 rounded-lg">
              <p>[Your multiple-choice question here].</p>
              <p>A) [Option A]</p>
              <p>B) [Option B]</p>
              <p>C) [Option C]</p>
              <p>D) [Option D]</p>
              <br>
              <p><strong class="text-white">Correct Answer:</strong> [Correct letter]</p>
              <p><strong class="text-white">Rationale:</strong> [Your detailed rationale here].</p>
           </div>`;

      const debrief = await callGenerativeAI(prompt);
      setDebriefContent(debrief);
      setIsLoading(false);
      setShowDebriefModal(true);
  };

  const closeDebriefModal = () => {
    setShowDebriefModal(false);
    setScreen('dashboard');
  }

  // Render logic
  return (
    <div id="app" className="w-full h-full max-w-7xl mx-auto">
      {isLoading && <LoadingSpinner text={loadingText} />}

      {screen === 'dashboard' ? (
        <DashboardScreen onSpecialtyClick={handleSpecialtyClick} />
      ) : (
        <CaseScreen
          caseContent={caseContent}
          advanceCase={advanceCase}
          revealDiagnosis={revealDiagnosis}
          isCaseComplete={currentPartIndex >= caseParts.length && caseParts.length > 0}
          submitOrders={submitOrders}
          differentialList={differentialList}
          setDifferentialList={setDifferentialList}
        />
      )}

      {showConfirmationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-40">
          <div className="glass-modal-content p-8 rounded-lg text-center max-w-md">
            <h2 className="text-2xl font-bold mb-4">Start Case</h2>
            <p className="mb-6">{`Do you want to generate a new ${currentSpecialty} case?`}</p>
            <div className="flex justify-center gap-4">
              <button onClick={startCase} className="glass-button py-2 px-6 rounded-lg font-semibold">Confirm</button>
              <button onClick={() => setShowConfirmationModal(false)} className="bg-gray-600/50 hover:bg-gray-600/80 py-2 px-6 rounded-lg font-semibold">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showDebriefModal && (
         <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-40">
            <div className="glass-modal-content p-8 rounded-lg max-w-3xl w-full h-[90vh] flex flex-col">
                <h2 className="text-3xl font-bold mb-4 text-center text-white">Case Debrief</h2>
                <div className="flex-grow overflow-y-auto pr-2" dangerouslySetInnerHTML={{ __html: debriefContent }}>
                </div>
                <div className="flex justify-center mt-6">
                    <button onClick={closeDebriefModal} className="glass-button py-2 px-8 rounded-lg font-semibold">Close</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}

export default App;
