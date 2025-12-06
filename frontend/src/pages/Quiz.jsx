import PageHeader from "../components/PageHeader";
import { ArrowLeftToLine } from "lucide-react";
import Nav from "../components/Nav";
import CategorySlider from "../components/CategorySlider";
import { useEffect, useState, useRef } from "react";
import { useCycle } from "framer-motion";
import ProfilePage from "../components/ProfilePage";
import Settings from "../components/Settings";
import './Quiz.css';
import { aiQuizData } from "../../data/aiQuizData";
import { networkingQuizData } from "../../data/networkingQuizData";
import { cyberSecQuizData } from "../../data/cyberSecQuizData";
import { cloudQuizData } from "../../data/cloudQuizData";
import { mlQuizData } from "../../data/mlQuizData";
import { devOpsQuizData } from "../../data/devOpsQuizData";
import { vrQuizData } from "../../data/vrQuizData";
import { softwareDevQuizData } from "../../data/softwareDevQuizData";
import { arQuizData } from "../../data/arQuizData";

import QuizCard from "../components/QuizCard";
import QuizNav from "../components/QuizNav";
import HelpPage from "../components/HelpPage.jsx";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";


export default function Quiz() {

  const [isDropDownOpen, setIsDropDownOpen] = useState(false);
  const [isNotificationBarOpen, cycleNotificationBarOpen] = useCycle(false, true);
  const [isProfilePageOpen, setIsProfilePageOpen] = useState(false);
  const [isSettingOpen, setIsSettingOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [answers, setAnswers] = useState({});
  const [openQuiz, setOpenQuiz] = useState(false);
  const [quizTitle, setQuizTitle] = useState('');
  const [quizList, setQuizList] = useState([]);

  const [openHelpPage, setOpenHelpPage] = useState(false);
  const [quizInfo, setQuizInfo] = useState({});
  const [quizScore, setQuizScore] = useState([]);
  console.log(quizScore);

  const { user } = useContext(AuthContext);
  const userId = user?.id;
  console.log(userId);


  const ALL_QUIZZES = [
    { title: "AI Assessment 1", category: "Artificial Intelligence", quiz_description: "This quiz tests your understanding of basic AI concepts, including its purpose, core technologies like machine learning and neural networks, computing needs, real-world applications, and ethical concerns. Answer carefully to assess how well you grasp AI and its role in modern technology", data: aiQuizData },
    { title: "Cyber Security Assessment 1", category: "Cyber Security", quiz_description: "This quiz tests your knowledge of basic cybersecurity concepts, including digital threats, protection methods, safe practices, and data security. Answer carefully to assess how well you understand how to stay safe online.", data: cyberSecQuizData },
    { title: "Networking Assessment 1", category: "Networking", quiz_description: "This quiz evaluates your understanding of fundamental networking concepts, including data transmission, network types, hardware components, and communication protocols. Answer carefully to assess how well you grasp how networks connect and share information.", data: networkingQuizData },
    { title: "Cloud Engineering Assessment 1", category: "Cloud Engineering", quiz_description: "This quiz tests your understanding of basic cloud engineering concepts, including cloud services, deployment models, scalability, and infrastructure management. Answer carefully to assess how well you grasp how cloud technologies operate and support modern computing.", data: cloudQuizData },
    { title: "Software Development Assessment 1", category: "Software Development", quiz_description: "This quiz checks your understanding of fundamental software development concepts, including programming logic, development processes, problem-solving, and code quality. Answer carefully to assess how well you grasp how software is designed and built.", data: softwareDevQuizData },
    { title: "DevOps Assessment 1", category: "Dev Ops", quiz_description: "This quiz tests your understanding of DevOps fundamentals, including collaboration, automation, continuous integration, and deployment practices. Answer carefully to assess how well you grasp how DevOps improves software delivery.", data: devOpsQuizData },
    { title: "Machine Learning Assessment 1", category: "Machine Learning", quiz_description: "This quiz evaluates your knowledge of basic machine learning concepts, including data-driven training, model improvement, algorithms, and real-world applications. Answer carefully to assess how well you understand how machines learn from data.", data: mlQuizData },
    { title: "Virtual Reality Assessment 1", category: "Virtual Reality", quiz_description: "This quiz checks your understanding of virtual reality concepts, including immersive environments, interactive simulations, and hardware usage. Answer carefully to see how well you grasp how VR creates digital experiences.", data: vrQuizData },
    { title: "Augmented Reality Assessment 1", category: "Augmented Reality", quiz_description: "This quiz tests your knowledge of augmented reality fundamentals, including overlaying digital content onto the real world, user interaction, and common applications. Answer carefully to assess your understanding of how AR enhances real-world environments.", data: arQuizData },
  ];

  const filteredQuizzes = selectedCategory === "All"
    ? ALL_QUIZZES
    : ALL_QUIZZES.filter(q => q.category === selectedCategory);


  const QUIZ_INFO = {
    "AI Assessment 1": { id: 1, category: "Artificial Intelligence" },
    "Cyber Security Assessment 1": { id: 2, category: "Cyber Security" },
    "Networking Assessment 1": { id: 3, category: "Networking" },
    "Cloud Engineering Assessment 1": { id: 4, category: "Cloud Engineering" },
    "Software Development Assessment 1": {
      id: 5,
      category: "Software Development",
    },
    "DevOps Assessment 1": { id: 6, category: "DevOps" },
    "Machine Learning Assessment 1": { id: 7, category: "Machine Learning" },
    "Virtual Reality Assessment 1": { id: 8, category: "Virtual Reality" },
    "Augmented Reality Assessment 1": { id: 9, category: "Augmented Reality" },
  };


  useEffect(() => {
    if (!userId) return;

    const fetchScores = async () => {
      try {
        const formData = new FormData();
        formData.append("user_id", userId);

        const res = await fetch("http://localhost/Sociatech/backend/auth/fetchQuizScore.php", {
          method: "POST",
          body: formData,
        });
        const data = await res.json(); // <--- THIS WAS MISSING
        if (data.success) {
          setQuizScore(data.scores || []); // safely set scores
        }

      } catch (err) {
        console.error("Fetching scores failed:", err);
      }
    };

    fetchScores();
  }, [userId]);


  const getQuizScore = (quizId) => {
    const found = quizScore.find(item => item.quiz_id === quizId);
    if (!found) return "";

    let totalQuestions = 10;
    switch (quizId) {
      case 1: totalQuestions = aiQuizData.length; break;
      case 2: totalQuestions = cyberSecQuizData.length; break;
      case 3: totalQuestions = networkingQuizData.length; break;
      case 4: totalQuestions = cloudQuizData.length; break;
      case 5: totalQuestions = softwareDevQuizData.length; break;
      case 6: totalQuestions = devOpsQuizData.length; break;
      case 7: totalQuestions = mlQuizData.length; break;
      case 8: totalQuestions = vrQuizData.length; break;
      case 9: totalQuestions = arQuizData.length; break;
    }

    return `Recent Score: ${found.score}/${totalQuestions}`;
  };




  const handleQuiz = (quizData, quizTitle) => {
    setOpenQuiz(true);
    setQuizList(quizData);
    setQuizTitle(quizTitle);
    setCurrentIndex(0);
    setAnswers({});
    setQuizInfo({
      quiz_id: QUIZ_INFO[quizTitle].id,
      category: QUIZ_INFO[quizTitle].category,
    });
  };


  const closeAllModals = () => {
    setIsProfilePageOpen(false);
    setIsDropDownOpen(false);
    setIsSettingOpen(false);
    setOpenHelpPage(false);

  }





  const current = quizList[currentIndex];

  const handleSelect = (answerIndex) => {
    setAnswers({
      ...answers,
      [current.id]: answerIndex,
    });
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const handleNext = () => {
    if (currentIndex < quizList.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const handleSubmit = () => {
    let score = 0;

    quizList.forEach((q) => {
      const userAnswer = answers[q.id];
      if (userAnswer === q.correct) score++;
    });

    const resultData = {
      user_id: userId,
      quiz_id: quizInfo.quiz_id,
      quiz_title: quizTitle,
      category: quizInfo.category,
      score: score,
      date_taken: new Date().toISOString().slice(0, 19).replace("T", " "),
    };

    console.log("Score data to send:", resultData);

    fetch("http://localhost/Sociatech/backend/auth/save-score.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(resultData),
    })
      .then((res) => res.json())
      .then((data) => {
        alert(`Your Score: ${score}/${quizList.length}\n${data.message}`);
      })
      .catch((err) => {
        console.error(err);
        alert("Failed to save score.");
      });

    setOpenQuiz(false);
  };


  const openSetting = () => {
    setIsSettingOpen(true);
    setIsDropDownOpen(false);
  };
  const openProfilePage = () => {
    setIsProfilePageOpen(true);
    setIsDropDownOpen(false);
  };
  const closeProfilePage = () => setIsProfilePageOpen(false);
  const closeSetting = () => setIsSettingOpen(false);

  const toggleDropDown = () => setIsDropDownOpen((prev) => !prev);
  return (<>
    <div className="quizPage_parent_container">
      <PageHeader
        isOnCreatePost={false}
        isOnSearchBar={false}
        // onPostCreated={fetchPost}
        isDropDownOpen={isDropDownOpen}
        toggleDropDown={toggleDropDown}
        openProfilePage={openProfilePage}
        openSetting={openSetting}
        openNotificationBar={isNotificationBarOpen}
        closeNotificationBar={() => cycleNotificationBarOpen()}

      />
      <ProfilePage
        style={isProfilePageOpen ? "flex" : "none"}
        closeProfilePage={closeProfilePage}
      />


      <HelpPage openPage={openHelpPage} closePage={() => setOpenHelpPage(false)} />
      <Settings style={isSettingOpen ? 'flex' : 'none'}
        closeSetting={closeSetting} />
      <div className="quizPage_body_container">
        <Nav currentPage="quiz" />
        <div className="quizPage_main_container">
          <CategorySlider
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
          <div className="quiz_parent_container">
            <div className="quiz_container_title">Quiz</div>
            <div className="quiz_container">
              <div className="quiz_container">
                {filteredQuizzes.map((quiz) => (
                  <div className="quiz_card" key={quiz.title}>
                    <div className="quizCard_header">
                      <div className="quizCard_title">{quiz.title}</div>
                      <div className="quizCard_category">{quiz.category}</div>
                    </div>
                    <div className="quizCard_description">
                      {quiz.quiz_description}
                    </div>
                    <div className="takeQuiz_btn_container">
                      <div className="quiz_score">{getQuizScore(QUIZ_INFO[quiz.title].id)}</div>
                      <button className="takeQuiz_btn" onClick={() => handleQuiz(quiz.data, quiz.title)}>Take Quiz</button>
                    </div>
                  </div>
                ))}
              </div>


            </div>

          </div>
        </div>

      </div>
    </div>





    {openQuiz && current && (<div className="quiz_wrapper" style={{ display: openQuiz ? 'block' : 'none' }}>
      <button className="exitQuiz_btn" onClick={() => setOpenQuiz(false)}><ArrowLeftToLine />Exit Quiz</button>
      <QuizCard
        title={quizTitle}
        index={currentIndex}
        question={current.question}
        choices={current.choices}
        selectedAnswer={answers[current.id]}
        onSelect={handleSelect}
      />

      <div className="quiz_nav_container">
        <QuizNav
          onPrev={handlePrev}
          onNext={handleNext}
          isLast={currentIndex === quizList.length - 1}
        />
      </div>

      {currentIndex === quizList.length - 1 && (
        <button className="submit_btn" onClick={handleSubmit}>
          Submit
        </button>
      )}
    </div>)}
  </>);
}