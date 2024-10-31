import React from 'react';

interface QuickLinkProps {
  title: string;
  description: string;
}

interface GuideProps {
  title: string;
}

interface ArticleProps {
  title: string;
}

interface HelpCenterProps {
  greeting: string;
  quickLink: QuickLinkProps;
  guides: GuideProps[];
  articles: ArticleProps[];
}

const HelpCenter: React.FC<HelpCenterProps> = ({ greeting, quickLink, guides, articles }) => {
  return (
    <div className="max-w-4xl mx-auto p-6 font-sans">
      <h1 className="text-3xl font-normal mb-8">{greeting}</h1>
      
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-8 w-72">
        <h2 className="font-semibold mb-2">Quick Link</h2>
        <a href="#" className="text-blue-600 hover:underline block mb-2">{quickLink.title}</a>
        <p className="text-sm text-gray-600">{quickLink.description}</p>
      </div>
      
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-normal">Guides for Hosts</h2>
          <a href="#" className="text-sm text-gray-600 hover:underline">Browse all topics</a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {guides.map((guide, index) => (
            <div key={index} className="bg-gray-100 rounded-lg p-4 h-24 flex items-center justify-center">
              <p className="text-center text-sm">{guide.title}</p>
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <h2 className="text-xl font-normal mb-4">Top articles</h2>
        <ul className="space-y-2 text-sm">
          {articles.map((article, index) => (
            <li key={index}>
              <a href="#" className="text-blue-600 hover:underline">{article.title}</a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default HelpCenter;