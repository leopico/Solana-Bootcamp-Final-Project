'use client'

import { Review } from "../models/Review";
import React, { FC } from "react";
interface CardProps {
    review: Review;
    onClick?: () => void;
}

const ReviewCard: FC<CardProps> = ({ review, onClick }) => {
    const { title, description, rating, location } = review;

    return (
        <div
            className="relative cursor-pointer group rounded-lg border border-transparent px-5 py-4 transition-colors border-gray-300 bg-gray-100 dark:border-neutral-700 dark:bg-neutral-800/30 m-4"
            onClick={onClick}
        >
            <h2 className={`mb-3 text-2xl font-semibold`}>
                {title.toUpperCase()}{" "}
            </h2>
            <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
                {description}
            </p>
            <div className="mt-6 flex justify-between items-center">
                <p
                    className={`max-w-[30ch] text-sm opacity-75`}
                >{`${rating}/5`}</p>
                <p className={`max-w-[30ch] text-sm opacity-50`}>
                    {location}
                </p>
            </div>
        </div>
    );
};

export default ReviewCard;