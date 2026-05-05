import React, { useState, useEffect } from 'react'; 
import axios from 'axios';

function App() {
    // --- security stuff ---
    const [loggedInUser, setLoggedInUser] = useState(null); 
    const [typedUsername, setTypedUsername] = useState("");
    const [typedPassword, setTypedPassword] = useState("");
    const [isOnLoginScreen, setIsOnLoginScreen] = useState(true);
    const [statusNotification, setStatusNotification] = useState("");
    const [waitingForAuth, setWaitingForAuth] = useState(false);

    // --- stock stuff ---
    const [stockSymbol, setStockSymbol] = useState("");
    const [aiPredictionData, setAiPredictionData] = useState(null); 
    const [waitingForAi, setWaitingForAi] = useState(false);

    // --- crud list stuff ---
    const [mySavedStocks, setMySavedStocks] = useState([]);

    // handle login or making a new guy
    const handleLoginOrRegister = async () => {
        if (!typedUsername || !typedPassword) {
            setStatusNotification("fill in the boxes first...");
            return;
        }

        setWaitingForAuth(true);
        const targetUrl = isOnLoginScreen ? '/api/login/' : '/api/register/';
        
        try {
            const backendResponse = await axios.post(`http://127.0.0.1:8000${targetUrl}`, { 
                username: typedUsername, 
                password: typedPassword 
            });

            if (isOnLoginScreen) {
                setLoggedInUser(backendResponse.data.username); 
                setStatusNotification("");
            } else {
                setStatusNotification("account made. go ahead and login."); 
                setIsOnLoginScreen(true); 
                setTypedPassword("");
            }
        } catch (errorDetails) {
            console.error(errorDetails);
            setStatusNotification("server is mad or that name is taken");
        }
        setWaitingForAuth(false);
    };

    // get the ai numbers from django
    const getAiStockPrediction = async () => {
        if (!stockSymbol) return; 

        setWaitingForAi(true);
        try {
            const aiResponse = await axios.post('http://127.0.0.1:8000/api/predict/', { ticker: stockSymbol });
            setAiPredictionData(aiResponse.data);
        } catch (errorDetails) {
            console.error(errorDetails);
            alert("django probably crashed");
        }
        setWaitingForAi(false);
    };

    // --- watchlist logic (the crud parts) ---
    
    // pull the list from the database
    const refreshMyList = async () => {
        try {
            const res = await axios.get(`http://127.0.0.1:8000/api/get-list/?username=${loggedInUser}`);
            setMySavedStocks(res.data);
        } catch (err) {
            console.error("couldnt get the list", err);
        }
    };

    // shove a prediction into the database
    const saveThisPrediction = async () => {
        try {
            await axios.post('http://127.0.0.1:8000/api/save-it/', {
                username: loggedInUser,
                ticker: stockSymbol,
                prediction: aiPredictionData.prediction
            });
            refreshMyList(); // update the view
        } catch (err) {
            alert("failed to save");
        }
    };

    // kill an entry from the list
    const nukeStock = async (id) => {
        try {
            await axios.delete(`http://127.0.0.1:8000/api/remove-it/${id}/`);
            refreshMyList(); // update the view
        } catch (err) {
            alert("failed to delete");
        }
    };

    // auto-run this if someone actually logs in
    useEffect(() => {
        if (loggedInUser) refreshMyList();
    }, [loggedInUser]);


    // screen 1: the login gate
    if (!loggedInUser) {
        return (
            <div style={{ maxWidth: '400px', margin: '50px auto', fontFamily: 'monospace', textAlign: 'center' }}>
                <h1>BullsAI</h1>
                <p>{isOnLoginScreen ? 'identify yourself' : 'join the team'}</p>
                
                <div style={{ margin: '20px 0', padding: '20px', border: '2px solid #333', borderRadius: '8px' }}>
                    <input 
                        type="text" 
                        placeholder="username" 
                        value={typedUsername} 
                        onChange={(e) => setTypedUsername(e.target.value)}
                        style={{ padding: '10px', fontSize: '16px', width: '90%', marginBottom: '10px', boxSizing: 'border-box' }}
                    />
                    <input 
                        type="password" 
                        placeholder="password" 
                        value={typedPassword} 
                        onChange={(e) => setTypedPassword(e.target.value)}
                        style={{ padding: '10px', fontSize: '16px', width: '90%', marginBottom: '10px', boxSizing: 'border-box' }}
                    />
                    
                    <button 
                        onClick={handleLoginOrRegister} 
                        disabled={waitingForAuth} 
                        style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer', backgroundColor: 'black', color: 'white', width: '90%' }}
                    >
                        {waitingForAuth ? "one sec..." : (isOnLoginScreen ? "Login" : "Register")}
                    </button>
                </div>

                {statusNotification && (
                    <p style={{ color: statusNotification.includes("made") || statusNotification.includes("successful") ? 'green' : 'red' }}>
                        {statusNotification}
                    </p>
                )}

                <p 
                    style={{ fontSize: '12px', cursor: 'pointer', textDecoration: 'underline' }} 
                    onClick={() => {
                        setIsOnLoginScreen(!isOnLoginScreen);
                        setStatusNotification("");
                    }}
                >
                    {isOnLoginScreen ? "need an account?" : "already a member?"}
                </p>
            </div>
        );
    }

    // screen 2: the actual app
    return (
        <div style={{ maxWidth: '600px', margin: '50px auto', fontFamily: 'monospace', textAlign: 'center' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', marginBottom: '20px' }}>
                <span>analyst: {loggedInUser}</span>
                <button onClick={() => setLoggedInUser(null)} style={{ cursor: 'pointer' }}>Sign Out</button>
            </div>

            <h1>BullsAI</h1>
            
            <div style={{ margin: '20px 0', padding: '20px', border: '2px solid #333', borderRadius: '8px' }}>
                <input 
                    type="text" 
                    placeholder="TSLA, AAPL..." 
                    value={stockSymbol} 
                    onChange={(e) => setStockSymbol(e.target.value.toUpperCase())}
                    style={{ padding: '10px', fontSize: '18px', width: '50%', marginRight: '10px' }}
                />
                
                <button 
                    onClick={getAiStockPrediction} 
                    disabled={waitingForAi} 
                    style={{ padding: '10px 20px', fontSize: '18px', cursor: 'pointer', backgroundColor: 'black', color: 'white' }}
                >
                    {waitingForAi ? "thinking..." : "Predict"}
                </button>
            </div>

            {aiPredictionData && (
                <div style={{ margin: '20px 0', padding: '20px', backgroundColor: '#f4f4f4', borderRadius: '8px' }}>
                    <h2 style={{ color: aiPredictionData.prediction?.includes('UP') ? 'green' : 'red' }}>
                        {aiPredictionData.prediction}
                    </h2>
                    <p>the numbers: {aiPredictionData.stats}</p>
                    
                    <button 
                        onClick={saveThisPrediction} 
                        style={{ backgroundColor: '#2ecc71', color: 'white', border: 'none', padding: '10px', cursor: 'pointer', marginTop: '10px' }}
                    >
                        Save to My List
                    </button>
                </div>
            )}

            {/* the watchlist display (crud stuff) */}
            <hr style={{ margin: '40px 0' }} />
            <h3>My Saved Predictions </h3>
            <div style={{ textAlign: 'left' }}>
                {mySavedStocks.map(item => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid #ccc' }}>
                        <span><strong>{item.ticker_symbol}</strong>: {item.prediction_text}</span>
                        <button onClick={() => nukeStock(item.id)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>[Delete]</button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default App;