import { Link } from "react-router-dom";
import image from '../Assets/facultyimg.gif'
import image1 from '../Assets/signupimg.gif'
import image2 from '../Assets/stdimg.gif'
// Reusable ServiceCard Component
const ServiceCard = ({ title, icon, bgColor, link, image }) => {
  return (
    <Link
      to={link}
      className={`${bgColor} p-2 rounded-2xl shadow-lg flex flex-col items-center justify-between w-56 h-44 text-white text-center transition-transform transform hover:scale-105`}
    >
      <img src={image} alt={title} className="w-full h-32 object-cover rounded-lg" />
      <div className="flex items-center space-x-2">
        {icon}
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
    </Link>
  );
};

const Services = () => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <ServiceCard
          title="User Profile"
          icon={<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-label="User Profile Icon"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>}
          bgColor="bg-purple-500"
          link="/profile"
          image={image}
        />
        <ServiceCard
          title="Settings"
          icon={<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-label="Settings Icon"><path d="M19.43 12.98c.04-.32.07-.65.07-.98s-.03-.66-.07-.98l2.11-1.65a.5.5 0 00.12-.64l-2-3.46a.5.5 0 00-.61-.22l-2.49 1a7.89 7.89 0 00-1.72-.98l-.38-2.65a.5.5 0 00-.5-.42h-4a.5.5 0 00-.5.42l-.38 2.65c-.61.24-1.19.55-1.72.98l-2.49-1a.5.5 0 00-.61.22l-2 3.46a.5.5 0 00.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65a.5.5 0 00-.12.64l2 3.46a.5.5 0 00.61.22l2.49-1c.53.43 1.11.74 1.72.98l.38 2.65a.5.5 0 00.5.42h4a.5.5 0 00.5-.42l.38-2.65a7.89 7.89 0 001.72-.98l2.49 1a.5.5 0 00.61-.22l2-3.46a.5.5 0 00-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/></svg>}
          bgColor="bg-purple-500"
          link="/settings"
          image={image1}
        />
        <ServiceCard
          title="Support"
          icon={<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-label="Support Icon"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>}
          bgColor="bg-purple-500"
          link="/support"
          image={image2}
        />
      </div>
    </div>
  );
};

export default Services;
