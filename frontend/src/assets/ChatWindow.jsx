
import "./ChatWindow.css";
import Chat from "./Chat.jsx";
import { MyContext } from "./MyContext.jsx";
import { useContext, useState, useEffect } from "react";
import { ScaleLoader } from "react-spinners";
import { v1 as uuidv1 } from "uuid";

function ChatWindow() {
    const {
        prompt,
        setPrompt,
        reply,
        setReply,
        currThreadId,
        setPrevChats,
        setNewChat,
        setCurrThreadId
    } = useContext(MyContext);

    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [activePanel, setActivePanel] = useState("");

    const [profileName, setProfileName] = useState(() =>
        localStorage.getItem("vchat-profile-name") || "Guest User"
    );

    const [nameDraft, setNameDraft] = useState(profileName);

    const [theme, setTheme] = useState(() =>
        localStorage.getItem("vchat-theme") || "dark"
    );

    // Save profile name and theme
    useEffect(() => {
        localStorage.setItem("vchat-profile-name", profileName);
    }, [profileName]);

    useEffect(() => {
        localStorage.setItem("vchat-theme", theme);
    }, [theme]);

    // Get AI response
    const getReply = async () => {
        const currentPrompt = prompt.trim();

        if (!currentPrompt || loading) return;

        setLoading(true);
        setNewChat(false);

        try {
            const response = await fetch(
                "http://localhost:8080/api/chat",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        message: currentPrompt,
                        threadId: currThreadId
                    })
                }
            );

            if (!response.ok) {
                throw new Error("Failed to get AI response");
            }

            const data = await response.json();

            // Add user and assistant messages
            setPrevChats(prev => [
                ...prev,
                { role: "user", content: currentPrompt },
                { role: "assistant", content: data.reply }
            ]);

            setReply(data.reply);
            setPrompt("");

        } catch (error) {
            console.error("Chat Error:", error);
            alert("Unable to get response. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Open profile panel
    const openPanel = (panel) => {
        setActivePanel(panel);
        setIsOpen(false);
        setNameDraft(profileName);
    };

    // Save profile
    const saveProfile = () => {
        const trimmedName = nameDraft.trim();

        if (!trimmedName) {
            alert("Please enter a valid name.");
            return;
        }

        setProfileName(trimmedName);
        setActivePanel("");
    };

    // Change theme
    const toggleTheme = () => {
        setTheme(prev => prev === "dark" ? "light" : "dark");
    };

    // Reset session
    const resetSession = () => {
        const confirmed = window.confirm(
            "Start a new session? Your saved chat history will not be deleted."
        );

        if (!confirmed) return;

        setPrompt("");
        setReply(null);
        setCurrThreadId(uuidv1());
        setPrevChats([]);
        setNewChat(true);

        setIsOpen(false);
        setActivePanel("");
    };

    // Close panels
    const closePanel = () => {
        setActivePanel("");
    };

    return (
        <div className={`chatWindow ${theme === "light" ? "light-theme" : ""}`}>

            {/* NAVBAR */}
            <div className="navbar">
                <span className="app-name">
                    VChat-AI
                    <i className="fa-solid fa-chevron-down"></i>
                </span>

                {/* PROFILE BUTTON */}
                <div className="profile-container">
                    <button
                        type="button"
                        className="profile-button"
                        onClick={() => setIsOpen(prev => !prev)}
                        title="Profile"
                    >
                        <span className="profile-avatar">
                            {profileName.charAt(0).toUpperCase()}
                        </span>
                    </button>

                    {/* PROFILE DROPDOWN */}
                    {isOpen && (
                        <div className="profile-dropdown">

                            <div className="profile-info">
                                <div className="profile-avatar large">
                                    {profileName.charAt(0).toUpperCase()}
                                </div>

                                <div className="profile-details">
                                    <h4>{profileName}</h4>
                                    <p>Guest Account</p>
                                </div>
                            </div>

                            <div className="dropdown-divider"></div>

                            <button
                                type="button"
                                className="dropdown-item"
                                onClick={() => openPanel("profile")}
                            >
                                <i className="fa-solid fa-user"></i>
                                <span>My Profile</span>
                            </button>

                            <button
                                type="button"
                                className="dropdown-item"
                                onClick={() => openPanel("settings")}
                            >
                                <i className="fa-solid fa-gear"></i>
                                <span>Settings</span>
                            </button>

                            <button
                                type="button"
                                className="dropdown-item"
                                onClick={() => openPanel("help")}
                            >
                                <i className="fa-regular fa-circle-question"></i>
                                <span>Help & Support</span>
                            </button>

                            <div className="dropdown-divider"></div>

                            <button
                                type="button"
                                className="dropdown-item logout-item"
                                onClick={resetSession}
                            >
                                <i className="fa-solid fa-arrow-rotate-left"></i>
                                <span>Reset Session</span>
                            </button>

                            <div className="dropdown-footer">
                                VChat-AI · Personal AI Assistant
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* CHAT */}
            <Chat />

            {/* LOADING */}
            <div className="loader-container">
                <ScaleLoader
                    color={theme === "light" ? "#333" : "#fff"}
                    loading={loading}
                />
            </div>

            {/* CHAT INPUT */}
            <div className="chatInput">
                <div className="inputBox">
                    <input
                        type="text"
                        placeholder="Ask anything..."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") getReply();
                        }}
                    />

                    <button
                        type="button"
                        id="submit"
                        onClick={getReply}
                        disabled={loading || !prompt.trim()}
                        title="Send message"
                    >
                        <i className="fa-solid fa-paper-plane"></i>
                    </button>
                </div>

                <p className="info">
                    VChat-AI can make mistakes. Check important info.
                </p>
            </div>

            {/* PROFILE PANELS */}
            {activePanel && (
                <div
                    className="panel-overlay"
                    onClick={closePanel}
                >
                    <div
                        className="profile-panel"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="panel-header">
                            <h3>
                                {activePanel === "profile" && "My Profile"}
                                {activePanel === "settings" && "Settings"}
                                {activePanel === "help" && "Help & Support"}
                            </h3>

                            <button
                                type="button"
                                className="panel-close"
                                onClick={closePanel}
                                title="Close"
                            >
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>

                        {/* MY PROFILE */}
                        {activePanel === "profile" && (
                            <div className="panel-content">
                                <div className="profile-large-avatar">
                                    {profileName.charAt(0).toUpperCase()}
                                </div>

                                <p className="guest-label">GUEST ACCOUNT</p>

                                <label htmlFor="profileName">
                                    Display Name
                                </label>

                                <input
                                    id="profileName"
                                    className="profile-name-input"
                                    type="text"
                                    value={nameDraft}
                                    maxLength={30}
                                    onChange={(e) => setNameDraft(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") saveProfile();
                                    }}
                                    placeholder="Enter your name"
                                />

                                <p className="panel-note">
                                    Your name is saved in this browser.
                                </p>

                                <button
                                    type="button"
                                    className="primary-action"
                                    onClick={saveProfile}
                                >
                                    Save Changes
                                </button>
                            </div>
                        )}

                        {/* SETTINGS */}
                        {activePanel === "settings" && (
                            <div className="panel-content">
                                <div className="setting-row">
                                    <div className="setting-description">
                                        <h4>Appearance</h4>
                                        <p>Choose how VChat-AI looks.</p>
                                    </div>

                                    <button
                                        type="button"
                                        className="theme-toggle"
                                        onClick={toggleTheme}
                                    >
                                        <i className={
                                            theme === "dark"
                                                ? "fa-solid fa-moon"
                                                : "fa-solid fa-sun"
                                        }></i>

                                        {theme === "dark" ? "Dark" : "Light"}
                                    </button>
                                </div>

                                <div className="dropdown-divider"></div>

                                <div className="setting-row">
                                    <div className="setting-description">
                                        <h4>Account Type</h4>
                                        <p>Currently using guest access.</p>
                                    </div>

                                    <span className="guest-badge">Guest</span>
                                </div>

                                <p className="panel-note">
                                    Your appearance preference is saved
                                    automatically in this browser.
                                </p>
                            </div>
                        )}

                        {/* HELP & SUPPORT */}
                        {activePanel === "help" && (
                            <div className="panel-content help-content">
                                <div className="help-heading">
                                    <i className="fa-solid fa-robot"></i>
                                    <h4>Welcome to VChat-AI!</h4>
                                </div>

                                <p>
                                    VChat-AI is your personal AI assistant.
                                    Ask questions and get AI-powered answers.
                                </p>

                                <div className="help-item">
                                    <i className="fa-solid fa-message"></i>
                                    <div>
                                        <h4>Start a conversation</h4>
                                        <p>
                                            Type your question in the chat box
                                            and press Enter or Send.
                                        </p>
                                    </div>
                                </div>

                                <div className="help-item">
                                    <i className="fa-solid fa-clock-rotate-left"></i>
                                    <div>
                                        <h4>Chat History</h4>
                                        <p>
                                            Open previous conversations from
                                            the sidebar.
                                        </p>
                                    </div>
                                </div>

                                <div className="help-item">
                                    <i className="fa-solid fa-trash"></i>
                                    <div>
                                        <h4>Delete Conversations</h4>
                                        <p>
                                            Use the trash icon beside a chat
                                            to delete it.
                                        </p>
                                    </div>
                                </div>

                                <div className="help-item">
                                    <i className="fa-solid fa-palette"></i>
                                    <div>
                                        <h4>Customize Appearance</h4>
                                        <p>
                                            Switch between dark and light themes
                                            in Settings.
                                        </p>
                                    </div>
                                </div>

                                <p className="panel-note">
                                    AI responses may occasionally be inaccurate.
                                    Verify important information.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}

        </div>
    );
}

export default ChatWindow;
