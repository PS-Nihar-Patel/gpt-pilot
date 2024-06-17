const reportWebVitals = onPerfEntry => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry).catch(error => console.error('Failed to get CLS', error));
      getFID(onPerfEntry).catch(error => console.error('Failed to get FID', error));
      getFCP(onPerfEntry).catch(error => console.error('Failed to get FCP', error));
      getLCP(onPerfEntry).catch(error => console.error('Failed to get LCP', error));
      getTTFB(onPerfEntry).catch(error => console.error('Failed to get TTFB', error));
    }).catch(error => console.error('Failed to import web-vitals', error));
  }
};

export default reportWebVitals;