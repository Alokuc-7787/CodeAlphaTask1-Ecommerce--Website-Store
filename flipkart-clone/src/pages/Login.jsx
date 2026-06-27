import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = () => {
    if (email === "admin@gmail.com" && password === "1234") {
      setMessage("Login Successful ✅");
    } else {
      setMessage("Invalid Credentials ❌");
    }
  };

  return (
    <div style={{ padding: "50px", textAlign: "center" }}>
      <h2>Login Page</h2>

      <input
        type="email"
        placeholder="Enter Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ padding: "10px", margin: "10px" }}
      />

      <br />

      <input
        type="password"
        placeholder="Enter Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ padding: "10px", margin: "10px" }}
      />

      <br />

      <button
        onClick={handleLogin}
        style={{ padding: "10px 20px", cursor: "pointer" }}
      >
        Login
      </button>

      <h3>{message}</h3>
    </div>
  );
}
