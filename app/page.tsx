'use client'

import { AppBar } from "./components/AppBar";
import ReviewCard from "./components/ReviewCard";
import { useEffect, useMemo, useState } from "react";
import { Review } from "./models/Review";
import * as web3 from "@solana/web3.js";
import { fetchReviews } from "./util/fetchReviews";
import { useWallet } from "@solana/wallet-adapter-react";
import ReviewForm from "./components/Form";
import Link from "next/link";

//Replace with your own Program_id
const REVIEW_PROGRAM_ID = "8aZHFMQmAFfj3CniTn2hp2Ty3GVAgk3iJXSYWjp5NzR4";
// console.log(typeof REVIEW_PROGRAM_ID);

export default function Home() {
  const connection = useMemo(() => new web3.Connection(web3.clusterApiUrl("devnet")), []);
  const { publicKey, sendTransaction } = useWallet();

  const [txid, setTxid] = useState("");
  const [reviews, setReviews] = useState<Review[]>([]);

  const [title, setTitle] = useState("");
  const [rating, setRating] = useState(0);
  const [description, setDescription] = useState("");
  const [loader, setLoader] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  useEffect(() => {
    const fetchAccounts = async () => {
      await fetchReviews(REVIEW_PROGRAM_ID, connection).then(setReviews);
    };
    fetchAccounts();
  }, [connection]);

  const handleSubmit = () => {
    if (selectedReview) {
      const updatedReview = new Review(title, rating, description);
      handleTransactionUpdateSubmit(updatedReview);
    } else {
      const review = new Review(title, rating, description);
      handleTransactionSubmit(review);
    }
  };

  const handleTransactionUpdateSubmit = async (updatedReview: Review) => {
    // console.log(updatedReview);
    if (!publicKey) {
      alert('Please connect wallet');
      return;
    };
    setLoader(true);
    const buffer = updatedReview.serialize(1);
    const transaction = new web3.Transaction();
    const [pda] = web3.PublicKey.findProgramAddressSync(
      [publicKey.toBuffer(), Buffer.from(updatedReview.title)],
      new web3.PublicKey(REVIEW_PROGRAM_ID)
    );
    const instruction = new web3.TransactionInstruction({
      keys: [
        {
          pubkey: publicKey,
          isSigner: true,
          isWritable: false,
        },
        {
          pubkey: pda,
          isSigner: false,
          isWritable: true,
        },
      ],
      data: buffer,
      programId: new web3.PublicKey(REVIEW_PROGRAM_ID),
    });
    transaction.add(instruction);

    try {
      let txid = await sendTransaction(transaction, connection);
      setTxid(`https://explorer.solana.com/tx/${txid}?cluster=devnet`);
    } catch (error) {
      console.log(JSON.stringify(error));
      alert(JSON.stringify(error));
    };
    setLoader(false);
    setSelectedReview(null);
  }

  const handleTransactionSubmit = async (review: Review) => {
    if (!publicKey) {
      alert('Please connect wallet');
      return;
    };
    setLoader(true);
    const buffer = review.serialize();
    const transaction = new web3.Transaction();
    const [pda] = web3.PublicKey.findProgramAddressSync(
      [publicKey.toBuffer(), Buffer.from(review.title)],
      new web3.PublicKey(REVIEW_PROGRAM_ID)
    );
    const instruction = new web3.TransactionInstruction({
      keys: [
        {
          pubkey: publicKey,
          isSigner: true,
          isWritable: false,
        },
        {
          pubkey: pda,
          isSigner: false,
          isWritable: true,
        },
        {
          pubkey: web3.SystemProgram.programId,
          isSigner: false,
          isWritable: false,
        },
      ],
      data: buffer,
      programId: new web3.PublicKey(REVIEW_PROGRAM_ID),
    });
    transaction.add(instruction);

    try {
      let txid = await sendTransaction(transaction, connection);
      setTxid(`https://explorer.solana.com/tx/${txid}?cluster=devnet`);
    } catch (error) {
      console.log(JSON.stringify(error));
      alert(JSON.stringify(error));
    };
    setLoader(false);
  };

  const handleReviewCardClick = (review: Review) => {
    setSelectedReview(review);
    setTitle(review.title);
    setDescription(review.description);
    setRating(review.rating);
  }

  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between p-24 `}
    >
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <AppBar />
      </div>

      <div className="after:absolute after:-z-20 after:h-[180px] after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700/10 after:dark:from-sky-900 after:dark:via-[#0141ff]/40 before:lg:h-[360px]">
        <ReviewForm
          title={title}
          description={description}
          rating={rating}
          setTitle={setTitle}
          setDescription={setDescription}
          setRating={setRating}
          handleSubmit={handleSubmit}
          loader={loader}
          selectedReview={selectedReview}
        />
      </div>

      {txid && (
        <div>
          <Link href={txid} target="_blink" className="font-semibold text-purple-400 text-center text-lg">
            See Transaction in explorer
          </Link>
        </div>
      )}

      <div className="mb-32 grid text-center sm:grid-cols-2 lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-3 lg:text-left">
        {reviews &&
          reviews.map((review) => {
            return (
              <ReviewCard key={review.title} review={review} onClick={() => handleReviewCardClick(review)} />
            );
          })}
      </div>
    </main>
  );
}