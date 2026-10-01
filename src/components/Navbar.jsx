import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
const Navbar = () => {
 const { user, logout } = useAuth();
 const navigate = useNavigate();
 const handleLogout = () => {
 logout();
 navigate("/login");
 };
 return (
 <div className="navbar">
 <Link to="/" style={{ color: "#fff", fontWeight: "bold", textDecoration: "none" }}>
 Task Manager
 </Link>
 <div>
 {user ? (
 <>
 <span style={{ marginRight: 12 }}>Hi, {user.name}</span>
 <button onClick={handleLogout}>Logout</button>
 </>
 ) : (
 <Link to="/login" style={{ color: "#fff" }}>Login</Link>
 )}
 </div>
 </div>
 );
};
export default Navbar;

