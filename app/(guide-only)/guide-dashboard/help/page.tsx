import React from 'react';
import HelpCenter from '@/components/Guide/Help';

const HelpPage: React.FC = () => {
  const helpCenterProps = {
    greeting: "Hello Tou, How Can we help you?",
    quickLink: {
      title: "Finding your reservation details",
      description: "Find all your reservations, news, and to-do's in the Today tab."
    },
    guides: [
      { title: "Getting paid" },
      { title: "Optimizing your listing" },
      { title: "Getting protected through Domner for hosts" }
    ],
    articles: [
      { title: "Changing your payment method for a confirmed reservation" },
      { title: "Find your reservation status as a guest" },
      { title: "Editing a review you wrote" }
    ]
  };

  return (
    <div>
      <HelpCenter {...helpCenterProps} />
    </div>
  );
};

export default HelpPage;