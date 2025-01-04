import Image from 'next/image';
import Link from 'next/link';
import { FaFacebook, FaXTwitter, FaLinkedin, FaInstagram } from 'react-icons/fa6';

const LandingFooter: React.FC = () => {
    return (
        <footer className="flex-col items-center w-full py-2 mt-4 dark:text-white bg-zinc-100 dark:bg-white/10 text-center">
            <div className="max-w-screen-xl mx-auto px-4 py-8 grid gap-8 md:grid-cols-3 items-start">
                <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                        <Image
                            src="/logo.png"
                            alt="Curious.AI Logo"
                            width={40}
                            height={40}
                            className="object-contain"
                        />
                        <span className="font-semibold text-lg">Curious.AI</span>
                    </div>
                    <p className="text-m leading-relaxed text-gray-400 text-justify">
                        Unleash your creativity with our AI-powered platform! Whether you&apos;re exploring ideas or building something amazing, we&apos;re here to empower your imagination. Start creating today!
                    </p>
                    <div className="flex space-x-4">
                        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-600 transition duration-300 ease-in-out">
                            <FaFacebook size={24} />
                        </a>
                        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400 transition duration-300 ease-in-out">
                            <FaXTwitter size={24} />
                        </a>
                        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-700 transition duration-300 ease-in-out">
                            <FaLinkedin size={24} />
                        </a>
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-pink-500 transition duration-300 ease-in-out">
                            <FaInstagram size={24} />
                        </a>
                    </div>
                </div>

                <div className="space-y-4 md:ml-16">
                    <h3 className="font-semibold text-lg">Services</h3>
                    <ul className="space-y-2 text-m">
                        <li><Link href="/chat" className="text-gray-400 hover:text-blue-500 transition duration-300 ease-in-out">Chat With AI</Link></li>
                        <li><Link href="/image" className="text-gray-400 hover:text-blue-500 transition duration-300 ease-in-out">Generate Images</Link></li>
                        <li><Link href="/code" className="text-gray-400 hover:text-blue-500 transition duration-300 ease-in-out">Code Generation For Devs</Link></li>
                        <li><Link href="/marketplace" className="text-gray-400 hover:text-blue-500 transition duration-300 ease-in-out">Marketplace</Link></li>
                    </ul>
                </div>

                <div className="space-y-4 md:ml-24">
                    <h3 className="font-semibold text-lg">Company</h3>
                    <ul className="space-y-2 text-m">
                        <li><Link href="/about" className="text-gray-400 hover:text-blue-500 transition duration-300 ease-in-out">About Us</Link></li>
                        <li><Link href="/contact" className="text-gray-400 hover:text-blue-500 transition duration-300 ease-in-out">Contact</Link></li>
                        <li><Link href="/community" className="text-gray-400 hover:text-blue-500 transition duration-300 ease-in-out">Join Community</Link></li>
                        <li><Link href="/blog" className="text-gray-400 hover:text-blue-500 transition duration-300 ease-in-out">Blog Place</Link></li>
                    </ul>
                </div>
            </div>

            <div className="border-t border-gray-600 my-4"></div>
            <div className="max-w-screen-xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-m">
                <span className="text-gray-400">&copy; 2025 All Rights Reserved</span>
                <div className="flex space-x-4">
                    <Link href="/privacy-policy" className="hover:text-blue-500 transition duration-300 ease-in-out">Privacy Policy</Link>
                    <Link href="/terms" className="hover:text-blue-500 transition duration-300 ease-in-out">Terms & Conditions</Link>
                </div>
            </div>
        </footer>
    );
}

export default LandingFooter;
