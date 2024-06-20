import React, { createContext, useContext, useState } from 'react';

const S3BucketContext = createContext();

export const useS3Buckets = () => useContext(S3BucketContext);

export const S3BucketProvider = ({ children }) => {
  const [buckets, setBuckets] = useState([]);
  const [selectedBucket, setSelectedBucket] = useState('');

  const updateBuckets = (newBuckets) => {
    setBuckets(newBuckets);
    console.log("S3 buckets updated:", newBuckets);
  };

  const updateSelectedBucket = (bucketName) => {
    setSelectedBucket(bucketName);
    console.log("Selected S3 bucket updated:", bucketName);
  };

  return (
    <S3BucketContext.Provider value={{ buckets, selectedBucket, updateBuckets, updateSelectedBucket }}>
      {children}
    </S3BucketContext.Provider>
  );
};