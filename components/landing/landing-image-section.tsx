"use client"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { InfiniteMovingCards } from "../features/infinite-moving-card"
import { useEffect } from "react";

const images = [
    "a cute cat with a hat.png",
    "a cute dog with sunglasses.png",
    "A ethereal and luminous citysc.png",
    "A futuristic city skyline at s.png",
    "A labyrinthine city of vibrant.png",
    "A vibrant and ethereal portrai.png",
    "A mystical forest at twilight,.png",
    "A surrealist landscape where a.png",
    "A vast, cosmic dreamscape wher.png",
    "A vibrant, ethereal cityscape .png",
    "A vibrant, kaleidoscopic citys.png",
    "cat.webp",
    "drone shot of a city which has.png",
    "Generate a breathtaking and aw.png",
    "Generate an intriguing and eye.png",
    "Generate an ethereal dreamscap.png",
    "lamborghini urus red color.png",
    "lamborghini.png",
    "red_urus.webp",
    "Surreal, bioluminescent forest.png",
    "random image.png",
    "Two ethereal spirits dance ami.png",

]
export default function LandingImageSection() {

    gsap.registerPlugin(ScrollTrigger)

    useEffect(() => {
        gsap.to(".AppearAnimation", {
            opacity: 1,
            duration: 5,
            scrollTrigger: ".AppearAnimation",
        })
        gsap.to(".slideUp", {
            opacity: 1,
            duration: 3,
            translateY: 0,
        })
    }, [])

    return (
        <div className="w-full h-full bg-white dark:bg-black" >
            <div className="w-full" >
                <InfiniteMovingCards
                    items={images}
                    direction="left"
                    speed="normal"
                />
            </div>
            <div className="relative w-full text-center mt-28">
                <h1 className=" text-black/70 font-bold  dark:text-white text-4xl sm:text-5xl md:text-7xl lg:text-9xl AppearAnimation opacity-0">Level up your creativity</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-6 slideUp opacity-0 translate-y-10 ">Go beyond the limits of creativity with AI generated image </p>
            </div>
        </div>
    )
}