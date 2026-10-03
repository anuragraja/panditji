import React from "react";
import { IReview } from "@/types";

interface ReviewsSectionProps {
  reviews?: IReview[];
}

export function ReviewsSection({ reviews }: ReviewsSectionProps) {
  const displayReviews =
    reviews && reviews.length > 0
      ? reviews
      : [
          {
            _id: "rev-1",
            name: "Rahul Sharma",
            roleTitle: "Regular Guest",
            rating: 5,
            comment:
              "The food has that proper ghar-jaisa taste. Paneer and dal were excellent.",
            approved: true,
            createdAt: new Date(),
          },
          {
            _id: "rev-2",
            name: "Priya Verma",
            roleTitle: "Happy Guest",
            rating: 5,
            comment:
              "Great service, fresh food and a really comfortable family atmosphere.",
            approved: true,
            createdAt: new Date(),
          },
          {
            _id: "rev-3",
            name: "Arjun Singh",
            roleTitle: "Food Lover",
            rating: 5,
            comment:
              "Loved the traditional flavours. The family combo is filling and delicious.",
            approved: true,
            createdAt: new Date(),
          },
        ];

  return (
    <section className="section py-[94px] max-sm:py-[68px]" id="reviews">
      <div className="container-dhaba">
        <div className="text-center mb-[35px]">
          <div className="eyebrow">GUEST LOVE</div>
          <h2 className="font-serif-dhaba font-extrabold text-[43px] max-sm:text-[35px] leading-[1.12] text-[#102a43] mt-[9px]">
            What Our <span className="text-[#246b9b]">Guests Say</span>
          </h2>
        </div>

        <div className="grid grid-cols-3 max-md:grid-cols-2 max-sm:grid-cols-1 gap-[18px]">
          {displayReviews.map((rev) => (
            <article
              key={rev._id}
              className="bg-white border border-[#e9e1d4] rounded-[17px] p-[25px] shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="text-[#d99a2b] tracking-[2px] text-[13px] mb-2 font-mono">
                {"★".repeat(rev.rating)}
                {"☆".repeat(5 - rev.rating)}
              </div>
              <p className="text-[#60717d] text-[13px] leading-[1.8] my-[14px]">
                “{rev.comment}”
              </p>
              <b className="text-[13px] font-bold text-[#102a43] block">
                {rev.name}
              </b>
              <small className="block text-[#89959e] text-[11px] mt-[4px]">
                {rev.roleTitle || "Happy Guest"}
              </small>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
