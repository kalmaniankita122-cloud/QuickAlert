const credentials = {
  email: "kalmanianita122@gmail.com",
  password: "Raju@2007"
};

async function testLogin() {
  try {
    const response = await fetch(
      "http://localhost:5000/api/auth/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(credentials)
      }
    );

    const data = await response.json();

    console.log("Login Status:", response.status);
    console.log("Login Response:", data);

  } catch (error) {
    console.log("Login Test Error:", error.message);
  }
}

testLogin();