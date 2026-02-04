import { useState } from "react";

const Auth = ({ username, setUsername, onLoginSuccess }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    if (!username || !password) return;
    
    setLoading(true);
    const endpoint = isLoginMode ? "/login" : "/register";
    
    try {
      const response = await fetch(`http://localhost:3001${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        if (isLoginMode) {
          onLoginSuccess(username);
        } else {
          alert("Registration successful! Please login.");
          setIsLoginMode(true);
        }
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Auth Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full h-screen bg-[#0f172a] overflow-hidden font-sans">
      
      {/* === LEFT SIDE: FORM === */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-8 relative z-10">
        
        {/* Mobile Background Blob */}
        <div className="absolute top-0 left-0 w-full h-full md:hidden bg-gradient-to-br from-blue-900/20 to-purple-900/20 -z-10" />

        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="text-center md:text-left">
            <h2 className="text-4xl font-extrabold text-white tracking-tight mb-2">
              {isLoginMode ? "Welcome Back" : "Join SyncText"}
            </h2>
            <p className="text-gray-400">
              {isLoginMode 
                ? "Enter your credentials to access your workspace." 
                : "Create an account to start collaborating with your team."}
            </p>
          </div>

          {/* Form */}
          <div className="space-y-6 mt-8">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 ml-1">Username</label>
              <input
                type="text"
                value={username}
                placeholder="e.g. dev_master"
                className="w-full bg-[#1e293b] border border-gray-700 text-white p-4 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-gray-600"
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 ml-1">Password</label>
              <input
                type="password"
                value={password}
                placeholder="••••••••"
                className="w-full bg-[#1e293b] border border-gray-700 text-white p-4 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-gray-600"
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAuth()}
              />
            </div>

            <button 
              onClick={handleAuth}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 rounded-xl transition-all transform active:scale-[0.98] shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                isLoginMode ? "Sign In" : "Create Account"
              )}
            </button>
          </div>

          {/* Footer Toggle */}
          <div className="text-center mt-6">
            <p className="text-gray-500 text-sm">
              {isLoginMode ? "Don't have an account?" : "Already have an account?"}{" "}
              <button 
                onClick={() => setIsLoginMode(!isLoginMode)}
                className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
              >
                {isLoginMode ? "Sign up for free" : "Log in"}
              </button>
            </p>
          </div>

          {/* Social Proof Badge */}
          <div className="pt-8 border-t border-gray-800 flex items-center justify-center gap-4 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
             <div className="text-xs text-gray-500 font-mono uppercase tracking-widest">Powered by</div>
             <div className="flex gap-4 font-bold text-gray-400">
                <span>Socket.io</span>
                <span>•</span>
                <span>React</span>
                <span>•</span>
                <span>Node.js</span>
             </div>
          </div>
        </div>
      </div>

      {/* === RIGHT SIDE: MARKETING (Hidden on Mobile) === */}
      <div className="hidden md:flex w-1/2 bg-gradient-to-br from-blue-900 via-[#0f172a] to-black relative items-center justify-center overflow-hidden">
        
        {/* Abstract Background Shapes */}
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[100px]" />

        {/* Glassmorphism Card (Fake Chat UI) */}
        <div className="relative z-10 bg-white/5 backdrop-blur-2xl border border-white/10 p-6 rounded-3xl w-[400px] shadow-2xl transform rotate-[-5deg] hover:rotate-0 transition-transform duration-700">
            {/* Fake Header */}
            <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-green-400 to-blue-500"></div>
                <div>
                    <div className="h-2 w-24 bg-gray-600 rounded mb-2"></div>
                    <div className="h-2 w-16 bg-gray-700 rounded"></div>
                </div>
            </div>
            
            {/* Fake Messages */}
            <div className="space-y-4">
                <div className="flex gap-3">
                   <div className="w-8 h-8 rounded-full bg-gray-700 flex-shrink-0"></div>
                   <div className="bg-gray-800 p-3 rounded-2xl rounded-tl-none text-xs text-gray-300 w-3/4 leading-relaxed">
                      Hey team! Did anyone check the latest deployment logs? 🚀
                   </div>
                </div>
                <div className="flex gap-3 flex-row-reverse">
                   <div className="w-8 h-8 rounded-full bg-blue-600 flex-shrink-0"></div>
                   <div className="bg-blue-600/20 border border-blue-500/30 p-3 rounded-2xl rounded-tr-none text-xs text-blue-100 w-2/3 leading-relaxed">
                      Yes! All green. The real-time latency is down to 20ms.
                   </div>
                </div>
                <div className="flex gap-3">
                   <div className="w-8 h-8 rounded-full bg-gray-700 flex-shrink-0"></div>
                   <div className="bg-gray-800 p-3 rounded-2xl rounded-tl-none text-xs text-gray-300 w-1/2">
                      Amazing work! 🎉
                   </div>
                </div>
            </div>

            {/* Fake Input */}
            <div className="mt-6 h-10 bg-black/30 rounded-xl border border-white/5 flex items-center px-3">
                <div className="h-2 w-1/2 bg-gray-700 rounded opacity-30"></div>
            </div>
        </div>

        {/* Floating Tag */}
        <div className="absolute bottom-20 right-20 bg-white/10 backdrop-blur-md border border-white/20 px-6 py-3 rounded-full text-sm text-white shadow-xl animate-bounce">
            ✨ Real-time Sync Active
        </div>

      </div>
    </div>
  );
};

export default Auth;