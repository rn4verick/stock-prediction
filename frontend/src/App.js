import React, { useState } from 'react';
import axios from 'axios';

function App() {
    // Basic states
    const [ticker, setTicker] = useState("");
    const [result, setResult] = useState(null); // holds the ML output
    const [loading, setLoading] = useState(false);

    const handlePredict = async () => {
        if (!ticker) return; // don't do anything if empty

        setLoading(true);
        try {
            // console.log("sending ticker to django:", ticker);
            
            const res = await axios.post('http://127.0.0.1:8000/api/predict/', { ticker: ticker });
            setResult(res.data);
            
        } catch (err) {
            console.error(err);
            alert("Oof, error connecting. Is Django actually running?");
        }
        setLoading(false);
    };

    return (
        // : move styles to a separate css file before turning this in
        <div style={{ maxWidth: '600px', margin: '50px auto', fontFamily: 'monospace', textAlign: 'center' }}>
            <h1>BullsAI</h1>
            <p>Enter a stock ticker to get an AI-powered prediction.</p>
            
            <div style={{ margin: '20px 0', padding: '20px', border: '2px solid #333', borderRadius: '8px' }}>
                <input 
                    type="text" 
                    placeholder="e.g., TSLA, AAPL" 
                    value={ticker} 
                    onChange={(e) => setTicker(e.target.value.toUpperCase())}
                    style={{ padding: '10px', fontSize: '18px', width: '50%', marginRight: '10px', textTransform: 'uppercase' }}
                />
                
                <button 
                    onClick={handlePredict} 
                    disabled={loading} 
                    style={{ padding: '10px 20px', fontSize: '18px', cursor: 'pointer', backgroundColor: 'black', color: 'white' }}
                >
                    {loading ? "Thinking..." : "Predict"}
                </button>
            </div>

            {/* only show results if we got something back from the backend */}
            {result && (
                <div style={{ margin: '20px 0', padding: '20px', backgroundColor: '#f4f4f4', borderRadius: '8px' }}>
                    <h2 style={{ color: result.prediction.includes('UP') ? 'green' : 'red' }}>
                        {result.prediction}
                    </h2>
                    <p style={{ color: '#666' }}>Technical Analysis: {result.stats}</p>
                </div>
            )}
        </div>
    );
}

export default App;