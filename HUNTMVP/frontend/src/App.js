import { useState } from "react";
import './App.css'

export default function IncidentForm() {
  const [message, setMessage] = useState("");//state to track the incident description
  const [status, setStatus] = useState("");// state to display req/res status to user
  const [severity, setSeverity] = useState("Medium");//sr=tate for severity dropdown(default is medium though)
  const [userPhone, setUserPhone] = useState(""); // state for user phone number(needed if aws connect should call back)

  //handle form submission
  const submitIncident = async (e) => {
    e.preventDefault();//prevent pg reload once form is submitted
    setStatus("Sending...");//feedback while req is pending

    try {
      //send incident report to backend API
      const res = await fetch("http://localhost:5000/incident", {
        method: "POST",//send as POST req
        headers: { "Content-Type": "application/json" },// tell backend json is coming
        body: JSON.stringify({ message, severity, userPhone })
      });

      const data = await res.json(); //parse backend response
      if (data.success) setStatus("Incident reported! Good job girl");//success feedback
      else setStatus("Failed: " + data.error); 
    } catch (err) {
      setStatus("Failed: " + err.message);//network errors
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto incident-container">
      <h1 className="text-xl font-bold mb-4">Report Incident</h1>
      <form className="incident-form" onSubmit={submitIncident}>
        <textarea
          className="w-full border rounded p-2 mb-4"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Describe the incident..."
          required
        />
        <input
          type="tel"
          className="w-full border rounded p-2 mb-4"
          placeholder="Your phone number"
          value={userPhone}
          onChange={(e) => setUserPhone(e.target.value)}
          required={severity === "High"} // required only for High severity
        />
        <select
          className="w-full border rounded p-2 mb-4"
          value={severity}
          onChange={(e) => setSeverity(e.target.value)}
        >
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
        <button className="bg-red-600 text-white px-4 py-2 rounded">
          Report Incident
        </button>
      </form>
      {status && <p className="mt-4 status">{status}</p>}
    </div>
  );
}
