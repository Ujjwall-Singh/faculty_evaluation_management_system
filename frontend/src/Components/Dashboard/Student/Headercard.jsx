import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

const Headercard = () => {
  useEffect(() => {
    AOS.init();
  }, []);

  return (
    <div
      className="items-center mt-6 md:mt-5 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid-cols-1 lg:grid-cols-2 overflow-x-hidden lg:grid md:py-8 lg:py-14 xl:py-14 lg:mt-3 xl:mt-5 bg-white"
      data-aos="fade-right"
      data-aos-duration="800"
    >
      <div className="pr-0 lg:pr-14 mb-8 md:mb-14 py-8 md:py-14 lg:py-0 text-center lg:text-left">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-semibold text-purple-500 leading-tight">
          <span className="block w-full">Faculty Evaluation System</span> 
        </h1>
        <p className="py-4 text-base sm:text-lg text-black 2xl:py-8 md:py-6 2xl:pr-5 leading-relaxed">
        "Empowering academic growth through feedback. Our Faculty Evaluation System enables transparent, constructive, and data-driven assessments to enhance teaching quality and foster a culture of continuous improvement."
        </p>
        {/* Uncomment if needed
        <div className="mt-4">
          <a
            href="#contact"
            className="inline-block px-4 sm:px-5 md:px-8 py-3 text-base sm:text-lg tracking-wider text-white bg-purple-500 rounded-lg hover:bg-purple-600 group transition-colors"
          >
            <span>Explore More</span>
          </a>
        </div> */}
      </div>
      <div className="pb-6 sm:pb-10 overflow-hidden p-4 md:p-10 lg:p-0 flex justify-center">
        <img
          id="heroImg1"
          className="transition-all duration-300 ease-in-out hover:scale-105 w-full max-w-sm sm:max-w-md lg:max-w-full h-auto object-contain"
          src="https://bootstrapmade.com/demo/templates/FlexStart/assets/img/hero-img.png"
          alt="Faculty Evaluation System illustration showing academic growth and feedback"
          width="500"
          height="488"
          loading="lazy"
        />
      </div>
    </div>
  );
};

export default Headercard;
