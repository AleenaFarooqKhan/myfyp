import React, { createContext, useReducer } from 'react';
import { OriginReducer, DestinationReducer } from '../Reducers/Reducers';

// Create contexts
export const OriginContext = createContext();
export const DestinationContext = createContext();

// Common initial state
const initialLocationState = {
  latitude: null,
  longitude: null,
  address: "",
  name: ""
};

// Origin Provider Component
export const OriginContextProvider = ({ children }) => {
  const [origin, dispatchOrigin] = useReducer(OriginReducer, initialLocationState);
  
  return (
    <OriginContext.Provider value={{ origin, dispatchOrigin }}>
      {children}
    </OriginContext.Provider>
  );
};

// Destination Provider Component
export const DestinationContextProvider = ({ children }) => {
  const [destination, dispatchDestination] = useReducer(DestinationReducer, initialLocationState);
  
  return (
    <DestinationContext.Provider value={{ destination, dispatchDestination }}>
      {children}
    </DestinationContext.Provider>
  );
};

// Combined Provider for cleaner usage (optional)
export const LocationProviders = ({ children }) => {
  return (
    <OriginContextProvider>
      <DestinationContextProvider>
        {children}
      </DestinationContextProvider>
    </OriginContextProvider>
  );
};