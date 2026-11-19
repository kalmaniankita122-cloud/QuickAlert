const credentials = {
  full_name: "Rajeshwari Kalamani",
  email: "kalmaniankita122@gmail.com",
  password: "Raju@2007"
};

async function testRegister() {
  try {
    const response = await fetch(
      "http://localhost:5000/api/auth/register",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(credentials)
      }
    );

    const data = await response.json();

    console.log("Registration Status:", response.status);
    console.log("Registration Response:", data);

  } catch (error) {
    console.log("Registration Test Error:", error.message);
  }
}

testRegister();