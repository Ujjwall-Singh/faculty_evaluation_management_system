import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

const Headercard = () => {
  useEffect(() => {
    AOS.init();
  }, []);

  return (
    <div
      className="items-center mt-10 md:mt-5 w-10/12 grid-cols-2 mx-auto overflow-x-hidden lg:grid md:py-14 lg:py-24 xl:py-14 lg:mt-3 xl:mt-5 bg-white"
      data-aos="fade-right"
      data-aos-duration="800"
    >
      <div className="pr-14 md:mb-14 py-14 md:py-0 ">
        <h1 className="text-3xl font-semibold text-purple-500 xl:text-4xl lg:text-3xl">
          <span className="block w-full">Faculty Evaluation System</span> 
        </h1>
        <p className="py-4  text-lg text-black 2xl:py-8 md:py-6 2xl:pr-5">
        "Empowering academic growth through feedback. Our Faculty Evaluation System enables transparent, constructive, and data-driven assessments to enhance teaching quality and foster a culture of continuous improvement."
        </p>
        {/* <div className="mt-4">
          <a
            href="#contact"
            className="px-5 py-3 text-lg tracking-wider text-white bg-purple-500 rounded-lg md:px-8 hover:bg-purple-600 group"
          >
            <span>Explore More</span>
          </a>
        </div> */}
      </div>
      <div className="pb-10 overflow-hidden md:p-10 lg:p-0 sm:pb-0">
        <img
          id="heroImg1"
          className="transition-all duration-300 ease-in-out hover:scale-105 lg:w-full sm:mx-auto sm:w-4/6 sm:pb-12 lg:pb-0"
          src="https://bootstrapmade.com/demo/templates/FlexStart/assets/img/hero-img.png"
          alt="Awesome hero page image"
          width="500"
          height="488"
        />
      </div>
    </div>
  );
};

export default Headercard;
