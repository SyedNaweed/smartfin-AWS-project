import { Link } from "react-router-dom"; // Import Link from react-router-dom


// assets
import illustration from "../assets/illustration.jpg";

const Intro = () => {
  return (
    <div className="intro">
      <div>
        <h1>
          Take Control of <span className="accent">Your Money</span>
        </h1>
        <p>
          Personal budgeting is the secret to financial freedom. Start your journey today.
        </p>
        <Link to="/dashboard">
          <button className="login-button">Login / Register</button>
        </Link>
      </div>
      <img src={illustration} alt="Person with money" width={600} />
    </div>
  );
};

export default Intro;
