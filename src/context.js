import React from 'react';
export const WSContext = React.createContext({
    ws: null,
    event: null,
    name: ""
});

export const StreamingContext = React.createContext({
    audio: {
        enabled: true,
        setEnabled: () => { }
    },
    video: {
        enabled: true,
        setEnabled: () => { }
    },
    screen: {
        enabled: true,
        setEnabled: () => { }
    },
    userStream: null,
    screenStream: null,
    dummy: null
});