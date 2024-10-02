import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';


const ChatLayout = ({children}) => {
    const page = usePage();
    const conversations = page.props.conversations
    const SelectedConversation = page.props.selectedConversation;

    const [onlineUsers , setOnlineUsers] = useState({});
    const [localConversations, setLocalConversations] = useState([]);
    const [sortedConversations, setSortedConversations] = useState([]);
    const isUserOnline = (userId) => onlineUsers[userId];

    console.log("conversations", conversations);
    console.log("selectedConversations", SelectedConversation);

    useEffect(()=>{
        setLocalConversations(conversations);
    },[conversations]);

    useEffect(()=>{
        setSortedConversations(
            localConversations.sort((a,b) => {
                if(a.blocked_at && b.blocked_at){
                    return a.blocked_at > b.blocked_at ? 1 : -1;
                }else if(a.blocked_at){
                    return 1;
                }else if(b.blocked_at){
                    return -1;
                }

                if(a.last_message_date && b.last_message_date){
                    return a.last_message_date.localeCompare(b.last_message_date);
                }else if(a.last_message_date){
                    return -1;
                }else if(b.last_message_date){
                    return 1;
                }else{
                    return 0;
                }
            })
        );
    },[localConversations]);

    useEffect(()=>{
        Echo.join('online')
            .here((users) => {
                console.log('here', users);
                const onlineUsersObj = Object.fromEntries(
                    users.map((user) => [user.id, user])
                );

                setOnlineUsers((prevOnlineUsers) => {
                    return {...prevOnlineUsers, ...onlineUsersObj}
                });
            })
            .joining((user) => {
                console.log('joining', user);
                setOnlineUsers((prevOnlineUsers) => {
                    const updatedOnlineUsers = {...prevOnlineUsers};
                    updatedOnlineUsers[user.id] = user;
                    return updatedOnlineUsers;
                });
            })
            .leaving((user) => {
                console.log('leaving', user);
                setOnlineUsers( (prevOnlineUsers) => {
                    const updatedOnlineUsers = {...prevOnlineUsers};
                    delete updatedOnlineUsers[user.id];
                    return updatedOnlineUsers;
                });
            })
            .error((err) => {
                console.error("Error:", err);
            });

        return () => { Echo.leave("online")};
    },[]);

    return(
        <>

        </>
    )
}

export default ChatLayout;
