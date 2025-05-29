import React, { createContext, useReducer } from "react";

// Create the contexts
export const OriginContext = createContext();
export const DestinationContext = createContext();

// Origin reducer
const originReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ORIGIN':
      return {
        ...state,
        ...action.payload
      };
    case 'CLEAR_ORIGIN':
      return null;
    default:
      return state;
  }
};

// Destination reducer
const destinationReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_DESTINATION':
      return {
        ...state,
        ...action.payload
      };
    case 'CLEAR_DESTINATION':
      return null;
    default:
      return state;
  }
};

// Origin context provider
export const OriginContextProvider = (props) => {
  const [origin, dispatchOrigin] = useReducer(originReducer, null);
  
  return (
    <OriginContext.Provider value={{ origin, dispatchOrigin }}>
      {props.children}
    </OriginContext.Provider>
  );
};

// Destination context provider
export const DestinationContextProvider = (props) => {
  const [destination, dispatchDestination] = useReducer(destinationReducer, null);
  
  return (
    <DestinationContext.Provider value={{ destination, dispatchDestination }}>
      {props.children}
    </DestinationContext.Provider>
  );
};

// Combined provider for convenience
export const LocationProviders = ({ children }) => {
  return (
    <OriginContextProvider>
      <DestinationContextProvider>
        {children}
      </DestinationContextProvider>
    </OriginContextProvider>
  );
};