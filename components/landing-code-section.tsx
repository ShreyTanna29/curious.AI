"use client"
import gsap from "gsap"
import { useEffect } from "react"
import { ScrollTrigger } from "gsap/ScrollTrigger"


gsap.registerPlugin(ScrollTrigger)
export default function LandingCodeSection() {
    useEffect(() => {
        gsap.to("section", {
            opacity: 1,
            duration: 5,
            stagger: 1,
            scrollTrigger: "section",
        })
    })
    return (
        <section className="relative opacity-0 bg-black w-full h-full ">
            <div className=" absolute rounded-lg inset-0 bg-contain bg-landing-code-section-bg opacity-20 " />
            <div className=" w-full h-full flex items-center justify-center  ">
                <h1 className="text-white text-4xl md:text-8xl lg:text-8xl text-center ">Generate Flawless Code, Effortlessly</h1>
            </div>


        </section>
    )
} 
