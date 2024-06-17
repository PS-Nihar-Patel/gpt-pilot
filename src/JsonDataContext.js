import React, { createContext, useContext, useState } from 'react';

const JsonDataContext = createContext();

export const useJsonData = () => useContext(JsonDataContext);

export const JsonDataProvider = ({ children }) => {
  const [jsonData, setJsonData] = useState({});

  const setJson = (data) => {
    try {
      setJsonData(data);
      console.log("JSON data set successfully.");
    } catch (error) {
      console.error("Error setting JSON data:", error.message, error.stack);
    }
  };

  return (
    <JsonDataContext.Provider value={{ jsonData, setJson }}>
      {children}
    </JsonDataContext.Provider>
  );
};