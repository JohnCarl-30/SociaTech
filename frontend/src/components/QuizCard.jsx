export default function QuizCard({
  title,
  index,
  question,
  choices,
  selectedAnswer,
  onSelect
}) {
  return (
    <div className="question_card">
    
      <h3 className="quiz_title">{title}</h3>

      <h2 className="question_number">
        Question {index + 1}
      </h2>
      <p className="question_text">{question}</p>

      
      <div className="choices_grid">
        {choices.map((choice, i) => (
          <button
            key={i}
            className={`choice_btn ${selectedAnswer === i ? "active" : ""}`}
            onClick={() => onSelect(i)}
          >
            {choice}
          </button>
        ))}
      </div>
      
    </div>
  );
}