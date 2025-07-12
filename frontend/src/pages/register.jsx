import { useState } from "react";
import axios from "axios";
import "../styles/form.css";

const Register= ()=>{
    const [form, setForm] = useState({
        username:"",
        email: "",
        password:""
    });
    const [msg, setMsg] = useState("");

    const handleChange= (e)=> {
        setForm({ ...form, [e.terget.name]: e.terget.value});
    };

    const handleRegister = async (e)=> {
        e.preventDefault();
        try{
            const res = await axios.post(
                `${import.meta.env.VITE_API_URL}/user/register`,
                form
            );
            setMsg("Registered successfully!");
        } catch (err) {
            setMsg(err.response?.data?.msg || "Registration failed");
        }
    };

    return (
        <div className="form-container">
            <h2>Register</h2>
            <form onSubmit={handleRegister}>
                <input 
                name="username" 
                value={form.username} 
                onChange={handleChange} 
                placeholder="Username"
                />
                <input 
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Email" 
                />
                <input 
                name="password" 
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Password" 
                />

                <button type="submit">Sign Up</button>

            </form>
            <p>{msg}</p>
        </div>
    );

};

export default Register;