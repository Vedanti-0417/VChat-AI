
import "./Slidebar.css";
import { useContext, useEffect } from "react";
import { MyContext } from "./MyContext.jsx";
import { v1 as uuidv1 } from "uuid";
import { API_BASE_URL } from "../config.js";

function Sidebar() {
    const {
        allThreads,
        setAllThreads,
        currThreadId,
        setNewChat,
        setPrompt,
        setReply,
        setCurrThreadId,
        setPrevChats,
        reply
    } = useContext(MyContext);

    // Fetch all chat threads
    const getAllThreads = async () => {
        try {
            const response = await fetch(
                `${API_BASE_URL}/api/thread`
            );

            if (!response.ok) {
                throw new Error("Failed to fetch threads");
            }

            const res = await response.json();

            const filteredData = res.map(thread => ({
                threadId: thread.threadId,
                title: thread.title
            }));

            setAllThreads(filteredData);
        } catch (err) {
            console.log("Error fetching threads:", err);
        }
    };

    useEffect(() => {
        getAllThreads();
    }, [currThreadId, reply]);

    // Create a new chat
    const createNewChat = () => {
        setNewChat(true);
        setPrompt("");
        setReply(null);
        setCurrThreadId(uuidv1());
        setPrevChats([]);
    };

    // Open previous chat
    const changeThread = async (newThreadId) => {
        setCurrThreadId(newThreadId);

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/thread/${newThreadId}`
            );

            if (!response.ok) {
                throw new Error("Failed to load chat");
            }

            const res = await response.json();

            console.log(res);
            setPrevChats(res);
            setNewChat(false);
            setReply(null);

        } catch (err) {
            console.log("Error changing thread:", err);
        }
    };

    // Delete a chat
    const deleteThread = async (threadId) => {
        try {
            const response = await fetch(
                `${API_BASE_URL}/api/thread/${threadId}`,
                { method: "DELETE" }
            );

            if (!response.ok) {
                throw new Error("Failed to delete chat");
            }

            const res = await response.json();
            console.log(res);

            // Remove deleted chat from history
            setAllThreads(prev =>
                prev.filter(thread => thread.threadId !== threadId)
            );

            // If current chat is deleted, create a new chat
            if (threadId === currThreadId) {
                createNewChat();
            }

        } catch (err) {
            console.log("Error deleting thread:", err);
        }
    };

    return (
        <section className="sidebar">

            {/* New Chat Button */}
            <button onClick={createNewChat}>
                <img
                    src="/src/assets/blacklogo.png"
                    alt="gpt logo"
                    className="logo"
                />
                <span>
                    <i className="fa-solid fa-pen-to-square"></i>
                </span>
            </button>

            {/* Chat History */}
            <ul className="history">
                {allThreads?.map((thread) => (
                    <li
                        key={thread.threadId}
                        onClick={() => changeThread(thread.threadId)}
                        className={
                            thread.threadId === currThreadId
                                ? "highlighted"
                                : ""
                        }
                    >
                        <span className="thread-title">
                            {thread.title}
                        </span>

                        {/* Delete Icon */}
                        <i
                            className="fa-solid fa-trash delete-icon"
                            onClick={(e) => {
                                e.stopPropagation();
                                deleteThread(thread.threadId);
                            }}
                            title="Delete chat"
                        ></i>

                    </li>
                ))}
            </ul>

            {/* Sidebar Footer */}
            <div className="sign">
                <p>By Vedanti &hearts;</p>
            </div>

        </section>
    );
}

export default Sidebar;
