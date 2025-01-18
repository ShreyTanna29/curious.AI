import Footer from "@/components/landing/landing-bottom"
import NotFound from "@/components/extra/PageNotFound";
import Header from "@/components/landing/landingNavbar"
import { BackgroundBeams } from "@/components/features/background-beams";

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