import React, { useState } from "react";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import { AiFillStar } from "react-icons/ai";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import ReviewFormModal from "./ReviewFormModal";
import { Card } from "./ui/card";
import HighlightText from "./HighlightText";
import LoadImage from "./LoadImage";

interface ReviewType {
  id: string;

  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    image: string | null;
  };
}

interface ReviewFrontProps {
  reviews: ReviewType[];
  onAddReview: (content: string) => void;
}

const animation = { duration: 50000, easing: (t: number) => t };

const ReviewFront: React.FC<ReviewFrontProps> = ({
  reviews,
  onAddReview,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [sliderRef] = useKeenSlider({
    loop: true,
    initial: 0,
    created(s) {
      s.moveToIdx(5, true, animation);
    },
    updated(s) {
      s.moveToIdx(s.track.details.abs + 5, true, animation);
    },
    animationEnded(s) {
      s.moveToIdx(s.track.details.abs + 5, true, animation);
    },
    breakpoints: {
      "(max-width: 768px)": {
        slides: {
          perView: 1,
          spacing: 15,
        },
      },
      "(min-width: 768px)": {
        slides: {
          perView: 2,
          spacing: 15,
        },
      },
      "(min-width: 1080px)": {
        slides: {
          perView: 3,
          spacing: 15,
        },
      },
    },
  });

  const handleAddReview = (content: string) => {
    onAddReview(content);
    setIsModalOpen(false);
  };

  return (
    <div>
      <h2 className="lg:text-4xl md:text-4xl text-3xl font-bold mb-2 whitespace-normal">
        <HighlightText>Traveler's</HighlightText> Review
        <LoadImage
          src="/underline.svg"
          alt="arrow"
          height={7}
          width={250}
          className="mt-1.5"
        />
      </h2>
      <p className="text-gray-600 mb-6">
        Discover the Impact of Our Products and Services Through Their
        Testimonials
      </p>

      <div ref={sliderRef} className="keen-slider">
        {reviews.map((review) => (
          <div key={review.id} className="keen-slider__slide">
            <Card className="p-8 shadow-md">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-start">
                  <Avatar className="h-12 w-12 mr-4">
                    <AvatarImage
                      src={review.user.image || undefined}
                      alt={review.user.name}
                    />
                    <AvatarFallback>{review.user.name[0]}</AvatarFallback>
                  </Avatar>

                  <h3 className="font-semibold text-lg items-center justify-center">
                    {review.user.name}
                  </h3>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <p className="text-gray-700 line-clamp-3">{review.content}</p>
            </Card>
          </div>
        ))}
      </div>

      
      <ReviewFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddReview}
      />
    </div>
  );
};

export default ReviewFront;
