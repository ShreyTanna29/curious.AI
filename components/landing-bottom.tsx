import Image from 'next/image';
import Link from 'next/link';
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram } from 'react-icons/fa';

const LandingFooter: React.FC = () => {
    return (
        <footer className="flex flex-col items-center w-full py-2 mt-4 text-white bg-white/10 text-center">
            <div className='flex flex-col md:flex-row justify-between items-center w-full px-4'>
                <div className='flex flex-col items-center md:items-start mx-10 mb-6 md:mb-0'>
                    <div className='flex items-center'>
                        <Image className='my-2 size-auto'
                            src={"/logo.png"}
                            alt="curious "
                            width={25}
                            height={1000}
                        />
                        <link rel="icon" href="/logo.png" sizes="any" />
                        <div className='my-3 mx-2 font-semibold text-base'>Curious.AI</div>
                    </div>
                    <div className='my-2 text-start text-sm max-w-96 text-gray-400'>
                        Unleash your creativity with our AI-powered platform! Whether you&#39;re exploring ideas or building something amazing, we&#39;re here to empower your imagination. Start creating today!
                    </div>
                    <div>
                        <div className="flex space-x-4 mt-3">
                            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600">
                                <FaFacebook size={20} />
                            </a>
                            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600">
                                <FaTwitter size={20} />
                            </a>
                            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600">
                                <FaLinkedin size={20} />
                            </a>
                            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600">
                                <FaInstagram size={20} />
                            </a>
                        </div>
                    </div>
                </div>

                <div className='flex flex-col md:flex-row items-start justify-end w-full'>
                    <div className='flex flex-col my-2 mx-5 md:mx-10 text-start'>
                        <div className='my-2 font-semibold list-disc'>Services</div>
                        <Link href={"/chat"}><li className='text-gray-400 text-sm hover:underline'>Chat With AI</li></Link>
                        <Link href={"/image"}><li className='text-gray-400 text-sm hover:underline'>Generate Images</li></Link>
                        <Link href={"/code"}><li className='text-gray-400 text-sm hover:underline'>Code Generation For Devs</li></Link>
                        <Link href={"/marketplace"}><li className='text-gray-400 text-sm hover:underline'>Marketplace</li></Link>
                    </div>
                    <div className='flex flex-col my-2 mx-5 md:mx-10 text-start list-disc'>
                        <div className='my-2 font-semibold'>Company</div>
                        <Link href={"/"}><li className='text-gray-400 text-sm hover:underline'>About Us</li></Link>
                        <Link href={"/"}><li className='text-gray-400 text-sm hover:underline'>Contact</li></Link>
                        <Link href={"/"}><li className='text-gray-400 text-sm hover:underline'>Join Community</li></Link>
                        <Link href={"/"}><li className='text-gray-400 text-sm hover:underline'>Blog Place</li></Link>
                    </div>
                </div>
            </div>

            <div className='h-[1px] w-[85%] bg-gray-500 my-7'></div>
            <div className='flex flex-col md:flex-row justify-between items-center w-[90%]'>
                <div className='text-gray-400 text-sm mb-3 md:mb-0'>&copy; 2024 All Rights Reserved</div>
                <div className='text-gray-400 text-sm flex'>
                    <Link href={"/"}><div className='underline mx-5 list-item'>Privacy Policy</div></Link>
                    <Link href={"/"}><div className='underline mx-5 list-item'>Terms & Conditions</div></Link>
                </div>
            </div>
        </footer>
    );
}

export default LandingFooter;
