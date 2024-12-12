import Image from "next/image"
export default function LandingCodeSection() {
    return (
        <section className="relative bg-black w-full h-full ">
            <div className=" w-full h-[50%] flex items-center justify-around flex-wrap ">
                <h1 className="text-white text-5xl ">Generate Flawless Code Effortlessly</h1>
                <Image className="border border-white" src={"/landing-code-image.png"} width={725} height={725} alt="Some Awesome Code" />
            </div>
            <div className="w-full h-[50%] flex items-center justify-around flex-wrap " >
                <Image className="border border-white" src={"/chat-image.png"} width={825} height={825} alt="Some Awesome Code" />
                <h1 className="text-white text-5xl ">Think Smarter.<br /> Chat Better.<br /> Experience Limitless AI.</h1>
            </div>

        </section>
    )
} 
