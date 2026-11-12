import React from "react";

// True once the animated splash has finished, so entry popups don't open
// underneath it.
export const AppReadyContext = React.createContext(false);
export const useAppReady = () => React.useContext(AppReadyContext);
