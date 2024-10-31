import React from "react";

import MainButton from "@/components/ui/MainButton";
import { Input } from "./ui/input";

function NewsLetterSection() {
  return (
    <section className="py-20 bg-[#05161A]">
    <div className=" bg-[#d1ffd1] max-w-6xl mx-auto p-[4rem] rounded-[1.25rem] rounded-tl-extraLarge relative ">
      <div className="z-10">
        <p className="text-lightGray text-[1.5rem] font-[600] text-center mb-[2.63rem]">
          Subscribe to get information, latest news and other{" "}
          <br className="hidden md:block" /> interesting offers about Jadoo
        </p>

        <div className="flex justify-between flex-col md:flex-row items-center gap-8">
          <div className="relative flex-grow z-[10]">
            <Input
              type="email"
              placeholder="Your email"
              className="bg-white h-[3.5rem] pl-[3rem]"
            />
            <div className="absolute top-5 left-4">
              <img src="/envelop.png" alt="envelope icon" />
            </div>
          </div>

          <MainButton
            text="Subscribe"
            classes="w-[9.25rem] h-[3.25rem] z-[10]"
            isGradient
          />
        </div>
      </div>
      <div className="absolute bottom-0  left-4 z-0 opacity-25">
        <img
          src="/round-ring-left.png"
          alt="round ring left"
          className="w-[200px]"
        />
      </div>

      <div className="absolute -top-4 -right-4">
        <img src="/send-shape.png" alt="send icon" />
      </div>

      <div className="absolute top-0 right-0 opacity-25">
        <img
          src="round-ring-right.png"
          alt="round ring right"
          className="w-[200px]"
        />
      </div>

      <div className="absolute -bottom-16 right-[-6rem] hidden md:block">
        <img src="/plus-group.png" alt="send icon" />
      </div>
    </div>
    </section>
  );
}

export default NewsLetterSection;