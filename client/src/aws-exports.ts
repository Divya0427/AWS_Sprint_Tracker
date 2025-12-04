const awsConfig = {
  Auth: {
    Cognito: {
      userPoolId: "ap-south-1_USXcq9vQB",    // 🔁 your actual User Pool ID
      userPoolClientId: "44mfu9vmbd2uisd7kjdlr455mu",  // 🔁 your actual App Client ID
      region: "ap-south-1",                // 🔁 your region
    },
  },
};

export default awsConfig;
