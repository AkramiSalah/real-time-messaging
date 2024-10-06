import React from "react";

export const EventBusContext = React.createContext();

export const EventBusProvider = ({children}) => {
    const [events, setEvents] = React.useState({});

    const emit = (name, data) => {
        if(events[name]){
            for (let callback of events[name]){
                callback(data)
            }
        }
    }

    const on = (name , callback) => {
        if(!events[name]){
            events[name] = [];
        }

        events[name].push(callback);

        return () => {
            events[name] = events[name].filter((fn) => fn !== callback)
        }
    }

    return(
        <EventBusContext.Provider value={{emit, on}}>
            {children}
        </EventBusContext.Provider>
    )
}

export const useEventBus = () => {
    return React.useContext(EventBusContext)
}
