/*** 
 How to use animations ?
 -> import the functions in desired component then set the class mentioned in "" to the element and then add starting positions.
 e.g. 1.) if I want to add opacityAnimation5 to an h1, this is how h1 will look like: 
 <h1 className = "opacityAnimation-5 opacity-0" >This is h1</h1>
 NOTE opacity-0 is starting position of h1 and then animation class will make its opacity-1, also don't forget to import opacityAnimation5 function and call it inside useEffect function in the component/page you want.
 e.g 2.) if I want to use appearUpAnimation5 to a div, this is how div would lopk like:
 <div className="appearUpAnimation-fast opacity-0 translate-y-10" ></div>
 note: translate-y-[value] will set intial position of div below its end postion, the can be set according to requirements.
 refer gsap docs for more info.
 */
"use client";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export const opacityAnimation5 = () => {
  return gsap.to(".opacityAnimation-5", {
    opacity: 1,
    duration: 5,
    scrollTrigger: {
      trigger: ".opacityAnimation-5",
      scroller: "body",
      markers: true,
    },
  });
};

export const appearUpAnimationFast = () => {
  return gsap.to(".appearUpAnimation-fast", {
    opacity: 1,
    duration: 1,
    translateY: 0,
    scrollTrigger: ".slideAnimation",
  });
};

export const slideAnimation = () => {
  // NOTE : to let element appear from left give class "-translate-x-[value]" and to let element appear from right give class "translate-x-[value]"
  return gsap.to(".slideAnimation", {
    opacity: 1,
    duration: 0.5,
    translateX: 0,
    scrollTrigger: ".slideAnimation",
  });
};