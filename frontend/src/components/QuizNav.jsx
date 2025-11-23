import { ChevronLeft,ChevronRight } from "lucide-react";
export default function QuizNav({ onPrev, onNext, isLast }) {
  return (
    <div className="quiz_nav">
      <button onClick={onPrev} className="navQuestion_btn"><ChevronLeft  className="arrowSvg"/></button>
      <button onClick={onNext} disabled={isLast} className="navQuestion_btn"><ChevronRight className="arrowSvg"/></button>
    </div>
  );
}