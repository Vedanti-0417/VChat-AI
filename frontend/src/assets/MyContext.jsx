
import { createContext, useState } from "react";
import { v1 as uuidv1 } from "uuid";

export const MyContext = createContext();

function MyContextProvider({ children }) {

    const [prompt, setPrompt] = useState("");
    const [reply, setReply] = useState(null);

    const [currThreadId, setCurrThreadId] = useState(uuidv1());

    const [prevChats, setPrevChats] = useState([]);

    const [newChat, setNewChat] = useState(true);

    const contextValue = {
        prompt,
        setPrompt,

        reply,
        setReply,

        currThreadId,
        setCurrThreadId,

        prevChats,
        setPrevChats,

        newChat,
        setNewChat
    };

    return (
        <MyContext.Provider value={contextValue}>
            {children}
        </MyContext.Provider>
    );
}

export default MyContextProvider;
