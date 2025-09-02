export async function callGenerativeAI(prompt, wantsImages = false, loadingSpinner) {
    const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
    if (!apiKey) {
        console.error("API Key not found. Please set REACT_APP_GEMINI_API_KEY in your .env file.");
        // You might want to return a user-friendly error message here
        return wantsImages ? [] : "Error: API Key is not configured. Please contact the administrator.";
    }

    // The user specified a custom model, let's use that.
    // Note: The original code used different models for text vs. image.
    // We will use the user-provided model for text, and a suitable vision model for images.
    const textModel = 'google/gemini-2.0-flash-exp:free';
    const visionModel = 'gemini-pro-vision'; // A common model for vision tasks

    const modelToUse = wantsImages ? visionModel : textModel;
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelToUse}:generateContent?key=${apiKey}`;

    const payload = {
        contents: [{ parts: [{ text: prompt }] }],
    };

    if (wantsImages) {
        // This part of the payload might need adjustment based on the exact vision model's requirements
        payload.generationConfig = { responseMimeType: "application/json" };
    }

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error("API Error Response:", errorBody);
            throw new Error(`API call failed with status: ${response.status}`);
        }

        const result = await response.json();

        if (wantsImages) {
            // Assuming the response for vision model provides parts with inlineData
            return result.candidates[0].content.parts;
        } else {
            // For text models
            return result.candidates[0].content.parts[0].text;
        }

    } catch (error) {
        console.error("Error calling Generative AI:", error);
        return wantsImages ? [] : "Error: Could not retrieve data from the AI. Please check the console for details.";
    }
}
