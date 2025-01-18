"use client"

import { useEffect } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)
export default function LandingChatSection() {
    useEffect(() => {
        gsap.to(".opacityAnimation-1", {
            opacity: 1,
            duration: 3,
            scrollTrigger: ".opacityAnimation-1",
        })
    }, [])

    return (
        <section className="relative w-full h-full ">
            <div className=" absolute rounded-lg inset-0 bg-contain  bg-landing-chat-light-section-bg dark:bg-landing-chat-dark-section-bg opacity-20 " />
            <div className="w-full h-full flex items-center justify-around flex-wrap " >
                <h1 className="dark:text-white font-bold text-3xl opacity-0 opacityAnimation-1 sm:text-4xl md:text-8xl lg:9xl ">Think Smarter.<br /> Chat Better.<br /> Experience Limitless AI.</h1>
            </div>

        </section>
    )
} 
