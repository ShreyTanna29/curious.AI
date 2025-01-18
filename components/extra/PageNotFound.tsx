import Link from 'next/link';

const PageNotFound = () => {
    return (
        <div className="flex flex-col items-center justify-center h-screen text-center">
            <h1 className="relative z-10 text-[10rem] bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-neutral-600 font-extrabold text-center">
                404
            </h1>
            <h2 className="text-3xl font-semibold mt-4">Page Not Found</h2>
            <p className="mt-4 text-lg text-white-700">
                Sorry, the page you are looking for does not exist.
            </p>
            <Link href="/" className="mt-6 text-blue-500 hover:no-underline text-lg font-medium relative z-10">
                Go back to Home
            </Link>
            
        </div>
    );
};

export default PageNotFound;