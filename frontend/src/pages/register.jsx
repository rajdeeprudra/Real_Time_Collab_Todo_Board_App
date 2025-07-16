import { useState } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';


import "../styles/form.css";




const Register= ()=>{
    const [form, setForm] = useState({
        username:"",
        email: "",
        password:""
    });
    const navigate = useNavigate();
    const [msg, setMsg] = useState("");
    const [showPopup, setShowPopup] = useState(false);

    const handleChange= (e)=> {
        setForm({ ...form, [e.target.name]: e.target.value});
    };

    const handleRegister = async (e)=> {
        e.preventDefault();
        try{
            const res = await axios.post(
                `${import.meta.env.VITE_API_URL}/user/register`,
                form
            );
            setMsg("Registered successfully!");
            navigate('/login');
            setShowPopup(true);
            setForm({username: "", email:"", password:""});

            setTimeout(()=>{
                setShowPopup(false);
                setMsg("");
            },3000);
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
                type="text"
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