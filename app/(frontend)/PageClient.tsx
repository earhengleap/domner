    // "use client"; // Marks this as a Client Component

    // import HeroSection from "@/components/HeroSection";
    // import { useSession } from "next-auth/react";
    // import { useEffect } from "react";

    // export default function Home() {
    //   const { data: session, status } = useSession();

    //   useEffect(() => {
    //     if (session) {
    //       console.log(session.user);
    //     }
    //   }, [session]);

    //   if (status === "loading") {
    //     return (
    //       <main>
    //         <p>Loading...</p>
    //       </main>
    //     );
    //   }

    //   if (!session) {
    //     return (
    //       <main>
    //         <p>You need to be authenticated to view this page.</p>
    //       </main>
    //     );
    //   }

    //   return (
    //     <main>
    //       <HeroSection
    //         videoSrc="Sequence.mp4"
    //         mainHeader="Welcome to Our Site"
    //         secondaryHeader="Discover Amazing Content"
    //       />
    //     </main>
    //   );
    // }
