import Footer from "@/components/landing-bottom"
import NotFound from "@/components/PageNotFound";
import Header from "@/components/landingNavbar"
import { BackgroundBeams } from "@/components/background-beams";

const NotFoundPage = () => {
    return (
        <>
            <Header />
            <NotFound />
            <Footer />
            <BackgroundBeams />
        </>
    );
};
export default NotFoundPage;