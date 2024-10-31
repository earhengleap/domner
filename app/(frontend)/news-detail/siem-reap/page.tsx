import React from "react";
import { FaFacebook, FaInstagram } from "react-icons/fa";

interface TourismProject {
  title: string;
  description: string;
  imageUrl: string;
  facebook?: string;
  instagram?: string;
}

const tourismProjects: TourismProject[] = [
  {
    title: "Chi Phat Community",
    description:
      "Chi Phat Community is a successful model ecotourism project by wildlife alliance qp. Working to keep the waterfall but showcasing work, wildlife and culture based tourism. Established in 2007 with 9 families, in take a trip to learn through mountain biking, trek, camping and kayaking. This is a community-based about 550+ year old situated at Thma Bang, Koh Kong Province which make day stay in chi phat long term and help build the rural community.",
    imageUrl: "/chiphat.jpg",
    facebook: "chiphatcommunity",
    instagram: "chiphatcommunity",
  },
  {
    title: "Chambok Community-Based Ecotourism",
    description:
      "Chambok Community-Based ecotourism is an initiative by local government organization that forming that aims to reduce deforestation rates and improve community livelihoods by the selling of eco-tourism products and services to visitors. We provide all-mobile high scenario through their guided tours and community education programmes, where will able visit around the home stay, waterfall, trekking, camping, hiking up river tubing, having bicycles (conditioning) bird watching.",
    imageUrl: "/chombork.jpg",
    facebook: "chambokcommunity",
    instagram: "chambokcommunity",
  },
  {
    title: "Osoam Community",
    description:
      "The osoam cardamom community center (swot/eco) is situated in the middle of the cardamom mountains which has electricity and proper access roads structure. offering educational programmes, vocational training, ecotourism. Through osoam cardamom community center's commitment to building a sustainable community, volunteers can explore and learn about cambodian culture while helping the three language or sharing the with locals during their stay. they will be able to join community activities activity (no climatic operated) with an fully programme experience during your time in cambodia.",
    imageUrl: "/osoam.jpg",
    facebook: "osoamcommunity",
    instagram: "osoamcommunity",
  },
  {
    title: "Tour by Vespa",
    description:
      "Travel like a local with tour by vespa through their traditional local community and experience with their architectures and landmarks. And its would drive to discover the countryside and take you to different spots to discover its authentic food and rich history with its great adventure vespa tour, your trip will never forget with the unique experiences in cambodia.",
    imageUrl: "/vespa.png",
    facebook: "toursbyvespa",
    instagram: "toursbyvespa",
  },
  {
    title: "All Dreams Cambodia",
    description:
      "The tourism industry has a huge impact on the environment. We want to make sure that future generations can enjoy traveling. collaborating or supporting they who care about sustainability development and your travel needs all dreams cambodia will make your trip filled with the world, the experience on china.",
    imageUrl: "/images.png",
    facebook: "alldreamscambodia",
    instagram: "cambodiadreams",
  },
];

const ProjectCard: React.FC<{ project: TourismProject }> = ({ project }) => (
    <div className="flex flex-col md:flex-row gap-8 mb-16">
    <div className="md:w-1/2">
      <img
        src={project.imageUrl}
        alt={project.title}
        className="w-full h-[500px] object-cover rounded-lg"
      />
    </div>
    <div className="md:w-1/2 flex flex-col">
      <h2 className="text-4xl font-bold mb-6 text-gray-900">{project.title}</h2>
      <p className="text-gray-600 mb-6 text-lg leading-relaxed">{project.description}</p>
      <div className="border-t border-gray-200 pt-6 mt-auto">
        <div className="bg-teal-700 rounded-lg p-4">
          <div className="flex justify-between items-center">
            {project.facebook && (
              <a
                href={`https://${project.facebook}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-white"
              >
                <FaFacebook size={20} />
                <span>{project.facebook}</span>
              </a>
            )}
            {project.instagram && (
              <a
                href={`https://instagram.com/${project.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-white"
              >
                <FaInstagram size={20} />
                <span>{project.instagram}</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
);

const SiemReap: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="relative h-screen w-full">
        <img
          src="/siem-reap.jpg"
          alt="Sihanouk Province"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
          <h1 className="text-6xl font-bold text-white">Siem Reap</h1>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white animate-bounce">
          <svg
            className="w-6 h-6"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
        </div>
      </div>

      <div className="bg-white">
        <div className="max-w-6xl mx-auto px-6 py-16">
          {tourismProjects.map((project, index) => (
            <ProjectCard key={index} project={project} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SiemReap;